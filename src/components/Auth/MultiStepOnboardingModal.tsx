import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  Zap,
} from 'lucide-react';
import type { UserProfile, AuthMode } from '../../types/auth';
import { registerUser, loginUser, signInWithGoogleReal } from '../../services/authService';

export interface OnboardingAnswers {
  name: string;
  contentType: string;
  referralSource: string;
  goal: string;
}

interface MultiStepOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  initialMode?: AuthMode;
}

const CONTENT_TYPES = [
  {
    id: 'shorts',
    title: 'Shorts, Reels y TikTok',
    desc: 'Videos verticales virales de alta retención',
    icon: '⚡️',
  },
  {
    id: 'podcasts',
    title: 'Podcasts y Entrevistas',
    desc: 'Videos largos, multi-hablante y subtítulos limpios',
    icon: '🎙️',
  },
  {
    id: 'courses',
    title: 'Cursos y Formación',
    desc: 'Tutoriales educativos y explicaciones paso a paso',
    icon: '📚',
  },
  {
    id: 'gaming',
    title: 'Gaming y Streaming',
    desc: 'Clips dinámicos, gameplays y directos',
    icon: '🎮',
  },
  {
    id: 'business',
    title: 'Marcas y Negocios',
    desc: 'Anuncios publicitarios, VSLs y corporativo',
    icon: '💼',
  },
];

const REFERRAL_SOURCES = [
  {
    id: 'tiktok',
    title: 'TikTok',
    desc: 'En un video viral o recomendación del feed',
    icon: '📱',
  },
  {
    id: 'instagram',
    title: 'Instagram',
    desc: 'Reels, historias o publicaciones de creadores',
    icon: '📸',
  },
  {
    id: 'youtube',
    title: 'YouTube',
    desc: 'En un tutorial o review de herramientas de IA',
    icon: '▶️',
  },
  {
    id: 'friend',
    title: 'Recomendación de un amigo',
    desc: 'Me lo recomendó otro editor o compañero creador',
    icon: '👥',
  },
  {
    id: 'google',
    title: 'Google / X (Twitter)',
    desc: 'Buscando la mejor herramienta de subtítulos automáticos',
    icon: '🔍',
  },
];

const GOALS = [
  {
    id: 'viral_style',
    title: 'Subtítulos dinámicos estilo Hormozi & MrBeast',
    desc: 'Efectos pop-in palabra por palabra con emojis dinámicos',
    icon: '🔥',
  },
  {
    id: 'boost_retention',
    title: 'Multiplicar la retención y visitas de mis videos',
    desc: 'Enganchar a la audiencia desde los primeros 3 segundos',
    icon: '📈',
  },
  {
    id: 'save_time',
    title: 'Ahorrar horas de edición manual y transcripción',
    desc: 'Generación en 1 click con 99.8% de precisión con Gemini',
    icon: '⏱️',
  },
  {
    id: 'translate',
    title: 'Traducir mis videos a más de 100 idiomas',
    desc: 'Llegar a audiencias globales sin esfuerzo adicional',
    icon: '🌍',
  },
];

const TOTAL_QUESTION_STEPS = 4;
const TOTAL_STEPS = 5; // 0 to 4 (Step 5 is registration)

export const MultiStepOnboardingModal: React.FC<MultiStepOnboardingModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'register',
}) => {
  // Mode: 'onboarding' (the multi-step survey) or 'direct-login'
  const [viewMode, setViewMode] = useState<'onboarding' | 'direct-login'>(
    initialMode === 'login' ? 'direct-login' : 'onboarding'
  );

  // Questionnaire Step (0: Name, 1: Content Type, 2: Referral, 3: Goal, 4: Registration)
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);

  // Form State
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    name: '',
    contentType: '',
    referralSource: '',
    goal: '',
  });

  // Auth Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sync mode when opening
  useEffect(() => {
    if (isOpen) {
      setViewMode(initialMode === 'login' ? 'direct-login' : 'onboarding');
      setCurrentStep(0);
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Trigger celebration confetti
  const fireCelebrationConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#000000', '#5c31ff', '#ff8f00', '#2acc6f', '#ffffff'],
      });
    } catch {
      // ignore
    }
  };

  // Step navigation
  const goToNextStep = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
      setErrorMessage('');
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
      setErrorMessage('');
    }
  };

  // Auto-advance helper with visual selection feedback
  const handleSelectOption = (key: keyof OnboardingAnswers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setTimeout(() => {
      goToNextStep();
    }, 220);
  };

  // Check if current step can advance
  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return answers.name.trim().length >= 2;
      case 1:
        return Boolean(answers.contentType);
      case 2:
        return Boolean(answers.referralSource);
      case 3:
        return Boolean(answers.goal);
      case 4:
        return email.trim().length > 3 && password.length >= 6;
      default:
        return true;
    }
  };

  // Handle final registration in step 5
  const handleCompleteRegistration = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Por favor introduce tu correo electrónico y una contraseña.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La contraseña debe contener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      const userProfile = await registerUser(answers.name.trim(), email, password);
      
      // Save onboarding answers in localStorage
      try {
        localStorage.setItem(`onboarding_${userProfile.id}`, JSON.stringify(answers));
      } catch {
        // ignore
      }

      setSuccessMessage(`¡Bienvenido, ${userProfile.name}! Tus 30 minutos gratis están listos.`);
      fireCelebrationConfetti();

      setTimeout(() => {
        setIsLoading(false);
        onAuthSuccess(userProfile);
        onClose();
      }, 900);
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Error al registrar la cuenta.';
      setErrorMessage(msg);
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setGoogleLoading(true);

    try {
      const customName = answers.name.trim() || 'Creador de Subtitla';
      // Save pending onboarding in case redirect is needed
      try {
        localStorage.setItem('pending_onboarding_answers', JSON.stringify(answers));
      } catch {
        // ignore
      }

      const userProfile = await signInWithGoogleReal(undefined, customName, () => {
        setSuccessMessage('Redirigiendo a Google para inicio de sesión seguro...');
      });
      
      // If popup succeeded without full page redirect
      if (userProfile && userProfile.id) {
        // Save onboarding answers in localStorage
        try {
          localStorage.setItem(`onboarding_${userProfile.id}`, JSON.stringify(answers));
          localStorage.removeItem('pending_onboarding_answers');
        } catch {
          // ignore
        }

        setSuccessMessage(`¡Conectado con Google exitosamente! Bienvenido, ${userProfile.name}.`);
        fireCelebrationConfetti();

        setTimeout(() => {
          setGoogleLoading(false);
          onAuthSuccess(userProfile);
          onClose();
        }, 800);
      }
    } catch (err: unknown) {
      setGoogleLoading(false);
      const msg = err instanceof Error ? err.message : 'Error al conectar con Google.';
      setErrorMessage(msg);
    }
  };

  // Handle Direct Login (for existing users)
  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMessage('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      const userProfile = await loginUser(loginEmail, loginPassword);
      setSuccessMessage(`¡Hola de nuevo, ${userProfile.name}!`);

      setTimeout(() => {
        setIsLoading(false);
        onAuthSuccess(userProfile);
        onClose();
      }, 700);
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión.';
      setErrorMessage(msg);
    }
  };

  // Percentage for the progress bar
  const progressPercent = Math.round(((currentStep + 1) / TOTAL_STEPS) * 100);

  // Animation variants
  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 35 : -35,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.25, ease: 'easeOut' },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -35 : 35,
      opacity: 0,
      transition: { duration: 0.18, ease: 'easeIn' },
    }),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-pop-in">
      {/* Background Noise Subtle Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Main Modal Card (Pure Solid White, High Contrast) */}
      <div className="relative w-full max-w-lg bg-white rounded-[32px] sm:rounded-[36px] shadow-2xl border border-gray-200/90 text-black flex flex-col overflow-hidden transition-all duration-300">
        
        {/* Top Header Bar */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
          
          {/* Tricks Style Progress Counter (if in onboarding mode) */}
          {viewMode === 'onboarding' ? (
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-[Poppins]">
                Completado
              </span>
              <div className="flex items-center font-[Poppins] font-black text-sm text-black bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentStep}
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="inline-block min-w-[16px] text-center"
                  >
                    0{Math.min(currentStep + 1, TOTAL_QUESTION_STEPS)}
                  </motion.span>
                </AnimatePresence>
                <span className="text-gray-300 mx-1">/</span>
                <span className="text-gray-400">0{TOTAL_QUESTION_STEPS}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white">
                <Sparkles className="w-3 h-3" />
              </div>
              <span className="font-[Poppins] font-extrabold text-sm text-black">
                Subtitla <span className="text-gray-400 font-normal">Acceso</span>
              </span>
            </div>
          )}

          {/* Right Header Actions: Mode Toggle & Close Button */}
          <div className="flex items-center space-x-2">
            {viewMode === 'onboarding' ? (
              <button
                type="button"
                onClick={() => {
                  setViewMode('direct-login');
                  setErrorMessage('');
                }}
                className="text-xs font-semibold text-gray-500 hover:text-black hover:bg-gray-100 px-3 py-1.5 rounded-full transition-colors font-[Poppins]"
              >
                ¿Ya tienes cuenta?
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setViewMode('onboarding');
                  setCurrentStep(0);
                  setErrorMessage('');
                }}
                className="text-xs font-semibold text-black bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors font-[Poppins]"
              >
                Probar gratis
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Alerts (Error / Success) */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-2 text-xs text-red-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
            <span className="leading-tight">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-2 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
            <span className="leading-tight font-medium">{successMessage}</span>
          </div>
        )}

        {/* Content Area: Multi-Step Questionnaire VS Direct Login */}
        <div className="p-6 sm:p-8 flex-1 min-h-[380px] flex flex-col justify-between">
          
          {viewMode === 'onboarding' ? (
            /* ONBOARDING QUESTIONNAIRE SLIDER */
            <div className="flex-1 flex flex-col justify-between">
              
              <AnimatePresence mode="wait" custom={direction}>
                {/* STEP 0: Nombre del usuario */}
                {currentStep === 0 && (
                  <motion.div
                    key="step-0"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-5"
                  >
                    <div>
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/5 text-[11px] font-bold text-black uppercase tracking-wider mb-2 font-[Poppins]">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>Paso 1 de 4</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight font-[Poppins] leading-tight">
                        ¿Cómo te llamas?
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 font-[Poppins]">
                        Usaremos tu nombre para configurar tu perfil y espacio de trabajo de creador.
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                          type="text"
                          autoFocus
                          value={answers.name}
                          onChange={(e) => setAnswers({ ...answers, name: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && answers.name.trim().length >= 2) {
                              e.preventDefault();
                              goToNextStep();
                            }
                          }}
                          placeholder="Ej. Alex Creador o @tuusuario"
                          className="w-full h-14 pl-12 pr-4 bg-gray-50 hover:bg-gray-100/80 focus:bg-white text-base font-semibold text-black rounded-2xl border-2 border-gray-200 focus:border-black focus:outline-none transition-all placeholder:text-gray-400"
                        />
                      </div>

                      <p className="text-[11px] text-gray-400 flex items-center space-x-1 pl-1">
                        <span>💡</span>
                        <span>Presiona <strong className="text-black">Enter ↵</strong> para continuar</span>
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* STEP 1: Tipo de contenido */}
                {currentStep === 1 && (
                  <motion.div
                    key="step-1"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-4"
                  >
                    <div>
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/5 text-[11px] font-bold text-black uppercase tracking-wider mb-2 font-[Poppins]">
                        <span>Paso 2 de 4</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight font-[Poppins] leading-tight">
                        ¿Qué tipo de contenido creas?
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 font-[Poppins]">
                        Personalizaremos los estilos de subtítulos ideales para tu formato.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 pt-1 max-h-[250px] overflow-y-auto pr-1">
                      {CONTENT_TYPES.map((opt) => {
                        const isSelected = answers.contentType === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectOption('contentType', opt.id)}
                            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.99] ${
                              isSelected
                                ? 'border-black bg-black/5 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-xl flex-shrink-0">{opt.icon}</span>
                              <div>
                                <h4 className="text-xs sm:text-sm font-bold text-black font-[Poppins]">
                                  {opt.title}
                                </h4>
                                <p className="text-[11px] text-gray-500 leading-tight">
                                  {opt.desc}
                                </p>
                              </div>
                            </div>

                            {/* Radio indicator */}
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'border-black bg-black text-white'
                                  : 'border-gray-300'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Cómo nos has conocido */}
                {currentStep === 2 && (
                  <motion.div
                    key="step-2"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-4"
                  >
                    <div>
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/5 text-[11px] font-bold text-black uppercase tracking-wider mb-2 font-[Poppins]">
                        <span>Paso 3 de 4</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight font-[Poppins] leading-tight">
                        ¿Cómo nos has conocido?
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 font-[Poppins]">
                        ¡Nos encanta saber de dónde vienen nuestros creadores!
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 pt-1 max-h-[250px] overflow-y-auto pr-1">
                      {REFERRAL_SOURCES.map((opt) => {
                        const isSelected = answers.referralSource === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectOption('referralSource', opt.id)}
                            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.99] ${
                              isSelected
                                ? 'border-black bg-black/5 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-xl flex-shrink-0">{opt.icon}</span>
                              <div>
                                <h4 className="text-xs sm:text-sm font-bold text-black font-[Poppins]">
                                  {opt.title}
                                </h4>
                                <p className="text-[11px] text-gray-500 leading-tight">
                                  {opt.desc}
                                </p>
                              </div>
                            </div>

                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'border-black bg-black text-white'
                                  : 'border-gray-300'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Principal objetivo */}
                {currentStep === 3 && (
                  <motion.div
                    key="step-3"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-4"
                  >
                    <div>
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/5 text-[11px] font-bold text-black uppercase tracking-wider mb-2 font-[Poppins]">
                        <span>Paso 4 de 4</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight font-[Poppins] leading-tight">
                        ¿Cuál es tu principal objetivo?
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 font-[Poppins]">
                        Queremos asegurarnos de que consigas los máximos resultados desde el minuto uno.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 pt-1 max-h-[250px] overflow-y-auto pr-1">
                      {GOALS.map((opt) => {
                        const isSelected = answers.goal === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectOption('goal', opt.id)}
                            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.99] ${
                              isSelected
                                ? 'border-black bg-black/5 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-xl flex-shrink-0">{opt.icon}</span>
                              <div>
                                <h4 className="text-xs sm:text-sm font-bold text-black font-[Poppins]">
                                  {opt.title}
                                </h4>
                                <p className="text-[11px] text-gray-500 leading-tight">
                                  {opt.desc}
                                </p>
                              </div>
                            </div>

                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'border-black bg-black text-white'
                                  : 'border-gray-300'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: Registro y Activación de 30 Minutos Gratis */}
                {currentStep === 4 && (
                  <motion.div
                    key="step-4"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider mb-2 font-[Poppins]">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>¡Casi listo! Reclama tu cuenta</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight font-[Poppins] leading-tight">
                        ¡Todo listo, {answers.name.trim() || 'Creador'}! 🎉
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 font-[Poppins]">
                        Crea tu cuenta gratis para activar tus <strong>30 minutos de IA</strong> y desbloquear el editor.
                      </p>
                    </div>

                    {/* Value badges */}
                    <div className="grid grid-cols-3 gap-2 py-1 text-center font-[Poppins]">
                      <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-[11px] font-semibold text-black">
                        🎁 30 min IA
                      </div>
                      <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-[11px] font-semibold text-black">
                        🎬 10 proyectos
                      </div>
                      <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-[11px] font-semibold text-black">
                        ⚡️ Sin marcas
                      </div>
                    </div>

                    {/* 1-Click Google Sign In */}
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading || isLoading}
                      className="w-full flex items-center justify-center space-x-2.5 py-3 px-4 rounded-2xl border-2 border-gray-200 bg-white hover:bg-gray-50 text-xs sm:text-sm font-bold text-black font-[Poppins] shadow-sm transition active:scale-95 disabled:opacity-60"
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
                      <span>Continuar con Google</span>
                    </button>

                    <div className="relative flex items-center justify-center py-1">
                      <div className="w-full border-t border-gray-200"></div>
                      <span className="absolute bg-white px-3 text-[11px] font-medium text-gray-400 font-[Poppins]">
                        o con tu correo
                      </span>
                    </div>

                    {/* Email & Password Registration Form */}
                    <form onSubmit={handleCompleteRegistration} className="space-y-2.5">
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tu.correo@ejemplo.com"
                          className="w-full h-11 pl-10 pr-4 bg-gray-50 focus:bg-white text-xs font-semibold text-black rounded-xl border border-gray-200 focus:border-black focus:outline-none transition-all placeholder:text-gray-400"
                        />
                      </div>

                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Crea una contraseña (mínimo 6 caracteres)"
                          className="w-full h-11 pl-10 pr-10 bg-gray-50 focus:bg-white text-xs font-semibold text-black rounded-xl border border-gray-200 focus:border-black focus:outline-none transition-all placeholder:text-gray-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading || googleLoading || !isStepValid()}
                        className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-black hover:opacity-90 active:scale-95 text-xs sm:text-sm font-bold text-white font-[Poppins] shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <>
                            <span>Activar 30 Minutos Gratis</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom Progress Bar & Tricks Style Arrows (Only on Steps 0 to 3) */}
              {currentStep < 4 && (
                <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
                  {/* Prev Button */}
                  <button
                    type="button"
                    onClick={goToPrevStep}
                    disabled={currentStep === 0}
                    className={`flex items-center space-x-1 px-3.5 py-2 rounded-full text-xs font-bold font-[Poppins] transition-all ${
                      currentStep === 0
                        ? 'opacity-30 pointer-events-none text-gray-400'
                        : 'text-black hover:bg-gray-100 active:scale-95'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  {/* Dynamic Progress Bar with Floating Percentage Tooltip */}
                  <div className="flex-1 mx-4 max-w-[180px] relative flex flex-col items-center">
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-black rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 font-[Poppins] mt-1">
                      {progressPercent}% completado
                    </span>
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={goToNextStep}
                    disabled={!isStepValid()}
                    className={`flex items-center space-x-1.5 px-5 py-2 rounded-full text-xs font-bold font-[Poppins] transition-all shadow-sm ${
                      isStepValid()
                        ? 'bg-black text-white hover:opacity-90 active:scale-95'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          ) : (
            /* DIRECT LOGIN MODE (For returning users) */
            <div className="space-y-5 animate-in fade-in">
              <div className="text-center">
                <h3 className="text-2xl font-black text-black tracking-tight font-[Poppins]">
                  Bienvenido de nuevo
                </h3>
                <p className="text-xs text-gray-500 mt-1 font-[Poppins]">
                  Accede a tus proyectos guardados y saldo de minutos de IA.
                </p>
              </div>

              {/* 1-Click Google Login */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || isLoading}
                className="w-full flex items-center justify-center space-x-2.5 py-3 px-4 rounded-2xl border-2 border-gray-200 bg-white hover:bg-gray-50 text-xs sm:text-sm font-bold text-black font-[Poppins] shadow-sm transition active:scale-95 disabled:opacity-60"
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
                <span>Iniciar sesión con Google</span>
              </button>

              <div className="relative flex items-center justify-center py-1">
                <div className="w-full border-t border-gray-200"></div>
                <span className="absolute bg-white px-3 text-[11px] font-medium text-gray-400 font-[Poppins]">
                  o con tu correo
                </span>
              </div>

              {/* Email + Password Login Form */}
              <form onSubmit={handleDirectLogin} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="tu.correo@ejemplo.com"
                    className="w-full h-11 pl-10 pr-4 bg-gray-50 focus:bg-white text-xs font-semibold text-black rounded-xl border border-gray-200 focus:border-black focus:outline-none transition-all placeholder:text-gray-400"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full h-11 pl-10 pr-10 bg-gray-50 focus:bg-white text-xs font-semibold text-black rounded-xl border border-gray-200 focus:border-black focus:outline-none transition-all placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || googleLoading}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-black hover:opacity-90 active:scale-95 text-xs sm:text-sm font-bold text-white font-[Poppins] shadow-md transition disabled:opacity-40"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <span>Entrar a mi cuenta</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('onboarding');
                    setCurrentStep(0);
                    setErrorMessage('');
                  }}
                  className="text-xs text-gray-500 hover:text-black font-semibold font-[Poppins]"
                >
                  ¿No tienes cuenta? <span className="underline text-black font-bold">Haz el cuestionario y consigue 30 min gratis</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
