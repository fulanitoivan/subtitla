import React from 'react';
import { SUBTITLE_PRESETS } from '../../constants/presets';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

interface StylesShowcaseProps {
  onSelectStyleAndCreate: (styleId: string) => void;
}

export const StylesShowcase: React.FC<StylesShowcaseProps> = ({
  onSelectStyleAndCreate,
}) => {
  return (
    <section id="styles" className="py-16 sm:py-24 bg-white border-t border-gray-100 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 space-y-12">
        
        {/* Header with Scroll Reveal */}
        <ScrollReveal direction="up" delay={50}>
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="font-[Poppins] text-2xl sm:text-3xl font-bold tracking-tight text-black">
              Estilos Virales de Alta Retención
            </h2>
            <p className="font-[Poppins] text-sm sm:text-base text-black/60">
              Diseñados con psicología visual para maximizar el tiempo de retención y reproducciones completas.
            </p>
          </div>
        </ScrollReveal>

        {/* Presets Grid with Staggered Scroll Reveal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUBTITLE_PRESETS.map((preset, idx) => (
            <ScrollReveal 
              key={preset.id} 
              direction="up" 
              delay={(idx % 3) * 120 + Math.floor(idx / 3) * 60} 
              distance={28}
            >
              <div className="group p-5 rounded-[26px] border border-gray-200 bg-white flex flex-col justify-between space-y-4 hover:border-black transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                {/* Preview Window in Dark OLED Contrast */}
                <div className="w-full h-28 rounded-2xl bg-black flex items-center justify-center p-3 relative overflow-hidden shadow-inner group-hover:scale-[1.02] transition-transform">
                  <div
                    style={{
                      fontFamily: preset.fontFamily,
                      fontSize: '20px',
                      fontWeight: preset.fontWeight,
                      textTransform: preset.textTransform,
                    }}
                    className="flex items-center space-x-1.5 select-none"
                  >
                    <span
                      style={{
                        color: preset.textColor,
                        WebkitTextStroke: preset.hasStroke ? `2px ${preset.strokeColor}` : 'none',
                      }}
                    >
                      CREA
                    </span>
                    <span
                      style={{
                        color: preset.highlightColor,
                        WebkitTextStroke: preset.hasStroke ? `2px ${preset.strokeColor}` : 'none',
                        textShadow: preset.hasShadow ? `0 0 16px ${preset.shadowColor}` : 'none',
                        transform: `scale(${preset.animationScale}) ${preset.rotateActiveWord ? `rotate(${preset.activeWordAngle}deg)` : ''}`,
                      }}
                      className="inline-block transition-transform duration-200"
                    >
                      VIRAL
                    </span>
                    <span
                      style={{
                        color: preset.textColor,
                        WebkitTextStroke: preset.hasStroke ? `2px ${preset.strokeColor}` : 'none',
                      }}
                    >
                      HOY
                    </span>
                  </div>

                  {preset.showEmojis && (
                    <span className="absolute top-2 right-2.5 text-base animate-bounce-subtle">🔥</span>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-[Poppins] text-sm font-bold text-black">
                      {preset.name}
                    </h4>
                    <p className="text-[11px] text-gray-500 capitalize mt-0.5">
                      Fuente: {preset.fontFamily} • Animación: {preset.animation}
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectStyleAndCreate(preset.id)}
                    className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-full bg-gray-50 hover:bg-black text-black hover:text-white border border-gray-200 hover:border-black text-xs font-semibold transition-all group-hover:shadow-sm active:scale-95"
                  >
                    <span>Probar este estilo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
};
