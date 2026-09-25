import type { SubtitleSegment, Word } from '../types/subtitle';

// Candidate models supporting audio input and structured JSON generation
const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',     // Fast, stable audio + JSON mode
  'gemini-3-flash-preview',     // High-speed preview fallback
  'gemini-3.8-flash',          // Latest generation Flash model
  'gemini-3.5-flash',          // Flash fallback
];

export const DEFAULT_GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export async function transcribeWithGemini(
  audioBlob: Blob,
  apiKey?: string,
  onProgress?: (status: string) => void,
  durationSeconds?: number
): Promise<SubtitleSegment[]> {
  const activeKey = (apiKey || DEFAULT_GEMINI_KEY).trim();
  if (!activeKey) {
    throw new Error('Error al conectar con el motor de transcripción IA (clave no configurada)');
  }

  onProgress?.('Codificando audio del video...');
  const base64Audio = await blobToBase64(audioBlob);

  const durationNotice = durationSeconds && durationSeconds > 0
    ? `La duración exacta del archivo de audio es de ${durationSeconds.toFixed(1)} segundos.`
    : `El archivo de audio tiene una duración completa continua.`;

  const prompt = `Eres un sistema profesional de transcripción e IA para subtítulos dinámicos de video (formato Reels, TikTok y YouTube Shorts).
${durationNotice}

INSTRUCCIONES OBLIGATORIAS:
1. Escucha TODO el archivo de audio de principio a fin, desde el segundo 0.0 hasta el último segundo del archivo.
2. Transcribe ABSOLUTAMENTE TODAS las palabras y frases habladas sin omitir, resumir ni cortar nada.
3. Divide todo el discurso de manera secuencial y continua en múltiples segmentos cortos (cada segmento debe contener entre 2 y 5 palabras, con una duración aproximada de 1.2 a 2.5 segundos por frase).
4. Genera marcas de tiempo exactas ("start" y "end" en segundos flotantes con decimales) para cada segmento y para cada palabra individual dentro del segmento.
5. Los segmentos deben cubrir toda la duración del audio de forma progresiva. El último segmento debe coincidir con el final del discurso hablado en el audio.

Devuelve EXCLUSIVAMENTE un objeto JSON válido con la lista completa de todos los segmentos:
{
  "language": "es",
  "segments": [
    {
      "id": "seg_0",
      "start": 0.0,
      "end": 2.1,
      "text": "Frase de inicio",
      "words": [
        { "id": "w_0_0", "word": "Frase", "start": 0.0, "end": 0.6 },
        { "id": "w_0_1", "word": "de", "start": 0.6, "end": 1.1 },
        { "id": "w_0_2", "word": "inicio", "start": 1.1, "end": 2.1 }
      ]
    },
    {
      "id": "seg_1",
      "start": 2.1,
      "end": 4.5,
      "text": "Siguiente frase continua",
      "words": [
        { "id": "w_1_0", "word": "Siguiente", "start": 2.1, "end": 3.0 },
        { "id": "w_1_1", "word": "frase", "start": 3.0, "end": 3.7 },
        { "id": "w_1_2", "word": "continua", "start": 3.7, "end": 4.5 }
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
      onProgress?.(`Transcribiendo con Google Gemini (${model})...`);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cleanKey)}`;

      const requestBody = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType.includes('audio') || mimeType.includes('video') ? mimeType : 'audio/wav',
                  data: rawData,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
          maxOutputTokens: 8192,
        },
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout for complete transcription

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

      // Validate and normalize all segments & word-level timestamps
      const normalizedSegments: SubtitleSegment[] = parsed.segments.map((seg: SubtitleSegment, sIdx: number) => {
        const start = typeof seg.start === 'number' ? Math.max(0, seg.start) : sIdx * 2.5;
        const end = typeof seg.end === 'number' ? Math.max(start + 0.3, seg.end) : start + 2.5;
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
