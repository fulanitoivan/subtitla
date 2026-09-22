import React from 'react';
import { SUBTITLE_PRESETS } from '../../constants/presets';
import type { SubtitleStyle } from '../../types/subtitle';
import { Sparkles, Check } from 'lucide-react';

interface PresetSelectorProps {
  currentStyle: SubtitleStyle;
  onSelectPreset: (preset: SubtitleStyle) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  currentStyle,
  onSelectPreset,
}) => {
  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h3 className="font-[Poppins] text-xs font-bold text-black flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-black" />
          <span>Estilos Virales Predefinidos (1-Clic)</span>
        </h3>
        <span className="text-[10px] text-black font-semibold bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
          Inspirados en TikTok / CapCut
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {SUBTITLE_PRESETS.map((preset) => {
          const isSelected = currentStyle.id === preset.id;
          return (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`relative cursor-pointer p-3 rounded-2xl transition-all duration-200 border flex flex-col justify-between overflow-hidden group ${
                isSelected
                  ? 'bg-black text-white border-black shadow-md scale-[1.02]'
                  : 'bg-white hover:bg-gray-50 border-gray-200 text-black'
              }`}
            >
              {/* Selected check badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white text-black flex items-center justify-center shadow-sm">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}

              {/* Dynamic Visual Preview Box */}
              <div
                className="w-full h-14 rounded-xl bg-black flex items-center justify-center p-2 mb-2 overflow-hidden border border-white/10 shadow-inner"
              >
                <div
                  style={{
                    fontFamily: preset.fontFamily,
                    fontSize: '13px',
                    fontWeight: preset.fontWeight,
                    textTransform: preset.textTransform,
                  }}
                  className="leading-none text-center select-none"
                >
                  <span
                    style={{
                      color: preset.textColor,
                      WebkitTextStroke: preset.hasStroke ? `1px ${preset.strokeColor}` : 'none',
                    }}
                  >
                    CREA{' '}
                  </span>
                  <span
                    style={{
                      color: preset.highlightColor,
                      WebkitTextStroke: preset.hasStroke ? `1px ${preset.strokeColor}` : 'none',
                      textShadow: preset.hasShadow ? `0 0 8px ${preset.shadowColor}` : 'none',
                    }}
                    className="inline-block transform scale-110 font-black animate-pulse"
                  >
                    VIRAL
                  </span>
                </div>
              </div>

              <div>
                <h4 className={`font-[Poppins] text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-black'}`}>
                  {preset.name}
                </h4>
                <p className={`text-[10px] capitalize mt-0.5 truncate ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                  {preset.fontFamily} • {preset.animation}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
