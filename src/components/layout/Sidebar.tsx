import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { StudioView } from '../../types';
import {
  LayoutDashboard,
  Sparkles,
  Image as ImageIcon,
  Wand2,
  Maximize2,
  Brush,
  BrainCircuit,
  Bot,
  Layers,
  LayoutGrid,
  Scissors,
  FileText,
  Palette,
  Type,
  Printer,
  Flame,
  BookmarkCheck,
  FolderArchive,
  FolderOpen,
  Clock,
  Settings as SettingsIcon,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SidebarItem {
  id: StudioView;
  labelAr: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  category?: string;
}

export const Sidebar: React.FC<{ isOpen: boolean; onClose?: () => void }> = ({ isOpen, onClose }) => {
  const { currentView, setCurrentView, activeProject, settings } = useStudio();
  const isAr = settings.language === 'ar';

  const menuSections: { titleAr: string; titleEn: string; items: SidebarItem[] }[] = [
    {
      titleAr: 'الرئيسية والإبداع',
      titleEn: 'Core & Creation',
      items: [
        { id: 'dashboard', labelAr: 'لوحة التحكم', labelEn: 'Dashboard', icon: LayoutDashboard },
        { id: 'create', labelAr: 'إنشاء جديد', labelEn: 'Create', icon: Sparkles },
        { id: 'prompt-to-image', labelAr: 'توليد من برومبت', labelEn: 'Prompt → Image', icon: Bot, badge: 'AI' },
        { id: 'image-to-prompt', labelAr: 'تحليل لصورة إلى برومبت', labelEn: 'Image → Prompt', icon: BrainCircuit },
      ],
    },
    {
      titleAr: 'محرر واستوديو الذكاء الاصطناعي',
      titleEn: 'Editor & AI Tools',
      items: [
        { id: 'image-editor', labelAr: 'محرر الصور والطبقات', labelEn: 'Image Editor', icon: ImageIcon },
        { id: 'ai-enhance', labelAr: 'تحسين الجودة وUpscale', labelEn: 'AI Enhance', icon: Sparkles },
        { id: 'expand', labelAr: 'توسيع الصورة Outpaint', labelEn: 'Expand', icon: Maximize2 },
        { id: 'generative-edit', labelAr: 'التعديل التوليدي', labelEn: 'Generative Edit', icon: Brush },
        { id: 'background-cutout', labelAr: 'عزل وقص الخلفية', labelEn: 'Background / Cutout', icon: Scissors },
      ],
    },
    {
      titleAr: 'التفكيك والتركيب',
      titleEn: 'Decompose & Composite',
      items: [
        { id: 'design-decomposer', labelAr: 'تفكيك التصميم إلى عناصر', labelEn: 'Design Decomposer', icon: Layers, badge: 'Pro' },
        { id: 'collage-studio', labelAr: 'استوديو الكولاج الذكي', labelEn: 'Collage Studio', icon: LayoutGrid },
      ],
    },
    {
      titleAr: 'الخطوط والألوان والنصوص',
      titleEn: 'Typography & Colors',
      items: [
        { id: 'text-ocr', labelAr: 'استخراج النصوص OCR', labelEn: 'Text & OCR', icon: FileText },
        { id: 'fonts', labelAr: 'اكتشاف وتنسيق الخطوط', labelEn: 'Fonts', icon: Type },
        { id: 'colors', labelAr: 'استوديو الألوان والباليت', labelEn: 'Colors', icon: Palette },
      ],
    },
    {
      titleAr: 'التجهيز للإنتاج والتصنيع',
      titleEn: 'Production & Manufacturing',
      items: [
        { id: 'print-prep', labelAr: 'معاينة وتجهيز PNG للطباعة', labelEn: 'Print PNG Preview', icon: Printer, badge: 'PNG' },
        { id: 'laser-prep', labelAr: 'معاينة عتبة الليزر', labelEn: 'Laser Threshold Preview', icon: Flame, badge: 'Preview' },
      ],
    },
    {
      titleAr: 'المكتبات والمشاريع',
      titleEn: 'Libraries & Projects',
      items: [
        { id: 'prompt-library', labelAr: 'مكتبة البرومبت والإصدارات', labelEn: 'Prompt Library', icon: BookmarkCheck },
        { id: 'asset-library', labelAr: 'مكتبة العناصر والملحقات', labelEn: 'Asset Library', icon: FolderArchive },
        { id: 'projects', labelAr: 'إدارة المشاريع', labelEn: 'Projects', icon: FolderOpen },
        { id: 'history', labelAr: 'سجل التعديلات', labelEn: 'History', icon: Clock },
        { id: 'settings', labelAr: 'إعدادات النظام والنماذج', labelEn: 'Settings', icon: SettingsIcon },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 z-40 flex w-72 flex-col border-r border-slate-800 bg-[#0d131f] transition-transform duration-300 lg:static lg:translate-x-0 ${
          isAr ? 'right-0 border-l border-r-0' : 'left-0 border-r'
        } ${isOpen ? 'translate-x-0' : isAr ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Banner */}
        <div className="flex h-18 items-center justify-between border-b border-slate-800/80 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 shadow-lg shadow-amber-500/20 text-slate-950 font-black text-lg">
              N
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider text-slate-100 uppercase">
                NAGAR DESIGN
              </h1>
              <p className="text-[10px] font-medium tracking-widest text-amber-400 uppercase">
                AI Studio 2026
              </p>
            </div>
          </div>
          <span className="flex h-6 items-center rounded-full bg-emerald-500/10 px-2 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
            PRO
          </span>
        </div>

        {/* Active Project Quick Card */}
        <div className="p-3 border-b border-slate-800/60 bg-slate-900/40">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>{isAr ? 'المشروع النشط' : 'Active Project'}</span>
            <span className="text-amber-400/90 font-mono text-[10px]">
              {activeProject?.prompts?.[0]?.versions?.length || 1} Versions
            </span>
          </div>
          <button
            onClick={() => setCurrentView('projects')}
            className="w-full text-right flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition-colors group"
          >
            <div className="truncate text-left font-medium text-xs text-slate-200 group-hover:text-amber-300">
              {activeProject?.name || 'Graduation Design 2026'}
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 shrink-0" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx}>
              <div className="px-2 mb-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-500">
                {isAr ? section.titleAr : section.titleEn}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        if (onClose) onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-950/40'
                          : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                        <span className="truncate">{isAr ? item.labelAr : item.labelEn}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase ${
                            item.badge === 'AI'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : item.badge === 'Preview'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : item.badge === 'PNG'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info & identity preserve status */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 text-slate-400 text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium">Non-Destructive Core</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">v2.0</span>
        </div>
      </aside>
    </>
  );
};
