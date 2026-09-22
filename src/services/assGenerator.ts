import type { SubtitleSegment, SubtitleStyle } from '../types/subtitle';

/**
 * Convierte color hexadecimal RGB (#RRGGBB) a formato BGR de ASS (&H00BBGGRR&)
 */
function hexToAssColor(hex: string, alpha = 0): string {
  const cleanHex = hex.replace('#', '');
  let r = 'FF', g = 'FF', b = 'FF';

  if (cleanHex.length === 6) {
    r = cleanHex.substring(0, 2);
    g = cleanHex.substring(2, 4);
    b = cleanHex.substring(4, 6);
  } else if (cleanHex.length === 3) {
    r = cleanHex[0] + cleanHex[0];
    g = cleanHex[1] + cleanHex[1];
    b = cleanHex[2] + cleanHex[2];
  }

  // Alpha en ASS: 00 = opaco, FF = transparente
  const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0').toUpperCase();
  return `&H${alphaHex}${b.toUpperCase()}${g.toUpperCase()}${r.toUpperCase()}&`;
}

function formatAssTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 100); // Centisegundos

  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
}

export function generateAssSubtitles(
  segments: SubtitleSegment[],
  style: SubtitleStyle,
  videoWidth = 1080,
  videoHeight = 1920
): string {
  const primaryColor = hexToAssColor(style.textColor);
  const highlightColor = hexToAssColor(style.highlightColor);
  const outlineColor = hexToAssColor(style.strokeColor);
  const backColor = hexToAssColor(style.backgroundColor, 1 - style.backgroundOpacity);

  const assHeader = `[Script Info]
Title: Subtitla ASS Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
PlayResX: ${videoWidth}
PlayResY: ${videoHeight}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${style.fontFamily},${Math.round(style.fontSize * 1.8)},${primaryColor},${highlightColor},${outlineColor},${backColor},-1,0,0,0,100,100,0,0,${style.hasBackground ? 3 : 1},${style.strokeWidth * 1.5},${style.shadowBlur ? 3 : 0},2,40,40,${Math.round((100 - style.positionY) * (videoHeight / 100))},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events: string[] = [];

  segments.forEach(seg => {
    // Si tenemos palabras detalladas
    if (seg.words && seg.words.length > 0) {
      if (style.displayMode === 'one-word') {
        // Renderizar una palabra a la vez
        seg.words.forEach(w => {
          const start = formatAssTime(w.start);
          const end = formatAssTime(w.end);
          const wordText = style.textTransform === 'uppercase' ? w.word.toUpperCase() : w.word;
          const wordColor = w.highlightColor ? hexToAssColor(w.highlightColor) : highlightColor;
          events.push(`Dialogue: 0,${start},${end},Default,,0,0,0,,{\\c${wordColor}\\t(0,100,\\fscx115\\fscy115)}${wordText}`);
        });
      } else {
        // Mostrar frase con palabra activa destacada (karaoke / color tag)
        seg.words.forEach((activeWord) => {
          const start = formatAssTime(activeWord.start);
          const end = formatAssTime(activeWord.end);

          const formattedWords = seg.words.map(w => {
            const isCurrent = w.id === activeWord.id;
            const wordText = style.textTransform === 'uppercase' ? w.word.toUpperCase() : w.word;
            if (isCurrent) {
              const activeColor = w.highlightColor ? hexToAssColor(w.highlightColor) : highlightColor;
              return `{\\c${activeColor}\\fscx${Math.round(style.animationScale * 100)}\\fscy${Math.round(style.animationScale * 100)}}${wordText}{\\r}`;
            }
            return `{\\c${primaryColor}}${wordText}`;
          }).join(' ');

          events.push(`Dialogue: 0,${start},${end},Default,,0,0,0,,${formattedWords}`);
        });
      }
    } else {
      // Segmento general
      const start = formatAssTime(seg.start);
      const end = formatAssTime(seg.end);
      const text = style.textTransform === 'uppercase' ? seg.text.toUpperCase() : seg.text;
      events.push(`Dialogue: 0,${start},${end},Default,,0,0,0,,${text}`);
    }
  });

  return assHeader + events.join('\n');
}

export function generateSrtSubtitles(segments: SubtitleSegment[]): string {
  function formatSrtTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  }

  return segments.map((seg, idx) => {
    return `${idx + 1}\n${formatSrtTime(seg.start)} --> ${formatSrtTime(seg.end)}\n${seg.text}\n`;
  }).join('\n');
}

export function generateFfmpegCommand(videoFilename: string, assFilename = 'subtitles.ass', outputFilename = 'output_viral.mp4'): string {
  return `ffmpeg -i "${videoFilename}" -vf "ass='${assFilename}'" -c:v libx264 -crf 18 -preset fast -c:a copy "${outputFilename}"`;
}
