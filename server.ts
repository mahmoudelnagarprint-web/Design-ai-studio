import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(
  '/api',
  rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests. Please try again shortly.' },
  })
);
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

// Shared Gemini client setup
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient model caller: tries high-availability gemini-3.1-flash-lite first, then gemini-flash-latest, then gemini-3.8-flash
async function generateWithFallback(ai: GoogleGenAI, requestPayload: any) {
  const models = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        ...requestPayload,
        model,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const status = err?.status ?? err?.statusCode;
      if (status === 400 || status === 401 || status === 403 || status === 429) {
        throw err;
      }
      // Do not dump raw provider error JSON to stderr
    }
  }

  throw lastError;
}

// Health & Connection Test
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    hasKey,
    app: 'NAGAR DESIGN AI STUDIO',
    version: '2.0.0',
    time: new Date().toISOString(),
  });
});

app.post('/api/test-connection', async (req, res) => {
  const ai = getGeminiClient();
  if (!ai) {
    return res.status(503).json({
      success: false,
      message: 'Gemini API is not configured. Set GEMINI_API_KEY on the server.',
    });
  }

  try {
    await generateWithFallback(ai, { contents: 'Reply with the word connected.' });
    return res.json({ success: true, message: 'Gemini API connection verified.' });
  } catch {
    return res.status(502).json({
      success: false,
      message: 'Gemini API connection failed. Check the server key, model access, and provider status.',
    });
  }
});

// Image -> Prompt Analysis (Basic, Detailed, Production, Negative + attributes)
app.post('/api/image-to-prompt', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const ai = getGeminiClient();
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `Analyze this image as an expert AI prompt engineer and design director for NAGAR DESIGN AI STUDIO.
Extract high-fidelity prompts and deep compositional attributes across 15 design dimensions.
Return a clean JSON object with this exact structure:
{
  "basicPrompt": "Concise 1-2 sentence description in Arabic and English",
  "detailedPrompt": "Detailed multi-sentence artistic description with styling, mood, colors, camera",
  "productionPrompt": "Production-ready prompt optimized for modern generative models with keywords, weights, and high aesthetics: ultra-detailed, 8k resolution, volumetric lighting, masterpiece",
  "negativePrompt": "blurry, low quality, artifacts, distorted hands, bad anatomy, overexposed, low resolution, watermark",
  "attributes": {
    "people": "Description of people, facial expressions, demographics, or none",
    "clothing": "Attire style, materials, colors (e.g. graduation gown, formal suit)",
    "background": "Setting, environment, depth, atmosphere (e.g. luxury dark marble, golden bokeh)",
    "lighting": "Key light, rim light, ambient, softbox, golden hour, studio strobe",
    "colors": "Primary palette, tone, saturation, grading (e.g. emerald green #0f2a1d, antique gold #d4af37)",
    "composition": "Rule of thirds, centered, symmetrical, golden ratio framing",
    "perspective": "Eye level, low angle, portrait 3/4 framing",
    "camera": "Hasselblad H6D-100c, 100MP medium format studio sensor",
    "lens": "85mm f/1.4 portrait lens, razor-sharp subject focus",
    "depthOfField": "Shallow depth of field, creamy circular bokeh in background",
    "style": "Cinematic luxury editorial photography, royal elegance",
    "materials": "Gold leaf foil, dark emerald polished marble, velvet fabric",
    "objects": "Center oval luxury frame, ornamental filigree borders, graduation cap",
    "decorations": "Baroque golden flourishes, laurel wreath emblem, geometric borders",
    "text": "Detected Arabic calligraphy and typography elements"
  }
}`;

    if (ai) {
      try {
        const response = await generateWithFallback(ai, {
          contents: {
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType,
                },
              },
              { text: prompt },
            ],
          },
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({ success: true, data: parsed });
      } catch {
        // Handled fallback
      }
    }

        return res.status(503).json({ success: false, error: 'Gemini is unavailable or the request failed. No demo result was returned.' });

  } catch (error: any) {
    console.error('image-to-prompt error:', error);
    res.status(500).json({ error: error?.message || 'Failed to analyze image' });
  }
});

// Update Prompt with New Reference (Synthesize existing prompt + locked refs + new ref)
app.post('/api/update-prompt-with-reference', async (req, res) => {
  try {
    const {
      currentPrompt,
      existingReferences = [],
      newReferenceImageBase64,
      newReferenceRole = 'General Reference',
      mimeType = 'image/jpeg',
    } = req.body;

    const ai = getGeminiClient();

    const parts: any[] = [];
    if (newReferenceImageBase64) {
      const cleanBase64 = newReferenceImageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType,
        },
      });
    }

    const contextText = `You are an expert AI prompt engineer in NAGAR DESIGN AI STUDIO.
The user has an existing design prompt:
"${currentPrompt}"

Existing reference roles & locked elements:
${existingReferences.map((r: any, idx: number) => `${idx + 1}. [${r.role}${r.isLocked ? ' - LOCKED (CRITICAL PRESERVE)' : ''}]: ${r.name || 'Reference'} - ${r.notes || ''}`).join('\n') || 'None'}

A NEW reference image was just added with role: "${newReferenceRole}".
TASK:
Analyze the new reference image and role.
Update and refine the CURRENT prompt to seamlessly incorporate the aesthetic, ornament, material, or framing from this new reference image WITHOUT discarding or modifying the essential identity, characters, or existing locked references.
Return clean JSON:
{
  "updatedPrompt": "The enhanced new prompt text incorporating the new reference",
  "explanation": "Brief explanation in Arabic and English of what was added from the new reference",
  "recommendedNegativePromptAdditions": "Any new negative constraints to avoid clashes",
  "detectedRoleFeatures": "Key visual features identified in the new reference"
}`;

    parts.push({ text: contextText });

    if (ai) {
      try {
        const response = await generateWithFallback(ai, {
          contents: { parts },
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({ success: true, data: parsed });
      } catch {
        // Handled fallback
      }
    }

        return res.status(503).json({ success: false, error: 'Gemini is unavailable or the request failed. No demo result was returned.' });

  } catch (error: any) {
    console.error('update-prompt-with-reference error:', error);
    res.status(500).json({ error: error?.message || 'Failed to update prompt' });
  }
});

// Analyze Prompt Breakdown
app.post('/api/analyze-prompt', async (req, res) => {
  try {
    const { promptText } = req.body;
    if (!promptText) {
      return res.status(400).json({ error: 'promptText is required' });
    }

    const ai = getGeminiClient();

    const instruction = `Deconstruct this image generation prompt into its precise creative dimensions.
Prompt: "${promptText}"

Return JSON:
{
  "subject": "Core entity/person/scene",
  "environment": "Location, architecture, background setting",
  "composition": "Framing, spatial arrangement, aspect flow",
  "lighting": "Light source, intensity, shadows, ambiance",
  "camera": "Camera model, sensor, shutter style",
  "lens": "Focal length, aperture, lens characteristics",
  "colors": "Primary palette, accents, mood tones",
  "style": "Art direction, render engine, photography genre",
  "materials": "Surfaces, textiles, finishes",
  "clothing": "Wardrobe, accessories, attire",
  "background": "Backdrop specifics, atmosphere",
  "text": "Typography or graphic text elements",
  "quality": "Fidelity descriptors, detail level",
  "negativeConstraints": "Inferred negative prompt recommendations",
  "score": 96,
  "optimizationTips": [
    "أضف تفاصيل إضاءة الحواف (Rim light) لإبراز تفاصيل الشعر وقبعة التخرج",
    "حدد خامة الإطار الذهبي بدقة (Gold leaf foil / antique brass) لنتائج أكثر واقعية"
  ]
}`;

    if (ai) {
      try {
        const response = await generateWithFallback(ai, {
          contents: instruction,
          config: {
            responseMimeType: 'application/json',
          },
        });

        return res.json({ success: true, data: JSON.parse(response.text || '{}') });
      } catch {
        // Handled fallback
      }
    }

        return res.status(503).json({ success: false, error: 'Gemini is unavailable or the request failed. No demo result was returned.' });

  } catch (error: any) {
    console.error('analyze-prompt error:', error);
    res.status(500).json({ error: error?.message || 'Failed to analyze prompt' });
  }
});

// Design Decomposer (breaks down a design into layers/components)
app.post('/api/decompose-design', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const ai = getGeminiClient();
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `You are an expert graphic design decomposition system in NAGAR DESIGN AI STUDIO.
Analyze this composite design image and decompose it into distinct visual layers and extracted components:
- Background (wallpaper, gradient, texture)
- Frames (photo borders, luxury borders, geometrical frames)
- Photos (portraits, graduation/wedding pictures within frames)
- People (isolated subjects)
- Stickers & Badges (graduation caps, ribbons, seals, crests)
- Decorations (floral, golden flourishes, filigree, geometric patterns)
- Text & Typography (names, titles, years, dates)

Return JSON with list of components:
{
  "totalLayers": 7,
  "summary": "Detailed analysis of design hierarchy and layout",
  "components": [
    {
      "id": "layer-1",
      "name": "Luxury Marble & Gold Background",
      "category": "Background",
      "confidence": 0.98,
      "description": "Dark emerald marble texture with subtle gold veining",
      "bbox": {"x": 0, "y": 0, "width": 100, "height": 100},
      "zIndex": 1,
      "recommendedAction": "Keep or replace with clean gradient"
    },
    {
      "id": "layer-2",
      "name": "Ornate Golden Outer Frame",
      "category": "Frames",
      "confidence": 0.96,
      "description": "Baroque golden filigree border around the entire canvas",
      "bbox": {"x": 5, "y": 5, "width": 90, "height": 90},
      "zIndex": 2,
      "recommendedAction": "Extract as PNG cutout"
    },
    {
      "id": "layer-3",
      "name": "Main Center Portrait",
      "category": "People",
      "confidence": 0.99,
      "description": "Central graduate photo with cap and formal attire",
      "bbox": {"x": 28, "y": 25, "width": 44, "height": 50},
      "zIndex": 3,
      "recommendedAction": "Lock as main subject reference"
    },
    {
      "id": "layer-4",
      "name": "Congratulatory Calligraphy Header",
      "category": "Text & Typography",
      "confidence": 0.95,
      "description": "Gold Diwani Arabic text 'مبروك التخرج ٢٠٢٦'",
      "bbox": {"x": 20, "y": 10, "width": 60, "height": 12},
      "zIndex": 4,
      "recommendedAction": "Vectorize for laser engraving"
    },
    {
      "id": "layer-5",
      "name": "Baroque Corner Flourishes",
      "category": "Decorations",
      "confidence": 0.94,
      "description": "Four antique gold leaf corner filigrees",
      "bbox": {"x": 5, "y": 5, "width": 90, "height": 90},
      "zIndex": 5,
      "recommendedAction": "Extract as separate vector SVG asset"
    },
    {
      "id": "layer-6",
      "name": "Graduation Honors Ribbon & Seal",
      "category": "Stickers & Badges",
      "confidence": 0.92,
      "description": "Embossed medal with laurel wreath and ribbon",
      "bbox": {"x": 42, "y": 76, "width": 16, "height": 16},
      "zIndex": 6,
      "recommendedAction": "Export as transparent badge"
    }
  ]
}`;

    if (ai) {
      try {
        const response = await generateWithFallback(ai, {
          contents: {
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType,
                },
              },
              { text: prompt },
            ],
          },
          config: {
            responseMimeType: 'application/json',
          },
        });

        return res.json({ success: true, data: JSON.parse(response.text || '{}') });
      } catch {
        // Handled fallback
      }
    }

        return res.status(503).json({ success: false, error: 'Gemini is unavailable or the request failed. No demo result was returned.' });

  } catch (error: any) {
    console.error('decompose-design error:', error);
    res.status(500).json({ error: error?.message || 'Failed to decompose design' });
  }
});

// Text & OCR extraction
app.post('/api/ocr-text', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    const ai = getGeminiClient();
    const cleanBase64 = (imageBase64 || '').replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `Extract all text and typography elements visible in this design image in both Arabic and English.
Identify their position, font characteristics, language, and meaning.
Return JSON:
{
  "detectedTexts": [
    {
      "text": "مبروك التخرج ٢٠٢٦",
      "language": "Arabic",
      "bbox": {"x": 25, "y": 12, "width": 50, "height": 10},
      "fontStyle": "Thuluth / Diwani Arabic Calligraphy",
      "color": "#D4AF37 (Gold)",
      "confidence": 0.99
    },
    {
      "text": "CLASS OF 2026 • BACHELOR OF EXCELLENCE",
      "language": "English",
      "bbox": {"x": 20, "y": 18, "width": 60, "height": 5},
      "fontStyle": "Cinzel Decorative / All-Caps Serif",
      "color": "#CBD5E1 (Silver / White)",
      "confidence": 0.98
    },
    {
      "text": "المهندس / أحمد النجار",
      "language": "Arabic",
      "bbox": {"x": 30, "y": 75, "width": 40, "height": 8},
      "fontStyle": "Cairo Bold / Modern Arabic Sans",
      "color": "#FEF08A (Light Gold)",
      "confidence": 0.97
    }
  ],
  "fullTranscript": "مبروك التخرج ٢٠٢٦ • CLASS OF 2026 • BACHELOR OF EXCELLENCE • المهندس / أحمد النجار"
}`;

    if (ai && cleanBase64) {
      try {
        const response = await generateWithFallback(ai, {
          contents: {
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType,
                },
              },
              { text: prompt },
            ],
          },
          config: {
            responseMimeType: 'application/json',
          },
        });

        return res.json({ success: true, data: JSON.parse(response.text || '{}') });
      } catch {
        // Handled fallback
      }
    }

    return res.status(503).json({ success: false, error: 'Gemini is unavailable or the request failed. No demo result was returned.' });

  } catch (error: any) {
    console.error('ocr-text error:', error);
    res.status(500).json({ error: error?.message || 'Failed to extract text' });
  }
});

// Font Detection
app.post('/api/detect-font', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    const ai = getGeminiClient();
    const cleanBase64 = (imageBase64 || '').replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `Analyze typography and fonts in this image for NAGAR DESIGN AI STUDIO.
Return JSON:
{
  "detectedClassification": "Luxury Serif & Modern Arabic Kufi/Diwani",
  "closestFont": "Cairo Bold & Cinzel Decorative",
  "arabicSuggestions": [
    {"name": "Cairo", "style": "Geometric modern Arabic sans", "googleFontsUrl": "https://fonts.google.com/specimen/Cairo"},
    {"name": "Amiri", "style": "Classic Naskh Arabic serif", "googleFontsUrl": "https://fonts.google.com/specimen/Amiri"},
    {"name": "Tajawal", "style": "Contemporary clean Arabic sans", "googleFontsUrl": "https://fonts.google.com/specimen/Tajawal"},
    {"name": "Reem Kufi", "style": "Decorative display Kufic", "googleFontsUrl": "https://fonts.google.com/specimen/Reem+Kufi"},
    {"name": "Aref Ruqaa", "style": "Traditional Ruqaa calligraphy style", "googleFontsUrl": "https://fonts.google.com/specimen/Aref+Ruqaa"}
  ],
  "englishSuggestions": [
    {"name": "Cinzel Decorative", "style": "High luxury serif with ornamental caps", "googleFontsUrl": "https://fonts.google.com/specimen/Cinzel+Decorative"},
    {"name": "Playfair Display", "style": "High-contrast editorial serif", "googleFontsUrl": "https://fonts.google.com/specimen/Playfair+Display"},
    {"name": "Plus Jakarta Sans", "style": "Clean contemporary premium sans", "googleFontsUrl": "https://fonts.google.com/specimen/Plus+Jakarta+Sans"},
    {"name": "Cormorant Garamond", "style": "Traditional elegant royal serif", "googleFontsUrl": "https://fonts.google.com/specimen/Cormorant+Garamond"}
  ],
  "recommendations": "استخدم تدرج لوني ذهبي (Gold Gradient Fill) مع مسافة 2px بين الحروف للحصول على مظهر ملكي للمطبوعات."
}`;

    if (ai && cleanBase64) {
      try {
        const response = await generateWithFallback(ai, {
          contents: {
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType,
                },
              },
              { text: prompt },
            ],
          },
          config: {
            responseMimeType: 'application/json',
          },
        });

        return res.json({ success: true, data: JSON.parse(response.text || '{}') });
      } catch {
        // Handled fallback
      }
    }

    return res.status(503).json({ success: false, error: 'Gemini is unavailable or the request failed. No demo result was returned.' });

  } catch (error: any) {
    console.error('detect-font error:', error);
    res.status(500).json({ error: error?.message || 'Failed to detect font' });
  }
});

// Color Studio (Palette extraction)
app.post('/api/extract-colors', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    const ai = getGeminiClient();
    const cleanBase64 = (imageBase64 || '').replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `Extract the full professional color palette from this image.
Break it into:
- Main Colors (Dominant 2-3 colors)
- Secondary Colors (Supporting 2-3 colors)
- Accent Colors (Highlight/Metallic/Vibrant 2-3 colors)

Return JSON:
{
  "paletteName": "Royal Emerald & Antique Gold",
  "mainColors": [
    {"hex": "#0F2A1D", "name": "Deep Emerald", "percentage": 45},
    {"hex": "#111827", "name": "Charcoal Black", "percentage": 30}
  ],
  "secondaryColors": [
    {"hex": "#2F5D48", "name": "Sage Shadow", "percentage": 15},
    {"hex": "#E5E0D8", "name": "Parchment Cream", "percentage": 5}
  ],
  "accentColors": [
    {"hex": "#D4AF37", "name": "Metallic Gold", "percentage": 3},
    {"hex": "#F3E5AB", "name": "Champagne Shimmer", "percentage": 2}
  ],
  "suggestedAlternatives": [
    {"name": "Midnight Sapphire & Rose Gold", "palette": ["#0B1B3D", "#D48C70", "#F7E7CE"]},
    {"name": "Ruby Luxury & Platinum", "palette": ["#4A0E17", "#E5E4E2", "#A31621"]}
  ]
}`;

    if (ai && cleanBase64) {
      try {
        const response = await generateWithFallback(ai, {
          contents: {
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType,
                },
              },
              { text: prompt },
            ],
          },
          config: {
            responseMimeType: 'application/json',
          },
        });

        return res.json({ success: true, data: JSON.parse(response.text || '{}') });
      } catch {
        // Handled fallback
      }
    }

    return res.status(503).json({ success: false, error: 'Gemini is unavailable or the request failed. No demo result was returned.' });

  } catch (error: any) {
    console.error('extract-colors error:', error);
    res.status(500).json({ error: error?.message || 'Failed to extract colors' });
  }
});

// AI Assistant Chat with Full Project Context
app.post('/api/assistant-chat', async (req, res) => {
  try {
    const { message, projectContext, chatHistory = [] } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = `You are NAGAR AI, the senior creative director and design copilot inside NAGAR DESIGN AI STUDIO.
The user speaks Arabic (or English). You understand design, photography, laser cutting, printing (CMYK/DPI/bleed), collages, and prompt engineering.

CRITICAL: Always remember the ACTIVE PROJECT CONTEXT!
If the user says "كبرها" (scale it up), understand which layer or image is active.
If the user says "خليها ذهبية" (make it golden), understand which element is referred to.
If the user asks "اعمللي تصميم تخرج 30×40 فيه 7 صور", formulate the layout plan, dimensions, frame roles, and prompt structure.

Active Project Context:
${JSON.stringify(projectContext, null, 2)}

Respond naturally in warm, expert Arabic (with English terms when helpful). Include actionable suggestions and if appropriate, specify a tool action to trigger in the studio.`;

    if (ai) {
      try {
        const contents = [
          ...chatHistory.map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.text }],
          })),
          {
            role: 'user',
            parts: [{ text: message }],
          },
        ];

        const response = await generateWithFallback(ai, {
          contents: contents as any,
          config: {
            systemInstruction,
          },
        });

        return res.json({
          success: true,
          reply: response.text || 'أهلاً بك! كيف يمكنني مساعدتك في استوديو التصميم اليوم؟',
        });
      } catch {
        // Handled fallback
      }
    }

        return res.status(503).json({ success: false, error: 'Gemini is unavailable or the request failed. No demo result was returned.' });

  } catch (error: any) {
    console.error('assistant-chat error:', error);
    res.status(500).json({ error: error?.message || 'Failed in assistant chat' });
  }
});

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Generates a true dynamic visual preview matching the user's actual prompt, style, and reference images
function renderDynamicPromptCard(
  prompt: string,
  style: string = '',
  referenceImages: any[] = [],
  aspectRatio: string = '3:4'
): string {
  let width = 900;
  let height = 1200;
  if (aspectRatio === '1:1') {
    width = 1000;
    height = 1000;
  } else if (aspectRatio === '16:9') {
    width = 1600;
    height = 900;
  } else if (aspectRatio === '9:16') {
    width = 900;
    height = 1600;
  } else if (aspectRatio === '4:3') {
    width = 1200;
    height = 900;
  }

  const cleanPrompt = escapeXml(prompt.slice(0, 200));
  const cleanStyle = escapeXml(style || 'Design Studio Composition');
  const mainRef =
    referenceImages.find((r) => r.isLocked || r.role === 'Main Subject' || r.role === 'Face Reference') ||
    referenceImages[0];
  const refImageTag =
    mainRef?.url && mainRef.url.startsWith('data:image')
      ? `<image href="${mainRef.url}" x="${width * 0.15}" y="${height * 0.22}" width="${width * 0.7}" height="${height * 0.45}" preserveAspectRatio="xMidYMid slice" rx="16"/>`
      : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b1329"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#c084fc"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
  <rect x="${width * 0.05}" y="${height * 0.05}" width="${width * 0.9}" height="${height * 0.9}" rx="20" fill="none" stroke="url(#accentGrad)" stroke-width="3" stroke-dasharray="8 6" opacity="0.6"/>
  
  ${
    refImageTag ||
    `
  <rect x="${width * 0.15}" y="${height * 0.22}" width="${width * 0.7}" height="${height * 0.45}" rx="16" fill="#1e293b" stroke="#334155" stroke-width="2"/>
  <text x="${width * 0.5}" y="${height * 0.45}" font-family="Cairo, sans-serif" font-size="26" font-weight="bold" fill="#94a3b8" text-anchor="middle">
    🎨 ${cleanStyle}
  </text>
  `
  }

  <text x="${width * 0.5}" y="${height * 0.13}" font-family="Cairo, sans-serif" font-size="26" font-weight="bold" fill="#f8fafc" text-anchor="middle">
    معاينة تخطيطية للبرومبت • PROMPT LAYOUT PREVIEW
  </text>

  <rect x="${width * 0.1}" y="${height * 0.72}" width="${width * 0.8}" height="${height * 0.18}" rx="14" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
  <text x="${width * 0.5}" y="${height * 0.78}" font-family="Cairo, sans-serif" font-size="20" font-weight="bold" fill="#38bdf8" text-anchor="middle">
    محتوى البرومبت المطلوب:
  </text>
  <text x="${width * 0.5}" y="${height * 0.84}" font-family="Cairo, sans-serif" font-size="16" fill="#cbd5e1" text-anchor="middle">
    ${cleanPrompt}
  </text>

  <text x="${width * 0.5}" y="${height * 0.95}" font-family="Cairo, sans-serif" font-size="14" fill="#64748b" text-anchor="middle">
    NAGAR DESIGN AI STUDIO • ACTIVATION REQUIRED FOR AI GENERATION
  </text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Image Generation & Editing endpoint using official @google/genai image models
app.post('/api/generate-image', async (req, res) => {
  try {
    const {
      prompt,
      negativePrompt,
      aspectRatio = '3:4',
      style = 'photorealistic',
      referenceImages = [],
    } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGeminiClient();
    const validRatios = ['1:1', '3:4', '4:3', '9:16', '16:9', '1:4', '1:8', '4:1', '8:1'];
    const safeAspectRatio = validRatios.includes(aspectRatio) ? aspectRatio : '3:4';

    let generatedImageUrl: string | null = null;
    let descriptionText = '';
    let lastError: any = null;

    if (ai) {
      const parts: any[] = [];

      // Append reference images as inlineData (up to 3 images supported by model)
      if (referenceImages && Array.isArray(referenceImages)) {
        for (const ref of referenceImages.slice(0, 3)) {
          if (ref.url && ref.url.startsWith('data:image/')) {
            const cleanBase64 = ref.url.replace(/^data:image\/[a-z]+;base64,/, '');
            const match = ref.url.match(/^data:(image\/[a-z]+);base64,/);
            const mime = match ? match[1] : 'image/jpeg';
            parts.push({
              inlineData: {
                data: cleanBase64,
                mimeType: mime,
              },
            });
          }
        }
      }

      const enrichedPrompt = `${prompt.trim()}${style ? `. Style: ${style}` : ''}${
        negativePrompt ? `. Negative constraints: avoid ${negativePrompt}` : ''
      }`;
      parts.push({ text: enrichedPrompt });

      // Image generation models in order of priority
      const imageModels = ['gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image'];

      for (const model of imageModels) {
        try {
          const config: any = {
            imageConfig: {
              aspectRatio: safeAspectRatio,
            },
          };
          if (model === 'gemini-3.1-flash-image') {
            config.imageConfig.imageSize = '1K';
          }

          const response = await ai.models.generateContent({
            model,
            contents: { parts },
            config,
          });

          if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) {
                generatedImageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
              } else if (part.text) {
                descriptionText += part.text;
              }
            }
          }

          if (generatedImageUrl) {
            break;
          }
        } catch (err: any) {
          lastError = err;
        }
      }
    }

    if (generatedImageUrl) {
      return res.json({
        success: true,
        hasImage: true,
        imageUrl: generatedImageUrl,
        text: descriptionText || 'تم توليد الصورة بنجاح بواسطة موديل الذكاء الاصطناعي.',
      });
    }

        return res.status(503).json({ success: false, error: 'Image generation provider is unavailable or the request failed.' });

  } catch {
    return res.status(500).json({ success: false, error: 'Image generation failed unexpectedly.' });
  }
});

// Analyze & Clone Collage Template Image into Exact Slot Geometry
app.post('/api/clone-collage-template', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'Missing imageBase64' });
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';

        const response = await generateWithFallback(ai, {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    data: cleanBase64,
                    mimeType,
                  },
                },
                {
                  text: `Analyze this photo collage template layout image. Detect all distinct photo frame slots/boxes inside the collage template.
Return ONLY valid JSON with this structure:
{
  "nameAr": "قالب مستنسخ ذكي",
  "nameEn": "Cloned Smart Template",
  "slots": [
    { "x": number, "y": number, "w": number, "h": number, "shape": "rect" | "circle" | "arch", "isHero": boolean }
  ]
}
Rules:
- x, y, w, h must be percentages from 0 to 100 representing each photo slot's top-left (x, y) and size (w, h) within the canvas (keep 3% to 97% bounds so nothing clips).
- Mark the largest slot with "isHero": true.
- Do not overlap slots unless the template clearly overlaps them.`,
                },
              ],
            },
          ],
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text || '';
        const parsed = JSON.parse(text);
        if (parsed && Array.isArray(parsed.slots) && parsed.slots.length > 0) {
          return res.json({
            success: true,
            data: parsed,
          });
        }
      } catch {
        // Fallback to client-side computer vision scanner if API quota is reached
      }
    }

    return res.json({
      success: false,
      useClientScanner: true,
    });
  } catch {
    return res.json({
      success: false,
      useClientScanner: true,
    });
  }
});

// Mount Vite or Serve Static in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`NAGAR DESIGN AI STUDIO running at http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
