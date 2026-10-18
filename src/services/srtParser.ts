import type { SubtitleSegment, Word } from '../types/subtitle';

/**
 * Robust SubRip (.srt) and WebVTT (.vtt) parser with millisecond precision,
 * HTML tag cleaning, BOM handling, and automatic word-level timing interpolation.
 */

// Converts timecode (HH:MM:SS,mmm or HH:MM:SS.mmm or MM:SS.mmm) to seconds
export function timecodeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().replace(',', '.');
  const parts = clean.split(':');

  if (parts.length === 3) {
    const hours = parseFloat(parts[0]) || 0;
    const minutes = parseFloat(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const minutes = parseFloat(parts[0]) || 0;
    const seconds = parseFloat(parts[1]) || 0;
    return minutes * 60 + seconds;
  } else {
    return parseFloat(clean) || 0;
  }
}

// Formats seconds to SRT timecode: HH:MM:SS,mmm
export function secondsToSrtTimecode(seconds: number): string {
  const totalMs = Math.max(0, Math.round(seconds * 1000));
  const ms = totalMs % 1000;
  const totalSeconds = Math.floor(totalMs / 1000);
  const s = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const m = totalMinutes % 60;
  const h = Math.floor(totalMinutes / 60);

  const pad = (n: number, z = 2) => n.toString().padStart(z, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
}

// Formats seconds to WebVTT timecode: HH:MM:SS.mmm
export function secondsToVttTimecode(seconds: number): string {
  return secondsToSrtTimecode(seconds).replace(',', '.');
}

// Clean HTML tags and styling artifacts
export function cleanSubtitleText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, '') // remove HTML tags <i>, <b>, <font>, etc.
    .replace(/\{[^}]*\}/g, '') // remove ASS tags {\an8}, {\b1}, etc.
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

/**
 * Parses raw SRT or VTT content into SubtitleSegment array
 */
export function parseSrt(rawContent: string): SubtitleSegment[] {
  if (!rawContent || !rawContent.trim()) return [];

  // Remove Byte Order Mark (BOM) if present and normalize line endings
  const content = rawContent.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Split into subtitle blocks by double newlines (or more)
  const blocks = content.split(/\n\s*\n/);
  const segments: SubtitleSegment[] = [];

  // Regex to match timestamp line: e.g. "00:00:01,234 --> 00:00:04,567"
  const timestampRegex = /((?:\d{1,2}:)?\d{1,2}:\d{2}[,.]\d{2,3})\s*-->\s*((?:\d{1,2}:)?\d{1,2}:\d{2}[,.]\d{2,3})/;

  let segmentCounter = 0;

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    // Skip WebVTT header blocks
    if (lines[0].toUpperCase().startsWith('WEBVTT') || lines[0].toUpperCase().startsWith('NOTE')) {
      continue;
    }

    // Find the line containing the "-->" timestamp arrow
    let timestampLineIndex = -1;
    let match: RegExpMatchArray | null = null;

    for (let i = 0; i < lines.length; i++) {
      const lineMatch = lines[i].match(timestampRegex);
      if (lineMatch) {
        timestampLineIndex = i;
        match = lineMatch;
        break;
      }
    }

    if (!match || timestampLineIndex === -1) continue;

    const startSeconds = timecodeToSeconds(match[1]);
    const endSeconds = Math.max(startSeconds + 0.2, timecodeToSeconds(match[2]));

    // Everything after the timestamp line is subtitle text
    const textLines = lines.slice(timestampLineIndex + 1);
    const cleanedText = textLines.map(cleanSubtitleText).filter(Boolean).join(' ');

    if (!cleanedText) continue;

    // Generate word-level breakdown so that animations/karaoke work
    const rawWords = cleanedText.split(/\s+/).filter(Boolean);
    const duration = Math.max(0.2, endSeconds - startSeconds);
    const wordDuration = duration / Math.max(1, rawWords.length);

    const words: Word[] = rawWords.map((word, wIdx) => ({
      id: `w_${segmentCounter}_${wIdx}`,
      word,
      start: Number((startSeconds + wIdx * wordDuration).toFixed(3)),
      end: Number((startSeconds + (wIdx + 1) * wordDuration).toFixed(3)),
    }));

    segments.push({
      id: `seg_${segmentCounter}`,
      start: Number(startSeconds.toFixed(3)),
      end: Number(endSeconds.toFixed(3)),
      text: cleanedText,
      words,
    });

    segmentCounter++;
  }

  // Sort by start timestamp ascending
  return segments.sort((a, b) => a.start - b.start);
}

/**
 * Converts SubtitleSegment[] back into a clean .srt format string
 */
export function stringifySrt(segments: SubtitleSegment[]): string {
  return segments
    .map((seg, idx) => {
      const num = idx + 1;
      const start = secondsToSrtTimecode(seg.start);
      const end = secondsToSrtTimecode(seg.end);
      return `${num}\n${start} --> ${end}\n${seg.text}\n`;
    })
    .join('\n');
}

/**
 * Converts SubtitleSegment[] into standard WebVTT string
 */
export function stringifyVtt(segments: SubtitleSegment[]): string {
  let vtt = 'WEBVTT - Generado por Subtitla\n\n';
  segments.forEach((seg, idx) => {
    vtt += `${idx + 1}\n${secondsToVttTimecode(seg.start)} --> ${secondsToVttTimecode(seg.end)}\n${seg.text}\n\n`;
  });
  return vtt;
}

/**
 * Builds an MKV/MP4 Lossless Remux command for terminal execution
 */
export function generateLosslessFfmpegCommands(videoFilename: string, srtFilename: string) {
  const safeVideo = `"${videoFilename || 'video.mp4'}"`;
  const safeSrt = `"${srtFilename || 'subtitulos.srt'}"`;
  const baseName = (videoFilename || 'video').replace(/\.[^/.]+$/, '');

  const mp4Output = `"${baseName}_subtitulado.mp4"`;
  const mkvOutput = `"${baseName}_subtitulado.mkv"`;

  return {
    mp4Command: `ffmpeg -i ${safeVideo} -i ${safeSrt} -c copy -c:s mov_text ${mp4Output}`,
    mkvCommand: `ffmpeg -i ${safeVideo} -i ${safeSrt} -c copy ${mkvOutput}`,
    description:
      'Ambos comandos copian directamente los flujos de audio y vídeo sin recodificar. El proceso toma solo 1 a 3 segundos para un archivo de 2 GB y conserva el 100% exacto de la calidad de imagen y sonido original.',
  };
}
