import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Video as VideoIcon,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  Trash2,
  Search,
  Sliders,
  ShieldCheck,
  Terminal,
  FileCode,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { parseSrt, stringifySrt, stringifyVtt, generateLosslessFfmpegCommands } from '../../services/srtParser';
import { generateAssSubtitles } from '../../services/assGenerator';
import { SUBTITLE_PRESETS } from '../../constants/presets';
import type { SubtitleSegment, SubtitleStyle, VideoMetadata, Word } from '../../types/subtitle';
import { SubtitleOverlay } from '../VideoPlayer/SubtitleOverlay';

interface VideoSrtMergerProps {
  onOpenInStudio: (video: VideoMetadata, segments: SubtitleSegment[]) => void;
  onNavigateHome: () => void;
}

const MAX_VIDEO_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB in bytes

export const VideoSrtMerger: React.FC<VideoSrtMergerProps> = ({
  onOpenInStudio,
  onNavigateHome,
}) => {
  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({ width: 1920, height: 1080 });
  const [videoError, setVideoError] = useState<string | null>(null);

  // Subtitle state
  const [srtFile, setSrtFile] = useState<File | null>(null);
  const [segments, setSegments] = useState<SubtitleSegment[]>([]);
  const [srtError, setSrtError] = useState<string | null>(null);

  // Player & preview state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedStyle, setSelectedStyle] = useState<SubtitleStyle>(SUBTITLE_PRESETS[0]);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSubtitlesList, setShowSubtitlesList] = useState<boolean>(false);
  const [isDragOverAll, setIsDragOverAll] = useState<boolean>(false);

  // Sizing formatting helpers
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatSeconds = (sec: number): string => {
    const totalSec = Math.floor(sec || 0);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Handle Video file selection & validation
  const handleProcessVideo = (file: File) => {
    setVideoError(null);

    if (file.size > MAX_VIDEO_BYTES) {
      setVideoError(`El archivo pesa ${formatBytes(file.size)}, superando el límite máximo permitido de 2 GB.`);
      return;
    }

    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|mov|mkv|webm|avi|m4v)$/i)) {
      setVideoError('Por favor selecciona un archivo de video válido (.mp4, .mov, .mkv, .webm, .avi).');
      return;
    }

    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(objectUrl);

    // Get resolution & duration via hidden video element
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = objectUrl;
    tempVideo.onloadedmetadata = () => {
      setVideoDuration(tempVideo.duration || 0);
      setVideoDimensions({
        width: tempVideo.videoWidth || 1920,
        height: tempVideo.videoHeight || 1080,
      });
    };
  };

  // Handle SRT / VTT file selection & parsing
  const handleProcessSrt = async (file: File) => {
    setSrtError(null);

    if (!file.name.match(/\.(srt|vtt|txt)$/i)) {
      setSrtError('El archivo debe tener formato .srt o .vtt.');
      return;
    }

    try {
      const text = await file.text();
      const parsed = parseSrt(text);

      if (parsed.length === 0) {
        setSrtError('No se encontraron subtítulos válidos en el archivo. Verifica el formato de marcas de tiempo.');
        return;
      }

      setSrtFile(file);
      setSegments(parsed);

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err) {
      setSrtError('Error al leer el archivo de subtítulos.');
      console.error(err);
    }
  };

  // Unified drag and drop handling
  const handleUniversalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverAll(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => {
      if (file.name.match(/\.(srt|vtt)$/i)) {
        handleProcessSrt(file);
      } else if (file.type.startsWith('video/') || file.name.match(/\.(mp4|mov|mkv|webm|avi)$/i)) {
        handleProcessVideo(file);
      }
    });
  };

  // Video playback loop for subtitles sync
  useEffect(() => {
    let animId: number;
    const updateLoop = () => {
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
      }
      animId = requestAnimationFrame(updateLoop);
    };
    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Find active subtitle segment & word
  const activeSegment: SubtitleSegment | null = useMemo(() => {
    return segments.find((seg) => currentTime >= seg.start && currentTime <= seg.end) || null;
  }, [segments, currentTime]);

  const activeWord: Word | null = useMemo(() => {
    if (!activeSegment || !activeSegment.words) return null;
    return activeSegment.words.find((w) => currentTime >= w.start && currentTime <= w.end) || null;
  }, [activeSegment, currentTime]);

  // Commands for lossless muxing
  const ffmpegCommands = useMemo(() => {
    if (!videoFile) return null;
    return generateLosslessFfmpegCommands(videoFile.name, srtFile?.name || 'subtitulos.srt');
  }, [videoFile, srtFile]);

  const handleCopyCommand = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  // Action: Open in Studio
  const handleOpenInStudio = () => {
    if (!videoFile || !videoUrl) return;

    const metadata: VideoMetadata = {
      name: videoFile.name,
      duration: videoDuration,
      width: videoDimensions.width,
      height: videoDimensions.height,
      url: videoUrl,
      file: videoFile,
    };

    onOpenInStudio(metadata, segments);
  };

  // Download synced files
  const handleDownloadSrt = () => {
    if (segments.length === 0) return;
    const content = stringifySrt(segments);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(videoFile?.name || 'video').replace(/\.[^/.]+$/, '')}_subtitulos.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadVtt = () => {
    if (segments.length === 0) return;
    const content = stringifyVtt(segments);
    const blob = new Blob([content], { type: 'text/vtt;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(videoFile?.name || 'video').replace(/\.[^/.]+$/, '')}_subtitulos.vtt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAss = () => {
    if (segments.length === 0) return;
    const content = generateAssSubtitles(segments, selectedStyle);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(videoFile?.name || 'video').replace(/\.[^/.]+$/, '')}_subtitulos_estilizados.ass`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered segments for search drawer
  const filteredSegments = useMemo(() => {
    if (!searchQuery.trim()) return segments;
    return segments.filter((s) => s.text.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [segments, searchQuery]);

  const bothFilesLoaded = Boolean(videoFile && segments.length > 0);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOverAll(true);
      }}
      onDragLeave={() => setIsDragOverAll(false)}
      onDrop={handleUniversalDrop}
      className="min-h-[85vh] bg-white text-black py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative"
    >
      {/* Universal Drag Overlay */}
      {isDragOverAll && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center pointer-events-none animate-in fade-in duration-200">
          <div className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center mb-4 shadow-2xl animate-bounce">
            <UploadCloud className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mb-2">Suelta aquí tu Video y archivo .SRT</h2>
          <p className="text-sm text-gray-200 max-w-md">
            Detectaremos automáticamente cada archivo y los prepararemos para fusionar sin pérdida de calidad.
          </p>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-gray-100">
        <div>
          <div className="flex items-center space-x-2.5 mb-2.5">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Sin Pérdida de Calidad • Hasta 2 GB</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-black">
            Unir Video + Subtítulos SRT
          </h1>

          <p className="text-sm text-gray-500 mt-2 max-w-2xl leading-relaxed">
            Junta tu archivo de video de hasta <strong>2 GB</strong> con tu archivo de subtítulos <strong>.SRT</strong> sin recodificar ni perder un solo píxel de resolución, color o calidad de audio.
          </p>
        </div>

        {/* Back / Navigation CTA */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onNavigateHome}
            className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>

      {/* Two-Column Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
        
        {/* ===================== VIDEO UPLOAD CARD ===================== */}
        <div
          className={`rounded-3xl border-2 transition-all p-6 sm:p-7 flex flex-col justify-between ${
            videoFile
              ? 'border-gray-200 bg-gray-50/50 shadow-sm'
              : 'border-dashed border-gray-300 hover:border-black bg-white hover:bg-gray-50/30'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center shadow-sm">
                  <VideoIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-black">Archivo de Video</h3>
                  <p className="text-[11px] text-gray-400">Hasta 2 GB • MP4, MOV, MKV, WebM</p>
                </div>
              </div>

              {videoFile && (
                <button
                  onClick={() => {
                    setVideoFile(null);
                    setVideoUrl(null);
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Eliminar video"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {videoError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{videoError}</span>
              </div>
            )}

            {/* Video loaded details */}
            {videoFile ? (
              <div className="space-y-4 pt-1">
                <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-black truncate block flex-1" title={videoFile.name}>
                      {videoFile.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-extrabold uppercase shrink-0">
                      {videoFile.name.split('.').pop() || 'VIDEO'}
                    </span>
                  </div>

                  {/* Size Progress Bar towards 2GB */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-gray-600 mb-1">
                      <span>Tamaño del archivo:</span>
                      <strong className="text-black">{formatBytes(videoFile.size)} / 2.00 GB</strong>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(4, (videoFile.size / MAX_VIDEO_BYTES) * 100))}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-gray-500 border-t border-gray-100">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Resolución</span>
                      <span className="font-semibold text-black">
                        {videoDimensions.width} x {videoDimensions.height}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Duración</span>
                      <span className="font-semibold text-black">{formatSeconds(videoDuration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/x-matroska,video/webm,video/x-msvideo,.mp4,.mov,.mkv,.webm,.avi"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleProcessVideo(f);
                  }}
                />
                <div className="py-10 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-black">
                      Haz clic para subir o arrastra tu video aquí
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Acepta archivos de hasta 2 GB con cualquier resolución (4K, 1080p, 60fps)
                    </p>
                  </div>
                </div>
              </label>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200/60 mt-4 flex items-center justify-between text-[11px] text-gray-400">
            <span>Máximo: 2.048 MB (2 GB)</span>
            {videoFile && <span className="text-emerald-600 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Video verificado</span>
            </span>}
          </div>
        </div>

        {/* ===================== SRT SUBTITLE UPLOAD CARD ===================== */}
        <div
          className={`rounded-3xl border-2 transition-all p-6 sm:p-7 flex flex-col justify-between ${
            srtFile
              ? 'border-gray-200 bg-gray-50/50 shadow-sm'
              : 'border-dashed border-gray-300 hover:border-black bg-white hover:bg-gray-50/30'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center shadow-sm">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-black">Archivo de Subtítulos (.SRT)</h3>
                  <p className="text-[11px] text-gray-400">SubRip (.srt) o WebVTT (.vtt)</p>
                </div>
              </div>

              {srtFile && (
                <button
                  onClick={() => {
                    setSrtFile(null);
                    setSegments([]);
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Eliminar subtítulos"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {srtError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{srtError}</span>
              </div>
            )}

            {/* SRT loaded details */}
            {srtFile && segments.length > 0 ? (
              <div className="space-y-4 pt-1">
                <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-black truncate block flex-1" title={srtFile.name}>
                      {srtFile.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase shrink-0">
                      {segments.length} FRASES
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Rango de tiempo</span>
                      <span className="font-semibold text-black">
                        {formatSeconds(segments[0]?.start || 0)} → {formatSeconds(segments[segments.length - 1]?.end || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Total palabras</span>
                      <span className="font-semibold text-black">
                        {segments.reduce((acc, s) => acc + (s.words ? s.words.length : 0), 0)} palabras
                      </span>
                    </div>
                  </div>

                  {/* Preview first subtitle line */}
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[11px]">
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Primera frase:</span>
                    <p className="text-gray-800 italic truncate">"{segments[0]?.text}"</p>
                  </div>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept=".srt,.vtt,.txt,text/plain"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleProcessSrt(f);
                  }}
                />
                <div className="py-10 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-black">
                      Haz clic para subir o arrastra tu archivo .SRT aquí
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Soporta codificación UTF-8, marcas de tiempo milisegundos y etiquetas estándar
                    </p>
                  </div>
                </div>
              </label>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200/60 mt-4 flex items-center justify-between text-[11px] text-gray-400">
            <span>Formato: SubRip (.srt) / WebVTT (.vtt)</span>
            {segments.length > 0 && <span className="text-emerald-600 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Sincronización lista</span>
            </span>}
          </div>
        </div>

      </div>

      {/* ===================== MERGE / PREVIEW / ACTION SECTION ===================== */}
      {bothFilesLoaded && videoUrl && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 mt-10 pt-8 border-t border-gray-200"
        >
          {/* Main Action Bar */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-black text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1 text-center md:text-left">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>Video y Subtítulos vinculados correctamente</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                ¿Qué deseas hacer con tu video fusionado?
              </h2>
              <p className="text-xs text-gray-300 max-w-xl">
                Puedes abrirlo en el Editor para personalizar animaciones y estilos visuales, o copiar el comando de remuxing instantáneo sin perder 1 solo fotograma de calidad.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
              <button
                onClick={handleOpenInStudio}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 rounded-full bg-white text-black font-bold text-xs sm:text-sm hover:bg-gray-100 transition-all shadow-lg active:scale-95"
              >
                <Sliders className="w-4 h-4" />
                <span>Abrir en Editor de Subtitla</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleDownloadSrt}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Descargar .SRT Limpio</span>
              </button>
            </div>
          </div>

          {/* Interactive Player with Real-Time Subtitles Overlay */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Player Column */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center">
              <div className="w-full max-w-2xl bg-black rounded-3xl overflow-hidden shadow-2xl relative group border border-gray-200">
                
                {/* HTML5 Video Element */}
                <div className="relative aspect-video flex items-center justify-center bg-black">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    playsInline
                    muted={isMuted}
                    onClick={togglePlay}
                    className="w-full h-full object-contain cursor-pointer"
                  />

                  {/* Subtitle Overlay at 60 FPS */}
                  <SubtitleOverlay
                    currentTime={currentTime}
                    activeSegment={activeSegment}
                    activeWord={activeWord}
                    style={selectedStyle}
                  />

                  {/* Top Status Tag */}
                  <div className="absolute top-4 left-4 pointer-events-none">
                    <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-bold border border-white/10 shadow-sm flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Previsualización 1:1 Sin Pérdida</span>
                    </span>
                  </div>
                </div>

                {/* Player Controls Bar */}
                <div className="p-4 bg-gray-950 text-white space-y-3">
                  {/* Progress scrub bar */}
                  <div className="flex items-center space-x-3 text-xs font-mono">
                    <span>{formatSeconds(currentTime)}</span>
                    <input
                      type="range"
                      min={0}
                      max={videoDuration || 100}
                      step={0.05}
                      value={currentTime}
                      onChange={(e) => handleSeek(parseFloat(e.target.value))}
                      className="flex-1 accent-white h-1.5 bg-white/20 rounded-lg cursor-pointer"
                    />
                    <span>{formatSeconds(videoDuration)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={togglePlay}
                        className="p-2 rounded-full bg-white text-black hover:bg-gray-200 transition-colors"
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black translate-x-0.5" />}
                      </button>

                      <button
                        onClick={toggleMute}
                        className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                      </button>

                      <span className="text-[11px] text-gray-400">
                        {segments.length} subtítulos cargados
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowSubtitlesList(!showSubtitlesList)}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white font-medium transition-colors"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Ver Líneas</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Lossless Muxing & Styles Options Column */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              
              {/* Preset Selector */}
              <div className="p-5 rounded-3xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-black">
                    Estilo Visual del Subtítulo
                  </h4>
                  <span className="text-[10px] text-gray-400">60 FPS</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {SUBTITLE_PRESETS.slice(0, 6).map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedStyle(preset)}
                      className={`p-2.5 rounded-2xl text-xs font-semibold text-left transition-all border ${
                        selectedStyle.id === preset.id
                          ? 'bg-black text-white border-black shadow-sm'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
                      }`}
                    >
                      <div className="truncate">{preset.name}</div>
                      <div className="text-[10px] opacity-70 capitalize mt-0.5">{preset.animation}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lossless Export / FFmpeg 1-Click Remuxing Block */}
              {ffmpegCommands && (
                <div className="p-5 rounded-3xl bg-black text-white space-y-4 shadow-lg border border-gray-800">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
                      Muxing 100% Lossless (Sin Recodificar)
                    </h4>
                  </div>

                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    Para unir un archivo de 2 GB en <strong>menos de 3 segundos</strong> en tu ordenador con calidad idéntica garantizada bit a bit:
                  </p>

                  {/* MP4 Command */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 font-bold">Para formato MP4:</span>
                      <button
                        onClick={() => handleCopyCommand(ffmpegCommands.mp4Command, 'mp4')}
                        className="flex items-center space-x-1 text-[10px] text-white/80 hover:text-white bg-white/10 px-2 py-0.5 rounded-lg"
                      >
                        {copiedCommand === 'mp4' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCommand === 'mp4' ? '¡Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                    <pre className="p-2.5 rounded-xl bg-gray-900 border border-white/10 text-[11px] font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap break-all">
                      {ffmpegCommands.mp4Command}
                    </pre>
                  </div>

                  {/* MKV Command */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-cyan-400 font-bold">Para formato MKV (Universal):</span>
                      <button
                        onClick={() => handleCopyCommand(ffmpegCommands.mkvCommand, 'mkv')}
                        className="flex items-center space-x-1 text-[10px] text-white/80 hover:text-white bg-white/10 px-2 py-0.5 rounded-lg"
                      >
                        {copiedCommand === 'mkv' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCommand === 'mkv' ? '¡Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                    <pre className="p-2.5 rounded-xl bg-gray-900 border border-white/10 text-[11px] font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap break-all">
                      {ffmpegCommands.mkvCommand}
                    </pre>
                  </div>

                  <div className="text-[10px] text-gray-400 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>0% compresión • Conserva 4K, HDR y audio envolvente 5.1/7.1</span>
                  </div>
                </div>
              )}

              {/* Subtitles Download Options */}
              <div className="p-5 rounded-3xl bg-gray-50 border border-gray-200 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-black">
                  Formatos de Subtítulos Listos
                </h4>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={handleDownloadSrt}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-gray-100 border border-gray-200 text-xs font-semibold transition-colors"
                  >
                    <span className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-black" />
                      <span>Descargar .SRT Sincronizado</span>
                    </span>
                    <Download className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  <button
                    onClick={handleDownloadVtt}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-gray-100 border border-gray-200 text-xs font-semibold transition-colors"
                  >
                    <span className="flex items-center space-x-2">
                      <FileCode className="w-4 h-4 text-black" />
                      <span>Descargar .VTT (Para Web / HTML5)</span>
                    </span>
                    <Download className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  <button
                    onClick={handleDownloadAss}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-gray-100 border border-gray-200 text-xs font-semibold transition-colors"
                  >
                    <span className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>Descargar .ASS (Con Estilos y Fuentes)</span>
                    </span>
                    <Download className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Subtitles Search & List Drawer */}
          {showSubtitlesList && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-6 rounded-3xl bg-gray-50 border border-gray-200 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-black">Líneas de Subtítulos ({segments.length})</h3>
                  <p className="text-xs text-gray-500">Haz clic en cualquier línea para saltar al segundo exacto en el video</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar frase..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredSegments.map((seg, idx) => (
                  <div
                    key={seg.id || idx}
                    onClick={() => handleSeek(seg.start)}
                    className="p-3 rounded-2xl bg-white hover:bg-gray-100 border border-gray-200 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="font-mono text-gray-400 text-[11px] shrink-0">
                      {formatSeconds(seg.start)} → {formatSeconds(seg.end)}
                    </span>
                    <span className="font-medium text-black truncate flex-1">{seg.text}</span>
                    <span className="text-[10px] text-gray-400 shrink-0">{seg.words?.length || 0} palabras</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </motion.div>
      )}

    </div>
  );
};
