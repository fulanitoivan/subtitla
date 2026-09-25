import type { VideoProject, ProjectLimitInfo } from '../types/project';
import type { VideoMetadata, SubtitleSegment, SubtitleStyle } from '../types/subtitle';
import { DEMO_VIDEOS } from '../constants/demoData';
import { SUBTITLE_PRESETS } from '../constants/presets';
import { saveVideoToIndexedDB, restoreVideoUrl, deleteVideoFromIndexedDB } from './videoStorageService';

const STORAGE_KEY = 'captions_ai_projects_v1';

// Initial sample projects if empty
const createInitialProjects = (): VideoProject[] => {
  const demo = DEMO_VIDEOS[0];
  return [
    {
      id: 'demo-project-1',
      title: 'Demo: Crecimiento Viral Shorts',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
      updatedAt: Date.now() - 1000 * 60 * 60 * 2,
      video: {
        name: demo.title,
        duration: demo.duration,
        width: 1080,
        height: 1920,
        url: demo.url,
      },
      segments: demo.segments,
      style: SUBTITLE_PRESETS[0],
    },
    {
      id: 'demo-project-2',
      title: 'Demo: Estilo Hormozi Impacto',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
      updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
      video: {
        name: DEMO_VIDEOS[1] ? DEMO_VIDEOS[1].title : demo.title,
        duration: DEMO_VIDEOS[1] ? DEMO_VIDEOS[1].duration : demo.duration,
        width: 1080,
        height: 1920,
        url: DEMO_VIDEOS[1] ? DEMO_VIDEOS[1].url : demo.url,
      },
      segments: DEMO_VIDEOS[1] ? DEMO_VIDEOS[1].segments : demo.segments,
      style: SUBTITLE_PRESETS[1] || SUBTITLE_PRESETS[0],
    },
  ];
};

export const getProjectLimit = (plan: string = 'free'): number => {
  switch (plan.toLowerCase()) {
    case 'creator':
    case 'pro':
      return 50;
    case 'agency':
      return 1000;
    case 'free':
    default:
      return 10; // Exactly 10 projects limit for Free tier
  }
};

export const getProjects = (): VideoProject[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialProjects();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading projects from storage:', err);
    return [];
  }
};

export const getProjectById = (id: string): VideoProject | null => {
  const all = getProjects();
  return all.find((p) => p.id === id) || null;
};

/**
 * Hydrates a project's video URL from IndexedDB if the previous blob URL expired on page reload
 */
export const hydrateProjectVideo = async (project: VideoProject): Promise<VideoProject> => {
  if (!project.video || !project.video.url) return project;

  try {
    const validUrl = await restoreVideoUrl(project.id, project.video.url);
    if (validUrl && validUrl !== project.video.url) {
      return {
        ...project,
        video: {
          ...project.video,
          url: validUrl,
        },
      };
    }
  } catch (err) {
    console.warn('Error hydrating project video URL:', err);
  }
  return project;
};

export const getProjectUsage = (plan: string = 'free'): ProjectLimitInfo => {
  const projects = getProjects();
  const max = getProjectLimit(plan);
  const count = projects.length;
  const percent = Math.min(100, Math.round((count / max) * 100));
  const isLimitReached = count >= max;

  const planName =
    plan === 'agency' ? 'Plan Agencia' : plan === 'creator' || plan === 'pro' ? 'Plan Creador Pro' : 'Plan Gratuito';

  return {
    count,
    max,
    percent,
    isLimitReached,
    planName,
  };
};

export const canCreateProject = (plan: string = 'free'): boolean => {
  const usage = getProjectUsage(plan);
  return !usage.isLimitReached;
};

export const saveProject = (
  projectData: {
    id?: string;
    title: string;
    video: VideoMetadata;
    segments: SubtitleSegment[];
    style: SubtitleStyle;
  },
  plan: string = 'free'
): { success: boolean; project?: VideoProject; error?: string } => {
  const projects = getProjects();
  const maxAllowed = getProjectLimit(plan);

  // If editing existing project
  if (projectData.id) {
    const existingIndex = projects.findIndex((p) => p.id === projectData.id);
    if (existingIndex >= 0) {
      const updated: VideoProject = {
        ...projects[existingIndex],
        title: projectData.title,
        video: projectData.video,
        segments: projectData.segments,
        style: projectData.style,
        updatedAt: Date.now(),
      };
      projects[existingIndex] = updated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));

      // Persist video file/blob to IndexedDB if present
      if (projectData.video.file) {
        saveVideoToIndexedDB(projectData.id, projectData.video.file);
      }

      return { success: true, project: updated };
    }
  }

  // If creating new project, enforce plan limit (e.g. max 10 for Free)
  if (projects.length >= maxAllowed) {
    return {
      success: false,
      error: `Has alcanzado el límite máximo de ${maxAllowed} proyectos de tu ${
        plan === 'free' ? 'Plan Gratuito' : 'plan'
      }. Elimina algún proyecto o actualiza tu plan.`,
    };
  }

  const newId = 'proj_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const newProject: VideoProject = {
    id: newId,
    title: projectData.title.trim() || `Proyecto #${projects.length + 1}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    video: projectData.video,
    segments: projectData.segments,
    style: projectData.style,
  };

  const updatedProjects = [newProject, ...projects];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));

  // Persist video file/blob to IndexedDB if present
  if (projectData.video.file) {
    saveVideoToIndexedDB(newId, projectData.video.file);
  }

  return { success: true, project: newProject };
};

export const renameProject = (id: string, newTitle: string): boolean => {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index >= 0) {
    projects[index].title = newTitle.trim() || 'Proyecto sin título';
    projects[index].updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return true;
  }
  return false;
};

export const deleteProject = (id: string): boolean => {
  const projects = getProjects();
  const filtered = projects.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  deleteVideoFromIndexedDB(id);
  return true;
};
