import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Folder,
  Plus,
  Search,
  Clock,
  Sliders,
  Trash2,
  Edit2,
  Check,
  X,
  ArrowRight,
  Video as VideoIcon,
  Crown,
  Play,
  FileText,
} from 'lucide-react';
import type { VideoProject } from '../../types/project';
import type { UserProfile } from '../../types/auth';
import {
  getProjects,
  getProjectUsage,
  renameProject,
  deleteProject,
  hydrateProjectVideo,
} from '../../services/projectService';

interface ProjectsGalleryPageProps {
  user: UserProfile | null;
  onSelectProject: (project: VideoProject) => void;
  onNewProject: () => void;
  onOpenUpgradeModal: () => void;
}

export const ProjectsGalleryPage: React.FC<ProjectsGalleryPageProps> = ({
  user,
  onSelectProject,
  onNewProject,
  onOpenUpgradeModal,
}) => {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const plan = user?.plan || 'free';
  const usage = getProjectUsage(plan);

  const loadProjects = async () => {
    const rawProjects = getProjects();
    // Hydrate all project videos in parallel so valid video URLs are available
    const hydrated = await Promise.all(rawProjects.map(hydrateProjectVideo));
    setProjects(hydrated);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleStartRename = (project: VideoProject, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(project.id);
    setEditTitle(project.title);
  };

  const handleSaveRename = (id: string, e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    if (editTitle.trim()) {
      renameProject(id, editTitle.trim());
      loadProjects();
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteProject(id);
    setConfirmDeleteId(null);
    loadProjects();
  };

  const handleOpenProject = async (project: VideoProject) => {
    setLoadingId(project.id);
    const fullyHydrated = await hydrateProjectVideo(project);
    setLoadingId(null);
    onSelectProject(fullyHydrated);
  };

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[85vh] bg-white text-black py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-gray-100">
        <div>
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white shadow-sm">
              <Folder className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Workspace & Gestión
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black">
            Mis Proyectos de Video
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            Selecciona un proyecto para continuar editando sus subtítulos en el editor o sube un nuevo video.
          </p>
        </div>

        {/* Action Controls & Usage pill */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Plan Usage Pill */}
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200/80 text-xs text-gray-700">
            <span className="font-medium">{usage.planName}:</span>
            <span
              className={`font-bold ${
                usage.isLimitReached ? 'text-amber-600' : 'text-black'
              }`}
            >
              {usage.count} / {usage.max} proyectos
            </span>
            {usage.isLimitReached && (
              <button
                onClick={onOpenUpgradeModal}
                className="ml-1 text-[11px] font-bold text-amber-600 hover:underline flex items-center space-x-0.5"
              >
                <span>Mejorar</span>
                <Crown className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* New Project Button */}
          <button
            onClick={onNewProject}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-black text-white text-xs sm:text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Video</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-6">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título de proyecto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-xs sm:text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <span className="text-xs text-gray-400 self-end sm:self-center font-medium">
          Mostrando {filteredProjects.length} de {projects.length} proyectos guardados
        </span>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Create New Project Action Card */}
        <motion.div
          whileHover={{ y: -4 }}
          onClick={onNewProject}
          className="group border-2 border-dashed border-gray-200 hover:border-black rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-gray-50/50 hover:bg-white min-h-[260px] shadow-sm hover:shadow-md"
        >
          <div className="w-14 h-14 rounded-full bg-white group-hover:bg-black group-hover:text-white text-black border border-gray-200 flex items-center justify-center mb-4 transition-all group-hover:scale-110 shadow-sm">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-black mb-1">Subir Nuevo Video</h3>
          <p className="text-xs text-gray-400 max-w-[200px]">
            Transcribe con IA y genera subtítulos animados automáticamente
          </p>
        </motion.div>

        {/* Saved Project Cards */}
        {filteredProjects.map((project) => {
          const wordCount = project.segments.reduce((acc, s) => acc + (s.words ? s.words.length : 0), 0);
          const isEditing = editingId === project.id;
          const isConfirmingDelete = confirmDeleteId === project.id;
          const isLoading = loadingId === project.id;

          return (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
              onClick={() => {
                if (!isEditing && !isConfirmingDelete) {
                  handleOpenProject(project);
                }
              }}
              className="group bg-white rounded-3xl border border-gray-200 hover:border-black/30 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col overflow-hidden relative"
            >
              {/* Card Video Preview / Thumbnail Area */}
              <div className="w-full h-40 bg-gray-900 relative overflow-hidden flex items-center justify-center">
                {project.video?.url ? (
                  <video
                    src={project.video.url}
                    muted
                    preload="metadata"
                    playsInline
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                    onMouseEnter={(e) => {
                      try {
                        e.currentTarget.play().catch(() => {});
                      } catch {
                        // ignore
                      }
                    }}
                    onMouseLeave={(e) => {
                      try {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      } catch {
                        // ignore
                      }
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <VideoIcon className="w-8 h-8 mb-1" />
                    <span className="text-[10px]">Video local</span>
                  </div>
                )}

                {/* Duration / Badge overlay */}
                {project.video?.duration ? (
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold">
                    {Math.floor(project.video.duration / 60)}:
                    {Math.floor(project.video.duration % 60)
                      .toString()
                      .padStart(2, '0')}
                  </div>
                ) : null}

                {/* Subtitle Style Tag overlay */}
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-black text-[10px] font-bold flex items-center space-x-1 shadow-sm">
                  <Sliders className="w-2.5 h-2.5" />
                  <span className="capitalize">{project.style?.name || 'Estilo'}</span>
                </div>

                {/* Center Hover Play Indicator */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-4 h-4 fill-black translate-x-0.5" />
                  </div>
                </div>
              </div>

              {/* Card Body & Info */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                {/* Title & Rename */}
                <div>
                  {isEditing ? (
                    <div
                      className="flex items-center space-x-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(project.id)}
                        autoFocus
                        className="w-full px-2.5 py-1 text-xs font-bold border border-black rounded-lg focus:outline-none bg-white"
                      />
                      <button
                        onClick={(e) => handleSaveRename(project.id, e)}
                        className="p-1.5 rounded-lg bg-black text-white hover:opacity-80 transition-opacity"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleCancelRename}
                        className="p-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-black line-clamp-1 group-hover:text-black transition-colors">
                        {project.title}
                      </h3>
                      <button
                        onClick={(e) => handleStartRename(project, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-black rounded transition-all"
                        title="Renombrar"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Subtitle segment info */}
                  <div className="flex items-center space-x-2 text-[11px] text-gray-400 mt-1">
                    <span className="flex items-center space-x-1">
                      <FileText className="w-3 h-3" />
                      <span>{project.segments.length} bloques</span>
                    </span>
                    <span>•</span>
                    <span>{wordCount} palabras</span>
                  </div>
                </div>

                {/* Footer of Card: Date & Action CTA */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-gray-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                  </span>

                  {/* Delete or Open */}
                  {isConfirmingDelete ? (
                    <div
                      className="flex items-center space-x-1 bg-red-50 p-1 rounded-lg border border-red-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[10px] font-bold text-red-700 px-1">¿Borrar?</span>
                      <button
                        onClick={(e) => handleDelete(project.id, e)}
                        className="px-2 py-0.5 rounded bg-red-600 text-white hover:bg-red-700 text-[10px] font-bold"
                      >
                        Sí
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(null);
                        }}
                        className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-[10px]"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(project.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                        title="Eliminar proyecto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-black group-hover:translate-x-0.5 transition-transform">
                        <span>{isLoading ? 'Abriendo...' : 'Editar'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
