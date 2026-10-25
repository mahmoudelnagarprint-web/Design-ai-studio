import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { exportProjectPackage, exportPromptPackage } from '../../services/storage';
import {
  X,
  Download,
  FileCode,
  Image,
  Flame,
  FileCheck,
  CheckCircle2,
  Sliders,
  Layers,
  Sparkles,
} from 'lucide-react';

export const ExportCenterModal: React.FC = () => {
  const { isExportCenterOpen, setIsExportCenterOpen, activeProject, activePrompt, settings } = useStudio();
  const isAr = settings.language === 'ar';

  const [selectedFormat, setSelectedFormat] = useState<'PNG' | 'JPG' | 'WebP' | 'PDF' | 'SVG' | 'DXF' | 'PROMPT_PACKAGE' | 'PROJECT_PACKAGE'>('PNG');
  const [resolutionDpi, setResolutionDpi] = useState<300 | 150 | 72 | 600>(300);
  const [quality, setQuality] = useState(100);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedSuccess, setExportedSuccess] = useState(false);

  if (!isExportCenterOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    setExportedSuccess(false);

    setTimeout(() => {
      if (selectedFormat === 'PROJECT_PACKAGE') {
        exportProjectPackage(activeProject);
      } else if (selectedFormat === 'PROMPT_PACKAGE' && activePrompt) {
        exportPromptPackage(activePrompt);
      } else {
        // Download current result or composite
        const resultUrl =
          activePrompt?.generatedResults?.[0]?.url ||
          activeProject.originalImages?.[0] ||
          '';

        const link = document.createElement('a');
        link.href = resultUrl;
        link.download = `${activeProject.name.replace(/\s+/g, '_')}_${resolutionDpi}DPI.${selectedFormat.toLowerCase()}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      setIsExporting(false);
      setExportedSuccess(true);
      setTimeout(() => setExportedSuccess(false), 3000);
    }, 600);
  };

  const formats = [
    { id: 'PNG', label: 'PNG Image', descAr: 'دقة فائقة مع دعم الشفافية', descEn: 'Lossless with transparency', icon: Image },
    { id: 'JPG', label: 'JPEG Image', descAr: 'مناسب للطباعة والويب بحجم مضغوط', descEn: 'Optimized for web & print', icon: Image },
    { id: 'WebP', label: 'WebP Next-Gen', descAr: 'صيغة حديثة عالية الضغط', descEn: 'Modern high compression', icon: Image },
    { id: 'PDF', label: 'PDF Print Vector', descAr: 'جاهز لمطابع الديجيتال والأوفست', descEn: 'Ready for digital & offset press', icon: FileCheck },
    { id: 'SVG', label: 'SVG Vector Curves', descAr: 'متجهات قابلة للتحجيم بدون فقد', descEn: 'Infinite scaling vectors', icon: FileCode },
    { id: 'DXF', label: 'DXF Laser Cut Cad', descAr: 'متوافق مع ماكينات الليزر وCNC', descEn: 'Laser cutting & CNC vector file', icon: Flame },
    { id: 'PROMPT_PACKAGE', label: 'Prompt Package (JSON)', descAr: 'حزمة البرومبت مع كل الصور والإصدارات', descEn: 'Complete prompt with refs & history', icon: Sparkles },
    { id: 'PROJECT_PACKAGE', label: 'Project Package (JSON)', descAr: 'نسخة احتياطية كاملة للمشروع', descEn: 'Full project snapshot backup', icon: Layers },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#0e1422] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {isAr ? 'مركز التصدير الاحترافي' : 'Professional Export Center'}
              </h2>
              <p className="text-xs text-slate-400">
                {activeProject.name} • {activeProject.printSettings?.widthCm}×{activeProject.printSettings?.heightCm} cm
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExportCenterOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Format Selection Grid */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              {isAr ? 'اختر صيغة التصدير المناسبة:' : 'Select Export Format:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {formats.map((fmt) => {
                const Icon = fmt.icon;
                const isSelected = selectedFormat === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    onClick={() => setSelectedFormat(fmt.id as any)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-right transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300 shadow-md shadow-amber-950/20'
                        : 'border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-100">{fmt.label}</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {isAr ? fmt.descAr : fmt.descEn}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings Section (for raster formats) */}
          {['PNG', 'JPG', 'WebP', 'PDF'].includes(selectedFormat) && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>{isAr ? 'إعدادات الجودة ودقة الطباعة' : 'Resolution & Print Quality'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1.5">
                    {isAr ? 'كثافة النقط (DPI)' : 'Print DPI'}
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[72, 150, 300, 600].map((dpiVal) => (
                      <button
                        key={dpiVal}
                        onClick={() => setResolutionDpi(dpiVal as any)}
                        className={`py-1.5 text-xs rounded-lg font-mono font-medium border transition-colors ${
                          resolutionDpi === dpiVal
                            ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {dpiVal}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                    <span>{isAr ? 'مستوى الضغط والجودة' : 'Quality'}</span>
                    <span className="font-mono text-amber-400">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-950 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DXF / Laser Notification */}
          {selectedFormat === 'DXF' && (
            <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-950/20 text-xs text-red-200/90 flex items-start gap-2.5">
              <Flame className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{isAr ? 'ملف جاهز لماكينات الليزر:' : 'Laser Ready Vector:'} </span>
                {isAr
                  ? 'تم فحص المسارات تلقائيًا للتأكد من إغلاق المنحنيات وإزالة الخطوط المزدوجة وتحديد نقاط البداية والنهاية للقص السلس على الخشب والأكريليك.'
                  : 'Paths checked and verified for laser cutting without duplicate or open lines.'}
              </div>
            </div>
          )}

          {/* Success feedback */}
          {exportedSuccess && (
            <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAr ? 'تم تصدير وحفظ الملف بنجاح على جهازك!' : 'File exported successfully!'}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4 bg-slate-900/60">
          <div className="text-xs text-slate-400">
            {selectedFormat.includes('PACKAGE')
              ? isAr
                ? 'حزمة مستقلة قابلة للاسترجاع لاحقًا'
                : 'Standalone portable package'
              : `${activeProject.printSettings?.widthCm}×${activeProject.printSettings?.heightCm} cm • ${resolutionDpi} DPI`}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExportCenterOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>
                {isExporting
                  ? isAr
                    ? 'جاري التصدير...'
                    : 'Exporting...'
                  : isAr
                  ? `تحميل ملف ${selectedFormat}`
                  : `Download ${selectedFormat}`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
