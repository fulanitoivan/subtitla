import React, { useState } from 'react';
import { Search, CheckCircle2 } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

interface LanguageItem {
  name: string;
  native: string;
  code: string;
  flag: string;
  accuracy: string;
}

const POPULAR_LANGUAGES: LanguageItem[] = [
  { name: 'Español', native: 'Español', code: 'es', flag: '🇪🇸', accuracy: '99.8%' },
  { name: 'Inglés', native: 'English', code: 'en', flag: '🇺🇸', accuracy: '99.9%' },
  { name: 'Portugués', native: 'Português', code: 'pt', flag: '🇧🇷', accuracy: '99.6%' },
  { name: 'Francés', native: 'Français', code: 'fr', flag: '🇫🇷', accuracy: '99.5%' },
  { name: 'Alemán', native: 'Deutsch', code: 'de', flag: '🇩🇪', accuracy: '99.4%' },
  { name: 'Italiano', native: 'Italiano', code: 'it', flag: '🇮🇹', accuracy: '99.5%' },
  { name: 'Japonés', native: '日本語', code: 'ja', flag: '🇯🇵', accuracy: '99.1%' },
  { name: 'Coreano', native: '한국어', code: 'ko', flag: '🇰🇷', accuracy: '99.2%' },
  { name: 'Chino Mandarín', native: '中文', code: 'zh', flag: '🇨🇳', accuracy: '98.9%' },
  { name: 'Ruso', native: 'Русский', code: 'ru', flag: '🇷🇺', accuracy: '99.3%' },
  { name: 'Árabe', native: 'العربية', code: 'ar', flag: '🇸🇦', accuracy: '98.7%' },
  { name: 'Holandés', native: 'Nederlands', code: 'nl', flag: '🇳🇱', accuracy: '99.4%' },
  { name: 'Polaco', native: 'Polski', code: 'pl', flag: '🇵🇱', accuracy: '99.2%' },
  { name: 'Turco', native: 'Türkçe', code: 'tr', flag: '🇹🇷', accuracy: '99.0%' },
  { name: 'Sueco', native: 'Svenska', code: 'sv', flag: '🇸🇪', accuracy: '99.4%' },
  { name: 'Hindi', native: 'हिन्दी', code: 'hi', flag: '🇮🇳', accuracy: '98.8%' },
];

export const LanguagesSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = POPULAR_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.native.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="languages" className="py-16 sm:py-24 bg-white border-t border-gray-100 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 space-y-10">
        
        {/* Header with Scroll Reveal */}
        <ScrollReveal direction="up" delay={50}>
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="font-[Poppins] text-2xl sm:text-3xl font-bold tracking-tight text-black">
              Transcripción en más de 100 idiomas
            </h2>
            <p className="font-[Poppins] text-sm sm:text-base text-black/60">
              Google Gemini detecta automáticamente acentos, dialectos y modismos locales.
            </p>
          </div>
        </ScrollReveal>

        {/* Search Bar with Scroll Reveal */}
        <ScrollReveal direction="up" delay={120}>
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar idioma (ej. Español, English, 日本語)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-full pl-11 pr-5 py-2.5 text-xs text-black placeholder-gray-400 focus:outline-none focus:border-black transition-all"
              />
            </div>
          </div>
        </ScrollReveal>

        {/* Languages Matrix with Staggered Scroll Reveal */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map((lang, idx) => (
            <ScrollReveal 
              key={lang.code} 
              direction="up" 
              delay={(idx % 4) * 60 + Math.floor(idx / 4) * 40} 
              distance={20}
            >
              <div className="p-3.5 rounded-2xl border border-gray-100 bg-[#F8F9FA] flex items-center justify-between group hover:border-gray-300 hover:bg-white hover:shadow-sm transition-all duration-200">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className="text-xl flex-shrink-0 group-hover:scale-110 transition-transform">{lang.flag}</span>
                  <div className="truncate">
                    <p className="font-[Poppins] text-xs font-bold text-black truncate">
                      {lang.name}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">{lang.native}</p>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-black bg-white border border-gray-200 px-2 py-0.5 rounded-full flex-shrink-0 ml-1">
                  {lang.accuracy}
                </span>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Bottom Trust Badge with Scroll Reveal */}
        <ScrollReveal direction="up" delay={200}>
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-600 font-medium shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-black" />
              <span>Puntuación ortográfica inteligente y formateo automático de números y símbolos</span>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
