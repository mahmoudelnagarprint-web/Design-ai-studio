import { Project, Asset, StudioSettings } from '../types';

export const defaultSettings: StudioSettings = {
  language: 'ar',
  theme: 'dark',
  defaultImageModel: 'gemini-3.1-flash-lite-image',
  defaultVisionModel: 'gemini-3.8-flash',
  defaultUpscaleModel: 'RealESRGAN-4x-Pro',
  defaultEditModel: 'gemini-3.1-flash-lite-image',
  autoSaveIntervalMs: 2500,
  showGrid: true,
  snapToGuides: true,
  activeGoogleAccountId: 'acc-google-1',
  autoSwitchOnQuotaExceeded: true,
  googleAccounts: [
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
    {
      id: 'acc-google-2',
      name: 'Nagar Design Studio',
      email: 'nagar.design.ai@gmail.com',
      isPrimary: false,
      dailyFreeRequestsLimit: 1500,
      usedRequestsToday: 0,
      lastActive: new Date(Date.now() - 86400000).toISOString(),
      quotaStatus: 'active',
    },
  ],
};

// SVG data helpers to provide crisp visual assets without external network dependency
const createSvgDataUrl = (svgContent: string): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
};

export const sampleGraduationPersonSvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#a16207"/>
    </linearGradient>
    <linearGradient id="skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fed7aa"/>
      <stop offset="100%" stop-color="#fba867"/>
    </linearGradient>
  </defs>
  <rect width="600" height="800" fill="url(#bg)"/>
  <circle cx="300" cy="310" r="140" fill="url(#skin)"/>
  <!-- Eyes -->
  <ellipse cx="255" cy="295" rx="12" ry="8" fill="#1e293b"/>
  <ellipse cx="345" cy="295" rx="12" ry="8" fill="#1e293b"/>
  <circle cx="257" cy="293" r="3" fill="#ffffff"/>
  <circle cx="347" cy="293" r="3" fill="#ffffff"/>
  <!-- Smile -->
  <path d="M 260 350 Q 300 380 340 350" stroke="#9a3412" stroke-width="4" fill="none" stroke-linecap="round"/>
  <!-- Hair -->
  <path d="M 170 300 Q 160 170 300 170 Q 440 170 430 300 Q 390 200 300 200 Q 210 200 170 300 Z" fill="#0f172a"/>
  <!-- Graduation Gown -->
  <path d="M 120 800 L 210 440 L 390 440 L 480 800 Z" fill="#111827"/>
  <!-- Golden Stole -->
  <path d="M 230 440 L 220 720 L 270 730 L 265 440 Z" fill="url(#gold)"/>
  <path d="M 370 440 L 380 720 L 330 730 L 335 440 Z" fill="url(#gold)"/>
  <!-- Graduation Cap / Mortarboard -->
  <polygon points="300,120 460,170 300,220 140,170" fill="#030712"/>
  <rect x="230" y="180" width="140" height="40" rx="8" fill="#111827"/>
  <!-- Golden Tassel -->
  <circle cx="300" cy="170" r="8" fill="url(#gold)"/>
  <path d="M 300 170 Q 380 210 390 260" stroke="#eab308" stroke-width="4" fill="none"/>
  <rect x="382" y="260" width="16" height="35" rx="3" fill="url(#gold)"/>
</svg>`);

export const sampleBackgroundSvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <defs>
    <radialGradient id="luxBg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#143428"/>
      <stop offset="60%" stop-color="#091b14"/>
      <stop offset="100%" stop-color="#020805"/>
    </radialGradient>
    <linearGradient id="goldVein" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d4af37" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#fff" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#a37e17" stop-opacity="0.7"/>
    </linearGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#luxBg)"/>
  <path d="M 0 300 Q 200 450 450 350 T 800 500" stroke="url(#goldVein)" stroke-width="3" fill="none" opacity="0.6"/>
  <path d="M 50 100 Q 350 200 650 50 T 800 200" stroke="url(#goldVein)" stroke-width="1.5" fill="none" opacity="0.4"/>
  <path d="M 0 750 Q 300 600 550 780 T 800 850" stroke="url(#goldVein)" stroke-width="2" fill="none" opacity="0.5"/>
</svg>`);

export const sampleFrameSvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="goldFrame" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="35%" stop-color="#ca8a04"/>
      <stop offset="70%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>
  </defs>
  <rect x="20" y="20" width="560" height="760" rx="20" fill="none" stroke="url(#goldFrame)" stroke-width="18"/>
  <rect x="42" y="42" width="516" height="716" rx="12" fill="none" stroke="url(#goldFrame)" stroke-width="3" stroke-dasharray="8,6"/>
  <!-- Corner Ornaments -->
  <circle cx="42" cy="42" r="14" fill="url(#goldFrame)"/>
  <circle cx="558" cy="42" r="14" fill="url(#goldFrame)"/>
  <circle cx="42" cy="758" r="14" fill="url(#goldFrame)"/>
  <circle cx="558" cy="758" r="14" fill="url(#goldFrame)"/>
</svg>`);

export const sampleDecorationSvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="goldDeco" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#d4af37"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>
  </defs>
  <path d="M 200 40 Q 230 140 330 170 Q 230 200 200 300 Q 170 200 70 170 Q 170 140 200 40 Z" fill="url(#goldDeco)"/>
  <circle cx="200" cy="170" r="18" fill="#ffffff" opacity="0.8"/>
  <!-- Laurel wreath flourish -->
  <path d="M 120 280 C 140 320, 260 320, 280 280" stroke="url(#goldDeco)" stroke-width="6" fill="none" stroke-linecap="round"/>
</svg>`);

export const sampleGraduationOutputSvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1066" viewBox="0 0 800 1066">
  <defs>
    <radialGradient id="resBg" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#193b2e"/>
      <stop offset="55%" stop-color="#0b1b15"/>
      <stop offset="100%" stop-color="#030806"/>
    </radialGradient>
    <linearGradient id="goldShine" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="30%" stop-color="#fde047"/>
      <stop offset="70%" stop-color="#d4af37"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
  </defs>
  <rect width="800" height="1066" fill="url(#resBg)"/>
  <!-- Ornate Luxury Outer Frame -->
  <rect x="30" y="30" width="740" height="1006" rx="24" fill="none" stroke="url(#goldShine)" stroke-width="12"/>
  <rect x="52" y="52" width="696" height="962" rx="16" fill="none" stroke="url(#goldShine)" stroke-width="2" stroke-dasharray="10 8"/>
  
  <!-- Corner Accents -->
  <polygon points="52,52 90,52 52,90" fill="url(#goldShine)"/>
  <polygon points="748,52 710,52 748,90" fill="url(#goldShine)"/>
  <polygon points="52,1014 90,1014 52,976" fill="url(#goldShine)"/>
  <polygon points="748,1014 710,1014 748,976" fill="url(#goldShine)"/>

  <!-- Top Arabic Heading -->
  <text x="400" y="140" font-family="Cairo, sans-serif" font-size="44" font-weight="bold" fill="url(#goldShine)" text-anchor="middle">مبروك التخرج ٢٠٢٦</text>
  <text x="400" y="180" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" letter-spacing="4" fill="#cbd5e1" text-anchor="middle">CLASS OF 2026 • BACHELOR OF EXCELLENCE</text>

  <!-- Central Portrait Frame Area -->
  <rect x="220" y="240" width="360" height="480" rx="180" fill="#0f172a" stroke="url(#goldShine)" stroke-width="8"/>
  <circle cx="400" cy="450" r="110" fill="#fed7aa"/>
  <path d="M 280 680 L 330 530 L 470 530 L 520 680 Z" fill="#111827"/>
  <polygon points="400,320 500,350 400,380 300,350" fill="#030712"/>
  <circle cx="400" cy="350" r="5" fill="url(#goldShine)"/>

  <!-- Mini Surrounding Frames (Collage element: 6 auxiliary photo placeholders) -->
  <rect x="90" y="320" width="100" height="130" rx="12" fill="#091811" stroke="url(#goldShine)" stroke-width="3"/>
  <rect x="90" y="490" width="100" height="130" rx="12" fill="#091811" stroke="url(#goldShine)" stroke-width="3"/>
  <rect x="610" y="320" width="100" height="130" rx="12" fill="#091811" stroke="url(#goldShine)" stroke-width="3"/>
  <rect x="610" y="490" width="100" height="130" rx="12" fill="#091811" stroke="url(#goldShine)" stroke-width="3"/>
  
  <rect x="190" y="750" width="120" height="150" rx="14" fill="#091811" stroke="url(#goldShine)" stroke-width="3"/>
  <rect x="490" y="750" width="120" height="150" rx="14" fill="#091811" stroke="url(#goldShine)" stroke-width="3"/>

  <!-- Name Ribbon & Badges -->
  <rect x="260" y="780" width="280" height="60" rx="30" fill="#0b1b15" stroke="url(#goldShine)" stroke-width="3"/>
  <text x="400" y="820" font-family="Cairo, sans-serif" font-size="28" font-weight="700" fill="url(#goldShine)" text-anchor="middle">المهندس / أحمد النجار</text>
  <text x="400" y="890" font-family="Cairo, sans-serif" font-size="18" fill="#94a3b8" text-anchor="middle">جامعة القاهرة • كلية الهندسة • مرتبة الشرف</text>

  <!-- Bottom Details -->
  <text x="400" y="990" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" letter-spacing="3" fill="#64748b" text-anchor="middle">NAGAR DESIGN STUDIO • 30×40 CM PREMIUM PRINT READY</text>
</svg>`);

export const initialProjects: Project[] = [
  {
    id: 'proj-grad-2026',
    name: 'تصميم تخرج فاخر 2026 (Graduation 30x40)',
    description: 'مشروع تخرج فخم بمقاس 30×40 سم مع إطار ذهبي مخصص وخلفية رخامية زمردية و7 صور مدمجة',
    createdAt: '2026-09-20T10:00:00Z',
    updatedAt: '2026-09-26T22:30:00Z',
    isFavorite: true,
    tags: ['graduation', 'gold', '30x40', '7-photos', 'laser', 'emerald'],
    notes: 'استخدم صورة الشخص الأساسية المغلقة وحافظ على ملامحه وهويته بالكامل أثناء أي توليد أو تعديل.',
    status: 'in_progress',
    canvasWidth: 3543, // 30cm at 300 DPI
    canvasHeight: 4724, // 40cm at 300 DPI
    originalImages: [sampleGraduationPersonSvg, sampleBackgroundSvg],
    activePromptId: 'prompt-grad-01',
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
    history: [
      {
        id: 'hist-1',
        timestamp: '2026-09-20T10:05:00Z',
        action: 'Project Created',
        description: 'إنشاء مشروع تخرج 2026 بمقاس 30×40 سم',
        tool: 'project',
      },
      {
        id: 'hist-2',
        timestamp: '2026-09-20T10:15:00Z',
        action: 'References Added',
        description: 'إضافة صورة الشخص وقفلها 🔒 مع إضافة صورة الخلفية والإطار',
        tool: 'references',
      },
      {
        id: 'hist-3',
        timestamp: '2026-09-22T14:30:00Z',
        action: 'Prompt Updated to v3',
        description: 'تحديث البرومبت بذكاء ليشمل زخرفة التخرج مع الحفاظ على الشخص',
        tool: 'prompt',
      },
      {
        id: 'hist-4',
        timestamp: '2026-09-26T21:40:00Z',
        action: 'Image Generated',
        description: 'توليد النتيجة النهائية Result 01 بدقة 2K ونمط فوتوغرافي فاخر',
        tool: 'generate',
      },
    ],
    assets: [
      {
        id: 'asset-bg-emerald',
        name: 'خلفية رخام ملكي وذهب',
        category: 'backgrounds',
        url: sampleBackgroundSvg,
        tags: ['emerald', 'marble', 'gold', 'luxury'],
        isFavorite: true,
        format: 'svg',
        dimensions: '3000x4000',
        createdAt: '2026-09-20T10:10:00Z',
      },
      {
        id: 'asset-frame-baroque',
        name: 'إطار ذهبي باروك منحوت',
        category: 'frames',
        url: sampleFrameSvg,
        tags: ['frame', 'gold', 'baroque', 'laser-ready'],
        isFavorite: true,
        format: 'svg',
        dimensions: '600x800',
        createdAt: '2026-09-20T10:12:00Z',
      },
      {
        id: 'asset-star-deco',
        name: 'نجمة ذهبية مع إكليل غار',
        category: 'decorations',
        url: sampleDecorationSvg,
        tags: ['star', 'laurel', 'gold', 'graduation'],
        isFavorite: false,
        format: 'svg',
        dimensions: '400x400',
        createdAt: '2026-09-22T12:00:00Z',
      },
    ],
    layers: [
      {
        id: 'layer-bg',
        name: 'خلفية الزمرد والذهب الرخامي',
        type: 'image',
        visible: true,
        locked: true,
        opacity: 1,
        blendMode: 'normal',
        x: 0,
        y: 0,
        width: 800,
        height: 1066,
        rotation: 0,
        dataUrl: sampleBackgroundSvg,
        zIndex: 1,
      },
      {
        id: 'layer-frame',
        name: 'الإطار الملكي المنحوت',
        type: 'frame',
        visible: true,
        locked: false,
        opacity: 1,
        blendMode: 'normal',
        x: 30,
        y: 30,
        width: 740,
        height: 1006,
        rotation: 0,
        dataUrl: sampleFrameSvg,
        zIndex: 2,
      },
      {
        id: 'layer-portrait',
        name: 'صورة الخريج الرئيسية (مقفل الهوية)',
        type: 'image',
        visible: true,
        locked: true,
        opacity: 1,
        blendMode: 'normal',
        x: 220,
        y: 240,
        width: 360,
        height: 480,
        rotation: 0,
        dataUrl: sampleGraduationPersonSvg,
        zIndex: 3,
      },
      {
        id: 'layer-text-title',
        name: 'نص: مبروك التخرج ٢٠٢٦',
        type: 'text',
        visible: true,
        locked: false,
        opacity: 1,
        blendMode: 'normal',
        x: 400,
        y: 140,
        width: 500,
        height: 60,
        rotation: 0,
        content: 'مبروك التخرج ٢٠٢٦',
        color: '#fde047',
        zIndex: 4,
      },
    ],
    prompts: [
      {
        id: 'prompt-grad-01',
        projectId: 'proj-grad-2026',
        text: 'A high-end luxury graduation design featuring the locked graduate in academic gown and cap, framed with ornate baroque gold filigree, against a deep emerald green marble backdrop with delicate gold veins. Soft rim lighting, Hasselblad 100mm portrait camera, cinematic composition, ultra sharp details, 8k quality.',
        negativePrompt: 'blurry, distorted facial features, changing face identity, low resolution, cheap plastic, oversaturated cartoon, watermark',
        model: 'gemini-3.1-flash-lite-image',
        settings: {
          model: 'gemini-3.1-flash-lite-image',
          aspectRatio: '3:4',
          resolution: '2K',
          numberOfImages: 3,
          style: 'Cinematic High Luxury Photo',
          seed: 42891,
        },
        aspectRatio: '3:4',
        resolution: '2K',
        style: 'Cinematic High Luxury Photo',
        createdAt: '2026-09-20T10:15:00Z',
        updatedAt: '2026-09-22T14:30:00Z',
        version: 3,
        tags: ['graduation', 'luxury', 'gold', 'emerald', 'locked-face'],
        notes: 'الإصدار الثالث هو المعتمد للطباعة ومطابقة الهوية.',
        isFavorite: true,
        references: [
          {
            id: 'ref-person-01',
            name: 'صورة الخريج الأصلية (احمد)',
            url: sampleGraduationPersonSvg,
            role: 'Main Subject',
            isLocked: true, // 🔒 Strictly preserved!
            notes: 'هذه صورة الشخص الأساسي، حافظ على ملامحه وهويته.',
            tags: ['person', 'face', 'primary'],
            order: 0,
            addedAt: '2026-09-20T10:15:00Z',
          },
          {
            id: 'ref-bg-02',
            name: 'الخلفية الرخامية الزمردية',
            url: sampleBackgroundSvg,
            role: 'Background Reference',
            isLocked: false,
            notes: 'نمط الرخام الأخضر الداكن مع عروق الذهب.',
            tags: ['background', 'marble', 'emerald'],
            order: 1,
            addedAt: '2026-09-20T10:16:00Z',
          },
          {
            id: 'ref-frame-03',
            name: 'الإطار الملكي الذهبي',
            url: sampleFrameSvg,
            role: 'Frame Reference',
            isLocked: false,
            notes: 'إطار باروك مائل للقص بالليزر.',
            tags: ['frame', 'gold'],
            order: 2,
            addedAt: '2026-09-21T11:20:00Z',
          },
          {
            id: 'ref-deco-04',
            name: 'إكليل الغار والنجمة',
            url: sampleDecorationSvg,
            role: 'Decoration Reference',
            isLocked: false,
            notes: 'عنصر زخرفي في الأعلى.',
            tags: ['decoration', 'tassel'],
            order: 3,
            addedAt: '2026-09-22T14:25:00Z',
          },
        ],
        generatedResults: [
          {
            id: 'gen-res-01',
            promptId: 'prompt-grad-01',
            promptVersion: 3,
            url: sampleGraduationOutputSvg,
            model: 'gemini-3.1-flash-lite-image',
            settings: {
              model: 'gemini-3.1-flash-lite-image',
              aspectRatio: '3:4',
              resolution: '2K',
              numberOfImages: 3,
              style: 'Cinematic High Luxury Photo',
            },
            createdAt: '2026-09-22T14:32:00Z',
            isFavorite: true,
            notes: 'أفضل نتيجة تم اعتمادها للمقاس 30×40 سم',
            referenceSummary: '4 References (Person Locked 🔒, Emerald Background, Gold Frame, Star Laurel)',
            aspectRatio: '3:4',
            width: 800,
            height: 1066,
          },
        ],
        versions: [
          {
            id: 'ver-1',
            promptId: 'prompt-grad-01',
            versionNumber: 1,
            text: 'A luxury graduation design for a young graduate in black gown with golden stole, dark background.',
            negativePrompt: 'blurry, low quality',
            references: [
              {
                id: 'ref-person-01',
                name: 'صورة الخريج الأصلية',
                url: sampleGraduationPersonSvg,
                role: 'Main Subject',
                isLocked: true,
                order: 0,
                addedAt: '2026-09-20T10:15:00Z',
              },
            ],
            settings: {
              model: 'gemini-3.1-flash-lite-image',
              aspectRatio: '3:4',
              resolution: '1K',
              numberOfImages: 1,
              style: 'Photo',
            },
            generatedResults: [],
            createdAt: '2026-09-20T10:15:00Z',
            notes: 'المسودة الأولى بدون إطارات أو تفاصيل رخامية',
          },
          {
            id: 'ver-2',
            promptId: 'prompt-grad-01',
            versionNumber: 2,
            text: 'A luxury graduation design with locked graduate person, deep emerald marble background, and golden ornate frame borders.',
            negativePrompt: 'blurry, bad anatomy, deformed',
            references: [
              {
                id: 'ref-person-01',
                name: 'صورة الخريج الأصلية',
                url: sampleGraduationPersonSvg,
                role: 'Main Subject',
                isLocked: true,
                order: 0,
                addedAt: '2026-09-20T10:15:00Z',
              },
              {
                id: 'ref-bg-02',
                name: 'الخلفية الرخامية الزمردية',
                url: sampleBackgroundSvg,
                role: 'Background Reference',
                isLocked: false,
                order: 1,
                addedAt: '2026-09-20T10:16:00Z',
              },
              {
                id: 'ref-frame-03',
                name: 'الإطار الملكي الذهبي',
                url: sampleFrameSvg,
                role: 'Frame Reference',
                isLocked: false,
                order: 2,
                addedAt: '2026-09-21T11:20:00Z',
              },
            ],
            settings: {
              model: 'gemini-3.1-flash-lite-image',
              aspectRatio: '3:4',
              resolution: '1K',
              numberOfImages: 2,
              style: 'Cinematic High Luxury Photo',
            },
            generatedResults: [],
            createdAt: '2026-09-21T11:25:00Z',
            notes: 'إضافة الإطار الذهبي وخلفية الرخام',
          },
          {
            id: 'ver-3',
            promptId: 'prompt-grad-01',
            versionNumber: 3,
            text: 'A high-end luxury graduation design featuring the locked graduate in academic gown and cap, framed with ornate baroque gold filigree, against a deep emerald green marble backdrop with delicate gold veins. Soft rim lighting, Hasselblad 100mm portrait camera, cinematic composition, ultra sharp details, 8k quality.',
            negativePrompt: 'blurry, distorted facial features, changing face identity, low resolution, cheap plastic, oversaturated cartoon, watermark',
            references: [
              {
                id: 'ref-person-01',
                name: 'صورة الخريج الأصلية (احمد)',
                url: sampleGraduationPersonSvg,
                role: 'Main Subject',
                isLocked: true,
                order: 0,
                addedAt: '2026-09-20T10:15:00Z',
              },
              {
                id: 'ref-bg-02',
                name: 'الخلفية الرخامية الزمردية',
                url: sampleBackgroundSvg,
                role: 'Background Reference',
                isLocked: false,
                order: 1,
                addedAt: '2026-09-20T10:16:00Z',
              },
              {
                id: 'ref-frame-03',
                name: 'الإطار الملكي الذهبي',
                url: sampleFrameSvg,
                role: 'Frame Reference',
                isLocked: false,
                order: 2,
                addedAt: '2026-09-21T11:20:00Z',
              },
              {
                id: 'ref-deco-04',
                name: 'إكليل الغار والنجمة',
                url: sampleDecorationSvg,
                role: 'Decoration Reference',
                isLocked: false,
                order: 3,
                addedAt: '2026-09-22T14:25:00Z',
              },
            ],
            settings: {
              model: 'gemini-3.1-flash-lite-image',
              aspectRatio: '3:4',
              resolution: '2K',
              numberOfImages: 3,
              style: 'Cinematic High Luxury Photo',
            },
            generatedResults: [],
            createdAt: '2026-09-22T14:30:00Z',
            notes: 'تحديث بالذكاء الاصطناعي لاستيعاب الزخارف والتفاصيل بدقة عالية',
          },
        ],
      },
    ],
  },
  {
    id: 'proj-wedding-gold',
    name: 'ألبوم زفاف ملكي ذهبي (Royal Wedding)',
    description: 'تصميم كتاب زفاف فاخر بالأبيض العاجي والذهب مع تجهيز للطباعة المخملية',
    createdAt: '2026-09-15T09:00:00Z',
    updatedAt: '2026-09-24T18:00:00Z',
    isFavorite: false,
    tags: ['wedding', 'gold', 'white', 'luxury', 'album'],
    status: 'completed',
    canvasWidth: 3543,
    canvasHeight: 3543, // Square 30x30 cm
    originalImages: [sampleBackgroundSvg],
    laserSettings: {
      threshold: 140,
      simplify: 2,
      smooth: true,
      closePaths: true,
      removeTinyDetails: true,
      detectOpenPaths: false,
      invert: false,
      lineColor: '#ef4444',
      fillMode: 'engrave',
    },
    printSettings: {
      widthCm: 30,
      heightCm: 30,
      dpi: 300,
      colorMode: 'CMYK',
      bleedMm: 3,
      safeAreaMm: 5,
      paperType: 'Cardstock',
    },
    history: [],
    assets: [],
    layers: [],
    prompts: [],
  },
];

export const studioTemplates = [
  {
    id: 'tpl-grad-30x40',
    title: 'تخرج ملكي 30×40 سم (7 صور)',
    category: 'Graduation',
    size: '30 × 40 cm',
    photosCount: 7,
    description: 'توزيع كولاج احترافي بـ 7 إطارات مختلفة الأحجام، صورة رئيسية بارزة، وعناصر ذهبية فاخرة',
    thumbnail: sampleGraduationOutputSvg,
    tags: ['graduation', '30x40', '7-photos', 'gold'],
  },
  {
    id: 'tpl-wedding-luxury',
    title: 'زفاف كلاسيكي عاجي وذهب',
    category: 'Wedding',
    size: '30 × 30 cm',
    photosCount: 5,
    description: 'ألبوم زفاف رومنسي بألوان العاج والذهب ولمسات زهرية خفيفة',
    thumbnail: sampleFrameSvg,
    tags: ['wedding', 'gold', 'album'],
  },
  {
    id: 'tpl-ramadan-crecent',
    title: 'رمضان كريم وهلال ذهبي',
    category: 'Ramadan',
    size: '20 × 30 cm',
    photosCount: 3,
    description: 'تصميم إسلامي بزخارف إسلامية وهلال مخصص للقص بالليزر على الخشب',
    thumbnail: sampleDecorationSvg,
    tags: ['ramadan', 'laser', 'islamic'],
  },
  {
    id: 'tpl-laser-box',
    title: 'علبة خشب منقوشة بالليزر',
    category: 'Laser',
    size: '15 × 20 cm',
    photosCount: 1,
    description: 'جاهز لبرامج القص بالليزر DXF وSVG بخطوط متصلة بدون تقاطعات تالفة',
    thumbnail: sampleFrameSvg,
    tags: ['laser', 'dxf', 'wood'],
  },
];
