import React from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize } from 'lucide-react';

interface ControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onFastForward: (seconds: number) => void;
  playbackRate: number;
  onChangePlaybackRate: (rate: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  onTogglePlay,
  currentTime,
  duration,
  onSeek,
  onFastForward,
  playbackRate,
  onChangePlaybackRate,
  isMuted,
  onToggleMute,
  onToggleFullscreen,
}) => {
  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 sm:p-4 rounded-b-2xl flex flex-col space-y-2 select-none">
      
      {/* Timeline Scrubber */}
      <div className="relative group flex items-center cursor-pointer">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.05}
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer focus:outline-none transition-all group-hover:h-2.5"
          style={{
            background: `linear-gradient(to right, #8b5cf6 ${progressPercent}%, rgba(255, 255, 255, 0.2) ${progressPercent}%)`,
          }}
        />
      </div>

      {/* Control Buttons Bar */}
      <div className="flex items-center justify-between text-white text-xs">
        
        {/* Left: Playback buttons & Time */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onTogglePlay}
            className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition-transform active:scale-95"
            title={isPlaying ? 'Pausar (Espacio)' : 'Reproducir (Espacio)'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
          </button>

          <button
            onClick={() => onFastForward(-3)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Retroceder 3s"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => onFastForward(3)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Avanzar 3s"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <div className="font-mono text-xs text-slate-300 pl-1">
            <span className="text-white font-semibold">{formatTime(currentTime)}</span>
            <span className="text-slate-500"> / {formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Audio, Speed & Fullscreen */}
        <div className="flex items-center space-x-2">
          
          {/* Mute button */}
          <button
            onClick={onToggleMute}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Playback speed selector */}
          <select
            value={playbackRate}
            onChange={(e) => onChangePlaybackRate(parseFloat(e.target.value))}
            className="bg-slate-800 text-slate-200 border border-white/10 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1}>1.0x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
          </select>

          {/* Fullscreen */}
          <button
            onClick={onToggleFullscreen}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
            title="Pantalla completa"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
