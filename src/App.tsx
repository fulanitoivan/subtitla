import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dropzone } from './components/Dropzone';
import { VideoPlayer } from './components/VideoPlayer/VideoPlayer';
import { StyleCustomizer } from './components/EditorPanel/StyleCustomizer';
import { TranscriptEditor } from './components/EditorPanel/TranscriptEditor';
import { ExportModal } from './components/ExportModal';
import { AuthModal } from './components/Auth/AuthModal';
import { BackgroundLiquidGlobes } from './components/BackgroundLiquidGlobes';
import { SpringNavTabs } from './components/Navigation/SpringNavTabs';
import { ProjectsGalleryPage } from './components/Projects/ProjectsGalleryPage';
import { Sliders, FileText } from 'lucide-react';

// Landing Page Components
import { HeroSection } from './components/Landing/HeroSection';
import { HowItWorks } from './components/Landing/HowItWorks';
import { LanguagesSection } from './components/Landing/LanguagesSection';
import { StylesShowcase } from './components/Landing/StylesShowcase';
import { PricingSection } from './components/Landing/PricingSection';
import { FaqSection } from './components/Landing/FaqSection';
import { Footer } from './components/Landing/Footer';

import { SUBTITLE_PRESETS } from './constants/presets';
import { DEMO_VIDEOS } from './constants/demoData';
import type { VideoMetadata, SubtitleSegment, SubtitleStyle, ApiKeys } from './types/subtitle';
import type { UserProfile, AuthMode } from './types/auth';
import type { VideoProject } from './types/project';
import { useVideoSync } from './hooks/useVideoSync';
import { extractAudioFromVideo } from './services/audioExtractor';
import { transcribeWithGemini } from './services/geminiTranscription';
import {
  getCurrentSession,
  setActiveSession,
  logoutUser,
  deductUserMinutes,
  checkFirebaseRedirectResult,
  subscribeToFirebaseAuthState,
} from './services/authService';
import { saveProject, getProjects, hydrateProjectVideo } from './services/projectService';

export function App() {
  // Navigation & View State with URL routing sync ('landing' | 'projects' | 'studio')
  const [currentView, setCurrentView] = useState<'landing' | 'projects' | 'studio'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path === '/projects' || path === '/proyectos') return 'projects';
      if (path === '/editor' || path === '/studio' || path === '/app') return 'studio';
    }
    return 'landing';
  });

  // Sync URL route with current view and support browser back/forward
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/projects' || path === '/proyectos') {
        setCurrentView('projects');
      } else if (path === '/editor' || path === '/studio' || path === '/app') {
        setCurrentView('studio');
      } else {
        setCurrentView('landing');
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  const handleNavigateView = (view: 'landing' | 'projects' | 'studio') => {
    setCurrentView(view);
    const targetPath = view === 'projects' ? '/projects' : view === 'studio' ? '/editor' : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  // Auth & User Profile State (Real Persistent Auth)
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('login');

  // Multi-Project Management State (Max 10 projects for Free Plan)
  const [currentProject, setCurrentProject] = useState<VideoProject | null>(null);

  // Video and Subtitles State
  const [video, setVideo] = useState<VideoMetadata | null>(null);
  const [segments, setSegments] = useState<SubtitleSegment[]>(DEMO_VIDEOS[0].segments);
  const [style, setStyle] = useState<SubtitleStyle>(SUBTITLE_PRESETS[0]);
  
  // UI & Modal State
  const [activeTab, setActiveTab] = useState<'style' | 'transcript'>('style');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const DEFAULT_GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

  // Transcription & AI State (Dedicated to Google Gemini AI)
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionStatus, setTranscriptionStatus] = useState('');
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    geminiKey: DEFAULT_GEMINI_KEY,
    groqKey: '',
  });

  // Load User, Projects & API keys on mount with video hydration
  useEffect(() => {
    // Load real persistent session
    const activeSession = getCurrentSession();
    if (activeSession) {
      setUser(activeSession);
    }

    // Load API Keys
    const savedKeys = localStorage.getItem('captions_ai_keys');
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        const activeGeminiKey = (!parsed.geminiKey || parsed.geminiKey.includes('Ab8RN6JaqYym'))
          ? DEFAULT_GEMINI_KEY
          : parsed.geminiKey;

        const updated = {
          geminiKey: activeGeminiKey,
          groqKey: parsed.groqKey || '',
        };
        setApiKeys(updated);
        localStorage.setItem('captions_ai_keys', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
    } else {
      localStorage.setItem('captions_ai_keys', JSON.stringify({
        geminiKey: DEFAULT_GEMINI_KEY,
        groqKey: '',
      }));
    }

    // Check if user just completed Google Redirect Sign-In
    checkFirebaseRedirectResult().then((redirectUser) => {
      if (redirectUser) {
        setUser(redirectUser);
        setActiveSession(redirectUser);
      }
    });

    // Subscribe to Firebase Auth state
    const unsubscribeAuth = subscribeToFirebaseAuthState((fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        setActiveSession(fbUser);
      }
    });

    // Load initial project if exists and hydrate video URL from IndexedDB
    const projects = getProjects();
    if (projects.length > 0 && !currentProject) {
      hydrateProjectVideo(projects[0]).then((hydrated) => {
        setCurrentProject(hydrated);
        if (hydrated.video) {
          setVideo(hydrated.video);
        }
        if (hydrated.segments) {
          setSegments(hydrated.segments);
        }
        if (hydrated.style) {
          setStyle(hydrated.style);
        }
      });
    }

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const handleAuthSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  const handleOpenAuthModal = (mode: AuthMode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Video playback & 60 FPS Sync Hook
  const {
    videoRef,
    currentTime,
    duration,
    isPlaying,
    activeSegment,
    activeWord,
    setDuration,
    setIsPlaying,
    togglePlay,
    seekTo,
  } = useVideoSync({ segments });

  // Handle loading a project from ProjectsGallery or ProjectsMenu
  const handleSelectProject = async (project: VideoProject) => {
    const hydrated = await hydrateProjectVideo(project);
    setCurrentProject(hydrated);
    setVideo(hydrated.video);
    setSegments(hydrated.segments);
    setStyle(hydrated.style);
    handleNavigateView('studio');
  };

  // Handle starting a fresh new project
  const handleNewProject = () => {
    setCurrentProject(null);
    setVideo(null);
    setSegments(DEMO_VIDEOS[0].segments);
    handleNavigateView('studio');
  };

  // Handle loading a video (demo or manual upload)
  const handleVideoLoaded = (videoData: VideoMetadata, initialSegments?: SubtitleSegment[]) => {
    const loadedSegments = initialSegments || segments;
    setVideo(videoData);
    if (initialSegments) {
      setSegments(initialSegments);
    }
    
    // Auto-save project within limit
    const saveResult = saveProject({
      title: videoData.name.replace(/\.[^/.]+$/, '') || 'Nuevo Proyecto',
      video: videoData,
      segments: loadedSegments,
      style: style,
    }, user?.plan || 'free');

    if (saveResult.success && saveResult.project) {
      setCurrentProject(saveResult.project);
    }

    setCurrentView('studio');
  };

  // Transcribe uploaded video with Google Gemini AI exclusively
  const handleTranscribeFile = async (file: File) => {
    setIsTranscribing(true);
    setTranscriptionStatus('Extrayendo audio optimizado del video...');
    setCurrentView('studio');

    try {
      const audioBlob = await extractAudioFromVideo(file);

      const resultSegments = await transcribeWithGemini(audioBlob, apiKeys.geminiKey, (status) => {
        setTranscriptionStatus(status);
      });

      const videoUrl = URL.createObjectURL(file);
      const newVideoData: VideoMetadata = {
        name: file.name,
        duration: 0,
        width: 1080,
        height: 1920,
        url: videoUrl,
        file,
      };

      setVideo(newVideoData);
      setSegments(resultSegments);
      setIsTranscribing(false);

      // Auto-save to Projects
      const saveRes = saveProject({
        title: file.name.replace(/\.[^/.]+$/, ''),
        video: newVideoData,
        segments: resultSegments,
        style: style,
      }, user?.plan || 'free');

      if (saveRes.success && saveRes.project) {
        setCurrentProject(saveRes.project);
      }

      // Deduct 1 min from active account
      if (user) {
        const remaining = deductUserMinutes(user.id, 1);
        setUser({ ...user, minutesRemaining: remaining });
      }
    } catch (err: unknown) {
      setIsTranscribing(false);
      const errorMessage = err instanceof Error ? err.message : 'Error al transcribir el archivo.';
      alert(`Error en la transcripción con Gemini: ${errorMessage}`);
    }
  };

  // Auto-sync style/segment changes to active project
  const handleStyleChange = (newStyle: SubtitleStyle) => {
    setStyle(newStyle);
    if (currentProject && video) {
      saveProject({
        id: currentProject.id,
        title: currentProject.title,
        video: video,
        segments: segments,
        style: newStyle,
      }, user?.plan || 'free');
    }
  };

  const handleSegmentsChange = (newSegments: SubtitleSegment[]) => {
    setSegments(newSegments);
    if (currentProject && video) {
      saveProject({
        id: currentProject.id,
        title: currentProject.title,
        video: video,
        segments: newSegments,
        style: style,
      }, user?.plan || 'free');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col selection:bg-black selection:text-white relative">
      
      {/* Voicecheap Dot Matrix Canvas */}
      <BackgroundLiquidGlobes />

      {/* Top Navigation Bar */}
      <Navbar
        user={user}
        currentProject={currentProject}
        onSelectProject={handleSelectProject}
        onNewProject={handleNewProject}
        onOpenUpgradeModal={() => handleOpenAuthModal('register')}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasVideo={Boolean(video)}
        isProcessing={isTranscribing}
        currentView={currentView}
        setCurrentView={handleNavigateView}
      />

      {/* Main Content Area: Landing View vs Projects Gallery vs Studio View */}
      {currentView === 'landing' ? (
        /* LANDING PAGE (Voicecheap Minimalist Pure White) */
        <main className="flex-1 flex flex-col bg-white">
          <HeroSection
            onStartCreating={() => handleNavigateView('projects')}
          />
          <HowItWorks />
          <StylesShowcase onSelectStyleAndCreate={(styleId) => {
            const foundPreset = SUBTITLE_PRESETS.find((p) => p.id === styleId);
            if (foundPreset) setStyle(foundPreset);
            const demo = DEMO_VIDEOS[0];
            handleVideoLoaded(
              {
                name: demo.title,
                duration: demo.duration,
                width: 1080,
                height: 1920,
                url: demo.url,
              },
              demo.segments
            );
          }} />
          <LanguagesSection />
          <PricingSection onSelectPlan={() => handleOpenAuthModal('register')} />
          <FaqSection />
          <Footer />
        </main>
      ) : currentView === 'projects' ? (
        /* PROJECTS GALLERY / WORKSPACE VIEW */
        <main className="flex-1 flex flex-col bg-white">
          <ProjectsGalleryPage
            user={user}
            onSelectProject={handleSelectProject}
            onNewProject={handleNewProject}
            onOpenUpgradeModal={() => handleOpenAuthModal('register')}
          />
        </main>
      ) : (
        /* STUDIO WORKSPACE (Voicecheap Minimalist Editor) */
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center bg-white">
          {!video ? (
            /* Dropzone / Upload Screen */
            <Dropzone
              onVideoLoaded={handleVideoLoaded}
              onTranscribeFile={handleTranscribeFile}
              isTranscribing={isTranscribing}
              transcriptionStatus={transcriptionStatus}
            />
          ) : (
            /* Two-Column Video Editor Workspace */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Real-time Video Player Preview */}
              <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-center sticky top-20">
                <VideoPlayer
                  video={video}
                  segments={segments}
                  style={style}
                  onChangeStyle={handleStyleChange}
                  videoRef={videoRef}
                  currentTime={currentTime}
                  duration={duration}
                  isPlaying={isPlaying}
                  activeSegment={activeSegment}
                  activeWord={activeWord}
                  setDuration={setDuration}
                  setIsPlaying={setIsPlaying}
                  onTogglePlay={togglePlay}
                  onSeek={seekTo}
                />
              </div>

              {/* Right Column: Customizer & Transcript Editor Panel */}
              <div className="lg:col-span-6 xl:col-span-7 bg-white rounded-[28px] p-5 sm:p-7 shadow-sm border border-gray-200 max-h-[85vh] overflow-y-auto space-y-5">
                
                {/* Prominent Dynamic Tab Switcher with Spring Physics */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                  <SpringNavTabs
                    tabs={[
                      {
                        id: 'style',
                        label: 'Estilo y Animación',
                        icon: <Sliders className="w-3.5 h-3.5" />,
                      },
                      {
                        id: 'transcript',
                        label: 'Transcripción',
                        icon: <FileText className="w-3.5 h-3.5" />,
                        badge: segments.length,
                      },
                    ]}
                    activeId={activeTab}
                    onChange={(id) => setActiveTab(id as 'style' | 'transcript')}
                    layoutId="studio-panel-spring-pill"
                    variant="subtle"
                    size="md"
                  />

                  <span className="text-[11px] font-semibold text-gray-400">
                    {activeTab === 'style' ? 'Personalización Visual 60 FPS' : 'Sincronización Palabra a Palabra'}
                  </span>
                </div>

                {/* Tab Content */}
                {activeTab === 'style' ? (
                  <StyleCustomizer style={style} onChangeStyle={handleStyleChange} />
                ) : (
                  <TranscriptEditor
                    segments={segments}
                    onChangeSegments={handleSegmentsChange}
                    onSeek={seekTo}
                    currentTime={currentTime}
                  />
                )}

              </div>

            </div>
          )}
        </main>
      )}

      {/* Auth Modal (Real Authentication with Google & Email) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />

      {/* Export Modal */}
      {video && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          video={video}
          segments={segments}
          style={style}
          videoRef={videoRef}
        />
      )}

    </div>
  );
}
export default App;
