import React from 'react';
import { AnimatedLogo } from '../AnimatedLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-100 py-12 bg-white text-gray-500 font-[Poppins] text-xs relative z-10">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-center space-x-3">
          <AnimatedLogo size="sm" />
          <span className="text-gray-300">|</span>
          <span>© 2026 Subtitla. Todos los derechos reservados.</span>
        </div>

        <div className="flex items-center space-x-6 text-black/80 font-medium">
          <a href="#how-it-works" className="hover:opacity-60 transition-opacity">Visión general</a>
          <a href="#styles" className="hover:opacity-60 transition-opacity">Estilos</a>
          <a href="#languages" className="hover:opacity-60 transition-opacity">Idiomas</a>
          <a href="#pricing" className="hover:opacity-60 transition-opacity">Precios</a>
          <a href="#faq" className="hover:opacity-60 transition-opacity">FAQ</a>
        </div>

        <div className="flex items-center space-x-2 text-gray-400">
          <span>Impulsado por Google Gemini 1.5 Flash</span>
        </div>

      </div>
    </footer>
  );
};
