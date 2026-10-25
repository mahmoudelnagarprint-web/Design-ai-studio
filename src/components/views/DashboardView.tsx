import React from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  Sparkles,
  PlusCircle,
  Upload,
  BrainCircuit,
  Bot,
  Layers,
  LayoutGrid,
  Scissors,
  Maximize2,
  Wand2,
  Star,
  Clock,
  ArrowRight,
  FolderOpen,
  Image as ImageIcon,
  Flame,
  Printer,
  ChevronRight,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    projects,
    activeProject,
    setActiveProjectId,
    setCurrentView,
    createNewProject,
    sendImageToTool,
    settings,
  } = useStudio();

  const isAr = settings.language === 'ar';

  const quickActions = [
    {
      id: 'new-project',
      labelAr: 'مشروع جديد',
      labelEn: 'New Project',
      descAr: 'بدء لوحة عمل بمقاس مخصص',
      descEn: 'Custom canvas workspace',
      icon: PlusCircle,
      color: 'from-amber-500 to-amber-600',
      action: () => createNewProject(isAr ? 'مشروع تصميم جديد' : 'New Design Project'),
    },
    {
      id: 'prompt-to-image',
      labelAr: 'توليد من برومبت',
      labelEn: 'Prompt → Image',
      descAr: 'توليد صور مع صور مرجعية متعددة',
      descEn: 'Multi-reference prompt generation',
      icon: Bot,
      color: 'from-purple-500 to-indigo-600',
      action: () => setCurrentView('prompt-to-image'),
    },
    {
      id: 'image-to-prompt',
      labelAr: 'صورة إلى برومبت',
      labelEn: 'Image → Prompt',
      descAr: 'استخراج البرومبت الدقيق بـ 15 بُعد',
      descEn: 'Reverse-engineer full prompt',
      icon: BrainCircuit,
      color: 'from-blue-500 to-cyan-600',
      action: () => setCurrentView('image-to-prompt'),
    },
    {
      id: 'enhance',
      labelAr: 'تحسين الجودة وUpscale',
      labelEn: 'AI Enhance',
      descAr: 'مضاعفة الدقة 4x مع الحفاظ على الملامح',
      descEn: 'Super-resolution & face preserve',
      icon: Sparkles,
      color: 'from-emerald-500 to-teal-600',
      action: () => setCurrentView('ai-enhance'),
    },
    {
      id: 'remove-bg',
      labelAr: 'إزالة وعزل الخلفية',
      labelEn: 'Remove Background',
      descAr: 'قص نقي فوري مع توليد بدائل',
      descEn: 'Instant cutout & generation',
      icon: Scissors,
      color: 'from-pink-500 to-rose-600',
      action: () => setCurrentView('background-cutout'),
    },
    {
      id: 'expand',
      labelAr: 'توسيع الصورة Outpaint',
      labelEn: 'Expand',
      descAr: 'توسيع أطراف التصميم تلقائياً',
      descEn: 'Generative canvas extension',
      icon: Maximize2,
      color: 'from-violet-500 to-purple-600',
      action: () => setCurrentView('expand'),
    },
    {
      id: 'extract-design',
      labelAr: 'تفكيك التصميم إلى عناصر',
      labelEn: 'Extract Design',
      descAr: 'فصل الإطارات، النصوص، والخلفية',
      descEn: 'Deconstruct design to layers',
      icon: Layers,
      color: 'from-amber-600 to-yellow-500',
      action: () => setCurrentView('design-decomposer'),
    },
    {
      id: 'collage',
      labelAr: 'صانع الكولاج الذكي',
      labelEn: 'Create Collage',
      descAr: 'توزيع 7 صور بتوازن وهيكل احترافي',
      descEn: 'Smart photo collage layout',
      icon: LayoutGrid,
      color: 'from-emerald-600 to-green-500',
      action: () => setCurrentView('collage-studio'),
    },
  ];

  const recentPrompts = activeProject?.prompts || [];
  const latestResults = recentPrompts[0]?.generatedResults || [];
  const favoriteProjects = projects.filter((p) => p.isFavorite);
  const inProgressProjects = projects.filter((p) => p.status === 'in_progress');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-r from-slate-900 via-[#121927] to-slate-900 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'المنصة الشاملة لإدارة وتعديل وتجهيز التصميمات' : 'Modular AI Design Platform'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              {isAr ? 'استوديو نجار ديزاين للذكاء الاصطناعي' : 'NAGAR DESIGN AI STUDIO'}
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              {isAr
                ? 'نظام متكامل يربط بين إدارة الصور المرجعية المقفلة 🔒، إصدارات البرومبت، محرر الطبقات، تفكيك التصاميم، وتجهيز الطباعة والليزر.'
                : 'Unified design workflow linking locked references, prompt versions, canvas layers, decomposition, and manufacturing prep.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentView('prompt-to-image')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all"
            >
              <Bot className="w-4 h-4" />
              <span>{isAr ? 'توليد تصميم تخرج' : 'Start Graduation Design'}</span>
            </button>
            <button
              onClick={() => createNewProject()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'مشروع جديد' : 'New Project'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {isAr ? 'الإجراءات السريعة (Quick Actions)' : 'Quick Actions'}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                className="group flex flex-col items-start p-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-800/60 hover:border-slate-700 text-right transition-all shadow-sm hover:shadow-md"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} text-white shadow-md mb-3 group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                  {isAr ? action.labelAr : action.labelEn}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {isAr ? action.descAr : action.descEn}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Active Project Highlight & Recent Generations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Project Overview */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-200">
                {isAr ? 'المشروع النشط الحالي' : 'Active Project'}
              </h3>
            </div>
            <button
              onClick={() => setCurrentView('projects')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              <span>{isAr ? 'جميع المشاريع' : 'View all'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#090e17] border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-slate-100">{activeProject.name}</span>
                {activeProject.isFavorite && (
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                )}
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 max-w-xl">
                {activeProject.description || activeProject.notes}
              </p>
              <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-500">
                <span className="font-mono text-amber-400/90">
                  {activeProject.printSettings?.widthCm}×{activeProject.printSettings?.heightCm} cm
                </span>
                <span>•</span>
                <span>{activeProject.layers?.length || 4} Layers</span>
                <span>•</span>
                <span>{activeProject.prompts?.[0]?.references?.length || 4} References</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('prompt-library')}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shrink-0 transition-colors"
            >
              {isAr ? 'فتح الاستوديو' : 'Open Studio'}
            </button>
          </div>

          {/* Quick References preview */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center justify-between">
              <span>{isAr ? 'الصور المرجعية المقترنة بالمشروع:' : 'Paired Reference Images:'}</span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {activeProject.prompts?.[0]?.references?.filter((r) => r.isLocked).length || 1} 🔒 Locked
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {(activeProject.prompts?.[0]?.references || []).slice(0, 6).map((ref) => (
                <div
                  key={ref.id}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-950"
                  title={`${ref.name} (${ref.role})`}
                >
                  <img src={ref.url} alt={ref.name} className="w-full h-full object-cover" />
                  {ref.isLocked && (
                    <span className="absolute top-1 right-1 p-1 rounded-md bg-amber-500 text-slate-950 shadow">
                      🔒
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 text-center">
                    <span className="text-[9px] text-slate-200 font-medium leading-tight">
                      {ref.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Latest Results Carousel / Grid */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>{isAr ? 'آخر النتائج المولدة' : 'Recent Generations'}</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              v{activeProject.prompts?.[0]?.version || 3}
            </span>
          </div>

          {latestResults.length > 0 ? (
            <div className="space-y-3">
              {latestResults.map((res) => (
                <div
                  key={res.id}
                  className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-[3/4]"
                >
                  <img src={res.url} alt="Result" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                    <span className="text-xs font-bold text-amber-300">{res.notes || 'Result 01'}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{res.referenceSummary}</span>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => sendImageToTool(res.url, 'image-editor')}
                        className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 text-[10px] font-bold"
                      >
                        {isAr ? 'تعديل' : 'Edit'}
                      </button>
                      <button
                        onClick={() => sendImageToTool(res.url, 'ai-enhance')}
                        className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 text-[10px] font-medium"
                      >
                        {isAr ? 'تحسين' : 'Enhance'}
                      </button>
                      <button
                        onClick={() => sendImageToTool(res.url, 'laser-prep')}
                        className="px-2.5 py-1 rounded bg-red-600/30 text-red-200 text-[10px] font-medium border border-red-500/30"
                      >
                        {isAr ? 'ليزر' : 'Laser'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-slate-800 text-center">
              <ImageIcon className="w-8 h-8 text-slate-600 mb-2" />
              <span className="text-xs text-slate-400">
                {isAr ? 'لم يتم توليد صور بعد في هذا البرومبت' : 'No generations yet'}
              </span>
              <button
                onClick={() => setCurrentView('prompt-to-image')}
                className="mt-3 text-xs text-amber-400 hover:underline font-bold"
              >
                {isAr ? 'ابدأ التوليد الآن' : 'Generate Now'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Projects List Summary (Favorites & In-Progress) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {isAr ? 'المشاريع قيد التنفيذ والمفضلة' : 'Projects in Progress & Favorites'}
          </h2>
          <button
            onClick={() => setCurrentView('projects')}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium"
          >
            {isAr ? 'عرض الكل' : 'View all'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => setActiveProjectId(proj.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                proj.id === activeProject.id
                  ? 'border-amber-500/50 bg-slate-900/70 shadow-lg shadow-amber-950/20'
                  : 'border-slate-800 bg-slate-900/30 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{proj.name}</span>
                    {proj.isFavorite && (
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {proj.description || proj.notes}
                  </p>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    proj.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {proj.status}
                </span>
              </div>

              <div className="flex items-center justify-between mt-4 text-[11px] text-slate-500">
                <span className="font-mono">
                  {proj.printSettings?.widthCm}×{proj.printSettings?.heightCm} cm • {proj.printSettings?.dpi} DPI
                </span>
                <span className="text-amber-400 text-xs font-medium">
                  {proj.id === activeProject.id ? (isAr ? 'المشروع النشط ✓' : 'Active ✓') : (isAr ? 'تفعيل' : 'Activate')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
