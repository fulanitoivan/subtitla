import React from 'react';
import type { SubtitleStyle, DisplayMode, AnimationType } from '../../types/subtitle';
import { AVAILABLE_FONTS } from '../../constants/presets';
import { PresetSelector } from './PresetSelector';
import { 
  Type, 
  Palette, 
  Layout, 
  Sparkles, 
  Smile, 
  Layers, 
  Move,
  Check
} from 'lucide-react';

interface StyleCustomizerProps {
  style: SubtitleStyle;
  onChangeStyle: (newStyle: SubtitleStyle) => void;
}

const VIRAL_PALETTE = [
  { name: 'Amarillo Viral', hex: '#FFE600' },
  { name: 'Verde Eléctrico', hex: '#00FF66' },
  { name: 'Cian TikTok', hex: '#00F2FE' },
  { name: 'Rosa Neón', hex: '#FF007A' },
  { name: 'Naranja Fuego', hex: '#FF5E00' },
  { name: 'Púrpura Neón', hex: '#A855F7' },
  { name: 'Blanco Puro', hex: '#FFFFFF' },
  { name: 'Negro Profundo', hex: '#000000' },
];

export const StyleCustomizer: React.FC<StyleCustomizerProps> = ({
  style,
  onChangeStyle,
}) => {
  const update = <K extends keyof SubtitleStyle>(key: K, value: SubtitleStyle[K]) => {
    onChangeStyle({
      ...style,
      [key]: value,
    });
  };

  // 3x3 Position Grid Presets (Top, Middle, Bottom)
  const POSITION_PRESETS = [
    { label: 'Sup. Izq', y: 25, x: 20 },
    { label: 'Sup. Centro', y: 25, x: 50 },
    { label: 'Sup. Der', y: 25, x: 80 },
    { label: 'Centro Izq', y: 50, x: 20 },
    { label: 'Centro', y: 50, x: 50 },
    { label: 'Centro Der', y: 50, x: 80 },
    { label: 'Inf. Izq', y: 75, x: 20 },
    { label: 'Inferior (Viral)', y: 75, x: 50 },
    { label: 'Inf. Der', y: 75, x: 80 },
  ];

  return (
    <div className="space-y-6 pb-6 text-black">
      
      {/* 1. Live Interactive Banner Preview of Current Style */}
      <div className="p-4 rounded-2xl bg-black text-white relative overflow-hidden border border-gray-800 shadow-md">
        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2 border-b border-white/10 pb-1.5">
          <span className="flex items-center space-x-1 font-semibold text-white">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Previsualización del Estilo Activo</span>
          </span>
          <span className="font-mono text-[10px] bg-white/10 px-2 py-0.5 rounded-full">{style.name}</span>
        </div>

        <div className="py-3 flex items-center justify-center select-none text-center">
          <div
            style={{
              fontFamily: style.fontFamily,
              fontSize: `${Math.min(32, Math.max(18, style.fontSize * 0.55))}px`,
              fontWeight: style.fontWeight,
              textTransform: style.textTransform,
            }}
            className="flex items-center space-x-2 flex-wrap justify-center"
          >
            <span
              style={{
                color: style.textColor,
                WebkitTextStroke: style.hasStroke ? `2px ${style.strokeColor}` : 'none',
              }}
            >
              CREA
            </span>
            <span
              style={{
                color: style.highlightColor,
                WebkitTextStroke: style.hasStroke ? `2px ${style.strokeColor}` : 'none',
                textShadow: style.hasShadow ? `0 0 12px ${style.shadowColor}` : 'none',
                transform: `scale(${style.animationScale}) ${style.rotateActiveWord ? `rotate(${style.activeWordAngle}deg)` : ''}`,
              }}
              className="inline-block transition-transform font-black animate-pulse"
            >
              SUBTÍTULOS
            </span>
            <span
              style={{
                color: style.textColor,
                WebkitTextStroke: style.hasStroke ? `2px ${style.strokeColor}` : 'none',
              }}
            >
              VIRALES
            </span>
            {style.showEmojis && <span className="inline-block text-lg">🚀</span>}
          </div>
        </div>
      </div>

      {/* 2. Presets Selector (1-Click) */}
      <PresetSelector currentStyle={style} onSelectPreset={onChangeStyle} />

      <hr className="border-gray-100" />

      {/* 3. Word Grouping & Display Mode */}
      <div className="space-y-3">
        <label className="font-[Poppins] text-xs font-bold text-black flex items-center space-x-2">
          <Layers className="w-4 h-4 text-black" />
          <span>Palabras en Pantalla (Ritmo)</span>
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'one-word', label: '1 Palabra', desc: 'Máximo impacto' },
            { id: 'two-words', label: '2 Palabras', desc: 'Ritmo TikTok' },
            { id: 'three-words', label: '3 Palabras', desc: 'Lectura fluida' },
            { id: 'full-line', label: 'Línea Entera', desc: 'Tradicional' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => update('displayMode', mode.id as DisplayMode)}
              className={`p-3 rounded-2xl text-left border transition-all ${
                style.displayMode === mode.id
                  ? 'bg-black text-white border-black shadow-sm'
                  : 'bg-white hover:bg-gray-50 border-gray-200 text-black'
              }`}
            >
              <div className="text-xs font-bold">{mode.label}</div>
              <div className={`text-[10px] mt-0.5 ${style.displayMode === mode.id ? 'text-gray-300' : 'text-gray-500'}`}>
                {mode.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Color Palette & Dynamic Highlighting */}
      <div className="space-y-3.5">
        <label className="font-[Poppins] text-xs font-bold text-black flex items-center space-x-2">
          <Palette className="w-4 h-4 text-black" />
          <span>Color de Resaltado (Palabra Activa)</span>
        </label>

        {/* Quick Clickable Swatches */}
        <div className="flex items-center flex-wrap gap-2">
          {VIRAL_PALETTE.map((swatch) => {
            const isCurrent = style.highlightColor.toUpperCase() === swatch.hex.toUpperCase();
            return (
              <button
                key={swatch.hex}
                onClick={() => update('highlightColor', swatch.hex)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  isCurrent
                    ? 'bg-black text-white border-black shadow-sm scale-105'
                    : 'bg-white hover:bg-gray-50 border-gray-200 text-black'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                  style={{ backgroundColor: swatch.hex }}
                />
                <span className="text-[11px]">{swatch.name}</span>
                {isCurrent && <Check className="w-3 h-3 text-white ml-0.5" />}
              </button>
            );
          })}
        </div>

        {/* Color Details (Text, Highlight, Stroke) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Active Highlight Color Picker */}
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 space-y-1.5">
            <span className="text-[11px] text-gray-600 font-bold block">Resaltado</span>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={style.highlightColor}
                onChange={(e) => update('highlightColor', e.target.value)}
                className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer"
              />
              <span className="font-mono text-xs text-black font-bold">{style.highlightColor}</span>
            </div>
          </div>

          {/* Primary Text Color Picker */}
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 space-y-1.5">
            <span className="text-[11px] text-gray-600 font-bold block">Texto Base</span>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={style.textColor}
                onChange={(e) => update('textColor', e.target.value)}
                className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer"
              />
              <span className="font-mono text-xs text-black font-bold">{style.textColor}</span>
            </div>
          </div>

          {/* Stroke Outline Color Picker */}
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 space-y-1.5">
            <span className="text-[11px] text-gray-600 font-bold block">Borde / Stroke</span>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={style.strokeColor}
                onChange={(e) => update('strokeColor', e.target.value)}
                className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer"
              />
              <span className="font-mono text-xs text-black font-bold">{style.strokeColor}</span>
            </div>
          </div>
        </div>

        {/* Stroke Width Slider */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600 font-medium">Grosor de Borde (Stroke)</span>
            <span className="font-mono text-black font-bold">{style.strokeWidth}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={8}
            step={0.5}
            value={style.strokeWidth}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onChangeStyle({
                ...style,
                strokeWidth: val,
                hasStroke: val > 0,
              });
            }}
            className="w-full"
          />
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 5. Visual Interactive Position Grid & Sliders */}
      <div className="space-y-3.5">
        <label className="font-[Poppins] text-xs font-bold text-black flex items-center space-x-2">
          <Move className="w-4 h-4 text-black" />
          <span>Posición en Pantalla (1-Clic)</span>
        </label>

        {/* 3x3 Visual Placement Grid */}
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto p-2 bg-gray-50 rounded-2xl border border-gray-200">
          {POSITION_PRESETS.map((pos) => {
            const isMatching = Math.abs(style.positionY - pos.y) <= 8 && Math.abs((style.positionX || 50) - pos.x) <= 15;
            return (
              <button
                key={pos.label}
                onClick={() => {
                  onChangeStyle({
                    ...style,
                    positionY: pos.y,
                    positionX: pos.x,
                  });
                }}
                className={`py-2 px-1 rounded-xl text-[10px] font-bold text-center border transition-all ${
                  isMatching
                    ? 'bg-black text-white border-black shadow-sm'
                    : 'bg-white hover:bg-gray-100 border-gray-200 text-gray-700'
                }`}
              >
                {pos.label}
              </button>
            );
          })}
        </div>

        {/* Fine-tune Position Vertical Slider */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600 font-medium">Ajuste Fino Vertical</span>
            <span className="font-mono text-black font-bold">{style.positionY}%</span>
          </div>
          <input
            type="range"
            min={20}
            max={88}
            value={style.positionY}
            onChange={(e) => update('positionY', parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 6. Typography & Formatting */}
      <div className="space-y-4">
        <label className="font-[Poppins] text-xs font-bold text-black flex items-center space-x-2">
          <Type className="w-4 h-4 text-black" />
          <span>Tipografía y Tamaño</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Font Family Selector */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-gray-500">Fuente</span>
            <select
              value={style.fontFamily}
              onChange={(e) => update('fontFamily', e.target.value)}
              className="w-full bg-gray-50 text-black text-xs font-bold rounded-xl p-2.5 border border-gray-200 focus:border-black focus:outline-none shadow-sm"
            >
              {AVAILABLE_FONTS.map((f) => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Uppercase / Normal Toggle */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-gray-500">Formato</span>
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => update('textTransform', 'uppercase')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  style.textTransform === 'uppercase' ? 'bg-black text-white shadow-sm' : 'text-gray-600 hover:text-black'
                }`}
              >
                MAYÚSCULAS
              </button>
              <button
                onClick={() => update('textTransform', 'none')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  style.textTransform === 'none' ? 'bg-black text-white shadow-sm' : 'text-gray-600 hover:text-black'
                }`}
              >
                Normal
              </button>
            </div>
          </div>
        </div>

        {/* Font Size Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600 font-medium">Tamaño de Fuente</span>
            <span className="font-mono text-black font-bold">{style.fontSize}px</span>
          </div>
          <input
            type="range"
            min={20}
            max={75}
            value={style.fontSize}
            onChange={(e) => update('fontSize', parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 7. Animations & Interactive Dynamic Effects */}
      <div className="space-y-4">
        <label className="font-[Poppins] text-xs font-bold text-black flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-black" />
          <span>Efectos y Animación de Palabra</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'pop', label: '💥 Pop Scale' },
            { id: 'bounce', label: '⚡ Rebote' },
            { id: 'glow', label: '✨ Brillo Neón' },
            { id: 'none', label: '🚫 Estático' },
          ].map((anim) => (
            <button
              key={anim.id}
              onClick={() => update('animation', anim.id as AnimationType)}
              className={`p-2.5 rounded-xl text-xs font-bold text-center border transition-all ${
                style.animation === anim.id
                  ? 'bg-black text-white border-black shadow-sm'
                  : 'bg-white hover:bg-gray-50 border-gray-200 text-black'
              }`}
            >
              {anim.label}
            </button>
          ))}
        </div>

        {/* Scale & Tilt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5 bg-gray-50 p-3 rounded-2xl border border-gray-200">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 font-medium">Intensidad de Escala</span>
              <span className="font-mono text-black font-bold">{Math.round((style.animationScale - 1) * 100)}%</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={1.5}
              step={0.05}
              value={style.animationScale}
              onChange={(e) => update('animationScale', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-200">
            <div>
              <div className="text-xs font-bold text-black">Inclinación Dinámica</div>
              <div className="text-[10px] text-gray-500">Gira levemente la palabra activa</div>
            </div>
            <input
              type="checkbox"
              checked={style.rotateActiveWord}
              onChange={(e) => update('rotateActiveWord', e.target.checked)}
              className="w-5 h-5 rounded accent-black cursor-pointer"
            />
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 8. Additional Enhancements (Background Pill & Emojis) */}
      <div className="space-y-3">
        <label className="font-[Poppins] text-xs font-bold text-black flex items-center space-x-2">
          <Layout className="w-4 h-4 text-black" />
          <span>Modificadores Visuales</span>
        </label>

        {/* Background pill toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
          <div>
            <div className="text-xs font-bold text-black">Caja de Fondo (Background Pill)</div>
            <div className="text-[10px] text-gray-500">Añade contraste sobre videos con fondos complejos</div>
          </div>
          <input
            type="checkbox"
            checked={style.hasBackground}
            onChange={(e) => update('hasBackground', e.target.checked)}
            className="w-5 h-5 rounded accent-black cursor-pointer"
          />
        </div>

        {/* Floating Emojis Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Smile className="w-4 h-4 text-amber-500" />
            <div>
              <div className="text-xs font-bold text-black">Emojis Flotantes Automáticos</div>
              <div className="text-[10px] text-gray-500">Genera emojis animados sobre palabras clave 🚀🔥</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={style.showEmojis}
            onChange={(e) => update('showEmojis', e.target.checked)}
            className="w-5 h-5 rounded accent-black cursor-pointer"
          />
        </div>
      </div>

    </div>
  );
};
