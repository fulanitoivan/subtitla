import { pipeline, env } from '@xenova/transformers';
import type { SubtitleSegment, Word } from '../types/subtitle';

// Configurar Transformers.js para usar caché del navegador y WebAssembly
env.allowLocalModels = false;
env.useBrowserCache = true;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let transcriberInstance: any = null;

export async function transcribeWithLocalWhisper(
  audioBlob: Blob,
  onProgress?: (status: string, percent?: number) => void
): Promise<SubtitleSegment[]> {
  onProgress?.('Cargando modelo de IA Whisper en el navegador (100% Gratis)...', 10);

  // 1. Cargar el pipeline de Whisper Tiny (ultra ligero y rápido para el navegador)
  if (!transcriberInstance) {
    onProgress?.('Descargando pesos del modelo Whisper Tiny (solo la primera vez)...', 20);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transcriberInstance = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      progress_callback: (info: any) => {
        if (info.status === 'progress' && info.progress) {
          onProgress?.(`Descargando IA: ${Math.round(info.progress)}%`, Math.round(info.progress));
        } else if (info.status === 'initiate') {
          onProgress?.('Inicializando motor de Inteligencia Artificial...', 30);
        }
      },
    });
  }

  onProgress?.('Extrayendo muestras de audio a 16kHz...', 50);

  // 2. Decodificar audio a Float32Array a 16kHz mono
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({
    sampleRate: 16000,
  });

  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  await audioContext.close();

  // Obtener canal mono
  const inputData = audioBuffer.getChannelData(0);

  onProgress?.('Transcribiendo audio con IA local...', 70);

  // 3. Ejecutar inferencia de Whisper
  const output = await transcriberInstance(inputData, {
    chunk_length_s: 30,
    stride_length_s: 5,
    return_timestamps: 'word',
  });

  onProgress?.('Generando marcas de tiempo palabra por palabra...', 90);

  // 4. Procesar chunks de palabras y armar segmentos
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawChunks: Array<{ text: string; timestamp: [number, number] }> = output.chunks || [];

  if (rawChunks.length === 0) {
    // Si no devolvió chunks de palabras, usar el texto completo
    const fullText = (output.text || '').trim();
    if (!fullText) {
      throw new Error('No se detectó voz o audio inteligible en el archivo.');
    }

    const words = fullText.split(/\s+/);
    const duration = audioBuffer.duration || 5;
    const wordDur = duration / words.length;

    return [
      {
        id: 'seg-0',
        start: 0,
        end: Number(duration.toFixed(2)),
        text: fullText,
        words: words.map((w: string, idx: number) => ({
          id: `w-${idx}`,
          word: w,
          start: Number((idx * wordDur).toFixed(2)),
          end: Number(((idx + 1) * wordDur).toFixed(2)),
        })),
      },
    ];
  }

  // Agrupar palabras en segmentos de 4 a 6 palabras para visualización estilo TikTok
  const segments: SubtitleSegment[] = [];
  const chunkSize = 5;

  for (let i = 0; i < rawChunks.length; i += chunkSize) {
    const chunkWords = rawChunks.slice(i, i + chunkSize);
    const start = chunkWords[0].timestamp[0] ?? 0;
    const end = chunkWords[chunkWords.length - 1].timestamp[1] ?? (start + 2);
    const text = chunkWords.map((c) => c.text.trim()).join(' ');

    const words: Word[] = chunkWords.map((c, idx) => {
      const wStart = c.timestamp[0] ?? Number((start + idx * 0.4).toFixed(2));
      const wEnd = c.timestamp[1] ?? Number((wStart + 0.4).toFixed(2));
      return {
        id: `w-${i + idx}`,
        word: c.text.trim(),
        start: Number(wStart.toFixed(2)),
        end: Number(wEnd.toFixed(2)),
      };
    });

    segments.push({
      id: `seg-${Math.floor(i / chunkSize)}`,
      start: Number(start.toFixed(2)),
      end: Number(end.toFixed(2)),
      text,
      words,
    });
  }

  onProgress?.('¡Transcripción completada!', 100);
  return segments;
}
