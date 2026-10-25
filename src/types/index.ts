export type ReferenceRole =
  | 'Main Subject'
  | 'Face Reference'
  | 'Person Reference'
  | 'Background Reference'
  | 'Frame Reference'
  | 'Decoration Reference'
  | 'Style Reference'
  | 'Color Reference'
  | 'Pose Reference'
  | 'Clothing Reference'
  | 'Composition Reference'
  | 'Object Reference'
  | 'General Reference'
  | 'Custom Role';

export interface ReferenceImage {
  id: string;
  name: string;
  url: string; // Base64 or ObjectURL
  role: ReferenceRole;
  customRoleText?: string;
  isLocked: boolean; // 🔒 Locked reference: critical element that AI must preserve strictly
  notes?: string;
  tags?: string[];
  order: number;
  rotation?: number;
  crop?: { x: number; y: number; width: number; height: number };
  addedAt: string;
}

export interface GenerationSettings {
  model: string;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  resolution: '512px' | '1K' | '2K' | '4K';
  numberOfImages: number;
  style: string;
  seed?: number;
}

export interface GenerationResult {
  id: string;
  promptId: string;
  promptVersion: number;
  url: string;
  model: string;
  settings: GenerationSettings;
  createdAt: string;
  isFavorite?: boolean;
  notes?: string;
  referenceSummary?: string;
  aspectRatio: string;
  width?: number;
  height?: number;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  versionNumber: number;
  text: string;
  negativePrompt?: string;
  references: ReferenceImage[];
  settings: GenerationSettings;
  generatedResults: GenerationResult[];
  createdAt: string;
  notes?: string;
}

export interface PromptItem {
  id: string;
  projectId: string;
  text: string;
  negativePrompt?: string;
  model: string;
  settings: GenerationSettings;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  resolution: '512px' | '1K' | '2K' | '4K';
  style: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  tags: string[];
  notes?: string;
  isFavorite?: boolean;
  references: ReferenceImage[];
  generatedResults: GenerationResult[];
  versions: PromptVersion[];
}

export interface Layer {
  id: string;
  name: string;
  type: 'image' | 'text' | 'shape' | 'frame' | 'mask';
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  dataUrl?: string;
  color?: string;
  content?: string;
  zIndex: number;
}

export interface DecomposedComponent {
  id: string;
  name: string;
  category: 'Background' | 'Frames' | 'Photos' | 'People' | 'Stickers' | 'Decorations' | 'Text' | 'Logos' | 'Shadows' | 'Shapes';
  confidence: number;
  description: string;
  bbox: { x: number; y: number; width: number; height: number };
  zIndex: number;
  recommendedAction?: string;
  dataUrl?: string;
  extracted?: boolean;
}

export interface Asset {
  id: string;
  name: string;
  category: 'backgrounds' | 'frames' | 'stickers' | 'decorations' | 'photos' | 'logos' | 'fonts' | 'templates';
  url: string;
  tags: string[];
  isFavorite: boolean;
  format: 'png' | 'jpg' | 'svg' | 'webp';
  size?: string;
  dimensions?: string;
  notes?: string;
  createdAt: string;
}

export interface LaserSettings {
  threshold: number; // 0-255
  simplify: number; // 1-10
  smooth: boolean;
  closePaths: boolean;
  removeTinyDetails: boolean;
  detectOpenPaths: boolean;
  invert: boolean;
  lineColor: string;
  fillMode: 'outline' | 'engrave' | 'cut';
}

export interface PrintSettings {
  widthCm: number;
  heightCm: number;
  dpi: 72 | 150 | 300 | 600;
  colorMode: 'RGB' | 'CMYK';
  bleedMm: number;
  safeAreaMm: number;
  paperType: 'Glossy' | 'Matte' | 'Canvas' | 'Vinyl' | 'Cardstock';
}

export interface ProjectHistoryItem {
  id: string;
  timestamp: string;
  action: string;
  description: string;
  tool: string;
  snapshotUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  tags: string[];
  notes?: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  canvasWidth: number;
  canvasHeight: number;
  originalImages: string[];
  activePromptId?: string;
  prompts: PromptItem[];
  assets: Asset[];
  layers: Layer[];
  laserSettings: LaserSettings;
  printSettings: PrintSettings;
  history: ProjectHistoryItem[];
  decomposedComponents?: DecomposedComponent[];
}

export type StudioView =
  | 'dashboard'
  | 'create'
  | 'image-editor'
  | 'ai-enhance'
  | 'expand'
  | 'generative-edit'
  | 'image-to-prompt'
  | 'prompt-to-image'
  | 'design-decomposer'
  | 'collage-studio'
  | 'background-cutout'
  | 'text-ocr'
  | 'colors'
  | 'fonts'
  | 'print-prep'
  | 'laser-prep'
  | 'prompt-library'
  | 'asset-library'
  | 'projects'
  | 'history'
  | 'settings';

export interface GoogleAccountProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isPrimary: boolean;
  dailyFreeRequestsLimit: number; // 1500 requests/day in Google Gemini Free Tier
  usedRequestsToday: number;
  lastActive: string;
  quotaStatus: 'active' | 'nearing_limit' | 'quota_exhausted';
  apiKey?: string;
  creditPlan?: string;
  isCreditActivated?: boolean;
  creditBalanceNote?: string;
}

export interface IllustrativePromptCard {
  id: string;
  name: string;
  imageUrl: string;
  promptText: string;
  negativePrompt?: string;
  role: ReferenceRole;
  isLocked: boolean;
  notes?: string;
  tags?: string[];
  createdAt: string;
  promptId?: string;
  cardPreviewUrl?: string;
}

export interface StudioSettings {
  language: 'ar' | 'en';
  theme: 'dark' | 'light';
  defaultImageModel: string;
  defaultVisionModel: string;
  defaultUpscaleModel: string;
  defaultEditModel: string;
  autoSaveIntervalMs: number;
  showGrid: boolean;
  snapToGuides: boolean;
  googleAccounts?: GoogleAccountProfile[];
  activeGoogleAccountId?: string;
  autoSwitchOnQuotaExceeded?: boolean;
}
