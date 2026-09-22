import React from 'react';
import type { SubtitleSegment, SubtitleStyle, Word } from '../../types/subtitle';

interface SubtitleOverlayProps {
  currentTime: number;
  activeSegment: SubtitleSegment | null;
  activeWord: Word | null;
  style: SubtitleStyle;
  isDraggingPosition?: boolean;
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  currentTime,
  activeSegment,
  style,
}) => {
  if (!activeSegment || !activeSegment.words || activeSegment.words.length === 0) {
    return null;
  }

  const words = activeSegment.words;

  // Determinar qué palabras mostrar según el displayMode
  let visibleWords: Word[] = words;

  if (style.displayMode === 'one-word') {
    const current = words.find((w) => currentTime >= w.start && currentTime <= w.end) || words[0];
    visibleWords = current ? [current] : [];
  } else if (style.displayMode === 'two-words' || style.displayMode === 'three-words') {
    const chunkSize = style.displayMode === 'two-words' ? 2 : 3;
    const activeIdx = words.findIndex((w) => currentTime >= w.start && currentTime <= w.end);
    const chunkIdx = activeIdx >= 0 ? Math.floor(activeIdx / chunkSize) : 0;
    visibleWords = words.slice(chunkIdx * chunkSize, (chunkIdx + 1) * chunkSize);
  }

  // Generar estilo de sombra / glow
  let textShadowStyle = 'none';
  if (style.hasShadow) {
    textShadowStyle = `${style.shadowOffsetX}px ${style.shadowOffsetY}px ${style.shadowBlur}px ${style.shadowColor}`;
  }

  // Estilo de fondo / pill
  const backgroundStyle: React.CSSProperties = style.hasBackground
    ? {
        backgroundColor: style.backgroundColor,
        opacity: style.backgroundOpacity,
        padding: `${style.backgroundPadding}px ${style.backgroundPadding * 1.5}px`,
        borderRadius: `${style.borderRadius}px`,
      }
    : {};

  return (
    <div
      className="absolute inset-x-0 pointer-events-none flex justify-center items-center select-none z-20 transition-all duration-75"
      style={{
        top: `${style.positionY}%`,
        transform: 'translateY(-50%)',
      }}
    >
      <div
        className="relative flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center transition-all max-w-[92%]"
        style={{
          fontFamily: style.fontFamily,
          textTransform: style.textTransform,
          fontWeight: style.fontWeight,
          maxWidth: `${style.maxWidth}%`,
        }}
      >
        {/* Fondo translúcido si está activo */}
        {style.hasBackground && (
          <div
            className="absolute inset-0 -z-10 transition-all pointer-events-none"
            style={backgroundStyle}
          />
        )}

        {visibleWords.map((wordObj) => {
          const isCurrent = currentTime >= wordObj.start && currentTime <= wordObj.end;
          const wordText = wordObj.word;

          // Color de la palabra
          const color = isCurrent
            ? wordObj.highlightColor || style.highlightColor
            : style.textColor;

          // Transformación y animación
          let transformStyle = 'scale(1)';
          if (isCurrent) {
            const angle = style.rotateActiveWord ? `${style.activeWordAngle}deg` : '0deg';
            transformStyle = `scale(${style.animationScale}) rotate(${angle})`;
          }

          // Stroke / Borde
          const strokeStyle = style.hasStroke && style.strokeWidth > 0
            ? `${style.strokeWidth}px ${style.strokeColor}`
            : 'none';

          return (
            <div
              key={wordObj.id}
              className="relative inline-flex flex-col items-center transition-all duration-75"
              style={{
                transform: transformStyle,
              }}
            >
              {/* Emoji flotante sobre palabra activa */}
              {style.showEmojis && wordObj.emoji && isCurrent && (
                <span
                  className="absolute -top-7 text-2xl animate-bounce-subtle pointer-events-none select-none drop-shadow-md"
                  style={{ transform: 'translateX(-50%)', left: '50%' }}
                >
                  {wordObj.emoji}
                </span>
              )}

              <span
                style={{
                  fontSize: `${style.fontSize}px`,
                  color: color,
                  textShadow: textShadowStyle,
                  WebkitTextStroke: strokeStyle,
                  paintOrder: 'stroke fill',
                }}
                className={`inline-block tracking-wide leading-tight ${
                  isCurrent && style.animation === 'glow' ? 'filter drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]' : ''
                }`}
              >
                {wordText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
