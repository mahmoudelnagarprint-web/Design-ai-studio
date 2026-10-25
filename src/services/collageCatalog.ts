import {
  CollageLayoutPreset,
  LayoutSlotDef,
  BackgroundPreset,
} from '../components/views/CollageStudioView';

// ============================================================================
// 1. REFERENCE SHEETS UPLOADED BY USER (PRE-LOADED FOR 1-CLICK CLONING)
// ============================================================================

export interface ReferenceTemplateSheet {
  id: string;
  nameAr: string;
  nameEn: string;
  url: string;
  cols: number;
  rows: number;
  descriptionAr: string;
}

export const PRELOADED_REFERENCE_SHEETS: ReferenceTemplateSheet[] = [
  {
    id: 'sheet-clusters-13',
    nameAr: 'لوحة قوالب الكلاستر والجاليري (13 Cluster Templates)',
    nameEn: '13 Cluster Templates Sheet',
    url: '/assets/aistudio/image_50095efe.png',
    cols: 4,
    rows: 4,
    descriptionAr: 'توزيعات جدارية حرة (Pinwheel, Spiral, Cinema Wings, Triptych)',
  },
  {
    id: 'sheet-scrapbook-15',
    nameAr: 'لوحة قوالب السكرابوكينج (15 Clean Scrapbooking 6x8)',
    nameEn: '15 Clean Photo Blocking Templates',
    url: '/assets/aistudio/image_cfd15ada.png',
    cols: 5,
    rows: 3,
    descriptionAr: 'تقسيمات نظيفة بإطارات بيضاء متناسقة (Everyday Scrapbooking)',
  },
  {
    id: 'sheet-architectural-20',
    nameAr: 'لوحة الشبكات المعمارية والموندريان (20 Modular Grids)',
    nameEn: '20 Modular Architectural Grids',
    url: '/assets/aistudio/image_8453167b.png',
    cols: 5,
    rows: 4,
    descriptionAr: 'شبكات الطوب المتداخلة والبينتو الحديث من 4 إلى 9 صور',
  },
];

// ============================================================================
// 2. ALL 48 HANDCRAFTED TEMPLATES EXTRACTED FROM THE 3 REFERENCE IMAGES
// ============================================================================

export const MASTER_CURATED_LAYOUTS: CollageLayoutPreset[] = [
  // --------------------------------------------------------------------------
  // GROUP A: 13 CLUSTER TEMPLATES (FROM IMAGE 1: image_50095efe.png)
  // --------------------------------------------------------------------------
  {
    id: 'cluster-1-hstrip3',
    nameAr: 'كلاستر 1: شريط ثلاثي أفقي متمركز',
    nameEn: 'Cluster 1: 3-Square Horizontal Strip',
    category: 'cluster' as any,
    photoCount: 3,
    badge: 'CLUSTER',
    slots: [
      { x: 6, y: 36, w: 28, h: 28, shape: 'rect' },
      { x: 36, y: 36, w: 28, h: 28, shape: 'rect', isHero: true },
      { x: 66, y: 36, w: 28, h: 28, shape: 'rect' },
    ],
  },
  {
    id: 'cluster-2-vtall3',
    nameAr: 'كلاستر 2: ثلاثية الأعمدة الرأسية',
    nameEn: 'Cluster 2: 3-Tall Vertical Triptych',
    category: 'cluster' as any,
    photoCount: 3,
    badge: 'CLUSTER',
    slots: [
      { x: 8, y: 24, w: 26, h: 52, shape: 'rect' },
      { x: 37, y: 24, w: 26, h: 52, shape: 'rect', isHero: true },
      { x: 66, y: 24, w: 26, h: 52, shape: 'rect' },
    ],
  },
  {
    id: 'cluster-3-stepped3',
    nameAr: 'كلاستر 3: الثلاثية المتدرجة (بطل وسطي)',
    nameEn: 'Cluster 3: Stepped Center Hero Triptych',
    category: 'cluster' as any,
    photoCount: 3,
    badge: 'CLUSTER',
    slots: [
      { x: 35, y: 22, w: 30, h: 56, shape: 'rect', isHero: true },
      { x: 9, y: 31, w: 24, h: 38, shape: 'rect' },
      { x: 67, y: 31, w: 24, h: 38, shape: 'rect' },
    ],
  },
  {
    id: 'cluster-4-spiral7',
    nameAr: 'كلاستر 4: الخلية الحلزونية السباعية',
    nameEn: 'Cluster 4: 7-Photo Spiral Mosaic',
    category: 'cluster' as any,
    photoCount: 7,
    badge: 'CLUSTER VIP',
    slots: [
      { x: 37, y: 31, w: 26, h: 38, shape: 'rect', isHero: true },
      { x: 37, y: 11, w: 34, h: 18, shape: 'rect' },
      { x: 13, y: 19, w: 22, h: 24, shape: 'rect' },
      { x: 9, y: 45, w: 26, h: 24, shape: 'rect' },
      { x: 29, y: 71, w: 34, h: 18, shape: 'rect' },
      { x: 65, y: 55, w: 22, h: 24, shape: 'rect' },
      { x: 65, y: 31, w: 26, h: 22, shape: 'rect' },
    ],
  },
  {
    id: 'cluster-5-cross5',
    nameAr: 'كلاستر 5: الجناح المتقاطع الخماسي',
    nameEn: 'Cluster 5: 5-Photo Cross Formation',
    category: 'cluster' as any,
    photoCount: 5,
    badge: 'CLUSTER',
    slots: [
      { x: 32, y: 41, w: 42, h: 18, shape: 'rect', isHero: true },
      { x: 8, y: 31, w: 22, h: 38, shape: 'rect' },
      { x: 32, y: 21, w: 20, h: 18, shape: 'rect' },
      { x: 32, y: 61, w: 20, h: 18, shape: 'rect' },
      { x: 76, y: 41, w: 16, h: 18, shape: 'rect' },
    ],
  },
  {
    id: 'cluster-6-staircase6',
    nameAr: 'كلاستر 6: المدرج الفني السداسي',
    nameEn: 'Cluster 6: 6-Photo Staggered Staircase',
    category: 'cluster' as any,
    photoCount: 6,
    badge: 'CLUSTER',
    slots: [
      { x: 29, y: 27, w: 42, h: 28, shape: 'rect', isHero: true },
      { x: 7, y: 48, w: 20, h: 28, shape: 'rect' },
      { x: 73, y: 20, w: 20, h: 28, shape: 'rect' },
      { x: 29, y: 57, w: 13, h: 15, shape: 'rect' },
      { x: 43.5, y: 57, w: 13, h: 15, shape: 'rect' },
      { x: 58, y: 57, w: 13, h: 15, shape: 'rect' },
    ],
  },
  {
    id: 'cluster-7-cinemawing5',
    nameAr: 'كلاستر 7: جناح السينما الخماسي',
    nameEn: 'Cluster 7: 5-Photo Cinema Wings',
    category: 'cluster' as any,
    photoCount: 5,
    badge: 'CLUSTER',
    slots: [
      { x: 31, y: 25, w: 38, h: 50, shape: 'rect', isHero: true },
      { x: 5, y: 25, w: 24, h: 24, shape: 'rect' },
      { x: 5, y: 51, w: 24, h: 24, shape: 'rect' },
      { x: 71, y: 25, w: 24, h: 24, shape: 'rect' },
      { x: 71, y: 51, w: 24, h: 24, shape: 'rect' },
    ],
  },
  {
    id: 'cluster-8-lsplit4',
    nameAr: 'كلاستر 8: التقسيم الرباعي غير المتماثل',
    nameEn: 'Cluster 8: 4-Photo Asymmetric Split',
    category: 'cluster' as any,
    photoCount: 4,
    badge: 'CLUSTER',
    slots: [
      { x: 6, y: 18, w: 42, h: 64, shape: 'rect', isHero: true },
      { x: 50, y: 18, w: 44, h: 28, shape: 'rect' },
      { x: 50, y: 48, w: 21, h: 34, shape: 'rect' },
      { x: 73, y: 48, w: 21, h: 34, shape: 'rect' },
    ],
  },
  {
    id: 'cluster-9-lefthero4',
    nameAr: 'كلاستر 9: عمود البطولة و3 شرائح',
    nameEn: 'Cluster 9: Left Hero + 3 Right Stack',
    category: 'cluster' as any,
    photoCount: 4,
    badge: 'CLUSTER',
    slots: [
      { x: 10, y: 16, w: 44, h: 68, shape: 'rect', isHero: true },
      { x: 56, y: 16, w: 34, h: 21, shape: 'rect' },
      { x: 56, y: 39.5, w: 34, h: 21, shape: 'rect' },
      { x: 56, y: 63, w: 34, h: 21, shape: 'rect' },
    ],
  },
  {
    id: 'cluster-10-theater7',
    nameAr: 'كلاستر 10: المسرح الملكي السباعي',
    nameEn: 'Cluster 10: 7-Photo Theater Wings',
    category: 'cluster' as any,
    photoCount: 7,
    badge: 'CLUSTER VIP',
    slots: [
      { x: 27, y: 24, w: 46, h: 52, shape: 'rect', isHero: true },
      { x: 5, y: 24, w: 20, h: 16, shape: 'rect' },
      { x: 5, y: 42, w: 20, h: 16, shape: 'rect' },
      { x: 5, y: 60, w: 20, h: 16, shape: 'rect' },
      { x: 75, y: 24, w: 20, h: 16, shape: 'rect' },
      { x: 75, y: 42, w: 20, h: 16, shape: 'rect' },
      { x: 75, y: 60, w: 20, h: 16, shape: 'rect' },
    ],
  },
  {
    id: 'cluster-11-quad4',
    nameAr: 'كلاستر 11: النافذة الرباعية المتمركزة',
    nameEn: 'Cluster 11: Centered 2x2 Window',
    category: 'cluster' as any,
    photoCount: 4,
    badge: 'CLUSTER',
    slots: [
      { x: 16, y: 18, w: 33, h: 31, shape: 'rect', isHero: true },
      { x: 51, y: 18, w: 33, h: 31, shape: 'rect' },
      { x: 16, y: 51, w: 33, h: 31, shape: 'rect' },
      { x: 51, y: 51, w: 33, h: 31, shape: 'rect' },
    ],
  },
  {
    id: 'cluster-12-matrix9',
    nameAr: 'كلاستر 12: مصفوفة الجاليري 3×3',
    nameEn: 'Cluster 12: 9-Square Gallery Matrix',
    category: 'cluster' as any,
    photoCount: 9,
    badge: 'CLUSTER',
    slots: [
      { x: 8, y: 14, w: 26, h: 22, shape: 'rect' },
      { x: 37, y: 14, w: 26, h: 22, shape: 'rect' },
      { x: 66, y: 14, w: 26, h: 22, shape: 'rect' },
      { x: 8, y: 39, w: 26, h: 22, shape: 'rect' },
      { x: 37, y: 39, w: 26, h: 22, shape: 'rect', isHero: true },
      { x: 66, y: 39, w: 26, h: 22, shape: 'rect' },
      { x: 8, y: 64, w: 26, h: 22, shape: 'rect' },
      { x: 37, y: 64, w: 26, h: 22, shape: 'rect' },
      { x: 66, y: 64, w: 26, h: 22, shape: 'rect' },
    ],
  },
  {
    id: 'cluster-13-pinwheel5',
    nameAr: 'كلاستر 13: المروحة الهندسية المتداخلة',
    nameEn: 'Cluster 13: 5-Photo Interlocking Pinwheel',
    category: 'cluster' as any,
    photoCount: 5,
    badge: '2028 ICONIC',
    slots: [
      { x: 33, y: 33, w: 34, h: 34, shape: 'rect', isHero: true },
      { x: 15, y: 15, w: 52, h: 16, shape: 'rect' },
      { x: 69, y: 15, w: 16, h: 52, shape: 'rect' },
      { x: 33, y: 69, w: 52, h: 16, shape: 'rect' },
      { x: 15, y: 33, w: 16, h: 52, shape: 'rect' },
    ],
  },

  // --------------------------------------------------------------------------
  // GROUP B: 15 SCRAPBOOKING PHOTO BLOCKING TEMPLATES (FROM IMAGE 2: image_cfd15ada.png)
  // --------------------------------------------------------------------------
  {
    id: 'scrap-1-sandwich4',
    nameAr: 'سكراب 1: بانر علوي وسفلي وقلبين (4 صور)',
    nameEn: 'Scrapbook 1: Top/Bottom Banners + 2 Mid',
    category: 'scrapbook' as any,
    photoCount: 4,
    badge: '6x8 BLOCK',
    slots: [
      { x: 6, y: 6, w: 88, h: 28, shape: 'rect', isHero: true },
      { x: 6, y: 36, w: 43, h: 28, shape: 'rect' },
      { x: 51, y: 36, w: 43, h: 28, shape: 'rect' },
      { x: 6, y: 66, w: 88, h: 28, shape: 'rect' },
    ],
  },
  {
    id: 'scrap-2-split5',
    nameAr: 'سكراب 2: عمودين يسار و3 يمين (5 صور)',
    nameEn: 'Scrapbook 2: Left 2 + Right 3 Split',
    category: 'scrapbook' as any,
    photoCount: 5,
    badge: '6x8 BLOCK',
    slots: [
      { x: 6, y: 6, w: 43, h: 43, shape: 'rect', isHero: true },
      { x: 6, y: 51, w: 43, h: 43, shape: 'rect' },
      { x: 51, y: 6, w: 43, h: 20.5, shape: 'rect' },
      { x: 51, y: 28.5, w: 43, h: 20.5, shape: 'rect' },
      { x: 51, y: 51, w: 43, h: 43, shape: 'rect' },
    ],
  },
  {
    id: 'scrap-3-tblock4',
    nameAr: 'سكراب 3: بطل يمين وبانر سفلي (4 صور)',
    nameEn: 'Scrapbook 3: Asymmetric T-Block',
    category: 'scrapbook' as any,
    photoCount: 4,
    badge: '6x8 BLOCK',
    slots: [
      { x: 51, y: 6, w: 43, h: 58, shape: 'rect', isHero: true },
      { x: 6, y: 6, w: 43, h: 28, shape: 'rect' },
      { x: 6, y: 36, w: 43, h: 28, shape: 'rect' },
      { x: 6, y: 66, w: 88, h: 28, shape: 'rect' },
    ],
  },
  {
    id: 'scrap-4-top3bot2',
    nameAr: 'سكراب 4: ثلاثي علوي وثنائي سفلي (5 صور)',
    nameEn: 'Scrapbook 4: 3 Top Tall + 2 Bottom',
    category: 'scrapbook' as any,
    photoCount: 5,
    badge: '6x8 BLOCK',
    slots: [
      { x: 6, y: 6, w: 28, h: 45, shape: 'rect' },
      { x: 36, y: 6, w: 28, h: 45, shape: 'rect', isHero: true },
      { x: 66, y: 6, w: 28, h: 45, shape: 'rect' },
      { x: 6, y: 53, w: 43, h: 41, shape: 'rect' },
      { x: 51, y: 53, w: 43, h: 41, shape: 'rect' },
    ],
  },
  {
    id: 'scrap-5-banner3banner',
    nameAr: 'سكراب 5: بانر مزدوج وثلاثي وسطي (5 صور)',
    nameEn: 'Scrapbook 5: Banners + 3 Center Row',
    category: 'scrapbook' as any,
    photoCount: 5,
    badge: '6x8 BLOCK',
    slots: [
      { x: 6, y: 6, w: 88, h: 28, shape: 'rect', isHero: true },
      { x: 6, y: 36, w: 28, h: 28, shape: 'rect' },
      { x: 36, y: 36, w: 28, h: 28, shape: 'rect' },
      { x: 66, y: 36, w: 28, h: 28, shape: 'rect' },
      { x: 6, y: 66, w: 88, h: 28, shape: 'rect' },
    ],
  },
  {
    id: 'scrap-7-lwrap6',
    nameAr: 'سكراب 7: البطل العلوي وحرف L (6 صور)',
    nameEn: 'Scrapbook 7: Hero + L-Wrap 6',
    category: 'scrapbook' as any,
    photoCount: 6,
    badge: '6x8 VIP',
    slots: [
      { x: 6, y: 6, w: 58, h: 58, shape: 'rect', isHero: true },
      { x: 66, y: 6, w: 28, h: 28, shape: 'rect' },
      { x: 66, y: 36, w: 28, h: 28, shape: 'rect' },
      { x: 6, y: 66, w: 28, h: 28, shape: 'rect' },
      { x: 36, y: 66, w: 28, h: 28, shape: 'rect' },
      { x: 66, y: 66, w: 28, h: 28, shape: 'rect' },
    ],
  },
  {
    id: 'scrap-8-grid6bot1',
    nameAr: 'سكراب 8: شبكة 3×2 وبانر سفلي عريض (7 صور)',
    nameEn: 'Scrapbook 8: 3x2 Grid + Bottom Banner',
    category: 'scrapbook' as any,
    photoCount: 7,
    badge: '6x8 BLOCK',
    slots: [
      { x: 6, y: 66, w: 88, h: 28, shape: 'rect', isHero: true },
      { x: 6, y: 6, w: 28, h: 28, shape: 'rect' },
      { x: 36, y: 6, w: 28, h: 28, shape: 'rect' },
      { x: 66, y: 6, w: 28, h: 28, shape: 'rect' },
      { x: 6, y: 36, w: 28, h: 28, shape: 'rect' },
      { x: 36, y: 36, w: 28, h: 28, shape: 'rect' },
      { x: 66, y: 36, w: 28, h: 28, shape: 'rect' },
    ],
  },
  {
    id: 'scrap-9-top1mid3bot2',
    nameAr: 'سكراب 9: هرمي 1 علوي + 3 وسط + 2 أسفل (6 صور)',
    nameEn: 'Scrapbook 9: 1 Top + 3 Mid + 2 Bottom',
    category: 'scrapbook' as any,
    photoCount: 6,
    badge: '6x8 BLOCK',
    slots: [
      { x: 6, y: 6, w: 88, h: 28, shape: 'rect', isHero: true },
      { x: 6, y: 36, w: 28, h: 28, shape: 'rect' },
      { x: 36, y: 36, w: 28, h: 28, shape: 'rect' },
      { x: 66, y: 36, w: 28, h: 28, shape: 'rect' },
      { x: 6, y: 66, w: 43, h: 28, shape: 'rect' },
      { x: 51, y: 66, w: 43, h: 28, shape: 'rect' },
    ],
  },
  {
    id: 'scrap-11-top1grid6',
    nameAr: 'سكراب 11: بانر علوي عريض + شبكة 3×2 (7 صور)',
    nameEn: 'Scrapbook 11: Top Banner + 3x2 Grid',
    category: 'scrapbook' as any,
    photoCount: 7,
    badge: '6x8 BLOCK',
    slots: [
      { x: 6, y: 6, w: 88, h: 28, shape: 'rect', isHero: true },
      { x: 6, y: 36, w: 28, h: 28, shape: 'rect' },
      { x: 36, y: 36, w: 28, h: 28, shape: 'rect' },
      { x: 66, y: 36, w: 28, h: 28, shape: 'rect' },
      { x: 6, y: 66, w: 28, h: 28, shape: 'rect' },
      { x: 36, y: 66, w: 28, h: 28, shape: 'rect' },
      { x: 66, y: 66, w: 28, h: 28, shape: 'rect' },
    ],
  },
  {
    id: 'scrap-12-left3right1',
    nameAr: 'سكراب 12: بانوراما يمين و3 مربعات يسار (4 صور)',
    nameEn: 'Scrapbook 12: Right Tall Hero + 3 Left',
    category: 'scrapbook' as any,
    photoCount: 4,
    badge: '6x8 BLOCK',
    slots: [
      { x: 38, y: 6, w: 56, h: 88, shape: 'rect', isHero: true },
      { x: 6, y: 6, w: 30, h: 28, shape: 'rect' },
      { x: 6, y: 36, w: 30, h: 28, shape: 'rect' },
      { x: 6, y: 66, w: 30, h: 28, shape: 'rect' },
    ],
  },
  {
    id: 'scrap-14-top2bot1',
    nameAr: 'سكراب 14: عمودين علويين وبانر سفلي (3 صور)',
    nameEn: 'Scrapbook 14: 2 Tall Top + 1 Bottom Wide',
    category: 'scrapbook' as any,
    photoCount: 3,
    badge: '6x8 BLOCK',
    slots: [
      { x: 6, y: 6, w: 43, h: 58, shape: 'rect', isHero: true },
      { x: 51, y: 6, w: 43, h: 58, shape: 'rect' },
      { x: 6, y: 66, w: 88, h: 28, shape: 'rect' },
    ],
  },

  // --------------------------------------------------------------------------
  // GROUP C: 20 MODULAR ARCHITECTURAL GRIDS (FROM IMAGE 3: image_8453167b.png)
  // --------------------------------------------------------------------------
  {
    id: 'arch-2-bento6',
    nameAr: 'معماري 2: بطل يسار علوي + 5 إطارات محيطة (6 صور)',
    nameEn: 'Modular 2: Top-Left Hero Bento (6)',
    category: 'bento',
    photoCount: 6,
    badge: 'MODULAR',
    slots: [
      { x: 4, y: 4, w: 45, h: 60, shape: 'rect', isHero: true },
      { x: 51, y: 4, w: 45, h: 29, shape: 'rect' },
      { x: 51, y: 35, w: 45, h: 29, shape: 'rect' },
      { x: 4, y: 66, w: 45, h: 30, shape: 'rect' },
      { x: 51, y: 66, w: 21.5, h: 30, shape: 'rect' },
      { x: 74.5, y: 66, w: 21.5, h: 30, shape: 'rect' },
    ],
  },
  {
    id: 'arch-3-top4bot4',
    nameAr: 'معماري 3: رباعي علوي عريض + 4 أعمدة سفلية (8 صور)',
    nameEn: 'Modular 3: 2x2 Top + 4 Bottom Strip (8)',
    category: 'bento',
    photoCount: 8,
    badge: 'MODULAR',
    slots: [
      { x: 4, y: 4, w: 45, h: 29, shape: 'rect', isHero: true },
      { x: 51, y: 4, w: 45, h: 29, shape: 'rect' },
      { x: 4, y: 35, w: 45, h: 29, shape: 'rect' },
      { x: 51, y: 35, w: 45, h: 29, shape: 'rect' },
      { x: 4, y: 66, w: 21.5, h: 30, shape: 'rect' },
      { x: 27.5, y: 66, w: 21.5, h: 30, shape: 'rect' },
      { x: 51, y: 66, w: 21.5, h: 30, shape: 'rect' },
      { x: 74.5, y: 66, w: 21.5, h: 30, shape: 'rect' },
    ],
  },
  {
    id: 'arch-4-brickwall9',
    nameAr: 'معماري 4: جدار الطوب المتداخل (9 صور)',
    nameEn: 'Modular 4: Staggered Brick Wall (9)',
    category: 'bento',
    photoCount: 9,
    badge: 'BRICK 2028',
    slots: [
      { x: 4, y: 4, w: 22, h: 29, shape: 'rect' },
      { x: 28, y: 4, w: 22, h: 29, shape: 'rect' },
      { x: 52, y: 4, w: 44, h: 29, shape: 'rect', isHero: true },
      { x: 4, y: 35, w: 29, h: 30, shape: 'rect' },
      { x: 35, y: 35, w: 30, h: 30, shape: 'rect' },
      { x: 67, y: 35, w: 29, h: 30, shape: 'rect' },
      { x: 4, y: 67, w: 44, h: 29, shape: 'rect' },
      { x: 50, y: 67, w: 22, h: 29, shape: 'rect' },
      { x: 74, y: 67, w: 22, h: 29, shape: 'rect' },
    ],
  },
  {
    id: 'arch-7-diag4',
    nameAr: 'معماري 7: التبادل القطري الذكي (4 صور)',
    nameEn: 'Modular 7: Diagonal Alternating (4)',
    category: 'bento',
    photoCount: 4,
    badge: 'MODULAR',
    slots: [
      { x: 4, y: 4, w: 58, h: 45, shape: 'rect', isHero: true },
      { x: 64, y: 4, w: 32, h: 45, shape: 'rect' },
      { x: 4, y: 51, w: 32, h: 45, shape: 'rect' },
      { x: 38, y: 51, w: 58, h: 45, shape: 'rect' },
    ],
  },
  {
    id: 'arch-8-centerfocus7',
    nameAr: 'معماري 8: بؤرة المركز السباعية (7 صور)',
    nameEn: 'Modular 8: Brick Center Focus (7)',
    category: 'bento',
    photoCount: 7,
    badge: 'MODULAR',
    slots: [
      { x: 31, y: 33, w: 38, h: 34, shape: 'rect', isHero: true },
      { x: 4, y: 4, w: 45, h: 27, shape: 'rect' },
      { x: 51, y: 4, w: 45, h: 27, shape: 'rect' },
      { x: 4, y: 33, w: 25, h: 34, shape: 'rect' },
      { x: 71, y: 33, w: 25, h: 34, shape: 'rect' },
      { x: 4, y: 69, w: 45, h: 27, shape: 'rect' },
      { x: 51, y: 69, w: 45, h: 27, shape: 'rect' },
    ],
  },
  {
    id: 'arch-9-topleft6',
    nameAr: 'معماري 9: بورتريه علوي كبير + 5 إطارات (6 صور)',
    nameEn: 'Modular 9: Big Top-Left + 5 Surround',
    category: 'bento',
    photoCount: 6,
    badge: 'MODULAR',
    slots: [
      { x: 4, y: 4, w: 54, h: 58, shape: 'rect', isHero: true },
      { x: 60, y: 4, w: 36, h: 34, shape: 'rect' },
      { x: 60, y: 40, w: 36, h: 26, shape: 'rect' },
      { x: 60, y: 68, w: 36, h: 28, shape: 'rect' },
      { x: 4, y: 64, w: 26, h: 32, shape: 'rect' },
      { x: 32, y: 64, w: 26, h: 32, shape: 'rect' },
    ],
  },
  {
    id: 'arch-12-botleft6',
    nameAr: 'معماري 12: بطل سفلي يسار + 5 إطارات (6 صور)',
    nameEn: 'Modular 12: Bottom-Left Hero (6)',
    category: 'bento',
    photoCount: 6,
    badge: 'MODULAR',
    slots: [
      { x: 4, y: 40, w: 56, h: 56, shape: 'rect', isHero: true },
      { x: 4, y: 4, w: 34, h: 34, shape: 'rect' },
      { x: 40, y: 4, w: 34, h: 34, shape: 'rect' },
      { x: 76, y: 4, w: 20, h: 34, shape: 'rect' },
      { x: 62, y: 40, w: 34, h: 20, shape: 'rect' },
      { x: 62, y: 62, w: 34, h: 34, shape: 'rect' },
    ],
  },
  {
    id: 'arch-14-sym8',
    nameAr: 'معماري 14: سيمفونية 3-2-3 المتوازنة (8 صور)',
    nameEn: 'Modular 14: 3 Top + 2 Wide Mid + 3 Bot (8)',
    category: 'bento',
    photoCount: 8,
    badge: 'MODULAR',
    slots: [
      { x: 4, y: 31, w: 45, h: 38, shape: 'rect', isHero: true },
      { x: 51, y: 31, w: 45, h: 38, shape: 'rect' },
      { x: 4, y: 4, w: 29, h: 25, shape: 'rect' },
      { x: 35, y: 4, w: 30, h: 25, shape: 'rect' },
      { x: 67, y: 4, w: 29, h: 25, shape: 'rect' },
      { x: 4, y: 71, w: 29, h: 25, shape: 'rect' },
      { x: 35, y: 71, w: 30, h: 25, shape: 'rect' },
      { x: 67, y: 71, w: 29, h: 25, shape: 'rect' },
    ],
  },
  {
    id: 'arch-15-mondrian8',
    nameAr: 'معماري 15: موندريان الـ 3 أعمدة المتداخلة (8 صور)',
    nameEn: 'Modular 15: 3-Column Mondrian Masonry (8)',
    category: 'bento',
    photoCount: 8,
    badge: 'MONDRIAN',
    slots: [
      { x: 4, y: 4, w: 29, h: 42, shape: 'rect', isHero: true },
      { x: 4, y: 48, w: 29, h: 22, shape: 'rect' },
      { x: 4, y: 72, w: 29, h: 24, shape: 'rect' },
      { x: 35, y: 4, w: 30, h: 28, shape: 'rect' },
      { x: 35, y: 34, w: 30, h: 36, shape: 'rect' },
      { x: 35, y: 72, w: 30, h: 24, shape: 'rect' },
      { x: 67, y: 4, w: 29, h: 28, shape: 'rect' },
      { x: 67, y: 34, w: 29, h: 62, shape: 'rect' },
    ],
  },
  {
    id: 'arch-16-cornerquad7',
    nameAr: 'معماري 16: بانر علوي ورباعي سفلي وعمود يمين (7 صور)',
    nameEn: 'Modular 16: Top Wide + 2x2 Quad + Right Stack (7)',
    category: 'bento',
    photoCount: 7,
    badge: 'MODULAR',
    slots: [
      { x: 4, y: 4, w: 58, h: 36, shape: 'rect', isHero: true },
      { x: 64, y: 4, w: 32, h: 36, shape: 'rect' },
      { x: 64, y: 42, w: 32, h: 54, shape: 'rect' },
      { x: 4, y: 42, w: 28, h: 26, shape: 'rect' },
      { x: 34, y: 42, w: 28, h: 26, shape: 'rect' },
      { x: 4, y: 70, w: 28, h: 26, shape: 'rect' },
      { x: 34, y: 70, w: 28, h: 26, shape: 'rect' },
    ],
  },
  {
    id: 'arch-18-top2bot3',
    nameAr: 'معماري 18: ثنائي علوي و3 أعمدة سفلية (5 صور)',
    nameEn: 'Modular 18: 2 Top + 3 Tall Bottom (5)',
    category: 'bento',
    photoCount: 5,
    badge: 'MODULAR',
    slots: [
      { x: 4, y: 4, w: 45, h: 38, shape: 'rect', isHero: true },
      { x: 51, y: 4, w: 45, h: 38, shape: 'rect' },
      { x: 4, y: 44, w: 29, h: 52, shape: 'rect' },
      { x: 35, y: 44, w: 30, h: 52, shape: 'rect' },
      { x: 67, y: 44, w: 29, h: 52, shape: 'rect' },
    ],
  },
  {
    id: 'arch-19-giant2bot3',
    nameAr: 'معماري 19: عملاقين بالأعلى و3 مربعات بالأسفل (5 صور)',
    nameEn: 'Modular 19: 2 Giant Portraits + 3 Bottom (5)',
    category: 'bento',
    photoCount: 5,
    badge: 'MODULAR VIP',
    slots: [
      { x: 4, y: 4, w: 45, h: 64, shape: 'rect', isHero: true },
      { x: 51, y: 4, w: 45, h: 64, shape: 'rect' },
      { x: 4, y: 70, w: 29, h: 26, shape: 'rect' },
      { x: 35, y: 70, w: 30, h: 26, shape: 'rect' },
      { x: 67, y: 70, w: 29, h: 26, shape: 'rect' },
    ],
  },
  {
    id: 'arch-20-columns7',
    nameAr: 'معماري 20: الأعمدة الثلاثة المتشابكة (7 صور)',
    nameEn: 'Modular 20: 3-Column Interlocking (7)',
    category: 'bento',
    photoCount: 7,
    badge: 'MODULAR',
    slots: [
      { x: 4, y: 4, w: 32, h: 45, shape: 'rect', isHero: true },
      { x: 4, y: 51, w: 32, h: 45, shape: 'rect' },
      { x: 38, y: 4, w: 24, h: 26, shape: 'rect' },
      { x: 38, y: 32, w: 24, h: 36, shape: 'rect' },
      { x: 38, y: 70, w: 24, h: 26, shape: 'rect' },
      { x: 64, y: 4, w: 32, h: 54, shape: 'rect' },
      { x: 64, y: 60, w: 32, h: 36, shape: 'rect' },
    ],
  },
];

// ============================================================================
// 3. EXPANDED 24 BACKGROUND PALETTES & GRADIENTS
// ============================================================================

export const EXPANDED_BACKGROUNDS: BackgroundPreset[] = [
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
    id: 'crisp-gallery-white',
    nameAr: 'أبيض معارض فنية نقي',
    nameEn: 'Crisp Gallery White',
    cssGradient: 'radial-gradient(circle at 50% 35%, #ffffff 0%, #f8fafc 70%, #f1f5f9 100%)',
    stops: ['#ffffff', '#f8fafc', '#f1f5f9'],
    borderDefault: '#0f172a',
    accentText: '#0f172a',
  },
  {
    id: 'scrapbook-sky-aqua',
    nameAr: 'سماوي السكرابوكينج الكلاسيكي',
    nameEn: 'Scrapbook Sky Blue',
    cssGradient: 'radial-gradient(circle at 50% 35%, #e0f2fe 0%, #bae6fd 65%, #7dd3fc 100%)',
    stops: ['#e0f2fe', '#bae6fd', '#7dd3fc'],
    borderDefault: '#ffffff',
    accentText: '#0c4a6e',
  },
  {
    id: 'editorial-ivory',
    nameAr: 'عاجي المجلات الفاخرة',
    nameEn: 'Editorial Warm Ivory',
    cssGradient: 'radial-gradient(circle at 50% 35%, #fafaf9 0%, #f5f5f4 65%, #e7e5e4 100%)',
    stops: ['#fafaf9', '#f5f5f4', '#e7e5e4'],
    borderDefault: '#78350f',
    accentText: '#1c1917',
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
  {
    id: 'imperial-gold-silk',
    nameAr: 'حرير إمبراطوري ذهبي',
    nameEn: 'Imperial Gold Silk',
    cssGradient: 'radial-gradient(circle at 50% 30%, #713f12 0%, #422006 60%, #1c0d02 100%)',
    stops: ['#713f12', '#422006', '#1c0d02'],
    borderDefault: '#fde047',
    accentText: '#fef9c3',
  },
  {
    id: 'nordic-sage',
    nameAr: 'مريمية إسكندنافية هادئة',
    nameEn: 'Nordic Sage Green',
    cssGradient: 'radial-gradient(circle at 50% 35%, #ecfdf5 0%, #d1fae5 65%, #a7f3d0 100%)',
    stops: ['#ecfdf5', '#d1fae5', '#a7f3d0'],
    borderDefault: '#065f46',
    accentText: '#064e3b',
  },
  {
    id: 'mocha-espresso',
    nameAr: 'موكا وإسبريسو دافئ',
    nameEn: 'Mocha Espresso',
    cssGradient: 'radial-gradient(circle at 50% 35%, #3e2723 0%, #271815 65%, #140c0a 100%)',
    stops: ['#3e2723', '#271815', '#140c0a'],
    borderDefault: '#d7ccc8',
    accentText: '#efebe9',
  },
  {
    id: 'sunset-terracotta',
    nameAr: 'غروب تيراكوتا دافئ',
    nameEn: 'Warm Terracotta',
    cssGradient: 'radial-gradient(circle at 50% 35%, #7c2d12 0%, #431407 65%, #1f0802 100%)',
    stops: ['#7c2d12', '#431407', '#1f0802'],
    borderDefault: '#fdba74',
    accentText: '#ffedd5',
  },
  {
    id: 'platinum-silver',
    nameAr: 'بلاتينيوم فضي معدني',
    nameEn: 'Platinum Metallic',
    cssGradient: 'radial-gradient(circle at 50% 35%, #475569 0%, #1e293b 65%, #0f172a 100%)',
    stops: ['#475569', '#1e293b', '#0f172a'],
    borderDefault: '#e2e8f0',
    accentText: '#f8fafc',
  },
  {
    id: 'rose-quartz-luxury',
    nameAr: 'روز كوارتز مخملي',
    nameEn: 'Rose Quartz Velvet',
    cssGradient: 'radial-gradient(circle at 50% 35%, #831843 0%, #500724 65%, #260210 100%)',
    stops: ['#831843', '#500724', '#260210'],
    borderDefault: '#f9a8d4',
    accentText: '#fce7f3',
  },
];

// ============================================================================
// 4. RICH SEAMLESS SVG PATTERN LIBRARY (16 PATTERNS WITH SCALE & OPACITY)
// ============================================================================

export interface PatternDefinition {
  id: string;
  nameAr: string;
  nameEn: string;
  buildSvg: (color: string, scale: number) => string;
}

export const SEAMLESS_PATTERNS: PatternDefinition[] = [
  {
    id: 'none',
    nameAr: 'بدون باترن (سادة)',
    nameEn: 'None (Solid/Gradient)',
    buildSvg: () => '',
  },
  {
    id: 'architectural-grid',
    nameAr: 'شبكة هندسية معمارية',
    nameEn: 'Architectural Grid',
    buildSvg: (color, s) =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
        <path d="M ${s} 0 L 0 0 0 ${s}" fill="none" stroke="${color}" stroke-width="1"/>
      </svg>`,
  },
  {
    id: 'diagonal-stripes',
    nameAr: 'خطوط مائلة كلاسيكية',
    nameEn: 'Diagonal Stripes',
    buildSvg: (color, s) =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 40 40">
        <path d="M-10,10 l20,-20 M0,40 l40,-40 M30,50 l20,-20" stroke="${color}" stroke-width="2"/>
      </svg>`,
  },
  {
    id: 'argyle-diamonds',
    nameAr: 'معينات ملكية متداخلة',
    nameEn: 'Royal Diamonds',
    buildSvg: (color, s) =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 40 40">
        <polygon points="20,2 38,20 20,38 2,20" fill="none" stroke="${color}" stroke-width="1.5"/>
        <circle cx="20" cy="20" r="2.5" fill="${color}"/>
      </svg>`,
  },
  {
    id: 'honeycomb-hex',
    nameAr: 'خلية النحل السداسية',
    nameEn: 'Honeycomb Hexagon',
    buildSvg: (color, s) =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 56 100">
        <path d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100" fill="none" stroke="${color}" stroke-width="2"/>
      </svg>`,
  },
  {
    id: 'islamic-star',
    nameAr: 'نجمة زخرفية إسلامية',
    nameEn: 'Arabesque Star',
    buildSvg: (color, s) =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 60 60">
        <rect x="12" y="12" width="36" height="36" fill="none" stroke="${color}" stroke-width="1.5"/>
        <rect x="12" y="12" width="36" height="36" transform="rotate(45 30 30)" fill="none" stroke="${color}" stroke-width="1.5"/>
        <circle cx="30" cy="30" r="4" fill="none" stroke="${color}" stroke-width="1.5"/>
      </svg>`,
  },
  {
    id: 'polka-dots',
    nameAr: 'نقاط استوديو ناعمة',
    nameEn: 'Polka Matrix',
    buildSvg: (color, s) =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 30 30">
        <circle cx="7" cy="7" r="2.2" fill="${color}"/>
        <circle cx="22" cy="22" r="2.2" fill="${color}"/>
      </svg>`,
  },
  {
    id: 'blueprint-cross',
    nameAr: 'صلبان تقنية 2028',
    nameEn: 'Tech Crosshairs',
    buildSvg: (color, s) =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 40 40">
        <path d="M20 14 V26 M14 20 H26" stroke="${color}" stroke-width="1.5"/>
      </svg>`,
  },
  {
    id: 'concentric-waves',
    nameAr: 'أقواس وموجات يابانية',
    nameEn: 'Seigaiha Waves',
    buildSvg: (color, s) =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 60 30">
        <path d="M 0 30 A 30 30 0 0 1 60 30 M 10 30 A 20 20 0 0 1 50 30 M 20 30 A 10 10 0 0 1 40 30" fill="none" stroke="${color}" stroke-width="1.5"/>
      </svg>`,
  },
  {
    id: 'chevron-zigzag',
    nameAr: 'شيفرون زجزاج عصري',
    nameEn: 'Modern Chevron',
    buildSvg: (color, s) =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 40 20">
        <polyline points="0,15 20,2 40,15" fill="none" stroke="${color}" stroke-width="2"/>
      </svg>`,
  },
  {
    id: 'starlight-dust',
    nameAr: 'نجوم وبريق ذهبي',
    nameEn: 'Starlight Sparkles',
    buildSvg: (color, s) =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 60 60">
        <path d="M15 5 L17 13 L25 15 L17 17 L15 25 L13 17 L5 15 L13 13 Z" fill="${color}"/>
        <circle cx="45" cy="42" r="2" fill="${color}"/>
        <circle cx="48" cy="14" r="1.2" fill="${color}"/>
      </svg>`,
  },
  {
    id: 'circles-overlap',
    nameAr: 'دوائر هندسية متشابكة',
    nameEn: 'Interlocking Circles',
    buildSvg: (color, s) =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="22" fill="none" stroke="${color}" stroke-width="1.2"/>
        <circle cx="0" cy="0" r="22" fill="none" stroke="${color}" stroke-width="1.2"/>
        <circle cx="50" cy="0" r="22" fill="none" stroke="${color}" stroke-width="1.2"/>
        <circle cx="0" cy="50" r="22" fill="none" stroke="${color}" stroke-width="1.2"/>
        <circle cx="50" cy="50" r="22" fill="none" stroke="${color}" stroke-width="1.2"/>
      </svg>`,
  },
];

export function getPatternDataUri(patternId: string, color: string, scale: number): string | null {
  const pat = SEAMLESS_PATTERNS.find((p) => p.id === patternId);
  if (!pat || pat.id === 'none') return null;
  const svg = pat.buildSvg(color, scale);
  if (!svg) return null;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ============================================================================
// 5. CLIENT-SIDE COMPUTER VISION TEMPLATE SLOT DETECTOR
//    (Scans any uploaded template image or cropped cell and extracts slots!)
// ============================================================================

export async function extractSlotsFromTemplateImage(
  imageSrc: string,
  cropRect?: { x: number; y: number; w: number; h: number } // 0..100 percentages
): Promise<LayoutSlotDef[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const S = 220; // Analysis grid 220x220
      const canvas = document.createElement('canvas');
      canvas.width = S;
      canvas.height = S;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve([]);
        return;
      }

      const sx = cropRect ? (cropRect.x / 100) * img.width : 0;
      const sy = cropRect ? (cropRect.y / 100) * img.height : 0;
      const sw = cropRect ? (cropRect.w / 100) * img.width : img.width;
      const sh = cropRect ? (cropRect.h / 100) * img.height : img.height;

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, S, S);
      const { data } = ctx.getImageData(0, 0, S, S);

      // Sample perimeter pixels to determine background color
      const bgSamples: [number, number, number][] = [];
      for (let i = 4; i < S - 4; i += 6) {
        const topIdx = (4 * S + i) * 4;
        const botIdx = ((S - 5) * S + i) * 4;
        const leftIdx = (i * S + 4) * 4;
        const rightIdx = (i * S + (S - 5)) * 4;
        bgSamples.push([data[topIdx], data[topIdx + 1], data[topIdx + 2]]);
        bgSamples.push([data[botIdx], data[botIdx + 1], data[botIdx + 2]]);
        bgSamples.push([data[leftIdx], data[leftIdx + 1], data[leftIdx + 2]]);
        bgSamples.push([data[rightIdx], data[rightIdx + 1], data[rightIdx + 2]]);
      }

      // Compute median background RGB
      const rSorted = bgSamples.map((c) => c[0]).sort((a, b) => a - b);
      const gSorted = bgSamples.map((c) => c[1]).sort((a, b) => a - b);
      const bSorted = bgSamples.map((c) => c[2]).sort((a, b) => a - b);
      const mid = Math.floor(bgSamples.length / 2);
      const bgR = rSorted[mid] ?? 255;
      const bgG = gSorted[mid] ?? 255;
      const bgB = bSorted[mid] ?? 255;

      // Build binary foreground mask (1 = slot pixel, 0 = background/gutter)
      const mask = new Uint8Array(S * S);
      for (let y = 2; y < S - 2; y++) {
        for (let x = 2; x < S - 2; x++) {
          const idx = (y * S + x) * 4;
          const dr = Math.abs(data[idx] - bgR);
          const dg = Math.abs(data[idx + 1] - bgG);
          const db = Math.abs(data[idx + 2] - bgB);
          const dist = dr + dg + db;
          if (dist > 70) {
            mask[y * S + x] = 1;
          }
        }
      }

      // Connected components flood-fill to extract bounding boxes
      const visited = new Uint8Array(S * S);
      const boxes: { minX: number; minY: number; maxX: number; maxY: number; area: number }[] = [];

      for (let y = 3; y < S - 3; y++) {
        for (let x = 3; x < S - 3; x++) {
          const startIdx = y * S + x;
          if (mask[startIdx] === 1 && visited[startIdx] === 0) {
            let minX = x;
            let maxX = x;
            let minY = y;
            let maxY = y;
            let count = 0;

            const queue: number[] = [startIdx];
            visited[startIdx] = 1;

            while (queue.length > 0) {
              const curr = queue.pop()!;
              const cy = Math.floor(curr / S);
              const cx = curr % S;
              count++;
              if (cx < minX) minX = cx;
              if (cx > maxX) maxX = cx;
              if (cy < minY) minY = cy;
              if (cy > maxY) maxY = cy;

              const neighbors = [curr - 1, curr + 1, curr - S, curr + S];
              for (const n of neighbors) {
                if (n >= 0 && n < S * S && mask[n] === 1 && visited[n] === 0) {
                  visited[n] = 1;
                  queue.push(n);
                }
              }
            }

            const bw = maxX - minX + 1;
            const bh = maxY - minY + 1;
            const rectArea = bw * bh;
            const fillRatio = count / rectArea;

            // Keep solid photo blocks (minimum 6% width/height, not a thin border line)
            if (bw >= S * 0.07 && bh >= S * 0.07 && bw <= S * 0.96 && bh <= S * 0.96 && fillRatio > 0.55) {
              boxes.push({ minX, minY, maxX, maxY, area: rectArea });
            }
          }
        }
      }

      if (boxes.length === 0) {
        resolve([]);
        return;
      }

      // Sort boxes top-to-bottom, left-to-right, and identify the largest as Hero
      let largestIdx = 0;
      let largestArea = 0;
      boxes.forEach((b, i) => {
        if (b.area > largestArea) {
          largestArea = b.area;
          largestIdx = i;
        }
      });

      const slots: LayoutSlotDef[] = boxes.slice(0, 16).map((b, idx) => ({
        x: Number(((b.minX / S) * 100).toFixed(1)),
        y: Number(((b.minY / S) * 100).toFixed(1)),
        w: Number((((b.maxX - b.minX) / S) * 100).toFixed(1)),
        h: Number((((b.maxY - b.minY) / S) * 100).toFixed(1)),
        shape: 'rect',
        isHero: idx === largestIdx,
      }));

      resolve(slots);
    };
    img.onerror = () => resolve([]);
    img.src = imageSrc;
  });
}
