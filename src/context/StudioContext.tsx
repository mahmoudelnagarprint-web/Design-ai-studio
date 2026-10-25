import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Project,
  PromptItem,
  PromptVersion,
  ReferenceImage,
  ReferenceRole,
  GenerationResult,
  StudioView,
  StudioSettings,
  Layer,
  Asset,
  GoogleAccountProfile,
  IllustrativePromptCard,
} from '../types';
import {
  loadStoredProjects,
  saveProjects,
  loadStoredSettings,
  saveSettings,
  getStoredActiveProjectId,
  setStoredActiveProjectId,
  duplicateProject,
  loadStoredPromptCards,
  saveStoredPromptCards,
} from '../services/storage';

interface StudioContextType {
  currentView: StudioView;
  setCurrentView: (view: StudioView) => void;
  projects: Project[];
  activeProject: Project;
  setActiveProjectId: (id: string) => void;
  updateActiveProject: (updates: Partial<Project>, logAction?: string) => void;
  createNewProject: (name?: string, widthCm?: number, heightCm?: number) => Project;
  duplicateCurrentProject: () => Project;
  deleteProject: (id: string) => void;
  
  // Prompt & Version Management
  activePrompt: PromptItem | null;
  setActivePromptId: (id: string) => void;
  createNewPrompt: (text?: string) => PromptItem;
  updateCurrentPrompt: (newText: string, notes?: string, negativePrompt?: string) => void;
  restorePromptVersion: (versionNumber: number) => void;
  duplicatePromptVersion: (versionNumber: number) => void;
  
  // Illustrative Prompt Cards & Reference Saving
  illustrativeCards: IllustrativePromptCard[];
  saveIllustrativeCard: (card: Omit<IllustrativePromptCard, 'id' | 'createdAt'>) => IllustrativePromptCard;
  deleteIllustrativeCard: (id: string) => void;
  createPromptWithReference: (options: {
    name: string;
    text: string;
    negativePrompt?: string;
    imageUrl: string;
    imageRole?: ReferenceRole;
    isLocked?: boolean;
    notes?: string;
    tags?: string[];
  }) => { prompt: PromptItem; card: IllustrativePromptCard };
  
  // Reference Images
  addReferenceImage: (ref: {
    name: string;
    url: string;
    role: any;
    isLocked?: boolean;
    notes?: string;
    tags?: string[];
  }) => void;
  updateReferenceImage: (id: string, updates: Partial<ReferenceImage>) => void;
  removeReferenceImage: (id: string) => void;
  toggleLockReference: (id: string) => void;
  reorderReferences: (fromIdx: number, toIdx: number) => void;

  // Generated Results
  addGenerationResult: (result: {
    url: string;
    model: string;
    settings: any;
    notes?: string;
    aspectRatio?: string;
  }) => void;
  toggleFavoriteResult: (resultId: string) => void;

  // Layer Management for Canvas / Collage
  addLayer: (layer: Omit<Layer, 'id' | 'zIndex'>) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  reorderLayers: (fromIdx: number, toIdx: number) => void;

  // Inter-tool Pipeline State
  selectedImageForTool: string | null;
  setSelectedImageForTool: (url: string | null) => void;
  sendImageToTool: (imageUrl: string, targetView: StudioView) => void;

  // Undo / Redo & Auto-save Status
  saveStatus: 'saved' | 'saving' | 'error';
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Modals & Assistant
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  isExportCenterOpen: boolean;
  setIsExportCenterOpen: (open: boolean) => void;
  
  // Google Accounts & Free Quota Manager
  googleAccounts: GoogleAccountProfile[];
  activeGoogleAccount: GoogleAccountProfile;
  switchGoogleAccount: (accountId: string) => void;
  addGoogleAccount: (email: string, name?: string, avatarUrl?: string, apiKey?: string) => void;
  updateGoogleAccount: (accountId: string, updates: Partial<GoogleAccountProfile>) => void;
  removeGoogleAccount: (accountId: string) => void;
  isGoogleAccountsModalOpen: boolean;
  setIsGoogleAccountsModalOpen: (open: boolean) => void;

  // Settings & Locale
  settings: StudioSettings;
  updateSettings: (updates: Partial<StudioSettings>) => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export const StudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => loadStoredProjects());
  const [activeProjectId, setActiveProjectIdState] = useState<string>(() => {
    const saved = getStoredActiveProjectId();
    const stored = loadStoredProjects();
    if (saved && stored.some((p) => p.id === saved)) return saved;
    return stored[0]?.id || 'proj-grad-2026';
  });

  const [currentView, setCurrentView] = useState<StudioView>('dashboard');
  const [settings, setSettings] = useState<StudioSettings>(() => loadStoredSettings());
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [selectedImageForTool, setSelectedImageForTool] = useState<string | null>(null);
  const [illustrativeCards, setIllustrativeCards] = useState<IllustrativePromptCard[]>(() => loadStoredPromptCards());

  // Modals
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isExportCenterOpen, setIsExportCenterOpen] = useState(false);
  const [isGoogleAccountsModalOpen, setIsGoogleAccountsModalOpen] = useState(false);

  // Undo / Redo history stack (snapshots of active project)
  const [undoStack, setUndoStack] = useState<Project[]>([]);
  const [redoStack, setRedoStack] = useState<Project[]>([]);

  // Find active project
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || {
    id: 'default',
    name: 'مشروع جديد',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: false,
    tags: [],
    status: 'draft',
    canvasWidth: 3000,
    canvasHeight: 4000,
    originalImages: [],
    prompts: [],
    assets: [],
    layers: [],
    laserSettings: {
      threshold: 128,
      simplify: 3,
      smooth: true,
      closePaths: true,
      removeTinyDetails: true,
      detectOpenPaths: true,
      invert: false,
      lineColor: '#ef4444',
      fillMode: 'cut',
    },
    printSettings: {
      widthCm: 30,
      heightCm: 40,
      dpi: 300,
      colorMode: 'CMYK',
      bleedMm: 3,
      safeAreaMm: 5,
      paperType: 'Glossy',
    },
    history: [],
  };

  const activePrompt: PromptItem | null =
    activeProject.prompts?.find((p) => p.id === activeProject.activePromptId) ||
    activeProject.prompts?.[0] ||
    null;

  // Persist projects whenever they change
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      saveProjects(projects);
      setSaveStatus('saved');
    }, 400);
    return () => clearTimeout(timer);
  }, [projects]);

  // Persist active project ID
  const setActiveProjectId = useCallback((id: string) => {
    setActiveProjectIdState(id);
    setStoredActiveProjectId(id);
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  // Update Settings
  const updateSettings = useCallback((updates: Partial<StudioSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      saveSettings(next);
      if (updates.language) {
        document.documentElement.lang = updates.language;
        document.documentElement.dir = updates.language === 'ar' ? 'rtl' : 'ltr';
      }
      return next;
    });
  }, []);

  // Set HTML dir/lang on initial load
  useEffect(() => {
    document.documentElement.lang = settings.language;
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
  }, [settings.language]);

  // Google Accounts & Free Quota Management
  const googleAccounts: GoogleAccountProfile[] = settings.googleAccounts || [
    {
      id: 'acc-google-1',
      name: 'Mahmoud El Nagar',
      email: 'mahmoud.elnagar22@gmail.com',
      isPrimary: true,
      dailyFreeRequestsLimit: 1500,
      usedRequestsToday: 18,
      lastActive: new Date().toISOString(),
      quotaStatus: 'active',
    },
  ];

  const activeGoogleAccountId = settings.activeGoogleAccountId || googleAccounts[0]?.id || 'acc-google-1';
  const activeGoogleAccount = googleAccounts.find((a) => a.id === activeGoogleAccountId) || googleAccounts[0];

  const switchGoogleAccount = useCallback(
    (accountId: string) => {
      const target = googleAccounts.find((a) => a.id === accountId);
      if (!target) return;
      const updatedAccounts = googleAccounts.map((a) => ({
        ...a,
        lastActive: a.id === accountId ? new Date().toISOString() : a.lastActive,
      }));
      updateSettings({
        activeGoogleAccountId: accountId,
        googleAccounts: updatedAccounts,
      });
    },
    [googleAccounts, updateSettings]
  );

  const addGoogleAccount = useCallback(
    (email: string, name?: string, avatarUrl?: string, apiKey?: string) => {
      const cleanEmail = email.trim();
      if (!cleanEmail) return;

      const existingIndex = googleAccounts.findIndex(
        (a) => a.email.toLowerCase() === cleanEmail.toLowerCase()
      );

      if (existingIndex >= 0) {
        // Already exists: update and activate it
        const existing = googleAccounts[existingIndex];
        const updated: GoogleAccountProfile = {
          ...existing,
          name: name?.trim() || existing.name,
          avatarUrl: avatarUrl || existing.avatarUrl,
          apiKey: apiKey !== undefined ? apiKey : existing.apiKey,
          isCreditActivated: true,
          creditPlan: apiKey ? 'Google Cloud / Custom Gemini Key' : 'Google Gemini High-Speed Free Tier',
          quotaStatus: 'active',
          lastActive: new Date().toISOString(),
        };
        const updatedAccounts = [...googleAccounts];
        updatedAccounts[existingIndex] = updated;

        updateSettings({
          googleAccounts: updatedAccounts,
          activeGoogleAccountId: existing.id,
        });
        return;
      }

      const newAcc: GoogleAccountProfile = {
        id: `acc-google-${Date.now()}`,
        name: name?.trim() || cleanEmail.split('@')[0],
        email: cleanEmail,
        avatarUrl,
        apiKey: apiKey?.trim(),
        isPrimary: googleAccounts.length === 0,
        dailyFreeRequestsLimit: 1500,
        usedRequestsToday: 0,
        lastActive: new Date().toISOString(),
        quotaStatus: 'active',
        isCreditActivated: true,
        creditPlan: apiKey ? 'Google Cloud / Custom Gemini Key' : 'Google Gemini High-Speed Free Tier',
      };
      const updatedAccounts = [...googleAccounts, newAcc];
      updateSettings({
        googleAccounts: updatedAccounts,
        activeGoogleAccountId: newAcc.id,
      });
    },
    [googleAccounts, updateSettings]
  );

  const updateGoogleAccount = useCallback(
    (accountId: string, updates: Partial<GoogleAccountProfile>) => {
      const updatedAccounts = googleAccounts.map((a) =>
        a.id === accountId ? { ...a, ...updates, lastActive: new Date().toISOString() } : a
      );
      updateSettings({
        googleAccounts: updatedAccounts,
      });
    },
    [googleAccounts, updateSettings]
  );

  const removeGoogleAccount = useCallback(
    (accountId: string) => {
      if (googleAccounts.length <= 1) return;
      const updatedAccounts = googleAccounts.filter((a) => a.id !== accountId);
      const newActiveId = accountId === activeGoogleAccountId ? updatedAccounts[0].id : activeGoogleAccountId;
      updateSettings({
        googleAccounts: updatedAccounts,
        activeGoogleAccountId: newActiveId,
      });
    },
    [googleAccounts, activeGoogleAccountId, updateSettings]
  );

  // Push snapshot to undo stack before mutating
  const pushSnapshot = useCallback(() => {
    setUndoStack((prev) => [...prev.slice(-20), JSON.parse(JSON.stringify(activeProject))]);
    setRedoStack([]);
  }, [activeProject]);

  // Update active project
  const updateActiveProject = useCallback(
    (updates: Partial<Project>, logAction?: string) => {
      pushSnapshot();
      const now = new Date().toISOString();
      setProjects((prev) =>
        prev.map((proj) => {
          if (proj.id !== activeProject.id) return proj;

          const updatedHistory = logAction
            ? [
                {
                  id: `hist-${Date.now()}`,
                  timestamp: now,
                  action: logAction,
                  description: logAction,
                  tool: currentView,
                },
                ...(proj.history || []),
              ]
            : proj.history || [];

          return {
            ...proj,
            ...updates,
            updatedAt: now,
            history: updatedHistory,
          };
        })
      );
    },
    [activeProject.id, currentView, pushSnapshot]
  );

  // Undo / Redo
  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [JSON.parse(JSON.stringify(activeProject)), ...prev]);
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? previous : p)));
  }, [activeProject, undoStack]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(activeProject))]);
    setRedoStack((prev) => prev.slice(1));
    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? next : p)));
  }, [activeProject, redoStack]);

  // Create New Project
  const createNewProject = useCallback((name = 'مشروع تصميم جديد', widthCm = 30, heightCm = 40) => {
    const id = `proj-${Date.now()}`;
    const now = new Date().toISOString();
    const promptId = `prompt-${Date.now()}`;

    const initialPrompt: PromptItem = {
      id: promptId,
      projectId: id,
      text: 'Create a luxurious and balanced creative artwork with rich textures and modern elegance',
      negativePrompt: 'blurry, low quality, artifacts, watermark',
      model: 'gemini-3.1-flash-lite-image',
      settings: {
        model: 'gemini-3.1-flash-lite-image',
        aspectRatio: '3:4',
        resolution: '2K',
        numberOfImages: 2,
        style: 'Modern Luxury',
      },
      aspectRatio: '3:4',
      resolution: '2K',
      style: 'Modern Luxury',
      createdAt: now,
      updatedAt: now,
      version: 1,
      tags: ['new'],
      references: [],
      generatedResults: [],
      versions: [
        {
          id: `ver-${Date.now()}`,
          promptId,
          versionNumber: 1,
          text: 'Create a luxurious and balanced creative artwork with rich textures and modern elegance',
          negativePrompt: 'blurry, low quality, artifacts, watermark',
          references: [],
          settings: {
            model: 'gemini-3.1-flash-lite-image',
            aspectRatio: '3:4',
            resolution: '2K',
            numberOfImages: 2,
            style: 'Modern Luxury',
          },
          generatedResults: [],
          createdAt: now,
          notes: 'الإصدار المبدئي للمشروع الجديد',
        },
      ],
    };

    const newProj: Project = {
      id,
      name,
      createdAt: now,
      updatedAt: now,
      isFavorite: false,
      tags: ['new-project'],
      status: 'in_progress',
      canvasWidth: Math.round(widthCm * 118.11), // cm to 300 dpi px
      canvasHeight: Math.round(heightCm * 118.11),
      originalImages: [],
      activePromptId: promptId,
      prompts: [initialPrompt],
      assets: [],
      layers: [],
      laserSettings: {
        threshold: 128,
        simplify: 3,
        smooth: true,
        closePaths: true,
        removeTinyDetails: true,
        detectOpenPaths: true,
        invert: false,
        lineColor: '#ef4444',
        fillMode: 'cut',
      },
      printSettings: {
        widthCm,
        heightCm,
        dpi: 300,
        colorMode: 'CMYK',
        bleedMm: 3,
        safeAreaMm: 5,
        paperType: 'Glossy',
      },
      history: [
        {
          id: `hist-${Date.now()}`,
          timestamp: now,
          action: 'Project Created',
          description: `إنشاء مشروع: ${name}`,
          tool: 'project',
        },
      ],
    };

    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectIdState(id);
    setStoredActiveProjectId(id);
    setCurrentView('dashboard');
    return newProj;
  }, []);

  // Duplicate Project
  const duplicateCurrentProject = useCallback(() => {
    const dup = duplicateProject(activeProject);
    setProjects((prev) => [dup, ...prev]);
    setActiveProjectIdState(dup.id);
    setStoredActiveProjectId(dup.id);
    return dup;
  }, [activeProject]);

  // Delete Project
  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => {
      const remaining = prev.filter((p) => p.id !== id);
      if (remaining.length === 0) {
        return prev;
      }
      return remaining;
    });
    if (activeProjectId === id) {
      const remaining = projects.filter((p) => p.id !== id);
      if (remaining.length > 0) {
        setActiveProjectIdState(remaining[0].id);
        setStoredActiveProjectId(remaining[0].id);
      }
    }
  }, [activeProjectId, projects]);

  // Create New Prompt inside Active Project
  const createNewPrompt = useCallback((text = 'Creative design prompt') => {
    const now = new Date().toISOString();
    const promptId = `prompt-${Date.now()}`;
    const newPrompt: PromptItem = {
      id: promptId,
      projectId: activeProject.id,
      text,
      negativePrompt: 'blurry, poor quality, watermark',
      model: settings.defaultImageModel,
      settings: {
        model: settings.defaultImageModel,
        aspectRatio: '1:1',
        resolution: '1K',
        numberOfImages: 2,
        style: 'Photorealistic',
      },
      aspectRatio: '1:1',
      resolution: '1K',
      style: 'Photorealistic',
      createdAt: now,
      updatedAt: now,
      version: 1,
      tags: ['prompt'],
      references: [],
      generatedResults: [],
      versions: [
        {
          id: `ver-${Date.now()}`,
          promptId,
          versionNumber: 1,
          text,
          references: [],
          settings: {
            model: settings.defaultImageModel,
            aspectRatio: '1:1',
            resolution: '1K',
            numberOfImages: 2,
            style: 'Photorealistic',
          },
          generatedResults: [],
          createdAt: now,
        },
      ],
    };

    updateActiveProject(
      {
        prompts: [newPrompt, ...(activeProject.prompts || [])],
        activePromptId: promptId,
      },
      'Created New Prompt'
    );
    return newPrompt;
  }, [activeProject.id, activeProject.prompts, settings.defaultImageModel, updateActiveProject]);

  const setActivePromptId = useCallback((id: string) => {
    updateActiveProject({ activePromptId: id });
  }, [updateActiveProject]);

  const saveIllustrativeCard = useCallback((cardData: Omit<IllustrativePromptCard, 'id' | 'createdAt'>) => {
    const newCard: IllustrativePromptCard = {
      ...cardData,
      id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setIllustrativeCards((prev) => {
      const updated = [newCard, ...prev];
      saveStoredPromptCards(updated);
      return updated;
    });
    return newCard;
  }, []);

  const deleteIllustrativeCard = useCallback((id: string) => {
    setIllustrativeCards((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveStoredPromptCards(updated);
      return updated;
    });
  }, []);

  const createPromptWithReference = useCallback(
    (options: {
      name: string;
      text: string;
      negativePrompt?: string;
      imageUrl: string;
      imageRole?: ReferenceRole;
      isLocked?: boolean;
      notes?: string;
      tags?: string[];
    }) => {
      const now = new Date().toISOString();
      const promptId = `prompt-${Date.now()}`;
      const refId = `ref-${Date.now()}`;
      const role = options.imageRole || 'Main Subject';
      const isLocked = options.isLocked ?? true;

      const newRef: ReferenceImage = {
        id: refId,
        name: options.name || 'صورة توضيحية مرجعية',
        url: options.imageUrl,
        role,
        isLocked,
        notes: options.notes || `صورة توضيحية لبرومبت: ${options.name}`,
        tags: options.tags || ['reference-card', 'illustration'],
        order: 0,
        addedAt: now,
      };

      const newPrompt: PromptItem = {
        id: promptId,
        projectId: activeProject.id,
        text: options.text,
        negativePrompt: options.negativePrompt || 'blurry, poor quality, watermark',
        model: settings.defaultImageModel,
        settings: {
          model: settings.defaultImageModel,
          aspectRatio: '3:4',
          resolution: '2K',
          numberOfImages: 2,
          style: 'Photorealistic',
        },
        aspectRatio: '3:4',
        resolution: '2K',
        style: 'Photorealistic',
        createdAt: now,
        updatedAt: now,
        version: 1,
        tags: [...(options.tags || []), 'reference-card'],
        notes: `البطاقة التوضيحية: ${options.name}`,
        references: [newRef],
        generatedResults: [],
        versions: [
          {
            id: `ver-${Date.now()}`,
            promptId,
            versionNumber: 1,
            text: options.text,
            negativePrompt: options.negativePrompt || 'blurry, poor quality, watermark',
            references: [newRef],
            settings: {
              model: settings.defaultImageModel,
              aspectRatio: '3:4',
              resolution: '2K',
              numberOfImages: 2,
              style: 'Photorealistic',
            },
            generatedResults: [],
            createdAt: now,
            notes: `الإصدار الأولي مع صورة توضيحية: ${options.name}`,
          },
        ],
      };

      const card = saveIllustrativeCard({
        name: options.name,
        imageUrl: options.imageUrl,
        promptText: options.text,
        negativePrompt: options.negativePrompt,
        role,
        isLocked,
        notes: options.notes,
        tags: options.tags,
        promptId,
      });

      const updatedOriginalImages = activeProject.originalImages?.includes(options.imageUrl)
        ? activeProject.originalImages
        : [options.imageUrl, ...(activeProject.originalImages || [])];

      updateActiveProject(
        {
          prompts: [newPrompt, ...(activeProject.prompts || [])],
          activePromptId: promptId,
          originalImages: updatedOriginalImages,
        },
        `Created Prompt & Illustrative Card: ${options.name}`
      );

      return { prompt: newPrompt, card };
    },
    [activeProject.id, activeProject.originalImages, activeProject.prompts, saveIllustrativeCard, settings.defaultImageModel, updateActiveProject]
  );

  // Update Current Prompt: Creates a NEW version (v+1) non-destructively!
  const updateCurrentPrompt = useCallback(
    (newText: string, notes?: string, negativePrompt?: string) => {
      if (!activePrompt) return;
      const now = new Date().toISOString();
      const nextVersionNumber = (activePrompt.version || 1) + 1;

      const newVersion: PromptVersion = {
        id: `ver-${Date.now()}`,
        promptId: activePrompt.id,
        versionNumber: nextVersionNumber,
        text: newText,
        negativePrompt: negativePrompt ?? activePrompt.negativePrompt,
        references: [...(activePrompt.references || [])],
        settings: { ...activePrompt.settings },
        generatedResults: [],
        createdAt: now,
        notes: notes || `تحديث للبرومبت إلى الإصدار ${nextVersionNumber}`,
      };

      const updatedPrompt: PromptItem = {
        ...activePrompt,
        text: newText,
        negativePrompt: negativePrompt ?? activePrompt.negativePrompt,
        updatedAt: now,
        version: nextVersionNumber,
        notes: notes || activePrompt.notes,
        versions: [newVersion, ...(activePrompt.versions || [])],
      };

      const updatedPrompts = (activeProject.prompts || []).map((p) =>
        p.id === activePrompt.id ? updatedPrompt : p
      );

      updateActiveProject(
        { prompts: updatedPrompts },
        `Prompt Updated to v${nextVersionNumber}`
      );
    },
    [activePrompt, activeProject.prompts, updateActiveProject]
  );

  // Restore previous prompt version
  const restorePromptVersion = useCallback(
    (versionNumber: number) => {
      if (!activePrompt) return;
      const target = activePrompt.versions?.find((v) => v.versionNumber === versionNumber);
      if (!target) return;

      const now = new Date().toISOString();
      const nextVersionNumber = activePrompt.version + 1;

      // Restoring creates a new forward version holding that target's state
      const restoredVersion: PromptVersion = {
        id: `ver-${Date.now()}`,
        promptId: activePrompt.id,
        versionNumber: nextVersionNumber,
        text: target.text,
        negativePrompt: target.negativePrompt,
        references: [...target.references],
        settings: { ...target.settings },
        generatedResults: [],
        createdAt: now,
        notes: `تمت استعادة محتوى الإصدار v${versionNumber}`,
      };

      const updatedPrompt: PromptItem = {
        ...activePrompt,
        text: target.text,
        negativePrompt: target.negativePrompt,
        references: [...target.references],
        settings: { ...target.settings },
        version: nextVersionNumber,
        updatedAt: now,
        versions: [restoredVersion, ...(activePrompt.versions || [])],
      };

      const updatedPrompts = (activeProject.prompts || []).map((p) =>
        p.id === activePrompt.id ? updatedPrompt : p
      );

      updateActiveProject(
        { prompts: updatedPrompts },
        `Restored Prompt v${versionNumber} as v${nextVersionNumber}`
      );
    },
    [activePrompt, activeProject.prompts, updateActiveProject]
  );

  // Duplicate prompt version
  const duplicatePromptVersion = useCallback(
    (versionNumber: number) => {
      restorePromptVersion(versionNumber);
    },
    [restorePromptVersion]
  );

  // Reference Images management
  const addReferenceImage = useCallback(
    (refData: {
      name: string;
      url: string;
      role: any;
      isLocked?: boolean;
      notes?: string;
      tags?: string[];
    }) => {
      if (!activePrompt) return;
      const now = new Date().toISOString();
      const newRef: ReferenceImage = {
        id: `ref-${Date.now()}`,
        name: refData.name,
        url: refData.url,
        role: refData.role,
        isLocked: Boolean(refData.isLocked),
        notes: refData.notes || '',
        tags: refData.tags || [],
        order: (activePrompt.references || []).length,
        addedAt: now,
      };

      const updatedRefs = [...(activePrompt.references || []), newRef];
      const updatedPrompt = {
        ...activePrompt,
        references: updatedRefs,
        updatedAt: now,
      };

      const updatedPrompts = (activeProject.prompts || []).map((p) =>
        p.id === activePrompt.id ? updatedPrompt : p
      );

      updateActiveProject(
        { prompts: updatedPrompts },
        `Added Reference "${refData.name}" (${refData.role})`
      );
    },
    [activePrompt, activeProject.prompts, updateActiveProject]
  );

  const updateReferenceImage = useCallback(
    (id: string, updates: Partial<ReferenceImage>) => {
      if (!activePrompt) return;
      const updatedRefs = (activePrompt.references || []).map((r) =>
        r.id === id ? { ...r, ...updates } : r
      );
      const updatedPrompt = { ...activePrompt, references: updatedRefs };
      const updatedPrompts = (activeProject.prompts || []).map((p) =>
        p.id === activePrompt.id ? updatedPrompt : p
      );
      updateActiveProject({ prompts: updatedPrompts });
    },
    [activePrompt, activeProject.prompts, updateActiveProject]
  );

  const removeReferenceImage = useCallback(
    (id: string) => {
      if (!activePrompt) return;
      const updatedRefs = (activePrompt.references || []).filter((r) => r.id !== id);
      const updatedPrompt = { ...activePrompt, references: updatedRefs };
      const updatedPrompts = (activeProject.prompts || []).map((p) =>
        p.id === activePrompt.id ? updatedPrompt : p
      );
      updateActiveProject({ prompts: updatedPrompts }, 'Removed Reference Image');
    },
    [activePrompt, activeProject.prompts, updateActiveProject]
  );

  const toggleLockReference = useCallback(
    (id: string) => {
      if (!activePrompt) return;
      const target = activePrompt.references?.find((r) => r.id === id);
      if (!target) return;
      const newLocked = !target.isLocked;
      updateReferenceImage(id, { isLocked: newLocked });
    },
    [activePrompt, updateReferenceImage]
  );

  const reorderReferences = useCallback(
    (fromIdx: number, toIdx: number) => {
      if (!activePrompt || !activePrompt.references) return;
      const arr = [...activePrompt.references];
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      const reindexed = arr.map((item, idx) => ({ ...item, order: idx }));
      const updatedPrompt = { ...activePrompt, references: reindexed };
      const updatedPrompts = (activeProject.prompts || []).map((p) =>
        p.id === activePrompt.id ? updatedPrompt : p
      );
      updateActiveProject({ prompts: updatedPrompts });
    },
    [activePrompt, activeProject.prompts, updateActiveProject]
  );

  // Add Generated Result
  const addGenerationResult = useCallback(
    (resData: {
      url: string;
      model: string;
      settings: any;
      notes?: string;
      aspectRatio?: string;
    }) => {
      if (!activePrompt) return;
      const now = new Date().toISOString();
      const newResult: GenerationResult = {
        id: `gen-${Date.now()}`,
        promptId: activePrompt.id,
        promptVersion: activePrompt.version || 1,
        url: resData.url,
        model: resData.model,
        settings: resData.settings,
        createdAt: now,
        notes: resData.notes || '',
        aspectRatio: resData.aspectRatio || '1:1',
        isFavorite: false,
      };

      const updatedResults = [newResult, ...(activePrompt.generatedResults || [])];
      const updatedPrompt = {
        ...activePrompt,
        generatedResults: updatedResults,
        updatedAt: now,
      };

      const updatedPrompts = (activeProject.prompts || []).map((p) =>
        p.id === activePrompt.id ? updatedPrompt : p
      );

      updateActiveProject(
        { prompts: updatedPrompts },
        `New Image Generated (v${activePrompt.version})`
      );
    },
    [activePrompt, activeProject.prompts, updateActiveProject]
  );

  const toggleFavoriteResult = useCallback(
    (resultId: string) => {
      if (!activePrompt) return;
      const updatedResults = (activePrompt.generatedResults || []).map((r) =>
        r.id === resultId ? { ...r, isFavorite: !r.isFavorite } : r
      );
      const updatedPrompt = { ...activePrompt, generatedResults: updatedResults };
      const updatedPrompts = (activeProject.prompts || []).map((p) =>
        p.id === activePrompt.id ? updatedPrompt : p
      );
      updateActiveProject({ prompts: updatedPrompts });
    },
    [activePrompt, activeProject.prompts, updateActiveProject]
  );

  // Layer Management
  const addLayer = useCallback(
    (layerData: Omit<Layer, 'id' | 'zIndex'>) => {
      const newLayer: Layer = {
        ...layerData,
        id: `layer-${Date.now()}`,
        zIndex: (activeProject.layers || []).length + 1,
      };
      updateActiveProject(
        { layers: [...(activeProject.layers || []), newLayer] },
        `Added Layer "${newLayer.name}"`
      );
    },
    [activeProject.layers, updateActiveProject]
  );

  const updateLayer = useCallback(
    (id: string, updates: Partial<Layer>) => {
      const updated = (activeProject.layers || []).map((l) =>
        l.id === id ? { ...l, ...updates } : l
      );
      updateActiveProject({ layers: updated });
    },
    [activeProject.layers, updateActiveProject]
  );

  const removeLayer = useCallback(
    (id: string) => {
      const updated = (activeProject.layers || []).filter((l) => l.id !== id);
      updateActiveProject({ layers: updated }, 'Removed Layer');
    },
    [activeProject.layers, updateActiveProject]
  );

  const reorderLayers = useCallback(
    (fromIdx: number, toIdx: number) => {
      const arr = [...(activeProject.layers || [])];
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      const reindexed = arr.map((l, i) => ({ ...l, zIndex: i + 1 }));
      updateActiveProject({ layers: reindexed });
    },
    [activeProject.layers, updateActiveProject]
  );

  // Pipeline flow helper
  const sendImageToTool = useCallback(
    (imageUrl: string, targetView: StudioView) => {
      setSelectedImageForTool(imageUrl);
      setCurrentView(targetView);
    },
    []
  );

  return (
    <StudioContext.Provider
      value={{
        currentView,
        setCurrentView,
        projects,
        activeProject,
        setActiveProjectId,
        updateActiveProject,
        createNewProject,
        duplicateCurrentProject,
        deleteProject,
        activePrompt,
        setActivePromptId,
        createNewPrompt,
        updateCurrentPrompt,
        restorePromptVersion,
        duplicatePromptVersion,
        illustrativeCards,
        saveIllustrativeCard,
        deleteIllustrativeCard,
        createPromptWithReference,
        addReferenceImage,
        updateReferenceImage,
        removeReferenceImage,
        toggleLockReference,
        reorderReferences,
        addGenerationResult,
        toggleFavoriteResult,
        addLayer,
        updateLayer,
        removeLayer,
        reorderLayers,
        selectedImageForTool,
        setSelectedImageForTool,
        sendImageToTool,
        saveStatus,
        undo,
        redo,
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0,
        isCopilotOpen,
        setIsCopilotOpen,
        isExportCenterOpen,
        setIsExportCenterOpen,
        googleAccounts,
        activeGoogleAccount,
        switchGoogleAccount,
        addGoogleAccount,
        updateGoogleAccount,
        removeGoogleAccount,
        isGoogleAccountsModalOpen,
        setIsGoogleAccountsModalOpen,
        settings,
        updateSettings,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error('useStudio must be used within a StudioProvider');
  return ctx;
};
