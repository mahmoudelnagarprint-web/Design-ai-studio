import React from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  Menu,
  RotateCcw,
  RotateCw,
  Copy,
  Download,
  Bot,
  Globe,
  CheckCircle2,
  Loader2,
  FolderOpen,
  Sparkles,
} from 'lucide-react';

// Official Google 4-color Brand Icon
const GoogleColorIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const Header: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
  const {
    activeProject,
    saveStatus,
    undo,
    redo,
    canUndo,
    canRedo,
    duplicateCurrentProject,
    setIsExportCenterOpen,
    isCopilotOpen,
    setIsCopilotOpen,
    setIsApiConnectionModalOpen,
    settings,
    updateSettings,
    setCurrentView,
  } = useStudio();

  const isAr = settings.language === 'ar';

  const toggleLanguage = () => {
    updateSettings({ language: isAr ? 'en' : 'ar' });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-[#0d131f]/90 px-4 backdrop-blur-md">
      {/* Left: Mobile Toggle & Project Info */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white lg:hidden"
          title="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('projects')}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-slate-800/80 text-left transition-colors"
          >
            <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-100 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {activeProject?.name || 'Graduation Design 2026'}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-2">
                <span>{activeProject?.printSettings?.widthCm}×{activeProject?.printSettings?.heightCm} cm</span>
                <span>•</span>
                <span className="text-amber-400/90">{activeProject?.prompts?.[0]?.versions?.length || 1} Versions</span>
              </span>
            </div>
          </button>
        </div>

        {/* Auto-save Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-[11px]">
          {saveStatus === 'saving' ? (
            <>
              <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
              <span className="text-amber-300/80">{isAr ? 'جاري الحفظ...' : 'Saving...'}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400/90">{isAr ? 'تم الحفظ' : 'Saved'}</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Actions (Undo/Redo, Duplicate, Export, AI Assistant, Language) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center border border-slate-800 rounded-lg p-0.5 bg-slate-900/60">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md transition-colors ${
              canUndo
                ? 'text-slate-200 hover:bg-slate-800 hover:text-white'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title={isAr ? 'تراجع (Undo)' : 'Undo'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-1.5 rounded-md transition-colors ${
              canRedo
                ? 'text-slate-200 hover:bg-slate-800 hover:text-white'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title={isAr ? 'إعادة (Redo)' : 'Redo'}
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Duplicate Project */}
        <button
          onClick={duplicateCurrentProject}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/60 bg-slate-800/60 text-slate-200 hover:bg-slate-700 hover:text-white text-xs font-medium transition-colors"
          title={isAr ? 'استنساخ المشروع بالكامل دون المساس بالأصل' : 'Duplicate Project'}
        >
          <Copy className="w-3.5 h-3.5 text-amber-400" />
          <span>{isAr ? 'نسخ المشروع' : 'Duplicate'}</span>
        </button>

        {/* Gemini API Connection */}
        <button
          onClick={() => setIsApiConnectionModalOpen(true)}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs transition-all shadow-sm group hover:border-amber-500/40"
          title={isAr ? 'إعداد واختبار اتصال Gemini API' : 'Configure and test Gemini API'}
        >
          <div className="h-6 w-6 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <GoogleColorIcon className="w-4 h-4" />
          </div>
          <div className="hidden md:flex flex-col text-right">
            <span className="text-[11px] font-bold text-slate-200 truncate max-w-[130px] group-hover:text-amber-300 transition-colors">
              Gemini API
            </span>
            <span className="text-[9px] text-slate-400 font-mono">
              {isAr ? 'اختبار الاتصال' : 'Test connection'}
            </span>
          </div>
        </button>

        {/* Export Center */}
        <button
          onClick={() => setIsExportCenterOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/10 transition-all"
        >
          <Download className="w-3.5 h-3.5 text-slate-950" />
          <span>{isAr ? 'مركز التصدير' : 'Export'}</span>
        </button>

        {/* AI Assistant Copilot Toggle */}
        <button
          onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            isCopilotOpen
              ? 'bg-purple-600/20 border-purple-500/50 text-purple-300 shadow-md shadow-purple-950/40'
              : 'border-slate-700/60 bg-slate-800/60 text-slate-200 hover:bg-slate-800 hover:text-white'
          }`}
          title="AI Design Assistant"
        >
          <Bot className="w-4 h-4 text-purple-400" />
          <span className="hidden sm:inline">{isAr ? 'مساعد AI' : 'AI Copilot'}</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
        </button>

        {/* Language Switch */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-medium transition-colors"
          title={isAr ? 'Switch to English' : 'التحويل للعربية'}
        >
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono">{isAr ? 'EN' : 'عربي'}</span>
        </button>
      </div>
    </header>
  );
};
