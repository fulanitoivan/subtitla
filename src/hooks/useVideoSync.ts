import { useState, useEffect, useRef, useCallback } from 'react';
import type { SubtitleSegment, Word } from '../types/subtitle';

interface UseVideoSyncProps {
  segments: SubtitleSegment[];
}

export function useVideoSync({ segments }: UseVideoSyncProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [activeSegment, setActiveSegment] = useState<SubtitleSegment | null>(null);
  const [activeWord, setActiveWord] = useState<Word | null>(null);

  const requestRef = useRef<number | null>(null);

  // Búsqueda de palabra y segmento activo en cada cuadro
  const updateActiveElements = useCallback((time: number) => {
    let currentSeg: SubtitleSegment | null = null;
    let currentW: Word | null = null;

    for (const seg of segments) {
      if (time >= seg.start && time <= seg.end) {
        currentSeg = seg;
        if (seg.words) {
          for (const w of seg.words) {
            if (time >= w.start && time <= w.end) {
              currentW = w;
              break;
            }
          }
        }
        break;
      }
    }

    setActiveSegment(currentSeg);
    setActiveWord(currentW);
  }, [segments]);

  // Loop de alta precisión con requestAnimationFrame
  const animateSync = useCallback(() => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      updateActiveElements(time);
    }
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animateSync);
    }
  }, [isPlaying, updateActiveElements]);

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animateSync);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, animateSync]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch((err) => {
        console.warn('Video play was prevented:', err);
      });
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seekTo = (timeInSeconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = timeInSeconds;
    setCurrentTime(timeInSeconds);
    updateActiveElements(timeInSeconds);
  };

  return {
    videoRef,
    currentTime,
    duration,
    isPlaying,
    activeSegment,
    activeWord,
    setDuration,
    setIsPlaying,
    setCurrentTime,
    togglePlay,
    seekTo,
  };
}
