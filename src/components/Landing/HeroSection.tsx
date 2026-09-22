import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { DEMO_VIDEOS } from '../../constants/demoData';
import { SUBTITLE_PRESETS } from '../../constants/presets';
import { SubtitleOverlay } from '../VideoPlayer/SubtitleOverlay';
import { ScrollReveal } from './ScrollReveal';
import type { SubtitleStyle, SubtitleSegment, Word } from '../../types/subtitle';

interface HeroSectionProps {
  onStartCreating: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartCreating }) => {
  // Live Demo Video Player State inside Hero (Pure Read-Only Showcase)
  const demo = DEMO_VIDEOS[0];
  const [selectedStyle, setSelectedStyle] = useState<SubtitleStyle>(SUBTITLE_PRESETS[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const liveSectionRef = useRef<HTMLDivElement>(null);

  // Sync current time with requestAnimationFrame for fluid 60fps subtitle animation
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

  const handleTogglePlay = () => {
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

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleScrollToLiveDemo = () => {
    if (liveSectionRef.current) {
      liveSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Find active segment & word for subtitle rendering
  const activeSegment: SubtitleSegment | null =
    demo.segments.find((seg) => currentTime >= seg.start && currentTime <= seg.end) || null;

  const activeWord: Word | null = activeSegment
    ? activeSegment.words.find((w) => currentTime >= w.start && currentTime <= w.end) || null
    : null;

  return (
    <section className="relative pt-10 pb-16 lg:pt-16 lg:pb-24 text-center bg-white overflow-hidden">
      
      {/* Voicecheap Minimalist Center Content */}
      <div className="max-w-4xl mx-auto px-6 space-y-7 relative z-10">
        
        {/* Minimalist Gemini Pill Badge */}
        <ScrollReveal direction="up" delay={50}>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#F5F5F5] text-black text-xs font-medium border border-gray-200 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-black animate-pulse" />
            <span className="font-semibold">Impulsado por Google Gemini 1.5 Flash</span>
          </div>
        </ScrollReveal>

        {/* Voicecheap Style Main Title */}
        <ScrollReveal direction="up" delay={120}>
          <h1 className="max-w-3xl mx-auto font-[Poppins] text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-balance text-black leading-[1.12]">
            Crea subtítulos virales y multiplica tu audiencia por 10.
          </h1>
        </ScrollReveal>

        {/* Voicecheap Style Subtitle */}
        <ScrollReveal direction="up" delay={180}>
          <p className="mx-auto max-w-xl font-[Poppins] text-base sm:text-lg font-normal tracking-tight text-gray-500 leading-relaxed">
            Di adiós a la edición manual. Subtítulos dinámicos estilo TikTok, CapCut y MrBeast en más de 100 idiomas con descarga de audio en HD.
          </p>
        </ScrollReveal>

        {/* Action Buttons (Voicecheap Black & White Pills) */}
        <ScrollReveal direction="up" delay={240}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onStartCreating}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-full bg-black px-7 py-3.5 font-[Poppins] text-sm font-medium text-white shadow-md transition hover:opacity-90 active:scale-95"
            >
              <span>Crear Subtítulos Gratis</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

            <button
              onClick={handleScrollToLiveDemo}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-full bg-white border border-gray-200 px-6 py-3.5 font-[Poppins] text-sm font-medium text-black shadow-sm transition hover:bg-gray-50 active:scale-95"
            >
              <Play className="w-4 h-4 text-black fill-black" />
              <span>Ver Demostración</span>
            </button>
          </div>
        </ScrollReveal>

        {/* Voicecheap Avatar Trust Proof */}
        <ScrollReveal direction="up" delay={300}>
          <div className="pt-2 flex flex-col items-center justify-center space-y-2">
            <div className="flex -space-x-2.5">
              <img
                alt="Creator 1"
                className="size-8 rounded-full border-2 border-white object-cover"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80"
              />
              <img
                alt="Creator 2"
                className="size-8 rounded-full border-2 border-white object-cover"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80"
              />
              <img
                alt="Creator 3"
                className="size-8 rounded-full border-2 border-white object-cover"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80"
              />
              <img
                alt="Creator 4"
                className="size-8 rounded-full border-2 border-white object-cover"
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80"
              />
            </div>
            <span className="font-[Poppins] text-xs text-black/60 font-medium">
              +1 millón de subtítulos generados con IA
            </span>
          </div>
        </ScrollReveal>

        {/* =========================================================
            VOICECHEAP LIVE VIDEO SHOWCASE (Pure Read-Only Preview)
            ========================================================= */}
        <div ref={liveSectionRef} className="pt-10 max-w-xl mx-auto space-y-5">
          
          {/* Style Selector Pills Bar */}
          <ScrollReveal direction="up" delay={200}>
            <div className="flex items-center justify-center flex-wrap gap-2 p-1.5 rounded-full bg-[#F5F5F5] border border-gray-200 max-w-fit mx-auto">
              {SUBTITLE_PRESETS.slice(0, 5).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedStyle(preset)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedStyle.id === preset.id
                      ? 'bg-black text-white shadow-sm'
                      : 'text-gray-600 hover:text-black hover:bg-white'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Video Mockup Frame (Read-Only Demo with Live Subtitles) */}
          <ScrollReveal direction="scale" delay={250} distance={20}>
            <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[360px] aspect-[9/16] rounded-[28px] overflow-hidden shadow-xl bg-black border border-gray-200 group">
              
              {/* Real HTML5 Video Player */}
              <video
                ref={videoRef}
                src={demo.url}
                playsInline
                loop
                autoPlay
                muted={isMuted}
                onClick={handleTogglePlay}
                className="w-full h-full object-cover cursor-pointer"
              />

              {/* Subtitle Overlay with Selected Preset Animation */}
              <SubtitleOverlay
                currentTime={currentTime}
                activeSegment={activeSegment}
                activeWord={activeWord}
                style={selectedStyle}
              />

              {/* Top Bar Floating Status */}
              <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-auto">
                <div className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-medium flex items-center space-x-1.5">
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                  <span>Vista Previa en Vivo</span>
                </div>

                <button
                  onClick={handleToggleMute}
                  className="p-2 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md text-white transition-colors"
                  title={isMuted ? 'Activar sonido' : 'Silenciar'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              </div>

              {/* Bottom Minimalist Status Bar (No Edit Button - Read Only) */}
              <div className="absolute bottom-4 inset-x-4 flex items-center justify-between pointer-events-auto bg-black/75 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10">
                <button
                  onClick={handleTogglePlay}
                  className="flex items-center space-x-1.5 text-white text-xs font-medium hover:opacity-80 transition-opacity"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  <span>{isPlaying ? 'Pausar demostración' : 'Reproducir'}</span>
                </button>

                <span className="text-[11px] text-gray-300 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Sincronización 60fps</span>
                </span>
              </div>

            </div>
          </ScrollReveal>

          <ScrollReveal direction="fade" delay={350}>
            <p className="text-xs text-gray-500 font-normal">
              Haz clic en los estilos superiores para previsualizar los efectos de texto sobre el video en tiempo real.
            </p>
          </ScrollReveal>

        </div>

      </div>
    </section>
  );
};
