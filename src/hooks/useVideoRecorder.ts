import { useState, useRef } from 'react';
import type { SubtitleSegment, SubtitleStyle, Word } from '../types/subtitle';

interface RenderOptions {
  videoElement: HTMLVideoElement;
  segments: SubtitleSegment[];
  style: SubtitleStyle;
  onProgress: (progress: number) => void;
}

export function useVideoRecorder() {
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);
  const [exportedMimeType, setExportedMimeType] = useState<string>('video/mp4');
  const abortControllerRef = useRef<boolean>(false);

  const renderAndExport = async ({
    videoElement,
    segments,
    style,
    onProgress,
  }: RenderOptions): Promise<string> => {
    setIsRendering(true);
    setRenderProgress(0);
    setRenderedVideoUrl(null);
    abortControllerRef.current = false;

    return new Promise(async (resolve, reject) => {
      let audioContext: AudioContext | null = null;
      let audioSourceNode: AudioBufferSourceNode | null = null;
      let animationFrameId: number | null = null;

      try {
        const video = videoElement;
        const width = video.videoWidth || 720;
        const height = video.videoHeight || 1280;
        const duration = video.duration || 10;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          throw new Error('No se pudo inicializar el contexto de Canvas 2D');
        }

        // 1. Extraer y decodificar la pista de audio con Web Audio API para mezcla perfecta
        let audioTrack: MediaStreamTrack | null = null;
        try {
          const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          audioContext = audioCtx;
          const audioDest = audioCtx.createMediaStreamDestination();

          let arrayBuffer: ArrayBuffer;
          const res = await fetch(video.src);
          arrayBuffer = await res.arrayBuffer();

          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          const source = audioCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioDest);
          audioSourceNode = source;

          const tracks = audioDest.stream.getAudioTracks();
          if (tracks.length > 0) {
            audioTrack = tracks[0];
          }
        } catch (audioErr) {
          console.warn('Audio decoding fallback:', audioErr);
          // Fallback a captureStream directo
          try {
            const captureFn = (video as unknown as { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream });
            const directStream = captureFn.captureStream ? captureFn.captureStream() : captureFn.mozCaptureStream ? captureFn.mozCaptureStream() : null;
            if (directStream && directStream.getAudioTracks().length > 0) {
              audioTrack = directStream.getAudioTracks()[0];
            }
          } catch {
            console.warn('No direct audio capture available');
          }
        }

        // 2. Crear Stream combinado de Video (Canvas 30FPS) + Audio (AudioContext PCM)
        const canvasStream = canvas.captureStream(30);
        const combinedStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...(audioTrack ? [audioTrack] : []),
        ]);

        // 3. Selección de mimeType con soporte de audio (AAC / Opus)
        const mimeTypes = [
          'video/mp4;codecs=avc1,mp4a.40.2',
          'video/mp4',
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp8,opus',
          'video/webm',
        ];
        let selectedMimeType = '';
        for (const mime of mimeTypes) {
          if (MediaRecorder.isTypeSupported(mime)) {
            selectedMimeType = mime;
            break;
          }
        }

        setExportedMimeType(selectedMimeType || 'video/mp4');

        const mediaRecorder = new MediaRecorder(combinedStream, {
          mimeType: selectedMimeType || undefined,
          videoBitsPerSecond: 8000000, // 8 Mbps para máxima nitidez
          audioBitsPerSecond: 192000,  // 192 kbps audio HD
        });

        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        const originalMuted = video.muted;
        const originalTime = video.currentTime;
        video.muted = true; // Silenciar el elemento DOM para no duplicar sonido en altavoces

        const finishRecording = () => {
          if (animationFrameId) cancelAnimationFrame(animationFrameId);
          setRenderProgress(100);
          onProgress(100);

          try {
            if (audioSourceNode) audioSourceNode.stop();
          } catch {}

          if (audioContext && audioContext.state !== 'closed') {
            audioContext.close().catch(() => {});
          }

          video.pause();
          video.muted = originalMuted;
          video.currentTime = originalTime;

          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: selectedMimeType || 'video/mp4' });
          const url = URL.createObjectURL(blob);
          setRenderedVideoUrl(url);
          setIsRendering(false);
          resolve(url);
        };

        // 4. Iniciar reproducción sincronizada y captura continua de fotogramas
        video.currentTime = 0;
        await new Promise((r) => setTimeout(r, 100));

        mediaRecorder.start(100);
        if (audioSourceNode) {
          audioSourceNode.start(0);
        }

        await video.play();

        const renderLoop = () => {
          if (abortControllerRef.current) {
            finishRecording();
            reject(new Error('Renderizado cancelado'));
            return;
          }

          const currentTime = video.currentTime;

          // Dibujar fotograma actual del video
          ctx.drawImage(video, 0, 0, width, height);

          // Dibujar subtítulos estilizados sincronizados con la palabra activa
          drawSubtitlesOnCanvas(ctx, currentTime, segments, style, width, height);

          // Progreso
          const progress = Math.min(99, Math.round((currentTime / duration) * 100));
          setRenderProgress(progress);
          onProgress(progress);

          if (video.ended || currentTime >= duration - 0.05) {
            finishRecording();
          } else {
            animationFrameId = requestAnimationFrame(renderLoop);
          }
        };

        animationFrameId = requestAnimationFrame(renderLoop);

      } catch (err) {
        setIsRendering(false);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (audioContext && audioContext.state !== 'closed') {
          audioContext.close().catch(() => {});
        }
        reject(err);
      }
    });
  };

  const cancelRender = () => {
    abortControllerRef.current = true;
    setIsRendering(false);
  };

  return {
    isRendering,
    renderProgress,
    renderedVideoUrl,
    exportedMimeType,
    renderAndExport,
    cancelRender,
  };
}

function drawSubtitlesOnCanvas(
  ctx: CanvasRenderingContext2D,
  time: number,
  segments: SubtitleSegment[],
  style: SubtitleStyle,
  canvasWidth: number,
  canvasHeight: number
) {
  // Buscar segmento activo
  const activeSegment = segments.find((s) => time >= s.start && time <= s.end);
  if (!activeSegment) return;

  const words = activeSegment.words || [];
  if (words.length === 0) return;

  ctx.save();

  // Escalar el tamaño de fuente proporcional al ancho del canvas (base 1080p)
  const scaleFactor = canvasWidth / 1080;
  const scaledFontSize = Math.round(style.fontSize * 1.8 * scaleFactor);

  ctx.font = `${style.fontWeight} ${scaledFontSize}px ${style.fontFamily}, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const posY = (style.positionY / 100) * canvasHeight;
  const posX = (style.positionX / 100) * canvasWidth;

  if (style.displayMode === 'one-word') {
    // 1 sola palabra activa
    const activeWord = words.find((w) => time >= w.start && time <= w.end) || words[0];
    if (activeWord) {
      const text = style.textTransform === 'uppercase' ? activeWord.word.toUpperCase() : activeWord.word;
      const highlight = activeWord.highlightColor || style.highlightColor;

      ctx.save();
      ctx.translate(posX, posY);
      if (style.rotateActiveWord && style.activeWordAngle) {
        ctx.rotate((style.activeWordAngle * Math.PI) / 180);
      }
      ctx.scale(style.animationScale, style.animationScale);

      drawSingleWord(ctx, text, 0, 0, highlight, style, scaleFactor, activeWord.emoji);
      ctx.restore();
    }
  } else {
    // Modo Frase / Dos Palabras / Tres Palabras
    let displayWords: Word[] = words;
    if (style.displayMode === 'two-words' || style.displayMode === 'three-words') {
      const chunkSize = style.displayMode === 'two-words' ? 2 : 3;
      const activeIdx = words.findIndex((w) => time >= w.start && time <= w.end);
      const chunkIdx = activeIdx >= 0 ? Math.floor(activeIdx / chunkSize) : 0;
      displayWords = words.slice(chunkIdx * chunkSize, (chunkIdx + 1) * chunkSize);
    }

    // Calcular ancho total para centrar
    let totalWidth = 0;
    const wordWidths: number[] = [];
    const spaceWidth = ctx.measureText(' ').width;

    displayWords.forEach((w) => {
      const text = style.textTransform === 'uppercase' ? w.word.toUpperCase() : w.word;
      const wWidth = ctx.measureText(text).width;
      wordWidths.push(wWidth);
      totalWidth += wWidth;
    });
    totalWidth += spaceWidth * (displayWords.length - 1);

    // Fondo / Pill contenedor si está activado
    if (style.hasBackground) {
      const pad = style.backgroundPadding * 2 * scaleFactor;
      ctx.fillStyle = hexToRgba(style.backgroundColor, style.backgroundOpacity);
      const rectX = posX - totalWidth / 2 - pad;
      const rectY = posY - scaledFontSize / 2 - pad;
      const rectW = totalWidth + pad * 2;
      const rectH = scaledFontSize + pad * 2;
      drawRoundedRect(ctx, rectX, rectY, rectW, rectH, style.borderRadius * scaleFactor);
    }

    let currentX = posX - totalWidth / 2;

    displayWords.forEach((w, idx) => {
      const isCurrent = time >= w.start && time <= w.end;
      const text = style.textTransform === 'uppercase' ? w.word.toUpperCase() : w.word;
      const wordW = wordWidths[idx];
      const wordCenterX = currentX + wordW / 2;

      ctx.save();
      ctx.translate(wordCenterX, posY);

      if (isCurrent) {
        if (style.rotateActiveWord && style.activeWordAngle) {
          ctx.rotate((style.activeWordAngle * Math.PI) / 180);
        }
        ctx.scale(style.animationScale, style.animationScale);
      }

      const color = isCurrent ? (w.highlightColor || style.highlightColor) : style.textColor;
      drawSingleWord(ctx, text, 0, 0, color, style, scaleFactor, style.showEmojis && isCurrent ? w.emoji : undefined);

      ctx.restore();
      currentX += wordW + spaceWidth;
    });
  }

  ctx.restore();
}

function drawSingleWord(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  style: SubtitleStyle,
  scaleFactor: number,
  emoji?: string
) {
  // Sombra / Glow
  if (style.hasShadow) {
    ctx.shadowColor = style.shadowColor;
    ctx.shadowBlur = style.shadowBlur * scaleFactor;
    ctx.shadowOffsetX = style.shadowOffsetX * scaleFactor;
    ctx.shadowOffsetY = style.shadowOffsetY * scaleFactor;
  } else {
    ctx.shadowColor = 'transparent';
  }

  // Trazo / Stroke exterior
  if (style.hasStroke && style.strokeWidth > 0) {
    ctx.strokeStyle = style.strokeColor;
    ctx.lineWidth = style.strokeWidth * 2.5 * scaleFactor;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(text, x, y);
  }

  // Relleno
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);

  // Dibujar emoji flotante si existe
  if (emoji) {
    ctx.save();
    ctx.font = `${Math.round(style.fontSize * 1.5 * scaleFactor)}px sans-serif`;
    ctx.fillText(emoji, x, y - style.fontSize * 1.6 * scaleFactor);
    ctx.restore();
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y + w, x, y, r);
  ctx.closePath();
  ctx.fill();
}

function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  let r = 0, g = 0, b = 0;
  if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
