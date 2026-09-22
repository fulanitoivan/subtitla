import React from 'react';
import { Upload, Sparkles, Download } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Sube tu video o audio',
      description: 'Arrastra tu archivo MP4, MOV o MP3 en formato vertical (TikTok, Reels, Shorts) u horizontal.',
      icon: Upload,
    },
    {
      number: '02',
      title: 'Transcripción con Gemini',
      description: 'Google Gemini transcribe al instante con marcas de tiempo exactas palabra por palabra y emojis dinámicos.',
      icon: Sparkles,
    },
    {
      number: '03',
      title: 'Elige estilo y descarga HD',
      description: 'Personaliza fuentes, colores y animaciones virales. Exporta tu video con audio nítido sin marcas de agua.',
      icon: Download,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-white border-t border-gray-100 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 space-y-12">
        
        {/* Section Header with Scroll Reveal */}
        <ScrollReveal direction="up" delay={50}>
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="font-[Poppins] text-2xl sm:text-3xl font-bold tracking-tight text-black">
              Visión general
            </h2>
            <p className="font-[Poppins] text-sm sm:text-base text-black/60 font-normal">
              De video sin editar a contenido viral listo para publicar en menos de 60 segundos.
            </p>
          </div>
        </ScrollReveal>

        {/* 3 Step Cards Grid with Staggered Scroll Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <ScrollReveal 
                key={step.number} 
                direction="up" 
                delay={idx * 130} 
                distance={32}
              >
                <div
                  className="group relative flex h-[260px] flex-col justify-between overflow-hidden rounded-[26px] border border-gray-100 bg-[#f8f9fa] p-7 transition-all duration-300 hover:border-black/20 hover:shadow-lg hover:-translate-y-1"
                  style={{
                    backgroundImage: 'radial-gradient(circle, rgb(209, 213, 219) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-[0_2px_12px_rgba(0,0,0,0.08)] group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-black" />
                    </div>
                    <span className="font-[Poppins] text-3xl font-black text-gray-300 group-hover:text-black transition-colors">
                      {step.number}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-[Poppins] text-base font-bold text-black group-hover:opacity-90">
                      {step.title}
                    </h3>
                    <p className="font-[Poppins] text-xs text-gray-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
};
