import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  AlertCircle, 
  Crown, 
  Clock, 
  Search
} from 'lucide-react';
import type { VideoProject } from '../types/project';
import type { UserProfile } from '../types/auth';
import { 
  getProjects, 
  getProjectUsage, 
  renameProject, 
  deleteProject
} from '../services/projectService';

interface ProjectsMenuProps {
  currentProject: VideoProject | null;
  user: UserProfile | null;
  onSelectProject: (project: VideoProject) => void;
  onNewProject: () => void;
  onOpenUpgradeModal: () => void;
}

export const ProjectsMenu: React.FC<ProjectsMenuProps> = ({
  currentProject,
  user,
  onSelectProject,
  onNewProject,
  onOpenUpgradeModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const plan = user?.plan || 'free';
  const usage = getProjectUsage(plan);

  const refreshProjects = () => {
    setProjects(getProjects());
  };

  useEffect(() => {
    refreshProjects();
  }, [isOpen]);

  const handleStartRename = (project: VideoProject, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(project.id);
    setEditTitle(project.title);
  };

  const handleSaveRename = (id: string, e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    if (editTitle.trim()) {
      renameProject(id, editTitle.trim());
      refreshProjects();
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
    refreshProjects();
  };

  const handleCreateNew = () => {
    if (usage.isLimitReached) {
      onOpenUpgradeModal();
      return;
    }
    setIsOpen(false);
    onNewProject();
  };

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      {/* Top-Left Projects Trigger Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 shadow-sm text-xs font-semibold text-black transition-all hover:border-black/30 group"
        title="Ver y gestionar mis proyectos de video"
      >
        <Folder className="w-3.5 h-3.5 text-black group-hover:scale-110 transition-transform" />
        <span className="font-bold">Proyectos</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
          usage.isLimitReached
            ? 'bg-amber-100 text-amber-900 border border-amber-300'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {usage.count}/{usage.max}
        </span>
      </button>

      {/* Projects Dropdown / Slide-over Modal */}
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" 
            onClick={() => setIsOpen(false)} 
          />

          {/* Panel */}
          <div className="absolute left-0 mt-2.5 w-[360px] sm:w-[420px] max-w-[92vw] z-50 bg-white rounded-3xl border border-gray-200 shadow-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white">
                  <Folder className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-black">Mis Proyectos</h3>
                  <p className="text-[11px] text-gray-500">{usage.planName} • Máximo {usage.max} proyectos</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Plan Usage Progress Bar */}
            <div className="bg-[#F8F9FA] rounded-2xl p-3.5 border border-gray-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-black/70">Uso de proyectos:</span>
                <span className={`font-bold ${usage.isLimitReached ? 'text-amber-600' : 'text-black'}`}>
                  {usage.count} de {usage.max} {usage.isLimitReached ? '(Límite alcanzado)' : ''}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    usage.isLimitReached 
                      ? 'bg-amber-500' 
                      : usage.percent > 70 
                        ? 'bg-blue-600' 
                        : 'bg-black'
                  }`}
                  style={{ width: `${Math.max(8, usage.percent)}%` }}
                />
              </div>

              {usage.isLimitReached ? (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-amber-700 font-medium flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Límite de {usage.max} proyectos activo</span>
                  </span>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenUpgradeModal();
                    }}
                    className="text-[11px] font-bold text-black hover:underline flex items-center space-x-1"
                  >
                    <span>Subir a Pro (50)</span>
                    <Crown className="w-3 h-3 text-amber-500" />
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-gray-500">
                  {usage.max - usage.count} {usage.max - usage.count === 1 ? 'espacio disponible' : 'espacios disponibles'} en tu {usage.planName}.
                </p>
              )}
            </div>

            {/* Action Bar: New Project Button & Search */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCreateNew}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-full bg-black hover:opacity-90 text-white text-xs font-bold transition-all shadow-sm active:scale-98"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Proyecto</span>
              </button>

              <div className="relative w-36 sm:w-44">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-full bg-gray-50 border border-gray-200 text-xs text-black focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>

            {/* Projects List */}
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredProjects.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <Folder className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-500">No se encontraron proyectos</p>
                </div>
              ) : (
                filteredProjects.map((proj) => {
                  const isActive = currentProject?.id === proj.id;
                  const wordCount = proj.segments.reduce((acc, s) => acc + s.words.length, 0);
                  const isEditing = editingId === proj.id;
                  const isConfirmingDelete = confirmDeleteId === proj.id;

                  return (
                    <div
                      key={proj.id}
                      onClick={() => {
                        if (!isEditing && !isConfirmingDelete) {
                          onSelectProject(proj);
                          setIsOpen(false);
                        }
                      }}
                      className={`group p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        isActive
                          ? 'bg-black/5 border-black/30 shadow-sm'
                          : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        {/* Title or Edit Form */}
                        {isEditing ? (
                          <div className="flex items-center space-x-1 flex-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(proj.id)}
                              autoFocus
                              className="w-full px-2 py-1 text-xs font-bold border border-black rounded-lg focus:outline-none bg-white"
                            />
                            <button
                              onClick={(e) => handleSaveRename(proj.id, e)}
                              className="p-1 rounded-md bg-black text-white hover:opacity-80"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={handleCancelRename}
                              className="p-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-bold text-black truncate block">
                                {proj.title}
                              </span>
                              {isActive && (
                                <span className="px-1.5 py-0.5 rounded-full bg-black text-white text-[9px] font-extrabold uppercase shrink-0">
                                  Activo
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-[10px] text-gray-500 mt-1">
                              <span className="flex items-center space-x-0.5">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span>{new Date(proj.updatedAt).toLocaleDateString()}</span>
                              </span>
                              <span>•</span>
                              <span>{wordCount} palabras</span>
                              <span>•</span>
                              <span className="capitalize">{proj.style.name}</span>
                            </div>
                          </div>
                        )}

                        {/* Action buttons (Rename / Delete) */}
                        {!isEditing && (
                          <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            {isConfirmingDelete ? (
                              <div className="flex items-center space-x-1 bg-red-50 p-1 rounded-lg border border-red-200" onClick={(e) => e.stopPropagation()}>
                                <span className="text-[10px] font-bold text-red-700 px-1">¿Borrar?</span>
                                <button
                                  onClick={(e) => handleDelete(proj.id, e)}
                                  className="p-1 rounded bg-red-600 text-white hover:bg-red-700 text-[10px]"
                                >
                                  Sí
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteId(null);
                                  }}
                                  className="p-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-[10px]"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={(e) => handleStartRename(proj, e)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
                                  title="Renombrar proyecto"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteId(proj.id);
                                  }}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Eliminar proyecto"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Notice */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span>Tus proyectos se guardan en tu dispositivo</span>
              <span className="font-bold text-black">Autoguardado ✓</span>
            </div>

          </div>
        </>
      )}
    </div>
  );
};
