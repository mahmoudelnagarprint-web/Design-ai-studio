import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStudio } from '../../context/StudioContext';
import { generateAiImage } from '../../services/api';
import {
  LayoutGrid,
  Sparkles,
  Sliders,
  CheckCircle2,
  Download,
  Plus,
  RefreshCw,
  Printer,
  Upload,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Lock,
  Unlock,
  Trash2,
  Type,
  Palette,
  Smile,
  Image as ImageIcon,
  Wand2,
  ArrowLeftRight,
  Layers,
  Eye,
  Scissors,
  Maximize2,
  Check,
  Loader2,
  Copy,
  Sparkle,
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES FOR 2028 AI PHOTO COLLAGE STUDIO
// ============================================================================

export type SlotShape = 'rect' | 'circle' | 'arch' | 'hexagon' | 'diamond' | 'polaroid';
export type LayoutCategory = 'all' | 'bento' | 'royal' | 'editorial' | 'geometric' | 'classic';
export type PhotoFilterType = 'none' | 'luxury-warm' | 'cinematic' | 'crisp' | 'bw' | 'vintage-gold' | 'vivid';
export type TextEffectType = 'gold-foil' | 'soft-glow' | 'ribbon-badge' | 'glass-pill' | 'outline' | 'clean-shadow';

export interface LayoutSlotDef {
  x: number; // percentage 0..100
  y: number; // percentage 0..100
  w: number; // percentage 0..100
  h: number; // percentage 0..100
  shape?: SlotShape;
  tilt?: number; // degrees for polaroid/scatter
  isHero?: boolean;
  zIndex?: number;
}

export interface CollageLayoutPreset {
  id: string;
  nameAr: string;
  nameEn: string;
  category: Exclude<LayoutCategory, 'all'>;
  photoCount: number;
  badge?: string;
  slots: LayoutSlotDef[];
}

export interface CollagePhotoSlotState {
  id: string;
  imageUrl: string;
  label: string;
  panX: number; // -100 to 100
  panY: number; // -100 to 100
  zoom: number; // 0.5 to 3
  rotation: number; // -180 to 180
  flipX: boolean;
  flipY: boolean;
  filter: PhotoFilterType;
  isLocked: boolean;
  caption?: string;
  customShape?: SlotShape;
}

export interface CollageOverlayItem {
  id: string;
  type: 'text' | 'sticker';
  content: string;
  subContent?: string;
  x: number; // percentage 0..100
  y: number; // percentage 0..100
  fontSize: number; // px base at 600px stage
  fontFamily: string;
  color: string;
  accentColor?: string;
  effect: TextEffectType;
  rotation: number;
  scale: number;
  opacity: number;
}

export interface BackgroundPreset {
  id: string;
  nameAr: string;
  nameEn: string;
  cssGradient: string;
  stops: [string, string, string];
  borderDefault: string;
  accentText: string;
}

// ============================================================================
// CURATED 2028 BACKGROUNDS, FONTS, STICKERS & LAYOUT GENERATORS
// ============================================================================

const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'royal-emerald',
    nameAr: 'زمردي ملكي وذهبي',
    nameEn: 'Royal Emerald & Gold',
    cssGradient: 'radial-gradient(circle at 50% 35%, #16382c 0%, #091c15 60%, #020906 100%)',
    stops: ['#16382c', '#091c15', '#020906'],
    borderDefault: '#d4af37',
    accentText: '#fde047',
  },
  {
    id: 'obsidian-champagne',
    nameAr: 'أوبسيديان وشامبانيا',
    nameEn: 'Obsidian & Champagne',
    cssGradient: 'radial-gradient(circle at 50% 30%, #27272a 0%, #111113 60%, #050507 100%)',
    stops: ['#27272a', '#111113', '#050507'],
    borderDefault: '#f59e0b',
    accentText: '#fef08a',
  },
  {
    id: 'midnight-sapphire',
    nameAr: 'ياقوتي منتصف الليل',
    nameEn: 'Midnight Sapphire',
    cssGradient: 'radial-gradient(circle at 50% 30%, #1e3a8a 0%, #0f172a 65%, #020617 100%)',
    stops: ['#1e3a8a', '#0f172a', '#020617'],
    borderDefault: '#38bdf8',
    accentText: '#e0f2fe',
  },
  {
    id: 'velvet-burgundy',
    nameAr: 'عنابي مخملي وروز جولد',
    nameEn: 'Velvet Burgundy',
    cssGradient: 'radial-gradient(circle at 50% 35%, #4c0519 0%, #27030d 65%, #0f0206 100%)',
    stops: ['#4c0519', '#27030d', '#0f0206'],
    borderDefault: '#fbbf24',
    accentText: '#fde68a',
  },
  {
    id: 'neo-aurora-2028',
    nameAr: 'أورورا 2028 الزجاجي',
    nameEn: 'Neo Aurora 2028',
    cssGradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #042f2e 100%)',
    stops: ['#0f172a', '#1e1b4b', '#042f2e'],
    borderDefault: '#2dd4bf',
    accentText: '#99f6e4',
  },
  {
    id: 'desert-bronze',
    nameAr: 'رمال الصحراء والبرونز',
    nameEn: 'Desert Bronze',
    cssGradient: 'radial-gradient(circle at 50% 35%, #451a03 0%, #291002 65%, #120601 100%)',
    stops: ['#451a03', '#291002', '#120601'],
    borderDefault: '#f59e0b',
    accentText: '#fed7aa',
  },
  {
    id: 'editorial-ivory',
    nameAr: 'عاجي المجلات الفاخرة',
    nameEn: 'Editorial Ivory',
    cssGradient: 'radial-gradient(circle at 50% 35%, #fafaf9 0%, #f5f5f4 65%, #e7e5e4 100%)',
    stops: ['#fafaf9', '#f5f5f4', '#e7e5e4'],
    borderDefault: '#1c1917',
    accentText: '#1c1917',
  },
  {
    id: 'royal-amethyst',
    nameAr: 'أماثيست ملكي فاخر',
    nameEn: 'Royal Amethyst',
    cssGradient: 'radial-gradient(circle at 50% 35%, #3b0764 0%, #1e0536 65%, #090112 100%)',
    stops: ['#3b0764', '#1e0536', '#090112'],
    borderDefault: '#e879f9',
    accentText: '#f5d0fe',
  },
  {
    id: 'pastel-blossom',
    nameAr: 'باستيل عائلي ناعم',
    nameEn: 'Soft Pastel Blossom',
    cssGradient: 'linear-gradient(135deg, #fdf2f8 0%, #f0f9ff 50%, #fefce8 100%)',
    stops: ['#fdf2f8', '#f0f9ff', '#fefce8'],
    borderDefault: '#f472b6',
    accentText: '#831843',
  },
  {
    id: 'carbon-matte',
    nameAr: 'كربون أسود مطفي',
    nameEn: 'Carbon Matte Studio',
    cssGradient: 'radial-gradient(circle at 50% 50%, #18181b 0%, #09090b 70%, #000000 100%)',
    stops: ['#18181b', '#09090b', '#000000'],
    borderDefault: '#a1a1aa',
    accentText: '#f4f4f5',
  },
];

const SURFACE_PATTERNS = [
  { id: 'none', nameAr: 'بدون نقش', nameEn: 'Clean Smooth' },
  { id: 'luxury-frame', nameAr: 'إطار ملكي مزدوج', nameEn: 'Double Royal Border' },
  { id: 'arabesque-corners', nameAr: 'زوايا هندسية ذهبية', nameEn: 'Gold Corner Ornaments' },
  { id: 'architectural-grid', nameAr: 'شبكة هندسية 2028', nameEn: '2028 Tech Grid' },
  { id: 'subtle-dots', nameAr: 'نقاط استوديو دقيقة', nameEn: 'Studio Polka Matrix' },
  { id: 'spotlight-rays', nameAr: 'إضاءة مسرحية علوية', nameEn: 'Stage Spotlight' },
];

const FONT_LIBRARY = [
  { id: 'Cairo', name: 'Cairo • القاهرة (عصري)', sample: 'تصميم كولاج ٢٠٢٨' },
  { id: 'Amiri', name: 'Amiri • أميري (ملكي كلاسيكي)', sample: 'مبروك التخرج والتميز' },
  { id: 'Tajawal', name: 'Tajawal • تجوال (ناعم وحديث)', sample: 'ذكريات لا تُنسى' },
  { id: 'Changa', name: 'Changa • تشانجا (عريض إعلاني)', sample: 'دفعة ٢٠٢٨ المميزة' },
  { id: 'Readex Pro', name: 'Readex Pro • ريدكس (هندسي)', sample: 'استوديو النجار الذكي' },
  { id: 'Playfair Display', name: 'Playfair Display (Luxury Serif)', sample: 'CLASS OF 2028' },
  { id: 'Cinzel', name: 'Cinzel (Royal Engraved)', sample: 'EXCELLENCE & HONOR' },
  { id: 'Outfit', name: 'Outfit (2028 Geometric)', sample: 'MODERN STUDIO' },
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta (Editorial)', sample: 'CREATIVE EDITION' },
  { id: 'JetBrains Mono', name: 'JetBrains Mono (Tech)', sample: '30×40 CM • 300 DPI' },
];

const STICKER_CATEGORIES = [
  {
    id: 'graduation',
    nameAr: 'تخرج ونجاح',
    nameEn: 'Graduation & Honor',
    items: [
      { icon: '🎓', label: 'قبعة تخرج' },
      { icon: '📜', label: 'وثيقة شرف' },
      { icon: '🏆', label: 'كأس التفوق' },
      { icon: '👑', label: 'تاج ملكي' },
      { icon: '🎖️', label: 'وسام التميز' },
      { icon: '⭐', label: 'نجمة ذهبية' },
      { icon: '✨', label: 'بريق لامع' },
      { icon: '🌟', label: 'نجمة شرف' },
      { icon: 'CLASS OF 2026', label: 'شعار دفعة 2026' },
      { icon: 'CLASS OF 2028', label: 'شعار دفعة 2028' },
      { icon: 'مبروك التخرج 🎓', label: 'تهنئة تخرج' },
      { icon: 'مرتبة الشرف الأولى ⭐', label: 'وسام الشرف' },
    ],
  },
  {
    id: 'events',
    nameAr: 'مناسبات وعائلة',
    nameEn: 'Events & Family',
    items: [
      { icon: '❤️', label: 'قلب أحمر' },
      { icon: '💛', label: 'قلب ذهبي' },
      { icon: '💍', label: 'خاتم زفاف' },
      { icon: '🌹', label: 'وردة جورية' },
      { icon: '💐', label: 'بوكيه ورد' },
      { icon: '🎉', label: 'احتفال' },
      { icon: '🎂', label: 'عيد ميلاد' },
      { icon: '🕊️', label: 'حمامة سلام' },
      { icon: '📸', label: 'كاميرا ذكريات' },
      { icon: 'أجمل الذكريات ❤️', label: 'عبارة ذكريات' },
      { icon: 'ألف مبروك 💍', label: 'تهنئة زفاف' },
      { icon: 'HAPPY MOMENTS ✨', label: 'لحظات سعيدة' },
    ],
  },
  {
    id: 'commercial',
    nameAr: 'دعاية وإعلان',
    nameEn: 'Promo & Badges',
    items: [
      { icon: '💎 VIP', label: 'شارة VIP' },
      { icon: '🔥 عرض خاص', label: 'عرض خاص' },
      { icon: '⚡ NEW 2028', label: 'جديد 2028' },
      { icon: '✅ 100% ORIGINAL', label: 'أصلي 100%' },
      { icon: '🏷️ خصم حصري', label: 'خصم حصري' },
      { icon: '🌟 BEST SELLER', label: 'الأكثر مبيعاً' },
      { icon: '👑 LUXURY EDITION', label: 'إصدار فاخر' },
      { icon: '🎯 LIMITED', label: 'كمية محدودة' },
    ],
  },
];

const ASPECT_PRESETS = [
  { id: '30x40', nameAr: '30×40 سم (بورتريه تخرج)', wCm: 30, hCm: 40, ratio: '3/4' },
  { id: '40x30', nameAr: '40×30 سم (أفقي عريض)', wCm: 40, hCm: 30, ratio: '4/3' },
  { id: '30x30', nameAr: '30×30 سم (مربع 1:1)', wCm: 30, hCm: 30, ratio: '1/1' },
  { id: '20x30', nameAr: '20×30 سم (A4 بورتريه)', wCm: 20, hCm: 30, ratio: '2/3' },
  { id: '50x70', nameAr: '50×70 سم (بوستر كبير)', wCm: 50, hCm: 70, ratio: '5/7' },
  { id: 'story', nameAr: 'ستوري ريلز (9:16)', wCm: 27, hCm: 48, ratio: '9/16' },
];

const PHOTO_FILTERS: { id: PhotoFilterType; nameAr: string; css: string }[] = [
  { id: 'none', nameAr: 'طبيعي (Original)', css: 'none' },
  { id: 'luxury-warm', nameAr: 'ذهبي دافئ (Luxury Warm)', css: 'contrast(1.08) saturate(1.18) sepia(0.12)' },
  { id: 'cinematic', nameAr: 'سينمائي 2028 (Cinematic)', css: 'contrast(1.16) saturate(0.92) brightness(1.02)' },
  { id: 'crisp', nameAr: 'بورتريه نقي (Crisp HD)', css: 'contrast(1.12) brightness(1.05) saturate(1.1)' },
  { id: 'bw', nameAr: 'أبيض وأسود فخم (B&W)', css: 'grayscale(1) contrast(1.2)' },
  { id: 'vintage-gold', nameAr: 'كلاسيك ملكي (Vintage)', css: 'sepia(0.35) contrast(1.1) brightness(0.98)' },
  { id: 'vivid', nameAr: 'ألوان غنية (Vivid Pop)', css: 'saturate(1.4) contrast(1.08)' },
];

// ============================================================================
// DYNAMIC & CURATED 2028 LAYOUT ENGINE (SUPPORTS 2 TO 16 PHOTOS)
// ============================================================================

function generateLayoutsForPhotoCount(count: number): CollageLayoutPreset[] {
  const layouts: CollageLayoutPreset[] = [];

  // 1. BENTO HERO CENTER / SPOTLIGHT (Hero in center or top, surrounded by auxiliary slots)
  const buildSpotlightSlots = (): LayoutSlotDef[] => {
    if (count === 2) {
      return [
        { x: 4, y: 12, w: 54, h: 74, shape: 'rect', isHero: true },
        { x: 60, y: 20, w: 36, h: 58, shape: 'rect' },
      ];
    }
    if (count === 3) {
      return [
        { x: 4, y: 12, w: 56, h: 74, shape: 'rect', isHero: true },
        { x: 62, y: 12, w: 34, h: 36, shape: 'rect' },
        { x: 62, y: 50, w: 34, h: 36, shape: 'rect' },
      ];
    }
    if (count === 4) {
      return [
        { x: 4, y: 12, w: 58, h: 52, shape: 'rect', isHero: true },
        { x: 64, y: 12, w: 32, h: 52, shape: 'rect' },
        { x: 4, y: 66, w: 45, h: 22, shape: 'rect' },
        { x: 51, y: 66, w: 45, h: 22, shape: 'rect' },
      ];
    }
    if (count === 5) {
      return [
        { x: 20, y: 14, w: 60, h: 48, shape: 'rect', isHero: true },
        { x: 4, y: 14, w: 14, h: 48, shape: 'rect' },
        { x: 82, y: 14, w: 14, h: 48, shape: 'rect' },
        { x: 10, y: 64, w: 38, h: 22, shape: 'rect' },
        { x: 52, y: 64, w: 38, h: 22, shape: 'rect' },
      ];
    }
    if (count === 7) {
      // Iconic Graduation 7-Photo Royal Layout
      return [
        { x: 24, y: 13, w: 52, h: 48, shape: 'rect', isHero: true },
        { x: 4, y: 15, w: 18, h: 22, shape: 'rect' },
        { x: 4, y: 39, w: 18, h: 22, shape: 'rect' },
        { x: 78, y: 15, w: 18, h: 22, shape: 'rect' },
        { x: 78, y: 39, w: 18, h: 22, shape: 'rect' },
        { x: 8, y: 63, w: 40, h: 23, shape: 'rect' },
        { x: 52, y: 63, w: 40, h: 23, shape: 'rect' },
      ];
    }
    // General N-photo Spotlight Bento (Hero + surrounding slots)
    const slots: LayoutSlotDef[] = [
      { x: 24, y: 13, w: 52, h: 46, shape: 'rect', isHero: true },
    ];
    const remaining = count - 1;
    const leftCount = Math.floor(remaining / 3);
    const rightCount = Math.floor(remaining / 3);
    const bottomCount = remaining - leftCount - rightCount;

    for (let i = 0; i < leftCount; i++) {
      const h = 46 / leftCount - 1.5;
      slots.push({ x: 4, y: 13 + i * (h + 1.5), w: 18, h, shape: 'rect' });
    }
    for (let i = 0; i < rightCount; i++) {
      const h = 46 / rightCount - 1.5;
      slots.push({ x: 78, y: 13 + i * (h + 1.5), w: 18, h, shape: 'rect' });
    }
    for (let i = 0; i < bottomCount; i++) {
      const w = 92 / bottomCount - 1.5;
      slots.push({ x: 4 + i * (w + 1.5), y: 61, w, h: 25, shape: 'rect' });
    }
    return slots;
  };

  // 2. ROYAL ARCH & GEOMETRIC LUXURY
  const buildRoyalArchSlots = (): LayoutSlotDef[] => {
    const base = buildSpotlightSlots();
    return base.map((s, idx) => ({
      ...s,
      shape: idx === 0 ? 'arch' : idx % 2 === 1 ? 'circle' : 'rect',
    }));
  };

  // 3. 2028 ASYMMETRIC BENTO MASONRY
  const buildAsymmetricBento = (): LayoutSlotDef[] => {
    const slots: LayoutSlotDef[] = [];
    // Top-left hero
    slots.push({ x: 4, y: 13, w: 56, h: 46, shape: 'rect', isHero: true });
    const rem = count - 1;
    const rightCol = Math.max(1, Math.min(3, Math.ceil(rem / 2)));
    const bottomRow = rem - rightCol;

    for (let i = 0; i < rightCol; i++) {
      const h = (46 - (rightCol - 1) * 2) / rightCol;
      slots.push({ x: 62, y: 13 + i * (h + 2), w: 34, h, shape: 'rect' });
    }
    if (bottomRow > 0) {
      for (let i = 0; i < bottomRow; i++) {
        const w = (92 - (bottomRow - 1) * 2) / bottomRow;
        slots.push({ x: 4 + i * (w + 2), y: 61, w, h: 25, shape: 'rect' });
      }
    }
    return slots;
  };

  // 4. POLAROID SCATTER STUDIO (2028 Editorial Tilt)
  const buildPolaroidScatter = (): LayoutSlotDef[] => {
    const base = buildSpotlightSlots();
    const tilts = [0, -5, 4, 5, -4, -3, 3, -6, 6, -4, 4, -3, 5, -5, 3, -2];
    return base.map((s, idx) => ({
      ...s,
      shape: 'polaroid',
      tilt: idx === 0 ? 0 : tilts[idx % tilts.length],
    }));
  };

  // 5. HONEYCOMB / DIAMOND GEOMETRIC
  const buildGeometricMatrix = (): LayoutSlotDef[] => {
    const base = buildSpotlightSlots();
    return base.map((s, idx) => ({
      ...s,
      shape: idx === 0 ? 'hexagon' : idx % 2 === 0 ? 'hexagon' : 'circle',
    }));
  };

  // 6. EVEN ARCHITECTURAL GRID
  const buildUniformGrid = (): LayoutSlotDef[] => {
    const cols = count <= 2 ? 2 : count <= 4 ? 2 : count <= 6 ? 3 : count <= 9 ? 3 : 4;
    const rows = Math.ceil(count / cols);
    const totalW = 92;
    const totalH = 73;
    const gap = 2;
    const cellW = (totalW - (cols - 1) * gap) / cols;
    const cellH = (totalH - (rows - 1) * gap) / rows;
    const slots: LayoutSlotDef[] = [];

    for (let i = 0; i < count; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      slots.push({
        x: 4 + c * (cellW + gap),
        y: 13 + r * (cellH + gap),
        w: cellW,
        h: cellH,
        shape: 'rect',
        isHero: i === 0,
      });
    }
    return slots;
  };

  // 7. CIRCULAR ORBIT SPOTLIGHT
  const buildCircularOrbit = (): LayoutSlotDef[] => {
    const slots: LayoutSlotDef[] = [
      { x: 26, y: 24, w: 48, h: 44, shape: 'circle', isHero: true },
    ];
    const rem = count - 1;
    const radiusX = 36;
    const radiusY = 30;
    for (let i = 0; i < rem; i++) {
      const angle = (i / rem) * Math.PI * 2 - Math.PI / 2;
      const cx = 50 + Math.cos(angle) * radiusX;
      const cy = 48 + Math.sin(angle) * radiusY;
      const size = rem <= 6 ? 19 : 15;
      slots.push({
        x: Math.max(3, Math.min(97 - size, cx - size / 2)),
        y: Math.max(12, Math.min(86 - size, cy - size / 2)),
        w: size,
        h: size,
        shape: 'circle',
      });
    }
    return slots;
  };

  layouts.push(
    {
      id: `spotlight-royal-${count}`,
      nameAr: `التوزيع الملكي الذكي (${count} صور)`,
      nameEn: `Royal Center Spotlight (${count})`,
      category: 'royal',
      photoCount: count,
      badge: '2028 VIP',
      slots: buildSpotlightSlots(),
    },
    {
      id: `bento-asymmetric-${count}`,
      nameAr: `بينتو 2028 غير متماثل (${count} صور)`,
      nameEn: `2028 Bento Studio (${count})`,
      category: 'bento',
      photoCount: count,
      badge: 'TREND',
      slots: buildAsymmetricBento(),
    },
    {
      id: `royal-arch-${count}`,
      nameAr: `أقواس ودوائر ملكية (${count} صور)`,
      nameEn: `Luxury Arch & Circles (${count})`,
      category: 'royal',
      photoCount: count,
      slots: buildRoyalArchSlots(),
    },
    {
      id: `polaroid-scatter-${count}`,
      nameAr: `بولارويد ومجلات حرة (${count} صور)`,
      nameEn: `Editorial Polaroid (${count})`,
      category: 'editorial',
      photoCount: count,
      slots: buildPolaroidScatter(),
    },
    {
      id: `geometric-hex-${count}`,
      nameAr: `خلية سداسية هندسية (${count} صور)`,
      nameEn: `Hexagon Matrix (${count})`,
      category: 'geometric',
      photoCount: count,
      slots: buildGeometricMatrix(),
    },
    {
      id: `circular-orbit-${count}`,
      nameAr: `المدار الدائري المتمركز (${count} صور)`,
      nameEn: `Circular Orbit (${count})`,
      category: 'geometric',
      photoCount: count,
      slots: buildCircularOrbit(),
    },
    {
      id: `uniform-grid-${count}`,
      nameAr: `الشبكة الهندسية المتوازنة (${count} صور)`,
      nameEn: `Balanced Studio Grid (${count})`,
      category: 'classic',
      photoCount: count,
      slots: buildUniformGrid(),
    }
  );

  return layouts;
}

// ============================================================================
// SAMPLE STUDIO PORTRAITS & PLACEHOLDERS (SVG DATA URLS - ZERO BROKEN IMAGES)
// ============================================================================

function createSampleSvgPortrait(index: number, title: string, accent: string): string {
  const palettes = [
    ['#0f172a', '#1e293b', '#f59e0b'],
    ['#064e3b', '#047857', '#fde047'],
    ['#31102f', '#701a75', '#f472b6'],
    ['#1e1b4b', '#312e81', '#38bdf8'],
    ['#451a03', '#78350f', '#fbbf24'],
    ['#18181b', '#27272a', '#a1a1aa'],
    ['#0c4a6e', '#0369a1', '#7dd3fc'],
  ];
  const [bg1, bg2, ring] = palettes[index % palettes.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
    <defs>
      <linearGradient id="g${index}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </linearGradient>
    </defs>
    <rect width="600" height="750" fill="url(#g${index})"/>
    <circle cx="300" cy="280" r="145" fill="none" stroke="${ring}" stroke-width="3" opacity="0.35"/>
    <circle cx="300" cy="260" r="82" fill="${ring}" opacity="0.85"/>
    <path d="M155 590 C155 445 445 445 445 590 Z" fill="${ring}" opacity="0.75"/>
    <rect x="60" y="630" width="480" height="64" rx="14" fill="#000000" opacity="0.45"/>
    <text x="300" y="670" font-family="Cairo, sans-serif" font-size="26" font-weight="bold" fill="#ffffff" text-anchor="middle">${title}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ============================================================================
// MAIN COMPONENT: 2028 AI PHOTO COLLAGE STUDIO
// ============================================================================

export const CollageStudioView: React.FC = () => {
  const {
    activeProject,
    addGenerationResult,
    sendImageToTool,
    setCurrentView,
    settings,
  } = useStudio();
  const isAr = settings.language === 'ar';

  // --- Studio Sidebar Tab ---
  const [activeToolTab, setActiveToolTab] = useState<
    'layouts' | 'photos' | 'backgrounds' | 'text' | 'stickers' | 'ai'
  >('layouts');

  // --- Dimensions & Aspect Ratio ---
  const [selectedAspectId, setSelectedAspectId] = useState<string>('30x40');
  const [canvasWidthCm, setCanvasWidthCm] = useState<number>(30);
  const [canvasHeightCm, setCanvasHeightCm] = useState<number>(40);

  // --- Layout & Grid Geometry ---
  const [numPhotos, setNumPhotos] = useState<number>(7);
  const [layoutCategory, setLayoutCategory] = useState<LayoutCategory>('all');
  const [activeLayoutId, setActiveLayoutId] = useState<string>('spotlight-royal-7');
  const [slotGap, setSlotGap] = useState<number>(6); // px in preview
  const [outerMargin, setOuterMargin] = useState<number>(20); // px in preview
  const [cornerRadius, setCornerRadius] = useState<number>(14); // px
  const [borderWidth, setBorderWidth] = useState<number>(2); // px
  const [borderColor, setBorderColor] = useState<string>('#d4af37');
  const [doubleGoldBorder, setDoubleGoldBorder] = useState<boolean>(true);

  // --- Background & Surface ---
  const [selectedBgPreset, setSelectedBgPreset] = useState<BackgroundPreset>(BACKGROUND_PRESETS[0]);
  const [customBgImageUrl, setCustomBgImageUrl] = useState<string | null>(null);
  const [surfacePattern, setSurfacePattern] = useState<string>('luxury-frame');

  // --- Photo Slots State (Up to 16 preserved slots) ---
  const [photoSlots, setPhotoSlots] = useState<CollagePhotoSlotState[]>(() => {
    const existingRefs = activeProject?.prompts?.[0]?.references || [];
    const defaultLabels = [
      'الصورة الرئيسية 🔒',
      'صورة التخرج ٢',
      'صورة تذكارية ٣',
      'صورة الأساتذة ٤',
      'صورة الأصدقاء ٥',
      'صورة العائلة ٦',
      'لحظة التكريم ٧',
      'صورة الحفل ٨',
      'صورة الكلية ٩',
      'صورة ١٠',
      'صورة ١١',
      'صورة ١٢',
      'صورة ١٣',
      'صورة ١٤',
      'صورة ١٥',
      'صورة ١٦',
    ];
    return Array.from({ length: 16 }, (_, idx) => ({
      id: `slot-${idx}`,
      imageUrl:
        existingRefs[idx]?.url ||
        (idx === 0 && activeProject?.originalImages?.[0]) ||
        createSampleSvgPortrait(idx, defaultLabels[idx], '#d4af37'),
      label: defaultLabels[idx],
      panX: 0,
      panY: 0,
      zoom: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
      filter: 'none',
      isLocked: idx === 0,
      caption: idx === 0 ? 'الخريج الأساسي' : '',
    }));
  });

  // --- Selected Slot & Interactive Drag State ---
  const [selectedSlotIdx, setSelectedSlotIdx] = useState<number>(0);
  const [swapSourceIdx, setSwapSourceIdx] = useState<number | null>(null);
  const [isDraggingPan, setIsDraggingPan] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number; initialPanX: number; initialPanY: number } | null>(null);

  // --- Free Overlays (Text & Stickers) ---
  const [overlays, setOverlays] = useState<CollageOverlayItem[]>([
    {
      id: 'txt-header',
      type: 'text',
      content: 'مبروك التخرج ٢٠٢٦',
      subContent: 'CLASS OF 2026 • ROYAL EDITION',
      x: 50,
      y: 6.5,
      fontSize: 26,
      fontFamily: 'Amiri',
      color: '#fde047',
      accentColor: '#d4af37',
      effect: 'gold-foil',
      rotation: 0,
      scale: 1,
      opacity: 1,
    },
    {
      id: 'txt-footer',
      type: 'text',
      content: 'المهندس / أحمد النجار',
      subContent: 'جامعة القاهرة • كلية الهندسة • مرتبة الشرف',
      x: 50,
      y: 92,
      fontSize: 18,
      fontFamily: 'Cairo',
      color: '#fde047',
      accentColor: '#d4af37',
      effect: 'ribbon-badge',
      rotation: 0,
      scale: 1,
      opacity: 1,
    },
    {
      id: 'stk-1',
      type: 'sticker',
      content: '🎓',
      x: 14,
      y: 6.5,
      fontSize: 28,
      fontFamily: 'Cairo',
      color: '#fde047',
      effect: 'soft-glow',
      rotation: -12,
      scale: 1,
      opacity: 1,
    },
  ]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [draggingOverlayId, setDraggingOverlayId] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // --- New Text Input State ---
  const [newTextValue, setNewTextValue] = useState<string>('');
  const [newTextSubValue, setNewTextSubValue] = useState<string>('');
  const [selectedFontFamily, setSelectedFontFamily] = useState<string>('Cairo');
  const [selectedTextEffect, setSelectedTextEffect] = useState<TextEffectType>('gold-foil');
  const [selectedTextColor, setSelectedTextColor] = useState<string>('#fde047');

  // --- AI Generation State ---
  const [aiSlotPrompt, setAiSlotPrompt] = useState<string>('');
  const [aiBgPrompt, setAiBgPrompt] = useState<string>('');
  const [isGeneratingAiSlot, setIsGeneratingAiSlot] = useState<boolean>(false);
  const [isGeneratingAiBg, setIsGeneratingAiBg] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // File Input Refs
  const singleSlotFileRef = useRef<HTMLInputElement | null>(null);
  const batchUploadFileRef = useRef<HTMLInputElement | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  // --- Compute Available Layouts for Current Photo Count ---
  const availableLayouts = React.useMemo(() => {
    return generateLayoutsForPhotoCount(numPhotos);
  }, [numPhotos]);

  const filteredLayouts = React.useMemo(() => {
    if (layoutCategory === 'all') return availableLayouts;
    return availableLayouts.filter((l) => l.category === layoutCategory);
  }, [availableLayouts, layoutCategory]);

  const activeLayout: CollageLayoutPreset = React.useMemo(() => {
    return (
      availableLayouts.find((l) => l.id === activeLayoutId) ||
      availableLayouts[0]
    );
  }, [availableLayouts, activeLayoutId]);

  // Keep activeLayoutId synced when numPhotos changes
  useEffect(() => {
    const prefix = activeLayoutId.split('-').slice(0, -1).join('-') || 'spotlight-royal';
    const matching = availableLayouts.find((l) => l.id.startsWith(prefix));
    if (matching) {
      setActiveLayoutId(matching.id);
    } else if (availableLayouts[0]) {
      setActiveLayoutId(availableLayouts[0].id);
    }
    if (selectedSlotIdx >= numPhotos) {
      setSelectedSlotIdx(0);
    }
  }, [numPhotos, availableLayouts]);

  // ============================================================================
  // INTERACTIVE HANDLERS: PAN, ZOOM, ROTATE, SWAP, UPLOAD
  // ============================================================================

  const updateSlot = (index: number, updates: Partial<CollagePhotoSlotState>) => {
    setPhotoSlots((prev) =>
      prev.map((slot, idx) => (idx === index ? { ...slot, ...updates } : slot))
    );
  };

  const applyFilterToAllSlots = (filter: PhotoFilterType) => {
    setPhotoSlots((prev) => prev.map((slot) => ({ ...slot, filter })));
    showToast(isAr ? 'تم تطبيق الفلتر اللوني على جميع صور الكولاج ✨' : 'Filter applied to all photos!');
  };

  // Mouse/Touch Pan inside a photo slot
  const handleSlotPointerDown = (e: React.PointerEvent, index: number) => {
    e.stopPropagation();
    setSelectedOverlayId(null);

    // If user clicked while in Swap mode
    if (swapSourceIdx !== null) {
      if (swapSourceIdx !== index) {
        setPhotoSlots((prev) => {
          const copy = [...prev];
          const tempUrl = copy[swapSourceIdx].imageUrl;
          const tempLabel = copy[swapSourceIdx].label;
          const tempCaption = copy[swapSourceIdx].caption;
          copy[swapSourceIdx] = {
            ...copy[swapSourceIdx],
            imageUrl: copy[index].imageUrl,
            label: copy[index].label,
            caption: copy[index].caption,
            panX: 0,
            panY: 0,
          };
          copy[index] = {
            ...copy[index],
            imageUrl: tempUrl,
            label: tempLabel,
            caption: tempCaption,
            panX: 0,
            panY: 0,
          };
          return copy;
        });
        showToast(isAr ? 'تم تبديل مكان الصورتين بنجاح 🔄' : 'Photos swapped successfully!');
      }
      setSwapSourceIdx(null);
      setSelectedSlotIdx(index);
      return;
    }

    setSelectedSlotIdx(index);
    setIsDraggingPan(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: photoSlots[index]?.panX || 0,
      initialPanY: photoSlots[index]?.panY || 0,
    };
  };

  const handleStagePointerMove = (e: React.PointerEvent) => {
    if (isDraggingPan && panStartRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      const nextPanX = Math.max(-100, Math.min(100, Math.round(panStartRef.current.initialPanX + dx * 0.45)));
      const nextPanY = Math.max(-100, Math.min(100, Math.round(panStartRef.current.initialPanY + dy * 0.45)));
      updateSlot(selectedSlotIdx, { panX: nextPanX, panY: nextPanY });
    } else if (draggingOverlayId && stageRef.current) {
      const rect = stageRef.current.getBoundingClientRect();
      const relX = ((e.clientX - rect.left) / rect.width) * 100;
      const relY = ((e.clientY - rect.top) / rect.height) * 100;
      const clampedX = Math.max(5, Math.min(95, Number(relX.toFixed(1))));
      const clampedY = Math.max(4, Math.min(96, Number(relY.toFixed(1))));
      setOverlays((prev) =>
        prev.map((ov) => (ov.id === draggingOverlayId ? { ...ov, x: clampedX, y: clampedY } : ov))
      );
    }
  };

  const handleStagePointerUp = () => {
    setIsDraggingPan(false);
    panStartRef.current = null;
    setDraggingOverlayId(null);
  };

  // Single Slot Image Upload
  const handleSingleSlotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateSlot(selectedSlotIdx, {
        imageUrl: reader.result as string,
        label: file.name.replace(/\.[^/.]+$/, ''),
        panX: 0,
        panY: 0,
        zoom: 1,
      });
      showToast(isAr ? `تم تحديث الصورة في الخانة رقم ${selectedSlotIdx + 1}` : `Updated slot #${selectedSlotIdx + 1}`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Batch Multi-Photo Upload
  const handleBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const countToUse = Math.min(16, Math.max(2, files.length));
    if (files.length >= 2 && files.length <= 16) {
      setNumPhotos(countToUse);
    }

    files.slice(0, 16).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        updateSlot(idx, {
          imageUrl: reader.result as string,
          label: file.name.replace(/\.[^/.]+$/, ''),
          panX: 0,
          panY: 0,
          zoom: 1,
        });
      };
      reader.readAsDataURL(file);
    });

    showToast(
      isAr
        ? `تم استيراد ${Math.min(16, files.length)} صور وتوزيعها ذكياً في الكولاج!`
        : `Imported ${Math.min(16, files.length)} photos into the collage!`
    );
    e.target.value = '';
  };

  // Smart Auto-Arrange (Cycles layout & harmonizes colors while keeping locked Hero slot)
  const handleSmartAutoArrange = () => {
    const currentIdx = availableLayouts.findIndex((l) => l.id === activeLayout.id);
    const nextLayout = availableLayouts[(currentIdx + 1) % availableLayouts.length];
    if (nextLayout) {
      setActiveLayoutId(nextLayout.id);
    }
    // Shuffle unlocked photos gently if user wants fresh visual balance
    setPhotoSlots((prev) => {
      const next = [...prev];
      const unlockedIndices: number[] = [];
      for (let i = 0; i < numPhotos; i++) {
        if (!next[i].isLocked) unlockedIndices.push(i);
      }
      if (unlockedIndices.length > 1) {
        const firstIdx = unlockedIndices[0];
        const firstItem = next[firstIdx];
        for (let i = 0; i < unlockedIndices.length - 1; i++) {
          next[unlockedIndices[i]] = next[unlockedIndices[i + 1]];
        }
        next[unlockedIndices[unlockedIndices.length - 1]] = firstItem;
      }
      return next;
    });
    showToast(
      isAr
        ? 'تم إعادة التوزيع الذكي مع الحفاظ على الصورة الرئيسية المقفلة 🔒'
        : 'Smart layout re-arranged while preserving locked hero photo!'
    );
  };

  // ============================================================================
  // AI GENERATION HANDLERS (GENERATE INTO SLOT & GENERATE BACKGROUND)
  // ============================================================================

  const handleGenerateAiIntoSlot = async (customPromptText?: string) => {
    const promptToUse = (customPromptText || aiSlotPrompt).trim();
    if (!promptToUse || isGeneratingAiSlot) return;

    setIsGeneratingAiSlot(true);
    try {
      const res = await generateAiImage({
        prompt: promptToUse,
        aspectRatio: '3:4',
        style: 'Photorealistic Studio Portrait 8K',
      });
      if (res.success && res.imageUrl) {
        updateSlot(selectedSlotIdx, {
          imageUrl: res.imageUrl,
          label: promptToUse.slice(0, 22),
          panX: 0,
          panY: 0,
          zoom: 1,
        });
        showToast(
          isAr
            ? `تم توليد الصورة بالذكاء الاصطناعي ووضعها في الخانة ${selectedSlotIdx + 1} ✨`
            : `AI Image generated into slot #${selectedSlotIdx + 1}!`
        );
      }
    } catch {
      showToast(isAr ? 'تعذر التوليد في الخانة، حاول مرة أخرى.' : 'Failed to generate slot image.');
    } finally {
      setIsGeneratingAiSlot(false);
    }
  };

  const handleGenerateAiBackground = async (customBgPromptText?: string) => {
    const promptToUse = (customBgPromptText || aiBgPrompt).trim();
    if (!promptToUse || isGeneratingAiBg) return;

    setIsGeneratingAiBg(true);
    try {
      const res = await generateAiImage({
        prompt: `${promptToUse}, luxury abstract background texture, no people, studio lighting, 8k wallpaper`,
        aspectRatio: '3:4',
        style: 'Luxury Background Texture',
      });
      if (res.success && res.imageUrl) {
        setCustomBgImageUrl(res.imageUrl);
        showToast(
          isAr
            ? 'تم توليد خلفية الكولاج الفاخرة بالذكاء الاصطناعي بنجاح 🎨'
            : 'AI Collage background generated successfully!'
        );
      }
    } catch {
      showToast(isAr ? 'تعذر توليد الخلفية.' : 'Failed to generate background.');
    } finally {
      setIsGeneratingAiBg(false);
    }
  };

  // ============================================================================
  // OVERLAYS: TEXT & STICKERS MANAGEMENT
  // ============================================================================

  const handleAddTextOverlay = (presetText?: string, presetSub?: string, presetEffect?: TextEffectType) => {
    const content = (presetText || newTextValue).trim() || (isAr ? 'عنوان جديد ٢٠٢٨' : 'New Title 2028');
    const newOv: CollageOverlayItem = {
      id: `txt-${Date.now()}`,
      type: 'text',
      content,
      subContent: presetSub !== undefined ? presetSub : newTextSubValue.trim() || undefined,
      x: 50,
      y: 50,
      fontSize: 22,
      fontFamily: selectedFontFamily,
      color: selectedTextColor,
      accentColor: borderColor,
      effect: presetEffect || selectedTextEffect,
      rotation: 0,
      scale: 1,
      opacity: 1,
    };
    setOverlays((prev) => [...prev, newOv]);
    setSelectedOverlayId(newOv.id);
    setNewTextValue('');
    setNewTextSubValue('');
    showToast(isAr ? 'تمت إضافة طبقة النص! اسحبها لتحريكها في أي مكان ✍️' : 'Text layer added! Drag to position.');
  };

  const handleAddStickerOverlay = (stickerIcon: string) => {
    const newOv: CollageOverlayItem = {
      id: `stk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      type: 'sticker',
      content: stickerIcon,
      x: 50 + (Math.random() * 20 - 10),
      y: 50 + (Math.random() * 20 - 10),
      fontSize: stickerIcon.length > 3 ? 16 : 30,
      fontFamily: 'Cairo',
      color: '#fde047',
      accentColor: borderColor,
      effect: stickerIcon.length > 3 ? 'ribbon-badge' : 'soft-glow',
      rotation: 0,
      scale: 1,
      opacity: 1,
    };
    setOverlays((prev) => [...prev, newOv]);
    setSelectedOverlayId(newOv.id);
    showToast(isAr ? 'تمت إضافة الاستيكر! يمكنك سحبه وتكبيره وتدويره ✨' : 'Sticker added! Drag to move.');
  };

  const updateSelectedOverlay = (updates: Partial<CollageOverlayItem>) => {
    if (!selectedOverlayId) return;
    setOverlays((prev) =>
      prev.map((ov) => (ov.id === selectedOverlayId ? { ...ov, ...updates } : ov))
    );
  };

  const deleteOverlay = (id: string) => {
    setOverlays((prev) => prev.filter((ov) => ov.id !== id));
    if (selectedOverlayId === id) setSelectedOverlayId(null);
  };

  // ============================================================================
  // HIGH-RESOLUTION 300-DPI HTML5 CANVAS RENDERER & EXPORT ENGINE
  // ============================================================================

  const loadImageElement = (url: string): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const drawSlotClipPath = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    shape: SlotShape,
    radius: number
  ) => {
    ctx.beginPath();
    if (shape === 'circle') {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const r = Math.min(w, h) / 2;
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
    } else if (shape === 'arch') {
      const archR = Math.min(w / 2, h / 2);
      ctx.moveTo(x, y + archR);
      ctx.arc(x + w / 2, y + archR, w / 2, Math.PI, 0, false);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.closePath();
    } else if (shape === 'hexagon') {
      const pts = [
        [x + w * 0.5, y],
        [x + w, y + h * 0.25],
        [x + w, y + h * 0.75],
        [x + w * 0.5, y + h],
        [x, y + h * 0.75],
        [x, y + h * 0.25],
      ];
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
    } else if (shape === 'diamond') {
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x + w, y + h / 2);
      ctx.lineTo(x + w / 2, y + h);
      ctx.lineTo(x, y + h / 2);
      ctx.closePath();
    } else {
      // rect or polaroid inner photo
      const r = Math.min(radius, w / 2, h / 2);
      ctx.roundRect(x, y, w, h, r);
    }
  };

  const renderHighResCollageDataUrl = async (): Promise<string | null> => {
    const scaleFactor = 40; // e.g. 30cm * 40 = 1200px, 40cm * 40 = 1600px
    const W = Math.max(800, Math.min(2400, Math.round(canvasWidthCm * scaleFactor)));
    const H = Math.max(800, Math.min(2800, Math.round(canvasHeightCm * scaleFactor)));

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 1. Draw Background (Custom AI Image or Gradient Preset)
    if (customBgImageUrl) {
      const bgImg = await loadImageElement(customBgImageUrl);
      if (bgImg) {
        ctx.drawImage(bgImg, 0, 0, W, H);
      }
    } else {
      const grad = ctx.createRadialGradient(W * 0.5, H * 0.35, W * 0.08, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
      grad.addColorStop(0, selectedBgPreset.stops[0]);
      grad.addColorStop(0.6, selectedBgPreset.stops[1]);
      grad.addColorStop(1, selectedBgPreset.stops[2]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    // 2. Surface Patterns & Luxury Borders
    const m = (outerMargin / 600) * W;
    if (doubleGoldBorder || surfacePattern === 'luxury-frame') {
      ctx.save();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = Math.max(3, W * 0.006);
      ctx.strokeRect(m, m, W - m * 2, H - m * 2);
      ctx.lineWidth = Math.max(1.5, W * 0.002);
      ctx.setLineDash([12, 8]);
      ctx.strokeRect(m + 14, m + 14, W - (m + 14) * 2, H - (m + 14) * 2);
      ctx.restore();
    }

    // 3. Render Each Slot in Active Layout
    const gapPx = (slotGap / 600) * W;
    const radiusPx = (cornerRadius / 600) * W;
    const frameBorderPx = (borderWidth / 600) * W;

    for (let i = 0; i < activeLayout.slots.length; i++) {
      const slotDef = activeLayout.slots[i];
      const slotState = photoSlots[i] || photoSlots[0];
      const shape: SlotShape = slotState.customShape || slotDef.shape || 'rect';

      const sx = (slotDef.x / 100) * W + gapPx / 2;
      const sy = (slotDef.y / 100) * H + gapPx / 2;
      const sw = (slotDef.w / 100) * W - gapPx;
      const sh = (slotDef.h / 100) * H - gapPx;

      ctx.save();
      const centerX = sx + sw / 2;
      const centerY = sy + sh / 2;
      if (slotDef.tilt) {
        ctx.translate(centerX, centerY);
        ctx.rotate((slotDef.tilt * Math.PI) / 180);
        ctx.translate(-centerX, -centerY);
      }

      // Polaroid white card backing
      let imgBoxX = sx;
      let imgBoxY = sy;
      let imgBoxW = sw;
      let imgBoxH = sh;

      if (shape === 'polaroid') {
        ctx.fillStyle = '#f8fafc';
        ctx.shadowColor = 'rgba(0,0,0,0.45)';
        ctx.shadowBlur = 24;
        ctx.beginPath();
        ctx.roundRect(sx, sy, sw, sh, Math.min(16, radiusPx));
        ctx.fill();
        ctx.shadowBlur = 0;
        const pad = sw * 0.05;
        imgBoxX = sx + pad;
        imgBoxY = sy + pad;
        imgBoxW = sw - pad * 2;
        imgBoxH = sh - pad * 3.2;
      }

      // Clip path for photo
      ctx.save();
      drawSlotClipPath(ctx, imgBoxX, imgBoxY, imgBoxW, imgBoxH, shape, radiusPx);
      ctx.clip();

      // Background inside slot
      ctx.fillStyle = '#090d16';
      ctx.fillRect(imgBoxX, imgBoxY, imgBoxW, imgBoxH);

      // Load & Draw Photo with Pan, Zoom, Rotation, Flip, Filter
      const imgEl = await loadImageElement(slotState.imageUrl);
      if (imgEl) {
        ctx.save();
        const filterObj = PHOTO_FILTERS.find((f) => f.id === slotState.filter);
        if (filterObj && filterObj.css !== 'none') {
          ctx.filter = filterObj.css;
        }

        const boxCx = imgBoxX + imgBoxW / 2;
        const boxCy = imgBoxY + imgBoxH / 2;
        ctx.translate(boxCx + (slotState.panX / 100) * (imgBoxW * 0.5), boxCy + (slotState.panY / 100) * (imgBoxH * 0.5));
        ctx.rotate((slotState.rotation * Math.PI) / 180);
        ctx.scale(
          slotState.zoom * (slotState.flipX ? -1 : 1),
          slotState.zoom * (slotState.flipY ? -1 : 1)
        );

        // Object-cover math
        const imgRatio = imgEl.width / imgEl.height;
        const boxRatio = imgBoxW / imgBoxH;
        let drawW = imgBoxW;
        let drawH = imgBoxH;
        if (imgRatio > boxRatio) {
          drawH = imgBoxH;
          drawW = imgBoxH * imgRatio;
        } else {
          drawW = imgBoxW;
          drawH = imgBoxW / imgRatio;
        }
        ctx.drawImage(imgEl, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }
      ctx.restore();

      // Draw Slot Frame Border
      if (frameBorderPx > 0 && shape !== 'polaroid') {
        ctx.save();
        drawSlotClipPath(ctx, imgBoxX, imgBoxY, imgBoxW, imgBoxH, shape, radiusPx);
        ctx.strokeStyle = slotDef.isHero ? '#fbbf24' : borderColor;
        ctx.lineWidth = slotDef.isHero ? frameBorderPx * 1.6 : frameBorderPx;
        ctx.stroke();
        ctx.restore();
      }

      // Draw Slot Caption if present
      if (slotState.caption) {
        ctx.save();
        const capY = shape === 'polaroid' ? sy + sh - (sh - imgBoxH) * 0.38 : sy + sh - 18;
        ctx.font = `bold ${Math.round(W * 0.018)}px Cairo, sans-serif`;
        ctx.fillStyle = shape === 'polaroid' ? '#0f172a' : '#fde047';
        ctx.textAlign = 'center';
        ctx.fillText(slotState.caption, sx + sw / 2, capY);
        ctx.restore();
      }

      ctx.restore();
    }

    // 4. Render Free Overlays (Text & Stickers)
    for (const ov of overlays) {
      ctx.save();
      const ox = (ov.x / 100) * W;
      const oy = (ov.y / 100) * H;
      ctx.translate(ox, oy);
      ctx.rotate((ov.rotation * Math.PI) / 180);
      ctx.scale(ov.scale, ov.scale);
      ctx.globalAlpha = ov.opacity;

      const scaledFontPx = Math.round((ov.fontSize / 600) * W * 1.35);
      ctx.font = `bold ${scaledFontPx}px "${ov.fontFamily}", Cairo, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (ov.effect === 'ribbon-badge' || ov.effect === 'glass-pill') {
        const textMetrics = ctx.measureText(ov.content);
        const pillW = Math.max(textMetrics.width + scaledFontPx * 1.8, W * 0.28);
        const pillH = scaledFontPx * (ov.subContent ? 2.4 : 1.7);
        ctx.fillStyle = ov.effect === 'ribbon-badge' ? 'rgba(9, 14, 23, 0.88)' : 'rgba(255, 255, 255, 0.14)';
        ctx.strokeStyle = ov.accentColor || borderColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-pillW / 2, -pillH / 2, pillW, pillH, pillH / 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.shadowColor = 'rgba(0,0,0,0.65)';
      ctx.shadowBlur = 14;
      ctx.fillStyle = ov.color;
      ctx.fillText(ov.content, 0, ov.subContent ? -scaledFontPx * 0.25 : 0);

      if (ov.subContent) {
        ctx.font = `600 ${Math.round(scaledFontPx * 0.52)}px "${ov.fontFamily}", Cairo, sans-serif`;
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(ov.subContent, 0, scaledFontPx * 0.55);
      }
      ctx.restore();
    }

    return canvas.toDataURL('image/png', 1.0);
  };

  const handleDownloadCollage = async () => {
    setIsExporting(true);
    try {
      const dataUrl = await renderHighResCollageDataUrl();
      if (!dataUrl) return;
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `NAGAR_2028_COLLAGE_${canvasWidthCm}x${canvasHeightCm}cm_${numPhotos}Photos_${Date.now()}.png`;
      link.click();

      addGenerationResult({
        url: dataUrl,
        model: '2028-Collage-Engine',
        settings: {
          model: '2028-Collage-Studio',
          aspectRatio: '3:4',
          resolution: '4K',
          numberOfImages: numPhotos,
          style: activeLayout.nameEn,
        },
        notes: `كولاج ${canvasWidthCm}×${canvasHeightCm} سم (${numPhotos} صور) - ${activeLayout.nameAr}`,
        aspectRatio: `${canvasWidthCm}:${canvasHeightCm}`,
      });

      showToast(
        isAr
          ? 'تم تصدير وتحميل الكولاج بدقة الطباعة الفائقة وحفظه في نتائج المشروع! 🎉'
          : 'High-res collage exported and saved to project results!'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendToStudio = async (target: 'print-prep' | 'laser-prep') => {
    setIsExporting(true);
    try {
      const dataUrl = await renderHighResCollageDataUrl();
      if (dataUrl) {
        sendImageToTool(dataUrl, target);
        setCurrentView(target);
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Active selected slot & overlay objects
  const activeSlot = photoSlots[selectedSlotIdx] || photoSlots[0];
  const activeOverlay = overlays.find((ov) => ov.id === selectedOverlayId) || null;

  // Helper CSS clip-path for DOM slot shapes
  const getSlotShapeStyle = (shape: SlotShape): React.CSSProperties => {
    if (shape === 'circle') {
      return { borderRadius: '9999px' };
    }
    if (shape === 'arch') {
      return { borderRadius: '999px 999px 16px 16px' };
    }
    if (shape === 'hexagon') {
      return {
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
      };
    }
    if (shape === 'diamond') {
      return {
        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      };
    }
    return { borderRadius: `${cornerRadius}px` };
  };

  return (
    <div
      className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-5 select-none"
      onPointerMove={handleStagePointerMove}
      onPointerUp={handleStagePointerUp}
    >
      {/* Hidden File Inputs */}
      <input
        ref={singleSlotFileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSingleSlotUpload}
      />
      <input
        ref={batchUploadFileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleBatchUpload}
      />

      {/* =================================================================== */}
      {/* TOP BAR: STUDIO HEADER & QUICK EXPORT ACTIONS                       */}
      {/* =================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <LayoutGrid className="w-6 h-6 text-amber-400 shrink-0" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              {isAr ? 'استوديو الكولاج الذكي 2028 (AI Smart Collage Studio)' : '2028 AI Photo Collage Studio'}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
            <span className="font-mono tabular-nums text-amber-300 font-semibold">
              {canvasWidthCm} × {canvasHeightCm} cm
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{numPhotos} {isAr ? 'صور نشطة' : 'Active Photos'}</span>
            <span aria-hidden="true">·</span>
            <span>{isAr ? activeLayout.nameAr : activeLayout.nameEn}</span>
            <span aria-hidden="true">·</span>
            <span>{isAr ? 'اسحب أي صورة لتحريكها أو نص لتغيير مكانه' : 'Drag any photo to pan or text to move'}</span>
          </div>
        </div>

        {/* Primary Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => batchUploadFileRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold border border-slate-700 transition-colors whitespace-nowrap shrink-0"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'رفع مجموعة صور' : 'Batch Upload Photos'}</span>
          </button>

          <button
            type="button"
            onClick={handleSmartAutoArrange}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold border border-slate-700 transition-colors whitespace-nowrap shrink-0"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span>{isAr ? 'توزيع ذكي سحري' : 'AI Auto-Arrange'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSendToStudio('print-prep')}
            disabled={isExporting}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors whitespace-nowrap shrink-0"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'إرسال للمطبعة' : 'Send to Print'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCollage}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{isAr ? 'تحميل الكولاج (300 DPI)' : 'Export High-Res PNG'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {toastMsg && (
        <div className="p-3 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-amber-300 hover:text-white font-bold px-2">
            ✕
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3-ZONE STUDIO WORKSPACE GRID                                        */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ================================================================= */}
        {/* ZONE 1 (5 COLS): MULTI-TAB CREATIVE LIBRARY & CONTROLS            */}
        {/* ================================================================= */}
        <div className="xl:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 sm:grid-cols-6 border-b border-slate-800 bg-[#080c14] p-1 gap-1">
            {[
              { id: 'layouts', labelAr: 'القوالب', labelEn: 'Layouts', icon: LayoutGrid },
              { id: 'photos', labelAr: 'الصور', labelEn: 'Photos', icon: ImageIcon },
              { id: 'backgrounds', labelAr: 'الخلفيات', labelEn: 'Surfaces', icon: Palette },
              { id: 'text', labelAr: 'الخطوط', labelEn: 'Fonts', icon: Type },
              { id: 'stickers', labelAr: 'استيكرات', labelEn: 'Stickers', icon: Smile },
              { id: 'ai', labelAr: 'الذكاء ✨', labelEn: 'AI Magic', icon: Sparkles },
            ].map((t) => {
              const Icon = t.icon;
              const active = activeToolTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveToolTab(t.id as any)}
                  className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{isAr ? t.labelAr : t.labelEn}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 sm:p-5 space-y-5 max-h-[760px] overflow-y-auto">
            {/* ------------------------------------------------------------- */}
            {/* TAB 1: LAYOUTS, PHOTO COUNT & GRID GEOMETRY                   */}
            {/* ------------------------------------------------------------- */}
            {activeToolTab === 'layouts' && (
              <div className="space-y-5">
                {/* Smart Photo Count Selector (2 to 16 Photos) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">
                      {isAr ? 'عدد الصور في الكولاج (2 إلى 16 صورة)' : 'Number of Photos (2 to 16)'}
                    </label>
                    <span className="text-xs font-mono tabular-nums font-bold text-amber-400">
                      {numPhotos} {isAr ? 'صور' : 'Photos'}
                    </span>
                  </div>
                  <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5">
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 16].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setNumPhotos(cnt)}
                        className={`py-1.5 rounded-lg text-xs font-mono tabular-nums font-bold border transition-all ${
                          numPhotos === cnt
                            ? 'border-amber-400 bg-amber-500 text-slate-950 shadow-sm'
                            : 'border-slate-800 bg-[#090d16] text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio & Print Size Presets */}
                <div className="space-y-2 pt-3 border-t border-slate-800/80">
                  <label className="block text-xs font-bold text-slate-200">
                    {isAr ? 'مقاس اللوحة ونسبة الأبعاد (Print & Social Dimensions)' : 'Canvas Size & Aspect Ratio'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ASPECT_PRESETS.map((asp) => (
                      <button
                        key={asp.id}
                        type="button"
                        onClick={() => {
                          setSelectedAspectId(asp.id);
                          setCanvasWidthCm(asp.wCm);
                          setCanvasHeightCm(asp.hCm);
                        }}
                        className={`px-3 py-2 rounded-xl text-right border text-xs transition-all ${
                          selectedAspectId === asp.id
                            ? 'border-amber-500/80 bg-amber-500/15 text-amber-200 font-bold'
                            : 'border-slate-800 bg-[#090d16] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="truncate">{asp.nameAr}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layout Category Filter */}
                <div className="space-y-2 pt-3 border-t border-slate-800/80">
                  <label className="block text-xs font-bold text-slate-200">
                    {isAr ? 'مكتبة التقسيمات الذكية 2028 (Layout Templates)' : '2028 Layout Templates'}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'all', labelAr: 'الكل' },
                      { id: 'royal', labelAr: 'ملكي وتخرج' },
                      { id: 'bento', labelAr: 'بينتو 2028' },
                      { id: 'editorial', labelAr: 'بولارويد ومجلات' },
                      { id: 'geometric', labelAr: 'أشكال هندسية' },
                      { id: 'classic', labelAr: 'شبكة متوازنة' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setLayoutCategory(cat.id as LayoutCategory)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap ${
                          layoutCategory === cat.id
                            ? 'bg-slate-200 text-slate-950'
                            : 'bg-[#090d16] text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {cat.labelAr}
                      </button>
                    ))}
                  </div>

                  {/* Visual Layout Mini-Previews Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                    {filteredLayouts.map((layout) => {
                      const isSelected = activeLayout.id === layout.id;
                      return (
                        <button
                          key={layout.id}
                          type="button"
                          onClick={() => setActiveLayoutId(layout.id)}
                          className={`group p-2.5 rounded-xl border text-right transition-all flex flex-col gap-2 ${
                            isSelected
                              ? 'border-amber-400 bg-amber-500/10'
                              : 'border-slate-800 bg-[#090d16] hover:border-slate-700'
                          }`}
                        >
                          {/* Mini Wireframe Diagram */}
                          <div className="w-full aspect-[4/3] bg-slate-950 rounded-lg relative overflow-hidden border border-slate-800/80">
                            {layout.slots.map((s, idx) => (
                              <div
                                key={idx}
                                style={{
                                  left: `${s.x}%`,
                                  top: `${s.y}%`,
                                  width: `${s.w}%`,
                                  height: `${s.h}%`,
                                  borderRadius:
                                    s.shape === 'circle'
                                      ? '999px'
                                      : s.shape === 'arch'
                                      ? '999px 999px 2px 2px'
                                      : '3px',
                                }}
                                className={`absolute border transition-colors ${
                                  s.isHero
                                    ? 'bg-amber-500/40 border-amber-400'
                                    : 'bg-slate-800/90 border-slate-600 group-hover:border-slate-500'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-bold text-slate-200 truncate">
                              {isAr ? layout.nameAr : layout.nameEn}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grid Geometry Sliders (Gap, Margin, Radius, Border) */}
                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'ضبط المسافات والحواف والإطارات' : 'Spacing, Corners & Borders'}</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>{isAr ? 'المسافة بين الصور (Gap)' : 'Photo Gap'}</span>
                        <span className="font-mono tabular-nums text-amber-300">{slotGap}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={24}
                        value={slotGap}
                        onChange={(e) => setSlotGap(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>{isAr ? 'استدارة الحواف (Radius)' : 'Corner Radius'}</span>
                        <span className="font-mono tabular-nums text-amber-300">{cornerRadius}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={48}
                        value={cornerRadius}
                        onChange={(e) => setCornerRadius(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>{isAr ? 'سمك إطار الصور' : 'Border Width'}</span>
                        <span className="font-mono tabular-nums text-amber-300">{borderWidth}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={8}
                        value={borderWidth}
                        onChange={(e) => setBorderWidth(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>{isAr ? 'الهامش الخارجي' : 'Outer Margin'}</span>
                        <span className="font-mono tabular-nums text-amber-300">{outerMargin}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={40}
                        value={outerMargin}
                        onChange={(e) => setOuterMargin(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 2: SMART PHOTO MANIPULATION (PAN, ZOOM, ROTATE, FILTERS)  */}
            {/* ------------------------------------------------------------- */}
            {activeToolTab === 'photos' && (
              <div className="space-y-5">
                {/* Slot Selector Strip */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      {isAr ? 'اختر الخانة لتعديل صورتها أو تحريكها:' : 'Select Slot to Edit:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => batchUploadFileRef.current?.click()}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isAr ? 'رفع عدة صور معاً' : 'Upload Multiple'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {Array.from({ length: numPhotos }, (_, idx) => {
                      const slot = photoSlots[idx];
                      const isSel = selectedSlotIdx === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedSlotIdx(idx)}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                            isSel
                              ? 'border-amber-400 ring-2 ring-amber-500/30 scale-105'
                              : 'border-slate-800 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={slot.imageUrl}
                            alt={slot.label}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.2 bg-slate-950/85 text-[10px] font-mono tabular-nums font-bold text-slate-200 rounded">
                            #{idx + 1}
                          </span>
                          {slot.isLocked && (
                            <span className="absolute top-1 left-1 text-[10px] bg-amber-500 text-slate-950 rounded px-1 font-bold">
                              🔒
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Photo Controls */}
                <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-xs font-bold text-amber-300">
                        {isAr ? `الخانة المحددة #${selectedSlotIdx + 1}` : `Selected Slot #${selectedSlotIdx + 1}`}
                      </h4>
                      <p className="text-[11px] text-slate-400">{activeSlot.label}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => singleSlotFileRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تغيير الصورة' : 'Replace'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setSwapSourceIdx(swapSourceIdx === selectedSlotIdx ? null : selectedSlotIdx)
                        }
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 ${
                          swapSourceIdx === selectedSlotIdx
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                            : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                        <span>{swapSourceIdx === selectedSlotIdx ? (isAr ? 'انقر على خانة أخرى' : 'Click target') : (isAr ? 'تبديل مكانها' : 'Swap')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateSlot(selectedSlotIdx, { isLocked: !activeSlot.isLocked })}
                        className={`p-1.5 rounded-lg border ${
                          activeSlot.isLocked
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                        title={isAr ? 'قفل الصورة كعنصر أساسي' : 'Lock Hero Photo'}
                      >
                        {activeSlot.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Pan X / Y & Zoom Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>{isAr ? 'التكبير (Zoom)' : 'Zoom'}</span>
                        <span className="font-mono tabular-nums text-amber-300">{activeSlot.zoom.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min={0.6}
                        max={2.8}
                        step={0.05}
                        value={activeSlot.zoom}
                        onChange={(e) => updateSlot(selectedSlotIdx, { zoom: Number(e.target.value) })}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>{isAr ? 'إزاحة أفقية (Pan X)' : 'Pan X'}</span>
                        <span className="font-mono tabular-nums text-amber-300">{activeSlot.panX}%</span>
                      </div>
                      <input
                        type="range"
                        min={-100}
                        max={100}
                        value={activeSlot.panX}
                        onChange={(e) => updateSlot(selectedSlotIdx, { panX: Number(e.target.value) })}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>{isAr ? 'إزاحة رأسية (Pan Y)' : 'Pan Y'}</span>
                        <span className="font-mono tabular-nums text-amber-300">{activeSlot.panY}%</span>
                      </div>
                      <input
                        type="range"
                        min={-100}
                        max={100}
                        value={activeSlot.panY}
                        onChange={(e) => updateSlot(selectedSlotIdx, { panY: Number(e.target.value) })}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>

                  {/* Rotate, Flip & Reset */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateSlot(selectedSlotIdx, { rotation: activeSlot.rotation - 90 })}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>-90°</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSlot(selectedSlotIdx, { rotation: activeSlot.rotation + 90 })}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>+90°</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSlot(selectedSlotIdx, { flipX: !activeSlot.flipX })}
                        className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 ${
                          activeSlot.flipX ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-200'
                        }`}
                      >
                        <FlipHorizontal className="w-3.5 h-3.5" />
                        <span>{isAr ? 'قلب أفقي' : 'Flip H'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSlot(selectedSlotIdx, { flipY: !activeSlot.flipY })}
                        className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 ${
                          activeSlot.flipY ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-200'
                        }`}
                      >
                        <FlipVertical className="w-3.5 h-3.5" />
                        <span>{isAr ? 'قلب رأسي' : 'Flip V'}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        updateSlot(selectedSlotIdx, {
                          panX: 0,
                          panY: 0,
                          zoom: 1,
                          rotation: 0,
                          flipX: false,
                          flipY: false,
                        })
                      }
                      className="text-[11px] text-slate-400 hover:text-amber-300 underline"
                    >
                      {isAr ? 'إعادة ضبط التمركز' : 'Reset Position'}
                    </button>
                  </div>

                  {/* Custom Shape Override for this slot */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <span className="block text-[11px] font-bold text-slate-300">
                      {isAr ? 'شكل إطار هذه الخانة (Slot Shape):' : 'Slot Frame Shape:'}
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {(
                        [
                          { id: 'rect', labelAr: 'مستطيل' },
                          { id: 'arch', labelAr: 'قوس ملكي' },
                          { id: 'circle', labelAr: 'دائري' },
                          { id: 'hexagon', labelAr: 'سداسي' },
                          { id: 'diamond', labelAr: 'معين' },
                          { id: 'polaroid', labelAr: 'بولارويد' },
                        ] as { id: SlotShape; labelAr: string }[]
                      ).map((sh) => {
                        const currentShape =
                          activeSlot.customShape || activeLayout.slots[selectedSlotIdx]?.shape || 'rect';
                        return (
                          <button
                            key={sh.id}
                            type="button"
                            onClick={() => updateSlot(selectedSlotIdx, { customShape: sh.id })}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all ${
                              currentShape === sh.id
                                ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {sh.labelAr}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Per-Slot Caption */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      {isAr ? 'تسمية توضيحية أسفل الصورة (Caption):' : 'Photo Caption:'}
                    </label>
                    <input
                      type="text"
                      value={activeSlot.caption || ''}
                      onChange={(e) => updateSlot(selectedSlotIdx, { caption: e.target.value })}
                      placeholder={isAr ? 'مثال: الخريج الأساسي / صورة العائلة...' : 'Enter caption...'}
                      className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-100"
                    />
                  </div>
                </div>

                {/* Photo Filters */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      {isAr ? 'الفلاتر اللونية للصورة (Photo Filters):' : 'Photo Color Filters:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => applyFilterToAllSlots(activeSlot.filter)}
                      className="text-[11px] text-amber-400 hover:underline font-bold"
                    >
                      {isAr ? 'تعميم الفلتر على كل الصور' : 'Apply to All Photos'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PHOTO_FILTERS.map((flt) => (
                      <button
                        key={flt.id}
                        type="button"
                        onClick={() => updateSlot(selectedSlotIdx, { filter: flt.id })}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border text-right transition-all ${
                          activeSlot.filter === flt.id
                            ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                            : 'border-slate-800 bg-[#090d16] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {flt.nameAr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 3: COLORS, 2028 GRADIENTS & SURFACE TEXTURES              */}
            {/* ------------------------------------------------------------- */}
            {activeToolTab === 'backgrounds' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">
                      {isAr ? 'تدرجات وألوان 2028 الفاخرة (Luxury Gradients)' : '2028 Luxury Gradients'}
                    </label>
                    {customBgImageUrl && (
                      <button
                        type="button"
                        onClick={() => setCustomBgImageUrl(null)}
                        className="text-[11px] text-rose-400 hover:underline"
                      >
                        {isAr ? 'إزالة صورة الخلفية المولدة' : 'Clear AI Background'}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {BACKGROUND_PRESETS.map((bg) => {
                      const isSel = !customBgImageUrl && selectedBgPreset.id === bg.id;
                      return (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() => {
                            setCustomBgImageUrl(null);
                            setSelectedBgPreset(bg);
                            setBorderColor(bg.borderDefault);
                          }}
                          className={`p-2.5 rounded-xl border flex items-center gap-3 text-right transition-all ${
                            isSel
                              ? 'border-amber-400 bg-amber-500/10'
                              : 'border-slate-800 bg-[#090d16] hover:border-slate-700'
                          }`}
                        >
                          <div
                            className="w-9 h-9 rounded-lg shrink-0 border border-white/20 shadow-inner"
                            style={{ background: bg.cssGradient }}
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-200 truncate">
                              {isAr ? bg.nameAr : bg.nameEn}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Surface Patterns & Borders */}
                <div className="space-y-2 pt-3 border-t border-slate-800/80">
                  <label className="block text-xs font-bold text-slate-200">
                    {isAr ? 'النقوش الزخرفية والإطار الملكي (Surface Pattern)' : 'Surface Ornaments & Frame'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SURFACE_PATTERNS.map((pat) => (
                      <button
                        key={pat.id}
                        type="button"
                        onClick={() => setSurfacePattern(pat.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                          surfacePattern === pat.id
                            ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                            : 'border-slate-800 bg-[#090d16] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {isAr ? pat.nameAr : pat.nameEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border Color & Double Gold Toggle */}
                <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-300">
                      {isAr ? 'لون الإطارات والزخارف:' : 'Frame Accent Color:'}
                    </label>
                    <input
                      type="color"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setDoubleGoldBorder(!doubleGoldBorder)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      doubleGoldBorder
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {doubleGoldBorder ? (isAr ? '✓ الإطار الملكي المزدوج مفعل' : '✓ Double Frame On') : (isAr ? 'تفعيل الإطار المزدوج' : 'Enable Double Frame')}
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 4: TYPOGRAPHY, ARABIC/ENGLISH FONTS & TEXT EFFECTS        */}
            {/* ------------------------------------------------------------- */}
            {activeToolTab === 'text' && (
              <div className="space-y-5">
                {/* Add New Text Layer Form */}
                <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-amber-300">
                    {isAr ? 'إضافة عنوان أو طبقة نصية حرة الحركة' : 'Add Free-Moving Text Layer'}
                  </h4>

                  <input
                    type="text"
                    value={newTextValue}
                    onChange={(e) => setNewTextValue(e.target.value)}
                    placeholder={isAr ? 'النص الرئيسي (مثال: مبروك التخرج ٢٠٢٨)...' : 'Main headline text...'}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-100"
                  />

                  <input
                    type="text"
                    value={newTextSubValue}
                    onChange={(e) => setNewTextSubValue(e.target.value)}
                    placeholder={isAr ? 'نص فرعي اختياري (مثال: كلية الهندسة • مرتبة الشرف)...' : 'Optional subtitle...'}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-300"
                  />

                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedTextColor}
                      onChange={(e) => setSelectedTextColor(e.target.value)}
                      className="w-9 h-9 rounded cursor-pointer bg-transparent border-0 shrink-0"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTextOverlay()}
                      className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isAr ? 'إضافة النص إلى الكولاج' : 'Add Text Layer'}</span>
                    </button>
                  </div>
                </div>

                {/* Font Family Picker */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-200">
                    {isAr ? 'مكتبة الخطوط العربية والإنجليزية (Font Family)' : 'Arabic & English Fonts'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {FONT_LIBRARY.map((f) => {
                      const currentFont = activeOverlay?.fontFamily || selectedFontFamily;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            setSelectedFontFamily(f.id);
                            if (activeOverlay) updateSelectedOverlay({ fontFamily: f.id });
                          }}
                          className={`p-2.5 rounded-xl border text-right transition-all ${
                            currentFont === f.id
                              ? 'border-amber-400 bg-amber-500/15 text-amber-200'
                              : 'border-slate-800 bg-[#090d16] text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="text-[10px] text-slate-400">{f.name}</div>
                          <div className="text-sm font-bold mt-0.5 truncate" style={{ fontFamily: f.id }}>
                            {f.sample}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Text Style Effects */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <label className="block text-xs font-bold text-slate-200">
                    {isAr ? 'تأثيرات النصوص والشرائط (Text Styles)' : 'Text Visual Effects'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(
                      [
                        { id: 'gold-foil', nameAr: 'ذهب ملكي لامع' },
                        { id: 'ribbon-badge', nameAr: 'شريط مؤطر فاخر' },
                        { id: 'glass-pill', nameAr: 'كبسولة زجاجية 2028' },
                        { id: 'soft-glow', nameAr: 'توهج سينمائي' },
                        { id: 'outline', nameAr: 'حواف مفرغة' },
                        { id: 'clean-shadow', nameAr: 'ظل بارز نقي' },
                      ] as { id: TextEffectType; nameAr: string }[]
                    ).map((ef) => {
                      const curEf = activeOverlay?.effect || selectedTextEffect;
                      return (
                        <button
                          key={ef.id}
                          type="button"
                          onClick={() => {
                            setSelectedTextEffect(ef.id);
                            if (activeOverlay) updateSelectedOverlay({ effect: ef.id });
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                            curEf === ef.id
                              ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                              : 'border-slate-800 bg-[#090d16] text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {ef.nameAr}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 5: STICKERS, BADGES & ORNAMENTS LIBRARY                   */}
            {/* ------------------------------------------------------------- */}
            {activeToolTab === 'stickers' && (
              <div className="space-y-5">
                {STICKER_CATEGORIES.map((cat) => (
                  <div key={cat.id} className="space-y-2">
                    <h4 className="text-xs font-bold text-amber-300">
                      {isAr ? cat.nameAr : cat.nameEn}
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {cat.items.map((st, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddStickerOverlay(st.icon)}
                          className="p-2.5 rounded-xl border border-slate-800 bg-[#090d16] hover:border-amber-500/60 hover:bg-slate-800/70 transition-all flex flex-col items-center justify-center gap-1 text-center"
                        >
                          <span className={st.icon.length > 3 ? 'text-xs font-black text-amber-300' : 'text-2xl'}>
                            {st.icon}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate w-full">{st.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 6: AI GENERATION (SLOT IMAGE & CUSTOM BACKGROUND)         */}
            {/* ------------------------------------------------------------- */}
            {activeToolTab === 'ai' && (
              <div className="space-y-5">
                {/* 1. Generate AI Image Directly Into Selected Slot */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/30 via-[#090d16] to-[#090d16] border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {isAr
                          ? `توليد صورة بالذكاء الاصطناعي في الخانة #${selectedSlotIdx + 1}`
                          : `Generate AI Photo into Slot #${selectedSlotIdx + 1}`}
                      </span>
                    </h4>
                  </div>

                  <textarea
                    rows={2}
                    value={aiSlotPrompt}
                    onChange={(e) => setAiSlotPrompt(e.target.value)}
                    placeholder={
                      isAr
                        ? 'اكتب وصف الصورة لتوليدها مباشرة داخل الإطار المحدد...'
                        : 'Describe the photo to generate into the selected frame...'
                    }
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-100"
                  />

                  {/* Quick Prompt Suggestions */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'بورتريه خريج بروب التخرج الملكي وإضاءة سينمائية',
                      'بوكيه ورد طبيعي فاخر مع شريط ذهبي',
                      'قاعة احتفالات تخرج فخمة بإضاءة ذهبية',
                    ].map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setAiSlotPrompt(sug);
                          handleGenerateAiIntoSlot(sug);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 border border-slate-800"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGenerateAiIntoSlot()}
                    disabled={isGeneratingAiSlot}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGeneratingAiSlot ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    <span>
                      {isGeneratingAiSlot
                        ? isAr
                          ? 'جاري توليد الصورة في الخانة...'
                          : 'Generating into Slot...'
                        : isAr
                        ? `توليد في الخانة #${selectedSlotIdx + 1} الآن (مجاناً)`
                        : `Generate into Slot #${selectedSlotIdx + 1}`}
                    </span>
                  </button>
                </div>

                {/* 2. Generate AI Custom Collage Background */}
                <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Palette className="w-4 h-4" />
                    <span>
                      {isAr
                        ? 'توليد خلفية فنية مخصصة للكولاج بالذكاء الاصطناعي'
                        : 'AI Custom Collage Background Generator'}
                    </span>
                  </h4>

                  <textarea
                    rows={2}
                    value={aiBgPrompt}
                    onChange={(e) => setAiBgPrompt(e.target.value)}
                    placeholder={
                      isAr
                        ? 'مثال: خلفية رخام أسود ملكي مع عروق ذهبية وإضاءة استوديو دافئة...'
                        : 'e.g., Black royal marble texture with gold veins and warm bokeh...'
                    }
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-100"
                  />

                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Luxury black marble with golden veins and soft bokeh',
                      'Royal emerald velvet fabric with subtle gold dust',
                      'Minimalist warm travertine stone architectural background',
                    ].map((bgSug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setAiBgPrompt(bgSug);
                          handleGenerateAiBackground(bgSug);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 border border-slate-800"
                      >
                        + {bgSug.slice(0, 34)}...
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGenerateAiBackground()}
                    disabled={isGeneratingAiBg}
                    className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGeneratingAiBg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>
                      {isGeneratingAiBg
                        ? isAr
                          ? 'جاري توليد الخلفية...'
                          : 'Generating Background...'
                        : isAr
                        ? 'توليد خلفية الكولاج بالذكاء الاصطناعي'
                        : 'Generate AI Background'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* ZONE 2 (7 COLS): INTERACTIVE STAGE & CONTEXTUAL INSPECTOR         */}
        {/* ================================================================= */}
        <div className="xl:col-span-7 flex flex-col items-center space-y-4">
          {/* Interactive Collage Canvas Viewport */}
          <div className="w-full flex justify-center bg-[#060911] border border-slate-800/90 rounded-2xl p-4 sm:p-6 shadow-2xl">
            <div
              ref={stageRef}
              style={{
                aspectRatio: `${canvasWidthCm} / ${canvasHeightCm}`,
                background: customBgImageUrl
                  ? `url(${customBgImageUrl}) center/cover no-repeat`
                  : selectedBgPreset.cssGradient,
                padding: `${outerMargin}px`,
              }}
              className="w-full max-w-[600px] rounded-2xl relative overflow-hidden shadow-2xl transition-all duration-200"
            >
              {/* Surface Pattern Overlays */}
              {surfacePattern === 'architectural-grid' && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-15"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${borderColor} 1px, transparent 1px), linear-gradient(to bottom, ${borderColor} 1px, transparent 1px)`,
                    backgroundSize: '36px 36px',
                  }}
                />
              )}
              {surfacePattern === 'subtle-dots' && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: `radial-gradient(${borderColor} 1.2px, transparent 1.2px)`,
                    backgroundSize: '20px 20px',
                  }}
                />
              )}
              {surfacePattern === 'spotlight-rays' && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${borderColor}33 0%, transparent 65%)`,
                  }}
                />
              )}

              {/* Double Royal Gold Border */}
              {(doubleGoldBorder || surfacePattern === 'luxury-frame') && (
                <>
                  <div
                    className="absolute inset-3 rounded-xl pointer-events-none"
                    style={{ border: `2px solid ${borderColor}` }}
                  />
                  <div
                    className="absolute inset-5 rounded-lg pointer-events-none opacity-55"
                    style={{ border: `1px dashed ${borderColor}` }}
                  />
                </>
              )}

              {/* Arabesque Gold Corner Accents */}
              {surfacePattern === 'arabesque-corners' && (
                <>
                  <div
                    className="absolute top-3 left-3 w-12 h-12 border-t-4 border-l-4 rounded-tl-xl pointer-events-none"
                    style={{ borderColor }}
                  />
                  <div
                    className="absolute top-3 right-3 w-12 h-12 border-t-4 border-r-4 rounded-tr-xl pointer-events-none"
                    style={{ borderColor }}
                  />
                  <div
                    className="absolute bottom-3 left-3 w-12 h-12 border-b-4 border-l-4 rounded-bl-xl pointer-events-none"
                    style={{ borderColor }}
                  />
                  <div
                    className="absolute bottom-3 right-3 w-12 h-12 border-b-4 border-r-4 rounded-br-xl pointer-events-none"
                    style={{ borderColor }}
                  />
                </>
              )}

              {/* =========================================================== */}
              {/* RENDER ACTIVE LAYOUT SLOTS                                  */}
              {/* =========================================================== */}
              {activeLayout.slots.map((slotDef, idx) => {
                const slotState = photoSlots[idx] || photoSlots[0];
                const shape: SlotShape = slotState.customShape || slotDef.shape || 'rect';
                const isSelected = selectedSlotIdx === idx;
                const isSwapSource = swapSourceIdx === idx;
                const filterObj = PHOTO_FILTERS.find((f) => f.id === slotState.filter);

                return (
                  <div
                    key={slotState.id}
                    onPointerDown={(e) => handleSlotPointerDown(e, idx)}
                    style={{
                      left: `calc(${slotDef.x}% + ${slotGap / 2}px)`,
                      top: `calc(${slotDef.y}% + ${slotGap / 2}px)`,
                      width: `calc(${slotDef.w}% - ${slotGap}px)`,
                      height: `calc(${slotDef.h}% - ${slotGap}px)`,
                      transform: slotDef.tilt ? `rotate(${slotDef.tilt}deg)` : undefined,
                      zIndex: slotDef.isHero ? 15 : 10 + idx,
                      ...(shape === 'polaroid'
                        ? {
                            backgroundColor: '#f8fafc',
                            padding: '6px 6px 26px 6px',
                            borderRadius: `${Math.min(12, cornerRadius)}px`,
                            boxShadow: '0 12px 28px rgba(0,0,0,0.45)',
                          }
                        : {}),
                    }}
                    className={`absolute cursor-grab active:cursor-grabbing group transition-shadow ${
                      isSelected ? 'ring-2 ring-amber-400 z-20' : ''
                    } ${isSwapSource ? 'ring-4 ring-cyan-400 animate-pulse' : ''}`}
                  >
                    {/* Inner Clipped Frame */}
                    <div
                      style={{
                        ...getSlotShapeStyle(shape),
                        border:
                          shape === 'polaroid'
                            ? '1px solid #cbd5e1'
                            : borderWidth > 0
                            ? `${slotDef.isHero ? borderWidth + 1 : borderWidth}px solid ${
                                slotDef.isHero ? '#fbbf24' : borderColor
                              }`
                            : 'none',
                      }}
                      className="w-full h-full overflow-hidden relative bg-slate-950/90 shadow-lg"
                    >
                      <img
                        src={slotState.imageUrl}
                        alt={slotState.label}
                        referrerPolicy="no-referrer"
                        draggable={false}
                        style={{
                          transform: `translate(${slotState.panX}%, ${slotState.panY}%) rotate(${
                            slotState.rotation
                          }deg) scale(${slotState.zoom * (slotState.flipX ? -1 : 1)}, ${
                            slotState.zoom * (slotState.flipY ? -1 : 1)
                          })`,
                          filter: filterObj?.css !== 'none' ? filterObj?.css : undefined,
                        }}
                        className="w-full h-full object-cover pointer-events-none transition-transform duration-75"
                      />

                      {/* Slot Index & Hero Lock Badge */}
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-85 group-hover:opacity-100 transition-opacity">
                        {slotState.isLocked && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[9px] shadow">
                            🔒 {slotDef.isHero ? (isAr ? 'الرئيسية' : 'Hero') : ''}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-slate-950/80 text-slate-200 font-mono tabular-nums text-[9px] border border-white/10">
                          #{idx + 1}
                        </span>
                      </div>

                      {/* Quick Hover Action Overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                        <button
                          type="button"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSlotIdx(idx);
                            singleSlotFileRef.current?.click();
                          }}
                          className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[10px]"
                        >
                          {isAr ? 'تغيير' : 'Upload'}
                        </button>
                        <span className="text-[9px] text-slate-200 truncate px-1">
                          {isAr ? 'اسحب للتحريك' : 'Drag to pan'}
                        </span>
                      </div>

                      {/* Non-polaroid Overlay Caption */}
                      {slotState.caption && shape !== 'polaroid' && (
                        <div className="absolute bottom-1.5 inset-x-2 text-center pointer-events-none">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-950/85 text-amber-300 border border-amber-400/40 text-[10px] font-bold shadow">
                            {slotState.caption}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Polaroid Bottom Caption */}
                    {shape === 'polaroid' && (
                      <div className="text-center mt-1 text-[11px] font-bold text-slate-900 truncate px-1">
                        {slotState.caption || slotState.label}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* =========================================================== */}
              {/* RENDER DRAGGABLE TEXT & STICKER OVERLAYS                    */}
              {/* =========================================================== */}
              {overlays.map((ov) => {
                const isOvSelected = selectedOverlayId === ov.id;
                return (
                  <div
                    key={ov.id}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setSelectedOverlayId(ov.id);
                      setDraggingOverlayId(ov.id);
                    }}
                    style={{
                      left: `${ov.x}%`,
                      top: `${ov.y}%`,
                      transform: `translate(-50%, -50%) rotate(${ov.rotation}deg) scale(${ov.scale})`,
                      opacity: ov.opacity,
                      fontFamily: ov.fontFamily,
                      zIndex: 35,
                    }}
                    className={`absolute cursor-move select-none transition-shadow ${
                      isOvSelected ? 'ring-2 ring-amber-400 rounded-xl p-1 bg-black/20' : ''
                    }`}
                  >
                    <div
                      style={{
                        fontSize: `${ov.fontSize}px`,
                        color: ov.color,
                        textShadow:
                          ov.effect === 'soft-glow'
                            ? `0 0 14px ${ov.color}88, 0 2px 6px rgba(0,0,0,0.85)`
                            : '0 2px 8px rgba(0,0,0,0.75)',
                        WebkitTextStroke: ov.effect === 'outline' ? `1px ${ov.accentColor || '#ffffff'}` : undefined,
                      }}
                      className={`text-center font-bold whitespace-nowrap leading-tight ${
                        ov.effect === 'ribbon-badge'
                          ? 'px-5 py-1.5 rounded-full bg-slate-950/90 border border-amber-400/70 shadow-xl'
                          : ov.effect === 'glass-pill'
                          ? 'px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 shadow-lg'
                          : ''
                      }`}
                    >
                      <div>{ov.content}</div>
                      {ov.subContent && (
                        <div className="text-[10px] font-medium text-slate-300 tracking-wider mt-0.5">
                          {ov.subContent}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =============================================================== */}
          {/* CONTEXTUAL FLOATING INSPECTOR BAR (FOR SELECTED OVERLAY OR SLOT) */}
          {/* =============================================================== */}
          {activeOverlay ? (
            <div className="w-full bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-amber-400" />
                <input
                  type="text"
                  value={activeOverlay.content}
                  onChange={(e) => updateSelectedOverlay({ content: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-100 font-bold"
                />
                <input
                  type="color"
                  value={activeOverlay.color}
                  onChange={(e) => updateSelectedOverlay({ color: e.target.value })}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span>{isAr ? 'الحجم:' : 'Size:'}</span>
                  <input
                    type="range"
                    min={12}
                    max={52}
                    value={activeOverlay.fontSize}
                    onChange={(e) => updateSelectedOverlay({ fontSize: Number(e.target.value) })}
                    className="w-20 accent-amber-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span>{isAr ? 'تدوير:' : 'Rotate:'}</span>
                  <input
                    type="range"
                    min={-45}
                    max={45}
                    value={activeOverlay.rotation}
                    onChange={(e) => updateSelectedOverlay({ rotation: Number(e.target.value) })}
                    className="w-20 accent-amber-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => deleteOverlay(activeOverlay.id)}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'حذف العنصر' : 'Delete'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Move className="w-4 h-4 text-amber-400" />
                <span>
                  {isAr
                    ? `الخانة النشطة #${selectedSlotIdx + 1}: اسحب الصورة بالماوس للتحريك، أو استخدم أزرار التكبير والتدوير السريعة`
                    : `Active Slot #${selectedSlotIdx + 1}: Drag photo directly to pan, or use quick zoom/rotate controls`}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    updateSlot(selectedSlotIdx, { zoom: Math.max(0.5, Number((activeSlot.zoom - 0.15).toFixed(2))) })
                  }
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono tabular-nums text-amber-400 font-bold px-1">
                  {Math.round(activeSlot.zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateSlot(selectedSlotIdx, { zoom: Math.min(3, Number((activeSlot.zoom + 0.15).toFixed(2))) })
                  }
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => updateSlot(selectedSlotIdx, { rotation: activeSlot.rotation + 90 })}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSendToStudio('laser-prep')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold flex items-center gap-1"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تجهيز لليزر' : 'Laser Prep'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
