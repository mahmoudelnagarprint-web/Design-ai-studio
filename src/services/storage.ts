import { Project, PromptItem, PromptVersion, StudioSettings } from '../types';
import { initialProjects, defaultSettings } from './mockData';

const PROJECTS_STORAGE_KEY = 'nagar_design_studio_projects_v2';
const SETTINGS_STORAGE_KEY = 'nagar_design_studio_settings_v2';
const ACTIVE_PROJECT_KEY = 'nagar_design_studio_active_project_id';

export function loadStoredProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) {
      saveProjects(initialProjects);
      return initialProjects;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return initialProjects;
  } catch (err) {
    console.error('Failed to load stored projects:', err);
    return initialProjects;
  }
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to persist projects to storage:', err);
  }
}

export function loadStoredSettings(): StudioSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: StudioSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function getStoredActiveProjectId(): string | null {
  return localStorage.getItem(ACTIVE_PROJECT_KEY);
}

export function setStoredActiveProjectId(id: string): void {
  localStorage.setItem(ACTIVE_PROJECT_KEY, id);
}

// Duplicate a project non-destructively
export function duplicateProject(source: Project): Project {
  const newId = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  // Clone prompts with new IDs
  const clonedPrompts: PromptItem[] = (source.prompts || []).map((p) => {
    const newPromptId = `prompt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    return {
      ...p,
      id: newPromptId,
      projectId: newId,
      createdAt: now,
      updatedAt: now,
      versions: (p.versions || []).map((v) => ({
        ...v,
        id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        promptId: newPromptId,
      })),
      generatedResults: (p.generatedResults || []).map((g) => ({
        ...g,
        id: `gen-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        promptId: newPromptId,
      })),
    };
  });

  const duplicated: Project = {
    ...JSON.parse(JSON.stringify(source)),
    id: newId,
    name: `${source.name} (نسخة جديدة)`,
    createdAt: now,
    updatedAt: now,
    status: 'in_progress',
    isFavorite: false,
    prompts: clonedPrompts,
    activePromptId: clonedPrompts[0]?.id,
    history: [
      {
        id: `hist-${Date.now()}`,
        timestamp: now,
        action: 'Project Duplicated',
        description: `تم استنساخ المشروع من "${source.name}"`,
        tool: 'project',
      },
    ],
  };

  return duplicated;
}

// Export Project Package as downloadable JSON
export function exportProjectPackage(project: Project): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${project.name.replace(/\s+/g, '_')}_Package.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Export Prompt Package as downloadable JSON
export function exportPromptPackage(prompt: PromptItem): void {
  const pkg = {
    studio: 'NAGAR DESIGN AI STUDIO',
    exportedAt: new Date().toISOString(),
    prompt,
  };
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(pkg, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `Prompt_v${prompt.version}_${prompt.id}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

const PROMPT_CARDS_STORAGE_KEY = 'nagar_design_studio_prompt_cards_v1';

export function loadStoredPromptCards(): any[] {
  try {
    const raw = localStorage.getItem(PROMPT_CARDS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredPromptCards(cards: any[]): void {
  try {
    localStorage.setItem(PROMPT_CARDS_STORAGE_KEY, JSON.stringify(cards));
  } catch (err) {
    console.error('Failed to save prompt cards:', err);
  }
}
