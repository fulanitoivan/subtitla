import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Play, Film, Wand2, ShieldCheck, Sparkles } from 'lucide-react';
import { DEMO_VIDEOS } from '../constants/demoData';
import type { DemoVideoOption } from '../constants/demoData';
import type { VideoMetadata, SubtitleSegment } from '../types/subtitle';

interface DropzoneProps {
  onVideoLoaded: (video: VideoMetadata, segments?: SubtitleSegment[]) => void;
  onTranscribeFile: (file: File) => void;
  isTranscribing: boolean;
  transcriptionStatus: string;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onVideoLoaded,
  onTranscribeFile,
  isTranscribing,
  transcriptionStatus,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live seconds timer during AI transcription
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTranscribing) {
      setElapsedSeconds(0);
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isTranscribing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
      alert('Por favor sube un archivo de video o audio válido (.mp4, .mov, .webm, .mp3, .wav)');
      return;
    }

    onTranscribeFile(file);
  };

  const handleSelectDemo = (demo: DemoVideoOption) => {
    onVideoLoaded(
      {
        name: demo.title,
        duration: demo.duration,
        width: 1080,
        height: 1920,
        url: demo.url,
      },
      demo.segments
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 relative bg-white">
      
      {/* Engine Badge & Title (Voicecheap Minimalist) */}
      <div className="text-center mb-8 space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gray-100 text-black text-xs font-semibold border border-gray-200">
          <Sparkles className="w-3.5 h-3.5 text-black" />
          <span>Motor de IA: Google Gemini Flash Ultra-Rápido (~2s)</span>
        </div>
        
        <h1 className="font-[Poppins] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-black">
          Sube tu video para generar <br />
          subtítulos animados en segundos
        </h1>
        
        <p className="max-w-xl mx-auto font-[Poppins] text-gray-500 text-sm sm:text-base">
          Google Gemini transcribe palabra por palabra con sincronización exacta y puntuación inteligente.
        </p>
      </div>

      {/* Main Drag & Drop Zone (Voicecheap Minimalist Card) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-[32px] p-10 sm:p-14 text-center transition-all duration-300 border-2 border-dashed bg-[#F8F9FA] ${
          isDragOver
            ? 'border-black bg-gray-50 scale-[1.01] shadow-xl'
            : 'border-gray-300 hover:border-black hover:bg-white'
        } ${isTranscribing ? 'pointer-events-none opacity-95' : ''}`}
        style={{
          backgroundImage: 'radial-gradient(circle, rgb(209, 213, 219) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,audio/mp3,audio/wav"
          className="hidden"
          onChange={handleFileChange}
        />

        {isTranscribing ? (
          <div className="space-y-4 max-w-md mx-auto py-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-black flex items-center justify-center animate-spin text-white">
              <Wand2 className="w-7 h-7" />
            </div>
            <h3 className="font-[Poppins] text-xl font-bold text-black">
              Transcribiendo con Google Gemini... ({elapsedSeconds}s)
            </h3>
            <p className="text-xs text-gray-600 font-medium animate-pulse">{transcriptionStatus}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-black h-full w-full animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-black flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-[Poppins] text-lg sm:text-xl font-bold text-black group-hover:opacity-80 transition-opacity">
                Arrastra tu video aquí para transcribir con Gemini
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Soporta MP4, MOV, WEBM, MP3 y WAV hasta 500 MB
              </p>
            </div>

            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-xs text-gray-600 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-black" />
              <span>Detección automática de idioma y puntuación inteligente</span>
            </div>
          </div>
        )}
      </div>

      {/* Sample Videos Gallery */}
      <div className="mt-12 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Film className="w-4 h-4 text-black" />
            <h3 className="font-[Poppins] text-base font-bold text-black">O prueba con videos de demostración:</h3>
          </div>
          <span className="text-xs text-gray-400">1-Clic para cargar</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEMO_VIDEOS.map((demo) => (
            <div
              key={demo.id}
              onClick={() => handleSelectDemo(demo)}
              className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-black cursor-pointer transition-all duration-200 group flex items-start space-x-3.5 shadow-sm"
            >
              <div className="w-14 h-18 rounded-xl bg-black flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-all">
                <Play className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-[Poppins] text-sm font-bold text-black group-hover:opacity-80 transition-opacity truncate">
                  {demo.title}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                  {demo.description}
                </p>
                <div className="flex items-center space-x-2 mt-2.5">
                  <span className="text-[11px] font-bold text-black bg-gray-100 px-2 py-0.5 rounded-full">
                    {demo.duration}s
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {demo.segments.reduce((acc, s) => acc + s.words.length, 0)} palabras
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
