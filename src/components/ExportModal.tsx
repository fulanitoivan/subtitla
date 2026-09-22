import React, { useState } from 'react';
import type { SubtitleSegment, SubtitleStyle, VideoMetadata } from '../types/subtitle';
import { generateAssSubtitles, generateSrtSubtitles, generateFfmpegCommand } from '../services/assGenerator';
import { useVideoRecorder } from '../hooks/useVideoRecorder';
import confetti from 'canvas-confetti';
import { X, Download, Film, FileCode, Terminal, Check, Loader2, Sparkles } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoMetadata;
  segments: SubtitleSegment[];
  style: SubtitleStyle;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  video,
  segments,
  style,
  videoRef,
}) => {
  const [copiedFfmpeg, setCopiedFfmpeg] = useState(false);
  const { isRendering, renderProgress, renderedVideoUrl, exportedMimeType, renderAndExport, cancelRender } = useVideoRecorder();

  if (!isOpen) return null;

  const handleStartRender = async () => {
    if (!videoRef.current) return;
    try {
      await renderAndExport({
        videoElement: videoRef.current,
        segments,
        style,
        onProgress: (p) => {
          if (p === 100) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          }
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const isWebm = exportedMimeType.includes('webm');
  const fileExtension = isWebm ? '.webm' : '.mp4';
  const cleanBaseName = (video.name || 'video_viral').replace(/\.[^/.]+$/, '');
  const finalFilename = `subtitla_${cleanBaseName}${fileExtension}`;

  const handleDownloadAss = () => {
    const assContent = generateAssSubtitles(segments, style);
    const blob = new Blob([assContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subtitles_viral.ass';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSrt = () => {
    const srtContent = generateSrtSubtitles(segments);
    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subtitles.srt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const ffmpegCommand = generateFfmpegCommand(video.name || 'input.mp4', 'subtitles_viral.ass', 'video_con_subtitulos.mp4');

  const handleCopyFfmpeg = () => {
    navigator.clipboard.writeText(ffmpegCommand);
    setCopiedFfmpeg(true);
    setTimeout(() => setCopiedFfmpeg(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-pop-in">
      <div className="relative w-full max-w-xl apple-glass rounded-[32px] p-7 sm:p-8 shadow-2xl border border-white text-slate-900 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-[#0071E3] border border-blue-200/60 shadow-sm">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Exportar Video y Subtítulos</h3>
              <p className="text-xs text-slate-500">Descarga tu video final con audio HD o archivos de subtítulo</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option 1: Direct Video Render & Download (Hardsubbed MP4) */}
        <div className="apple-glass-card p-6 rounded-[24px] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Film className="w-5 h-5 text-[#0071E3]" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Renderizar Video Final (Audio HD)</h4>
                <p className="text-[11px] text-slate-500">Incrusta subtítulos animados con audio original estéreo</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              100% Calidad
            </span>
          </div>

          {isRendering ? (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#0071E3] flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando fotogramas con subtítulos y audio...</span>
                </span>
                <span className="font-mono text-slate-900 font-bold">{renderProgress}%</span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0071E3] via-[#38BDF8] to-emerald-400 rounded-full transition-all duration-150"
                  style={{ width: `${renderProgress}%` }}
                />
              </div>
              <button
                onClick={cancelRender}
                className="text-xs text-rose-500 hover:underline block text-center w-full pt-1 font-semibold"
              >
                Cancelar renderizado
              </button>
            </div>
          ) : renderedVideoUrl ? (
            <div className="space-y-3 pt-2">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-700 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>¡Video renderizado con éxito a máxima calidad con Audio HD!</span>
              </div>
              <a
                href={renderedVideoUrl}
                download={finalFilename}
                className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Video con Audio HD ({fileExtension.toUpperCase()})</span>
              </a>
            </div>
          ) : (
            <button
              onClick={handleStartRender}
              className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-full apple-btn-primary font-bold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Iniciar Renderizado en Navegador</span>
            </button>
          )}
        </div>

        {/* Option 2: Download Subtitle Files */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleDownloadAss}
            className="flex items-center space-x-3 p-3.5 rounded-2xl bg-white/80 hover:bg-white border border-slate-200 hover:border-[#0071E3]/50 shadow-sm transition-all text-left"
          >
            <div className="p-2 rounded-xl bg-blue-50 text-[#0071E3]">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900">Subtítulos .ASS (Avanzado)</h5>
              <p className="text-[10px] text-slate-500">Incluye fuentes, karaoke y colores</p>
            </div>
          </button>

          <button
            onClick={handleDownloadSrt}
            className="flex items-center space-x-3 p-3.5 rounded-2xl bg-white/80 hover:bg-white border border-slate-200 hover:border-[#0071E3]/50 shadow-sm transition-all text-left"
          >
            <div className="p-2 rounded-xl bg-blue-50 text-[#0071E3]">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900">Subtítulos .SRT Estándar</h5>
              <p className="text-[10px] text-slate-500">Para YouTube, Premiere o CapCut</p>
            </div>
          </button>
        </div>

        {/* Option 3: FFmpeg Command for Developers & Server Render */}
        <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-slate-300 font-semibold">
              <Terminal className="w-4 h-4 text-[#38BDF8]" />
              <span>Comando FFmpeg (Para Servidor / Terminal)</span>
            </div>
            <button
              onClick={handleCopyFfmpeg}
              className="flex items-center space-x-1 text-slate-200 hover:text-white bg-white/10 px-2.5 py-0.5 rounded-lg transition-colors font-bold"
            >
              {copiedFfmpeg ? <Check className="w-3 h-3 text-emerald-400" /> : null}
              <span>{copiedFfmpeg ? '¡Copiado!' : 'Copiar'}</span>
            </button>
          </div>
          <pre className="p-2.5 rounded-xl bg-black text-[11px] font-mono text-emerald-400 overflow-x-auto border border-white/5">
            {ffmpegCommand}
          </pre>
        </div>

      </div>
    </div>
  );
};
