import type { SubtitleSegment, Word } from '../types/subtitle';

// Candidate models ordered by lowest latency & highest availability
const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',    // Blazing fast ~2s latency, native audio & JSON support
  'gemini-flash-latest',      // Fast ~4s latency, stable general alias
  'gemini-3.5-flash-lite',    // Lightweight fallback
  'gemini-3.5-flash',         // High-quality Flash model
  'gemini-3.8-flash',         // Latest generation
  'gemini-3.6-flash',         // Production fallback
];

export const DEFAULT_GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export async function transcribeWithGemini(
  audioBlob: Blob,
  apiKey?: string,
  onProgress?: (status: string) => void
): Promise<SubtitleSegment[]> {
  const activeKey = (apiKey || DEFAULT_GEMINI_KEY).trim();
  if (!activeKey) {
    throw new Error('Error al conectar con el motor de transcripción IA');
  }

  onProgress?.('Extrayendo audio optimizado...');
  const base64Audio = await blobToBase64(audioBlob);

  const prompt = `Actúa como un transcriptor profesional de audio para subtítulos virales de video.
Transcribe con exactitud fonética todo lo que se dice en este audio. Detecta el idioma automáticamente (por ejemplo español).
Genera marcas de tiempo exactas palabra por palabra (start y end en segundos).

Devuelve EXCLUSIVAMENTE un objeto JSON válido con la siguiente estructura exacta:
{
  "segments": [
    {
      "id": "seg-0",
      "start": 0.0,
      "end": 2.4,
      "text": "Frase de 3 a 5 palabras",
      "words": [
        { "id": "w0", "word": "palabra1", "start": 0.0, "end": 0.6 },
        { "id": "w1", "word": "palabra2", "start": 0.6, "end": 1.2 },
        { "id": "w2", "word": "palabra3", "start": 1.2, "end": 2.4 }
      ]
    }
  ]
}`;

  const cleanKey = activeKey;
  const rawData = base64Audio.split(',')[1] || base64Audio;
  const mimeType = audioBlob.type || 'audio/wav';

  let lastError: Error | null = null;

  for (let i = 0; i < CANDIDATE_MODELS.length; i++) {
    const model = CANDIDATE_MODELS[i];
    
    try {
      onProgress?.(`Procesando con Google Gemini (${model})...`);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cleanKey)}`;

      const requestBody = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType.includes('audio') ? mimeType : 'audio/wav',
                  data: rawData,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s fast timeout per model

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': cleanKey,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error?.message || `HTTP ${response.status} ${response.statusText}`;
        console.warn(`Modelo ${model} no disponible: ${message}`);
        lastError = new Error(`Error en ${model}: ${message}`);
        continue; // Cascade immediately to next model
      }

      const result = await response.json();
      const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textContent) {
        lastError = new Error(`El modelo ${model} devolvió respuesta vacía.`);
        continue;
      }

      const cleanedJson = textContent.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleanedJson);

      if (!parsed.segments || !Array.isArray(parsed.segments) || parsed.segments.length === 0) {
        lastError = new Error(`Formato de respuesta inválido en ${model}`);
        continue;
      }

      // Validate and normalize segments & word-level timestamps
      const normalizedSegments: SubtitleSegment[] = parsed.segments.map((seg: SubtitleSegment, sIdx: number) => {
        const start = typeof seg.start === 'number' ? seg.start : 0;
        const end = typeof seg.end === 'number' ? seg.end : start + 2;
        const text = seg.text || '';

        let words: Word[] = [];
        if (Array.isArray(seg.words) && seg.words.length > 0) {
          words = seg.words.map((w: Word, wIdx: number) => ({
            id: w.id || `w_${sIdx}_${wIdx}`,
            word: String(w.word || ''),
            start: typeof w.start === 'number' ? w.start : start,
            end: typeof w.end === 'number' ? w.end : end,
          }));
        } else {
          // Accurate word interpolation fallback
          const rawWords = text.split(/\s+/).filter(Boolean);
          const duration = Math.max(0.2, end - start);
          const wordDuration = duration / Math.max(1, rawWords.length);
          words = rawWords.map((word, wIdx) => ({
            id: `w_${sIdx}_${wIdx}`,
            word,
            start: start + wIdx * wordDuration,
            end: start + (wIdx + 1) * wordDuration,
          }));
        }

        return {
          id: seg.id || `seg_${sIdx}`,
          start,
          end,
          text,
          words,
        };
      });

      onProgress?.('¡Transcripción completada con éxito!');
      return normalizedSegments;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Intento con ${model} falló: ${msg}`);
      lastError = err instanceof Error ? err : new Error(msg);
    }
  }

  throw lastError || new Error('Google Gemini no se encuentra disponible temporalmente. Por favor inténtalo de nuevo.');
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
