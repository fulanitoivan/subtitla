import type { SubtitleSegment, Word } from '../types/subtitle';

export async function transcribeWithGroq(
  audioBlob: Blob,
  apiKey: string,
  onProgress?: (status: string) => void
): Promise<SubtitleSegment[]> {
  if (!apiKey) {
    throw new Error('Por favor ingresa tu API Key de Groq');
  }

  onProgress?.('Enviando audio a Groq Whisper (whisper-large-v3)...');

  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.wav');
  formData.append('model', 'whisper-large-v3');
  formData.append('response_format', 'verbose_json');
  formData.append('timestamp_granularities[]', 'word');

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Error en Groq API: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  onProgress?.('Procesando marcas de tiempo palabra por palabra...');

  return parseGroqWhisperResponse(data);
}

interface GroqWord {
  word: string;
  start: number;
  end: number;
}

interface GroqSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  words?: GroqWord[];
}

interface GroqWhisperResponse {
  text: string;
  segments?: GroqSegment[];
  words?: GroqWord[];
}

function parseGroqWhisperResponse(data: GroqWhisperResponse): SubtitleSegment[] {
  // Si tenemos segmentos con palabras
  if (data.segments && data.segments.length > 0) {
    const segments: SubtitleSegment[] = [];

    data.segments.forEach((seg, sIdx) => {
      const segWords: Word[] = [];

      if (seg.words && seg.words.length > 0) {
        seg.words.forEach((w, wIdx) => {
          segWords.push({
            id: `seg-${sIdx}-w-${wIdx}`,
            word: w.word.trim(),
            start: w.start,
            end: w.end,
          });
        });
      } else {
        // Si el segmento no tiene desglose de palabras, dividir equitativamente
        const words = seg.text.trim().split(/\s+/);
        const duration = Math.max(0.1, seg.end - seg.start);
        const wordDuration = duration / words.length;

        words.forEach((w, wIdx) => {
          segWords.push({
            id: `seg-${sIdx}-w-${wIdx}`,
            word: w,
            start: Number((seg.start + wIdx * wordDuration).toFixed(2)),
            end: Number((seg.start + (wIdx + 1) * wordDuration).toFixed(2)),
          });
        });
      }

      segments.push({
        id: `seg-${sIdx}`,
        start: seg.start,
        end: seg.end,
        text: seg.text.trim(),
        words: segWords,
      });
    });

    return segments;
  }

  // Fallback si solo devuelve lista global de palabras
  if (data.words && data.words.length > 0) {
    // Agrupar palabras en segmentos de 4 a 6 palabras
    const segments: SubtitleSegment[] = [];
    const chunkSize = 5;

    for (let i = 0; i < data.words.length; i += chunkSize) {
      const chunk = data.words.slice(i, i + chunkSize);
      const start = chunk[0].start;
      const end = chunk[chunk.length - 1].end;
      const text = chunk.map(w => w.word.trim()).join(' ');

      segments.push({
        id: `seg-${Math.floor(i / chunkSize)}`,
        start,
        end,
        text,
        words: chunk.map((w, wIdx) => ({
          id: `w-${i + wIdx}`,
          word: w.word.trim(),
          start: w.start,
          end: w.end,
        })),
      });
    }

    return segments;
  }

  throw new Error('No se encontraron palabras o marcas de tiempo en la respuesta de Whisper.');
}
