/**
 * Extrae la pista de audio de un archivo de video en el navegador usando AudioContext
 * y la exporta como un Blob de audio WAV ligero optimizado para la API de IA.
 */
export interface ExtractedAudio {
  blob: Blob;
  duration: number;
}

export async function extractAudioFromVideo(videoFile: File): Promise<ExtractedAudio> {
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  
  try {
    const arrayBuffer = await videoFile.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const wavBlob = bufferToWav(audioBuffer);
    return {
      blob: wavBlob,
      duration: audioBuffer.duration,
    };
  } catch (err) {
    console.warn('AudioContext decodeAudioData fallback, using original file blob:', err);
    // If Web Audio API decode fails (e.g. video format without standalone audio track in Web Audio),
    // get duration from temporary video element and send file directly to multimodal Gemini API
    const duration = await getVideoDuration(videoFile);
    return {
      blob: videoFile,
      duration,
    };
  } finally {
    try {
      await audioContext.close();
    } catch {
      // ignore
    }
  }
}

// Obtenemos la duración real del video a través de un elemento HTML5 Video temporal
function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    const url = URL.createObjectURL(file);
    tempVideo.src = url;

    tempVideo.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(tempVideo.duration || 0);
    };

    tempVideo.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
  });
}

// Conversor de AudioBuffer a WAV PCM 16-bit
function bufferToWav(buffer: AudioBuffer): Blob {
  const sampleRate = Math.min(buffer.sampleRate, 16000); // 16kHz es el estándar óptimo de Whisper y Gemini (mono)
  const length = Math.floor(buffer.duration * sampleRate);
  const outBuffer = new Float32Array(length);

  // Mezclar canales a mono y remuestrear
  const channels = buffer.numberOfChannels;
  const step = buffer.sampleRate / sampleRate;

  if (channels === 1) {
    const inputData = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      const srcIndex = Math.floor(i * step);
      outBuffer[i] = inputData[srcIndex] || 0;
    }
  } else {
    // Promedio de canales estéreo a mono
    const leftData = buffer.getChannelData(0);
    const rightData = buffer.getChannelData(1);
    for (let i = 0; i < length; i++) {
      const srcIndex = Math.floor(i * step);
      const left = leftData[srcIndex] || 0;
      const right = rightData[srcIndex] || 0;
      outBuffer[i] = (left + right) / 2;
    }
  }

  const wavData = encodeWAV(outBuffer, sampleRate, 1);
  return new Blob([wavData], { type: 'audio/wav' });
}

function encodeWAV(samples: Float32Array, sampleRate: number, numChannels: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * numChannels * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, numChannels * 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  // PCM samples
  floatTo16BitPCM(view, 44, samples);

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}
