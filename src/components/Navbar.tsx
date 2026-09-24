import React, { useState } from 'react';
import { Sparkles, Download, Sliders, FileText, LogOut, ChevronDown, Video, Globe, CreditCard, HelpCircle } from 'lucide-react';
import { ProjectsMenu } from './ProjectsMenu';
import { AnimatedLogo } from './AnimatedLogo';
import { SpringNavTabs, type SpringTabItem } from './Navigation/SpringNavTabs';
import { useActiveSection } from '../hooks/useActiveSection';
import type { UserProfile } from '../types/auth';
import type { VideoProject } from '../types/project';

interface NavbarProps {
  user: UserProfile | null;
  currentProject: VideoProject | null;
  onSelectProject: (project: VideoProject) => void;
  onNewProject: () => void;
  onOpenUpgradeModal: () => void;
  onOpenExportModal: () => void;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  activeTab: 'style' | 'transcript';
  setActiveTab: (tab: 'style' | 'transcript') => void;
  hasVideo: boolean;
  isProcessing: boolean;
  currentView: 'landing' | 'studio';
  setCurrentView: (view: 'landing' | 'studio') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentProject,
  onSelectProject,
  onNewProject,
  onOpenUpgradeModal,
  onOpenExportModal,
  onOpenAuthModal,
  onLogout,
  activeTab,
  setActiveTab,
  hasVideo,
  isProcessing,
  currentView,
  setCurrentView,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Active section scrollspy for Landing
  const landingSectionIds = ['how-it-works', 'styles', 'languages', 'pricing', 'faq'];
  const activeSection = useActiveSection(landingSectionIds, 'how-it-works');

  const landingTabs: SpringTabItem[] = [
    { id: 'how-it-works', label: 'Visión general', href: '#how-it-works', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'styles', label: 'Características', href: '#styles', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'languages', label: 'Idiomas (+100)', href: '#languages', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'pricing', label: 'Precios', href: '#pricing', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { id: 'faq', label: 'FAQ', href: '#faq', icon: <HelpCircle className="w-3.5 h-3.5" /> },
  ];

  const studioTabs: SpringTabItem[] = [
    { id: 'style', label: 'Estilo Visual', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'transcript', label: 'Transcripción', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  const viewTabs: SpringTabItem[] = [
    { id: 'landing', label: 'Inicio', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'studio', label: 'Editor', icon: <Video className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 lg:px-8 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left Section: Projects Menu + Brand Logo */}
        <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
          
          {/* Projects Menu Dropdown with 10 Project Limit */}
          <ProjectsMenu
            currentProject={currentProject}
            user={user}
            onSelectProject={onSelectProject}
            onNewProject={onNewProject}
            onOpenUpgradeModal={onOpenUpgradeModal}
          />

          <div className="h-4 w-px bg-gray-200 hidden sm:block" />

          {/* Animated Brand Logo (Video Logo that animates on load and stops at final frame) */}
          <AnimatedLogo
            onClick={() => setCurrentView('landing')}
            size="md"
          />
        </div>

        {/* Center Navigation Links with Spring Physics */}
        <div className="hidden lg:flex items-center justify-center">
          {currentView === 'landing' ? (
            <SpringNavTabs
              tabs={landingTabs}
              activeId={activeSection}
              layoutId="landing-nav-pill"
              variant="subtle"
              size="md"
            />
          ) : (
            hasVideo && (
              <SpringNavTabs
                tabs={studioTabs}
                activeId={activeTab}
                onChange={(id) => setActiveTab(id as 'style' | 'transcript')}
                layoutId="studio-navbar-pill"
                variant="subtle"
                size="md"
              />
            )
          )}
        </div>

        {/* Right Section: Studio Switcher, Gemini IA Status, User Auth & Export */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          
          {/* Studio / Landing Spring Switcher */}
          <SpringNavTabs
            tabs={viewTabs}
            activeId={currentView}
            onChange={(id) => setCurrentView(id as 'landing' | 'studio')}
            layoutId="view-switch-pill"
            variant="subtle"
            size="sm"
          />

          {/* User Auth Profile / Login Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1 pr-2.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 shadow-sm text-xs font-semibold text-black transition-colors"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover border border-black/10"
                />
                <span className="hidden md:inline max-w-[100px] truncate">{user.name}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl p-3 shadow-2xl border border-gray-200 z-50 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-black truncate">{user.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    <div className="mt-2 pt-1.5 border-t border-gray-200 flex items-center justify-between text-[11px]">
                      <span className="text-gray-600">Saldo disponible:</span>
                      <strong className="text-black font-black">{user.minutesRemaining} min</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center space-x-2 p-2 rounded-xl text-xs text-red-600 hover:bg-red-50 font-medium transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenAuthModal('login')}
                className="hidden sm:block px-3 py-1.5 rounded-full text-xs font-medium text-black hover:opacity-60 transition-opacity"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => onOpenAuthModal('register')}
                className="rounded-full bg-black px-4 sm:px-5 py-1.5 sm:py-2 font-[Poppins] text-xs sm:text-[13px] text-white shadow-sm transition hover:opacity-90 active:scale-95"
              >
                Pruébalo gratis
              </button>
            </div>
          )}

          {/* Export Button if inside studio */}
          {hasVideo && currentView === 'studio' && (
            <button
              onClick={onOpenExportModal}
              disabled={isProcessing}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-black hover:opacity-90 text-white text-xs font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>
          )}

        </div>

      </div>

      {/* Mobile Floating Bottom Spring Dock */}
      {currentView === 'landing' && (
        <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 lg:hidden pointer-events-none">
          <div className="pointer-events-auto shadow-2xl rounded-full">
            <SpringNavTabs
              tabs={[
                { id: 'how-it-works', label: 'Inicio', href: '#how-it-works', icon: <Sparkles className="w-3.5 h-3.5" /> },
                { id: 'styles', label: 'Estilos', href: '#styles', icon: <Sliders className="w-3.5 h-3.5" /> },
                { id: 'languages', label: 'Idiomas', href: '#languages', icon: <Globe className="w-3.5 h-3.5" /> },
                { id: 'pricing', label: 'Precios', href: '#pricing', icon: <CreditCard className="w-3.5 h-3.5" /> },
                { id: 'faq', label: 'FAQ', href: '#faq', icon: <HelpCircle className="w-3.5 h-3.5" /> },
              ]}
              activeId={activeSection}
              layoutId="mobile-floating-nav-pill"
              variant="floating"
              size="sm"
            />
          </div>
        </div>
      )}
    </header>
  );
};
