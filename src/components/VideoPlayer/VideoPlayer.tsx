import React, { useState, useRef, useEffect } from 'react';
import { SubtitleOverlay } from './SubtitleOverlay';
import { Controls } from './Controls';
import type { SubtitleSegment, SubtitleStyle, Word, VideoMetadata } from '../../types/subtitle';
import { Smartphone, Monitor, Square, MoveVertical } from 'lucide-react';

interface VideoPlayerProps {
  video: VideoMetadata;
  segments: SubtitleSegment[];
  style: SubtitleStyle;
  onChangeStyle: (newStyle: SubtitleStyle) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  activeSegment: SubtitleSegment | null;
  activeWord: Word | null;
  setDuration: (duration: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
}

export type AspectRatioType = '9:16' | '16:9' | '1:1' | '4:5';

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  style,
  onChangeStyle,
  videoRef,
  currentTime,
  duration,
  isPlaying,
  activeSegment,
  activeWord,
  setDuration,
  setIsPlaying,
  onTogglePlay,
  onSeek,
}) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('9:16');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isDraggingPosition, setIsDraggingPosition] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        onTogglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        onSeek(Math.max(0, currentTime - 3));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        onSeek(Math.min(duration, currentTime + 3));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, duration, onTogglePlay, onSeek]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleFastForward = (seconds: number) => {
    onSeek(Math.max(0, Math.min(duration, currentTime + seconds)));
  };

  const handleChangePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleToggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(err => console.error(err));
      } else {
        document.exitFullscreen().catch(err => console.error(err));
      }
    }
  };

  // Arrastrar la posición vertical de los subtítulos haciendo clic en la pantalla
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetY = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Si hace clic cerca de la zona media/inferior para mover subtítulos
    if (offsetY > 15 && offsetY < 90) {
      setIsDraggingPosition(true);
      onChangeStyle({
        ...style,
        positionY: Math.round(offsetY),
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingPosition || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetY = Math.max(15, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100));
    onChangeStyle({
      ...style,
      positionY: Math.round(offsetY),
    });
  };

  const handlePointerUp = () => {
    setIsDraggingPosition(false);
  };

  // Mapear aspect ratio a clases de Tailwind
  const getAspectClass = () => {
    switch (aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-w-[360px] sm:max-w-[400px]';
      case '16:9':
        return 'aspect-[16/9] max-w-[720px]';
      case '1:1':
        return 'aspect-square max-w-[440px]';
      case '4:5':
        return 'aspect-[4/5] max-w-[420px]';
    }
  };

  return (
    <div className="flex flex-col items-center w-full space-y-4">
      
      {/* Aspect Ratio Switcher */}
      <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-white/10 shadow-lg text-xs font-semibold">
        <button
          onClick={() => setAspectRatio('9:16')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
            aspectRatio === '9:16' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
          title="9:16 (TikTok / Reels / Shorts)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>9:16 Viral</span>
        </button>
        <button
          onClick={() => setAspectRatio('16:9')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
            aspectRatio === '16:9' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
          title="16:9 (YouTube / Horizontal)"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>16:9 Web</span>
        </button>
        <button
          onClick={() => setAspectRatio('1:1')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
            aspectRatio === '1:1' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
          title="1:1 (Cuadrado / Feed)"
        >
          <Square className="w-3.5 h-3.5" />
          <span>1:1 Feed</span>
        </button>
      </div>

      {/* Main Video Screen Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative w-full ${getAspectClass()} rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/10 group select-none transition-all`}
      >
        {/* HTML5 Video */}
        <video
          ref={videoRef}
          src={video.url}
          playsInline
          crossOrigin="anonymous"
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={onTogglePlay}
          className="w-full h-full object-cover cursor-pointer"
        />

        {/* Real-time Subtitle Overlay */}
        <SubtitleOverlay
          currentTime={currentTime}
          activeSegment={activeSegment}
          activeWord={activeWord}
          style={style}
          isDraggingPosition={isDraggingPosition}
        />

        {/* Vertical Position Drag Indicator */}
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md p-1.5 rounded-full opacity-0 group-hover:opacity-80 transition-opacity pointer-events-none flex flex-col items-center text-[10px] text-purple-300 border border-white/10"
        >
          <MoveVertical className="w-4 h-4" />
          <span>{style.positionY}%</span>
        </div>

        {/* Controls Overlay at Bottom */}
        <div className="absolute inset-x-0 bottom-0 opacity-100 sm:opacity-90 group-hover:opacity-100 transition-opacity">
          <Controls
            isPlaying={isPlaying}
            onTogglePlay={onTogglePlay}
            currentTime={currentTime}
            duration={duration}
            onSeek={onSeek}
            onFastForward={handleFastForward}
            playbackRate={playbackRate}
            onChangePlaybackRate={handleChangePlaybackRate}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onToggleFullscreen={handleToggleFullscreen}
          />
        </div>

      </div>

      <p className="text-xs text-slate-400 flex items-center space-x-1">
        <span>💡 Arrastra el cursor verticalmente sobre el video para ajustar la altura de los subtítulos ({style.positionY}%).</span>
      </p>

    </div>
  );
};
