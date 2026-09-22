import React, { useState, useEffect } from 'react';
import type { UserProfile, AuthMode } from '../../types/auth';
import { X, Sparkles, Lock, Mail, User as UserIcon, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { registerUser, loginUser, signInWithGoogleReal } from '../../services/authService';
import { SpringNavTabs } from '../Navigation/SpringNavTabs';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  initialMode?: AuthMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sync mode with initialMode prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Por favor ingresa tu correo y contraseña.');
      return;
    }

    if (mode === 'register' && password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      let userProfile: UserProfile;

      if (mode === 'register') {
        userProfile = await registerUser(name, email, password);
        setSuccessMessage('¡Cuenta creada exitosamente con 30 minutos gratis!');
      } else {
        userProfile = await loginUser(email, password);
        setSuccessMessage('¡Bienvenido de nuevo! Sesión iniciada.');
      }

      setTimeout(() => {
        setIsLoading(false);
        onAuthSuccess(userProfile);
        onClose();
        setSuccessMessage('');
        setEmail('');
        setPassword('');
        setName('');
      }, 700);
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Error al procesar la autenticación.';
      setErrorMessage(msg);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setGoogleLoading(true);

    try {
      const userProfile = await signInWithGoogleReal('usuario.creador@gmail.com', 'Creador de Contenido');
      setSuccessMessage('¡Conectado con Google exitosamente!');
      
      setTimeout(() => {
        setGoogleLoading(false);
        onAuthSuccess(userProfile);
        onClose();
        setSuccessMessage('');
      }, 800);
    } catch (err: unknown) {
      setGoogleLoading(false);
      const msg = err instanceof Error ? err.message : 'Error al conectar con Google.';
      setErrorMessage(msg);
    }
  };

  const modalTabs = [
    { id: 'login', label: 'Iniciar Sesión', icon: <Lock className="w-3.5 h-3.5" /> },
    { id: 'register', label: 'Crear Cuenta', icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-pop-in">
      
      {/* Solid White High-Contrast Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-gray-200 text-black space-y-5">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header & Spring Tabs Switcher */}
        <div className="text-center space-y-3 pt-1">
          <div className="flex justify-center">
            <SpringNavTabs
              tabs={modalTabs}
              activeId={mode}
              onChange={(id) => {
                setErrorMessage('');
                setMode(id as AuthMode);
              }}
              layoutId="auth-modal-spring-tabs"
              variant="subtle"
              size="md"
            />
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight font-[Poppins]">
              {mode === 'login' ? 'Bienvenido a Subtitla' : 'Crea tu Cuenta Gratis'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {mode === 'login'
                ? 'Accede a tus proyectos guardados y minutos de IA'
                : 'Recibe 30 minutos de transcripción inmediata con Gemini'}
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-2.5 text-xs text-red-700 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Success Notification */}
        {successMessage ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col items-center justify-center space-y-2 text-center animate-pop-in">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            <span className="text-sm font-bold text-black">{successMessage}</span>
          </div>
        ) : (
          <>
            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || isLoading}
              className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-black font-semibold text-xs shadow-sm hover:shadow transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{mode === 'login' ? 'Continuar con Google' : 'Registrarse con Google'}</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-white px-3 text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                o con correo
              </span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700">Nombre completo</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-black placeholder-gray-400 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-black placeholder-gray-400 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-black placeholder-gray-400 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-black"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || googleLoading}
                className="w-full py-3 rounded-full bg-black hover:opacity-90 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 active:scale-[0.98] disabled:opacity-70 mt-3"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <span>{mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta Gratis'}</span>
                )}
              </button>
            </form>

            {/* Toggle Login / Register Footnote */}
            <div className="text-center text-xs text-gray-500 pt-1">
              {mode === 'login' ? (
                <p>
                  ¿No tienes una cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setMode('register');
                    }}
                    className="text-black font-bold hover:underline"
                  >
                    Regístrate gratis
                  </button>
                </p>
              ) : (
                <p>
                  ¿Ya tienes una cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setMode('login');
                    }}
                    className="text-black font-bold hover:underline"
                  >
                    Inicia sesión
                  </button>
                </p>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};
