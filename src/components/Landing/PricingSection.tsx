import React from 'react';
import { Check, Crown } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

interface PricingSectionProps {
  onSelectPlan: (plan: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  return (
    <section id="pricing" className="py-16 sm:py-24 bg-white border-t border-gray-100 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 space-y-12">
        
        {/* Header with Scroll Reveal */}
        <ScrollReveal direction="up" delay={50}>
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="font-[Poppins] text-2xl sm:text-3xl font-bold tracking-tight text-black">
              Planes y Precios
            </h2>
            <p className="font-[Poppins] text-sm sm:text-base text-black/60">
              Comienza gratis con 30 minutos y hasta 10 proyectos. Actualiza en cualquier momento.
            </p>
          </div>
        </ScrollReveal>

        {/* Pricing Cards Grid with Staggered Scroll Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Plan 1: Gratis */}
          <ScrollReveal direction="up" delay={100} distance={30}>
            <div className="h-full p-7 rounded-[26px] border border-gray-200 bg-white flex flex-col justify-between space-y-6 hover:border-black/30 transition-all duration-300 hover:shadow-md">
              <div className="space-y-4">
                <div>
                  <h3 className="font-[Poppins] text-base font-bold text-black">Plan Gratuito</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Para creadores que inician</p>
                </div>

                <div className="flex items-baseline space-x-1">
                  <span className="font-[Poppins] text-3xl font-black text-black">0€</span>
                  <span className="text-xs text-gray-400">/ mes</span>
                </div>

                <ul className="space-y-2.5 text-xs text-black/80 pt-2 border-t border-gray-100">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-black flex-shrink-0" />
                    <span><strong>Hasta 10 proyectos</strong> guardados</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-black flex-shrink-0" />
                    <span><strong>30 minutos</strong> de IA al mes</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-black flex-shrink-0" />
                    <span>Google Gemini 1.5 Flash IA</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-black flex-shrink-0" />
                    <span>Todos los estilos virales</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-black flex-shrink-0" />
                    <span>Exportación directa con audio HD</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onSelectPlan('free')}
                className="w-full py-3 rounded-full bg-gray-100 hover:bg-gray-200 font-[Poppins] font-medium text-xs text-black transition-all active:scale-95"
              >
                Comenzar Gratis
              </button>
            </div>
          </ScrollReveal>

          {/* Plan 2: Creador Pro (Highlighted Card) */}
          <ScrollReveal direction="up" delay={200} distance={35}>
            <div className="h-full relative p-7 rounded-[26px] border-2 border-black bg-[#F8F9FA] flex flex-col justify-between space-y-6 shadow-xl transform md:-translate-y-2 transition-all duration-300 hover:shadow-2xl">
              
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                Más Popular
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-[Poppins] text-base font-bold text-black flex items-center space-x-1.5">
                    <span>Creador Pro</span>
                    <Crown className="w-4 h-4 text-amber-500" />
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Para creadores con publicación diaria</p>
                </div>

                <div className="flex items-baseline space-x-1">
                  <span className="font-[Poppins] text-3xl font-black text-black">12€</span>
                  <span className="text-xs text-gray-400">/ mes</span>
                </div>

                <ul className="space-y-2.5 text-xs text-black pt-2 border-t border-gray-200">
                  <li className="flex items-center space-x-2 font-semibold">
                    <Check className="w-4 h-4 text-black flex-shrink-0" />
                    <span><strong>Hasta 50 proyectos</strong> en tu panel</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-black flex-shrink-0" />
                    <span><strong>300 minutos</strong> de transcripción</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-black flex-shrink-0" />
                    <span>Gemini IA Prioritario (~2s)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-black flex-shrink-0" />
                    <span>Exportación 4K a 60 FPS</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-black flex-shrink-0" />
                    <span>Sin marcas de agua</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onSelectPlan('creator')}
                className="w-full py-3.5 rounded-full bg-black hover:opacity-90 font-[Poppins] font-semibold text-xs text-white shadow-md transition-all active:scale-95"
              >
                Probar Creador Pro
              </button>
            </div>
          </ScrollReveal>

          {/* Plan 3: Agencia / Equipos */}
          <ScrollReveal direction="up" delay={300} distance={30}>
            <div className="h-full p-7 rounded-[26px] border border-gray-200 bg-white flex flex-col justify-between space-y-6 hover:border-black/30 transition-all duration-300 hover:shadow-md">
              <div className="space-y-4">
                <div>
                  <h3 className="font-[Poppins] text-base font-bold text-black">Agencia & Equipos</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Para productoras y agencias</p>
                </div>

                <div className="flex items-baseline space-x-1">
                  <span className="font-[Poppins] text-3xl font-black text-black">29€</span>
                  <span className="text-xs text-gray-400">/ mes</span>
                </div>

                <ul className="space-y-2.5 text-xs text-black/80 pt-2 border-t border-gray-100">
                  <li className="flex items-center space-x-2 font-semibold">
                    <Check className="w-4 h-4 text-black flex-shrink-0" />
                    <span><strong>Proyectos ilimitados</strong></span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-black flex-shrink-0" />
                    <span><strong>1.500 minutos</strong> incluidos</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-black flex-shrink-0" />
                    <span>API de renderizado por lotes</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-black flex-shrink-0" />
                    <span>Tipografías TTF personalizadas</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-black flex-shrink-0" />
                    <span>Soporte prioritario 24/7</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onSelectPlan('agency')}
                className="w-full py-3 rounded-full bg-gray-100 hover:bg-gray-200 font-[Poppins] font-medium text-xs text-black transition-all active:scale-95"
              >
                Contactar Agencia
              </button>
            </div>
          </ScrollReveal>

        </div>

      </div>
    </section>
  );
};
