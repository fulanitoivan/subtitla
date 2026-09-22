import React, { useState } from 'react';
import type { SubtitleSegment } from '../../types/subtitle';
import { 
  Play, 
  Edit3, 
  Smile, 
  Plus, 
  Trash2, 
  Palette, 
  Search, 
  Download,
  Volume2
} from 'lucide-react';

interface TranscriptEditorProps {
  segments: SubtitleSegment[];
  onChangeSegments: (segments: SubtitleSegment[]) => void;
  onSeek: (time: number) => void;
  currentTime: number;
}

const COMMON_EMOJIS = ['🔥', '🚀', '⚡', '✨', '👀', '💡', '💰', '💯', '📈', '🎯', '❌', '✅', '👑', '⚠️'];
const COLOR_PRESETS = [
  { name: 'Amarillo', hex: '#FFE600' },
  { name: 'Verde', hex: '#00FF66' },
  { name: 'Cian', hex: '#00F2FE' },
  { name: 'Rosa', hex: '#FF007A' },
  { name: 'Naranja', hex: '#FF5E00' },
  { name: 'Púrpura', hex: '#A855F7' },
];

export const TranscriptEditor: React.FC<TranscriptEditorProps> = ({
  segments,
  onChangeSegments,
  onSeek,
  currentTime,
}) => {
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [emojiPickerWordId, setEmojiPickerWordId] = useState<string | null>(null);
  const [colorPickerWordId, setColorPickerWordId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [showReplaceBar, setShowReplaceBar] = useState(false);

  // Edit word text
  const handleWordTextChange = (segmentId: string, wordId: string, newText: string) => {
    const updated = segments.map((seg) => {
      if (seg.id !== segmentId) return seg;
      const updatedWords = seg.words.map((w) => (w.id === wordId ? { ...w, word: newText } : w));
      return {
        ...seg,
        text: updatedWords.map((w) => w.word).join(' '),
        words: updatedWords,
      };
    });
    onChangeSegments(updated);
  };

  // Assign / Remove Emoji on Word
  const handleSetEmoji = (segmentId: string, wordId: string, emoji: string | undefined) => {
    const updated = segments.map((seg) => {
      if (seg.id !== segmentId) return seg;
      return {
        ...seg,
        words: seg.words.map((w) => (w.id === wordId ? { ...w, emoji } : w)),
      };
    });
    onChangeSegments(updated);
    setEmojiPickerWordId(null);
  };

  // Assign / Remove custom highlight color on Word
  const handleSetWordColor = (segmentId: string, wordId: string, highlightColor: string | undefined) => {
    const updated = segments.map((seg) => {
      if (seg.id !== segmentId) return seg;
      return {
        ...seg,
        words: seg.words.map((w) => (w.id === wordId ? { ...w, highlightColor } : w)),
      };
    });
    onChangeSegments(updated);
    setColorPickerWordId(null);
  };

  // Adjust timing
  const handleAdjustWordTime = (segmentId: string, wordId: string, deltaSeconds: number) => {
    const updated = segments.map((seg) => {
      if (seg.id !== segmentId) return seg;
      return {
        ...seg,
        words: seg.words.map((w) => {
          if (w.id !== wordId) return w;
          const newStart = Math.max(0, Number((w.start + deltaSeconds).toFixed(2)));
          const newEnd = Math.max(newStart + 0.1, Number((w.end + deltaSeconds).toFixed(2)));
          return { ...w, start: newStart, end: newEnd };
        }),
      };
    });
    onChangeSegments(updated);
  };

  // Global Replace Word in all segments
  const handleExecuteReplace = () => {
    if (!searchQuery.trim() || !replaceQuery.trim()) return;
    const regex = new RegExp(`\\b${searchQuery.trim()}\\b`, 'gi');

    const updated = segments.map((seg) => {
      const updatedWords = seg.words.map((w) => ({
        ...w,
        word: w.word.replace(regex, replaceQuery.trim()),
      }));
      return {
        ...seg,
        text: updatedWords.map((w) => w.word).join(' '),
        words: updatedWords,
      };
    });

    onChangeSegments(updated);
    setSearchQuery('');
    setReplaceQuery('');
    setShowReplaceBar(false);
  };

  // Add new segment
  const handleAddSegment = () => {
    const lastSeg = segments[segments.length - 1];
    const newStart = lastSeg ? Number((lastSeg.end + 0.3).toFixed(2)) : 0;
    const newEnd = Number((newStart + 2.4).toFixed(2));
    const newId = `seg_${Date.now()}`;

    const newSegment: SubtitleSegment = {
      id: newId,
      start: newStart,
      end: newEnd,
      text: 'Nueva frase viral',
      words: [
        { id: `w_${Date.now()}_1`, word: 'Nueva', start: newStart, end: newStart + 0.7 },
        { id: `w_${Date.now()}_2`, word: 'frase', start: newStart + 0.7, end: newStart + 1.4 },
        { id: `w_${Date.now()}_3`, word: 'viral', start: newStart + 1.4, end: newEnd },
      ],
    };

    onChangeSegments([...segments, newSegment]);
  };

  // Delete segment
  const handleDeleteSegment = (segId: string) => {
    onChangeSegments(segments.filter((s) => s.id !== segId));
  };

  // Download SRT file directly
  const handleDownloadSRT = () => {
    let srtContent = '';
    segments.forEach((seg, idx) => {
      const formatTime = (secs: number) => {
        const hrs = Math.floor(secs / 3600);
        const mins = Math.floor((secs % 3600) / 60);
        const s = Math.floor(secs % 60);
        const ms = Math.floor((secs % 1) * 1000);
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
      };

      srtContent += `${idx + 1}\n`;
      srtContent += `${formatTime(seg.start)} --> ${formatTime(seg.end)}\n`;
      srtContent += `${seg.text}\n\n`;
    });

    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subtitulos_subtitla.srt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 pb-6 text-black">
      
      {/* Dynamic Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
        <div>
          <h3 className="font-[Poppins] text-xs font-bold text-black flex items-center space-x-1.5">
            <span>Editor Dinámico de Palabras</span>
            <span className="px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-black">
              {segments.length} frases
            </span>
          </h3>
          <p className="text-[11px] text-gray-500">Haz clic en cualquier palabra para saltar a ese segundo exacto</p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setShowReplaceBar(!showReplaceBar)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center space-x-1 ${
              showReplaceBar
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white hover:bg-gray-100 border-gray-200 text-black'
            }`}
            title="Buscar y reemplazar palabras"
          >
            <Search className="w-3 h-3" />
            <span>Buscar</span>
          </button>

          <button
            onClick={handleDownloadSRT}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-black text-xs font-semibold shadow-sm transition-all flex items-center space-x-1"
            title="Descargar subtítulos .SRT"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Descargar .SRT</span>
          </button>

          <button
            onClick={handleAddSegment}
            className="flex items-center space-x-1 px-3.5 py-1.5 rounded-full bg-black hover:opacity-90 text-white text-xs font-bold shadow-sm transition-all active:scale-95 ml-auto sm:ml-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir Frase</span>
          </button>
        </div>
      </div>

      {/* Expandable Search & Replace Bar */}
      {showReplaceBar && (
        <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <input
            type="text"
            placeholder="Buscar palabra..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-1/3 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs text-black focus:outline-none focus:border-black"
          />
          <input
            type="text"
            placeholder="Reemplazar por..."
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            className="w-full sm:w-1/3 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs text-black focus:outline-none focus:border-black"
          />
          <button
            onClick={handleExecuteReplace}
            disabled={!searchQuery || !replaceQuery}
            className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-black text-white text-xs font-bold hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            Reemplazar Todo
          </button>
        </div>
      )}

      {/* Dynamic Segments List */}
      <div className="space-y-3">
        {segments.map((seg, sIdx) => {
          const isSegActive = currentTime >= seg.start && currentTime <= seg.end;

          return (
            <div
              key={seg.id}
              className={`p-4 rounded-2xl border transition-all duration-200 ${
                isSegActive
                  ? 'bg-black/5 border-black shadow-md'
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              }`}
            >
              {/* Segment Header with Timestamp & Live Audio Meter */}
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSeek(seg.start)}
                    className={`flex items-center space-x-1.5 font-mono px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                      isSegActive
                        ? 'bg-black text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-black'
                    }`}
                    title="Saltar a este segundo"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>
                      {seg.start.toFixed(1)}s - {seg.end.toFixed(1)}s
                    </span>
                  </button>

                  {isSegActive && (
                    <div className="flex items-center space-x-1 text-black text-[11px] font-bold animate-pulse">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Reproduciendo</span>
                    </div>
                  )}

                  <span className="text-gray-400 text-[11px] font-medium hidden sm:inline">
                    Frase #{sIdx + 1}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteSegment(seg.id)}
                  className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  title="Eliminar frase"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dynamic Interactive Word Chips */}
              <div className="flex flex-wrap gap-2 items-center">
                {seg.words.map((word) => {
                  const isWordActive = currentTime >= word.start && currentTime <= word.end;
                  const isEditing = editingWordId === word.id;

                  return (
                    <div
                      key={word.id}
                      className={`relative group inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all duration-150 ${
                        isWordActive
                          ? 'bg-black text-white border-black font-extrabold scale-105 shadow-md'
                          : 'bg-gray-50 text-black border-gray-200 hover:border-black hover:bg-white'
                      }`}
                    >
                      {/* Emoji sticker */}
                      {word.emoji && (
                        <span 
                          className="text-sm cursor-pointer hover:scale-125 transition-transform" 
                          onClick={() => handleSetEmoji(seg.id, word.id, undefined)}
                          title="Clic para quitar emoji"
                        >
                          {word.emoji}
                        </span>
                      )}

                      {/* Custom color dot indicator */}
                      {word.highlightColor && (
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/20"
                          style={{ backgroundColor: word.highlightColor }}
                          title={`Color personalizado: ${word.highlightColor}`}
                        />
                      )}

                      {/* Word text / edit input */}
                      {isEditing ? (
                        <input
                          type="text"
                          autoFocus
                          defaultValue={word.word}
                          onBlur={(e) => {
                            handleWordTextChange(seg.id, word.id, e.target.value);
                            setEditingWordId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleWordTextChange(seg.id, word.id, (e.target as HTMLInputElement).value);
                              setEditingWordId(null);
                            }
                          }}
                          className="bg-white text-black text-xs font-bold px-1.5 py-0.5 rounded border border-black focus:outline-none w-20 shadow-inner"
                        />
                      ) : (
                        <span
                          onClick={() => onSeek(word.start)}
                          onDoubleClick={() => setEditingWordId(word.id)}
                          className="cursor-pointer hover:underline font-medium select-none"
                          title="Clic para reproducir • Doble clic para editar"
                        >
                          {word.word}
                        </span>
                      )}

                      {/* Word action popover triggers */}
                      <div className="hidden group-hover:flex items-center space-x-1 pl-1 border-l border-gray-300 text-gray-400">
                        {/* Edit text */}
                        <button
                          onClick={() => setEditingWordId(word.id)}
                          className="hover:text-black p-0.5"
                          title="Editar texto"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>

                        {/* Assign emoji sticker */}
                        <button
                          onClick={() => setEmojiPickerWordId(emojiPickerWordId === word.id ? null : word.id)}
                          className="hover:text-amber-500 p-0.5"
                          title="Añadir sticker emoji"
                        >
                          <Smile className="w-3 h-3" />
                        </button>

                        {/* Assign custom highlight color */}
                        <button
                          onClick={() => setColorPickerWordId(colorPickerWordId === word.id ? null : word.id)}
                          className="hover:text-blue-600 p-0.5"
                          title="Personalizar color de palabra"
                        >
                          <Palette className="w-3 h-3" />
                        </button>

                        {/* Adjust timing */}
                        <button
                          onClick={() => handleAdjustWordTime(seg.id, word.id, 0.1)}
                          className="hover:text-emerald-600 p-0.5 text-[9px] font-mono font-bold"
                          title="Ajustar tiempo +0.1s"
                        >
                          +0.1s
                        </button>
                      </div>

                      {/* Emoji Picker Popup */}
                      {emojiPickerWordId === word.id && (
                        <div className="absolute bottom-full left-0 mb-2 p-2.5 bg-white border border-gray-200 rounded-2xl shadow-2xl z-40 flex flex-wrap gap-1.5 w-48 animate-in fade-in zoom-in-95">
                          <p className="text-[10px] font-bold text-gray-500 w-full mb-1">Sticker para "{word.word}"</p>
                          {COMMON_EMOJIS.map((em) => (
                            <button
                              key={em}
                              onClick={() => handleSetEmoji(seg.id, word.id, em)}
                              className="text-lg p-1 hover:bg-gray-100 rounded-lg transition-transform hover:scale-125"
                            >
                              {em}
                            </button>
                          ))}
                          <button
                            onClick={() => handleSetEmoji(seg.id, word.id, undefined)}
                            className="text-[10px] text-red-600 hover:underline w-full text-center mt-1 pt-1 border-t border-gray-100"
                          >
                            Quitar emoji
                          </button>
                        </div>
                      )}

                      {/* Color Picker Popup */}
                      {colorPickerWordId === word.id && (
                        <div className="absolute bottom-full left-0 mb-2 p-2.5 bg-white border border-gray-200 rounded-2xl shadow-2xl z-40 space-y-2 w-44 animate-in fade-in zoom-in-95">
                          <p className="text-[10px] font-bold text-gray-500">Color para "{word.word}"</p>
                          <div className="grid grid-cols-3 gap-1.5">
                            {COLOR_PRESETS.map((color) => (
                              <button
                                key={color.hex}
                                onClick={() => handleSetWordColor(seg.id, word.id, color.hex)}
                                className="w-7 h-7 rounded-xl border border-gray-200 transition-transform hover:scale-110 shadow-sm"
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                              />
                            ))}
                          </div>
                          <button
                            onClick={() => handleSetWordColor(seg.id, word.id, undefined)}
                            className="text-[10px] text-red-600 hover:underline w-full text-center pt-1 border-t border-gray-100 block"
                          >
                            Color por defecto
                          </button>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
