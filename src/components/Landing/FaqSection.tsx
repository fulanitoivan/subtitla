import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: '¿Cuántos proyectos puedo tener guardados?',
    answer:
      'En el Plan Gratuito puedes gestionar hasta 10 proyectos simultáneos. En el Plan Creador Pro tienes hasta 50 proyectos, y en el Plan Agencia dispones de proyectos ilimitados.',
  },
  {
    question: '¿Por qué la transcripción con Google Gemini es superior?',
    answer:
      'Google Gemini cuenta con arquitectura multimodal nativa de audio de última generación. Comprende el contexto semántico de la frase, detecta pausas naturales, nombres propios y jergas, logrando una precisión fonética superior al 99.4% en español y +100 idiomas.',
  },
  {
    question: '¿El video exportado se descarga con audio HD?',
    answer:
      '¡Sí, 100%! Utilizamos el motor de renderizado por Web Audio API estéreo para mezclar el audio original de alta definición sincronizado a la perfección con los subtítulos en el archivo MP4/WebM final.',
  },
  {
    question: '¿Puedo personalizar las fuentes, colores y posiciones?',
    answer:
      'Por supuesto. Puedes elegir entre las tipografías más populares (The Bold Font, Montserrat, Komika Axis, Bebas Neue, Outfit), tamaño, colores de resaltado palabra por palabra, trazos/bordes, sombras y posición exacta en pantalla.',
  },
  {
    question: '¿Cómo se utilizan los minutos en Subtitla?',
    answer:
      'Al registrarte gratis recibes 30 minutos de transcripción inmediata. Conforme transcribes tus videos con Gemini, los minutos se deducen automáticamente según la duración de tu video.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 sm:py-24 bg-white border-t border-gray-100 overflow-hidden">
      <div className="max-w-3xl mx-auto px-6 space-y-10">
        
        {/* Header with Scroll Reveal */}
        <ScrollReveal direction="up" delay={50}>
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="font-[Poppins] text-2xl sm:text-3xl font-bold tracking-tight text-black">
              Preguntas frecuentes
            </h2>
            <p className="font-[Poppins] text-sm text-black/60">
              Todo lo que necesitas saber sobre subtítulos con IA, proyectos y renderizado HD.
            </p>
          </div>
        </ScrollReveal>

        {/* Accordion List with Staggered Scroll Reveal */}
        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <ScrollReveal 
                key={index} 
                direction="up" 
                delay={index * 70} 
                distance={20}
              >
                <div
                  className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-200 hover:border-black/30 hover:shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 select-none hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-[Poppins] text-sm font-semibold text-black">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-black flex-shrink-0 transition-transform duration-300 ${
                        isOpen ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
};
