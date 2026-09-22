import React, { useState, useEffect } from 'react';
import type { ApiKeys } from '../types/subtitle';
import { X, Key, ShieldCheck, ExternalLink, Sparkles } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKeys;
  onSaveKeys: (keys: ApiKeys) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKeys,
  onSaveKeys,
}) => {
  const [geminiKey, setGeminiKey] = useState(apiKeys.geminiKey || '');

  useEffect(() => {
    setGeminiKey(apiKeys.geminiKey || '');
  }, [apiKeys, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKeys({ geminiKey, groqKey: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-pop-in">
      <div className="relative w-full max-w-lg apple-glass rounded-[32px] p-7 sm:p-8 shadow-2xl border border-white text-slate-900 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-[#0071E3] border border-blue-200/60 shadow-sm">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Configuración Google Gemini AI</h3>
              <p className="text-xs text-slate-500">Motor exclusivo de transcripción multimodal</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Google Gemini API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-[#0071E3]" />
                <span>Google Gemini API Key (Flash / Pro)</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#0071E3] hover:underline flex items-center space-x-1 font-bold"
              >
                <span>Obtener en AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="AQ.Ab8... o AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-blue-100 shadow-sm"
            />
            <p className="text-[10px] text-slate-500">
              Transcripción multimodal con marcas de tiempo fonéticas palabra por palabra en +100 idiomas.
            </p>
          </div>

          {/* Security Note */}
          <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-100 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-[#0071E3] flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600">
              Tu clave se almacena exclusivamente en el <strong className="text-slate-900">localStorage</strong> de tu navegador de forma segura.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full apple-btn-primary text-xs font-bold shadow-md transition-all active:scale-95"
            >
              Guardar Configuración
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
