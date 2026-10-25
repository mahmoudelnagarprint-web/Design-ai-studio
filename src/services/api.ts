// Client API service for NAGAR DESIGN AI STUDIO

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  quotaError?: boolean;
}

export async function testAiConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/test-connection', { method: 'POST' });
    const data = await res.json();
    return res.ok
      ? data
      : { success: false, message: data.message || data.error || 'Gemini connection failed' };
  } catch {
    return { success: false, message: 'Network connection failed' };
  }
}

export async function imageToPrompt(imageBase64: string, mimeType = 'image/jpeg'): Promise<ApiResponse> {
  try {
    const res = await fetch('/api/image-to-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mimeType }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to analyze image' };
    }
    return data;
  } catch (err: any) {
    return { success: false, error: err?.message || 'Server request error' };
  }
}

export async function updatePromptWithReference(params: {
  currentPrompt: string;
  existingReferences: any[];
  newReferenceImageBase64?: string;
  newReferenceRole?: string;
  mimeType?: string;
}): Promise<ApiResponse> {
  try {
    const res = await fetch('/api/update-prompt-with-reference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to update prompt' };
    }
    return data;
  } catch (err: any) {
    return { success: false, error: err?.message || 'Server request error' };
  }
}

export async function analyzePromptBreakdown(promptText: string): Promise<ApiResponse> {
  try {
    const res = await fetch('/api/analyze-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptText }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to analyze prompt' };
    }
    return data;
  } catch (err: any) {
    return { success: false, error: err?.message || 'Server request error' };
  }
}

export async function decomposeDesign(imageBase64: string, mimeType = 'image/jpeg'): Promise<ApiResponse> {
  try {
    const res = await fetch('/api/decompose-design', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mimeType }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to decompose design' };
    }
    return data;
  } catch (err: any) {
    return { success: false, error: err?.message || 'Server request error' };
  }
}

export async function ocrText(imageBase64: string, mimeType = 'image/jpeg'): Promise<ApiResponse> {
  try {
    const res = await fetch('/api/ocr-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mimeType }),
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.error || 'OCR request failed' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'OCR request failed' };
  }
}

export async function detectFont(imageBase64: string, mimeType = 'image/jpeg'): Promise<ApiResponse> {
  try {
    const res = await fetch('/api/detect-font', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mimeType }),
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.error || 'Font detection failed' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Font detection failed' };
  }
}

export async function extractColors(imageBase64: string, mimeType = 'image/jpeg'): Promise<ApiResponse> {
  try {
    const res = await fetch('/api/extract-colors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mimeType }),
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.error || 'Color extraction failed' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Color extraction failed' };
  }
}

export async function sendAssistantMessage(params: {
  message: string;
  projectContext: any;
  chatHistory: { role: 'user' | 'assistant'; text: string }[];
}): Promise<{ success: boolean; reply?: string; error?: string }> {
  try {
    const res = await fetch('/api/assistant-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.error || 'Assistant request failed' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Assistant request failed' };
  }
}

export async function generateAiImage(params: {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: string;
  style?: string;
  referenceImages?: any[];
}): Promise<{
  success: boolean;
  hasImage?: boolean;
  imageUrl?: string;
  text?: string;
  error?: string;
  isQuotaError?: boolean;
  requiresPaidKey?: boolean;
  previewCardUrl?: string;
}> {
  try {
    const res = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.error || 'Image generation failed' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Image generation failed' };
  }
}

export async function cloneCollageTemplate(imageBase64: string): Promise<{
  success: boolean;
  data?: {
    nameAr?: string;
    nameEn?: string;
    slots: { x: number; y: number; w: number; h: number; shape?: string; isHero?: boolean }[];
  };
  useClientScanner?: boolean;
}> {
  try {
    const res = await fetch('/api/clone-collage-template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 }),
    });
    return await res.json();
  } catch {
    return { success: false, useClientScanner: true };
  }
}
