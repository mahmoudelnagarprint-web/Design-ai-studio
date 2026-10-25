import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { exportProjectPackage, exportPromptPackage } from '../../services/storage';
import { X, Download, Image as ImageIcon, CheckCircle2, AlertCircle, Sliders, Layers, Sparkles, Loader2 } from 'lucide-react';

type ExportFormat = 'PNG' | 'JPEG' | 'WebP' | 'PROMPT_PACKAGE' | 'PROJECT_PACKAGE';

const rasterMimeTypes: Record<'PNG' | 'JPEG' | 'WebP', string> = {
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  WebP: 'image/webp',
};

export const ExportCenterModal: React.FC = () => {
  const { isExportCenterOpen, setIsExportCenterOpen, activeProject, activePrompt, settings } = useStudio();
  const isAr = settings.language === 'ar';
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('PNG');
  const [quality, setQuality] = useState(92);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedSuccess, setExportedSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  if (!isExportCenterOpen) return null;

  const rasterizeCurrentImage = async (format: 'PNG' | 'JPEG' | 'WebP'): Promise<Blob> => {
    const source = activePrompt?.generatedResults?.[0]?.url || activeProject.originalImages?.[0] || '';
    if (!source) throw new Error(isAr ? 'لا توجد صورة للتصدير.' : 'There is no image to export.');

    const image = new Image();
    if (!source.startsWith('data:')) image.crossOrigin = 'anonymous';
    image.src = source;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error(isAr ? 'تعذر تحميل الصورة؛ قد يمنع مصدرها التحويل بسبب CORS.' : 'Could not load the image; its source may block canvas conversion via CORS.'));
    });

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error(isAr ? 'تعذر إنشاء لوحة التصدير.' : 'Could not create the export canvas.');
    context.drawImage(image, 0, 0);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error(isAr ? 'فشل تحويل الصورة إلى الصيغة المطلوبة.' : 'Image conversion failed.')),
        rasterMimeTypes[format],
        format === 'PNG' ? undefined : quality / 100,
      );
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportedSuccess(false);
    setExportError(null);
    try {
      if (selectedFormat === 'PROJECT_PACKAGE') {
        exportProjectPackage(activeProject);
      } else if (selectedFormat === 'PROMPT_PACKAGE') {
        if (!activePrompt) throw new Error(isAr ? 'لا يوجد برومبت نشط للتصدير.' : 'There is no active prompt to export.');
        exportPromptPackage(activePrompt);
      } else {
        const blob = await rasterizeCurrentImage(selectedFormat);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const extension = selectedFormat === 'JPEG' ? 'jpg' : selectedFormat.toLowerCase();
        link.href = url;
        link.download = `${activeProject.name.trim().replace(/[^\p{L}\p{N}_-]+/gu, '_') || 'design'}.${extension}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      setExportedSuccess(true);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : (isAr ? 'فشل التصدير.' : 'Export failed.'));
    } finally {
      setIsExporting(false);
    }
  };

  const formats: { id: ExportFormat; label: string; descAr: string; descEn: string; icon: React.ElementType }[] = [
    { id: 'PNG', label: 'PNG Image', descAr: 'تحويل نقطي يحافظ على الشفافية', descEn: 'Raster conversion with transparency', icon: ImageIcon },
    { id: 'JPEG', label: 'JPEG Image', descAr: 'تحويل نقطي مضغوط', descEn: 'Compressed raster conversion', icon: ImageIcon },
    { id: 'WebP', label: 'WebP Image', descAr: 'تحويل نقطي حديث', descEn: 'Modern raster conversion', icon: ImageIcon },
    { id: 'PROMPT_PACKAGE', label: 'Prompt Package (JSON)', descAr: 'حزمة البرومبت وبياناته', descEn: 'Prompt and its data', icon: Sparkles },
    { id: 'PROJECT_PACKAGE', label: 'Project Package (JSON)', descAr: 'نسخة من بيانات المشروع', descEn: 'Project data snapshot', icon: Layers },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#0e1422] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/20 text-amber-400">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">{isAr ? 'مركز التصدير' : 'Export Center'}</h2>
              <p className="text-xs text-slate-400">{activeProject.name}</p>
            </div>
          </div>
          <button type="button" aria-label={isAr ? 'إغلاق' : 'Close'} onClick={() => setIsExportCenterOpen(false)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <div>
            <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-400">{isAr ? 'اختر نوع التصدير' : 'Select export type'}</label>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {formats.map((format) => {
                const Icon = format.icon;
                const selected = selectedFormat === format.id;
                return (
                  <button key={format.id} type="button" onClick={() => setSelectedFormat(format.id)} className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${selected ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-slate-800/60'}`}>
                    <span className={`shrink-0 rounded-lg p-2 ${selected ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}><Icon className="h-4 w-4" /></span>
                    <span className="truncate">
                      <span className="block text-xs font-bold text-slate-100">{format.label}</span>
                      <span className="block truncate text-[11px] text-slate-400">{isAr ? format.descAr : format.descEn}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {['JPEG', 'WebP'].includes(selectedFormat) && (
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Sliders className="h-4 w-4 text-amber-400" />
                <span>{isAr ? 'جودة التحويل' : 'Conversion quality'}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>{isAr ? 'ضغط الصورة' : 'Image quality'}</span><span className="font-mono text-amber-400">{quality}%</span>
              </div>
              <input type="range" min="50" max="100" value={quality} onChange={(event) => setQuality(Number(event.target.value))} className="w-full cursor-pointer accent-amber-500" />
            </div>
          )}

          {['PNG', 'JPEG', 'WebP'].includes(selectedFormat) && (
            <p className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-xs leading-5 text-amber-200">
              {isAr ? 'يتم تحويل الصورة على أبعاد البكسل الأصلية. لا يضيف هذا التصدير بيانات DPI أو ملف CMYK/ICC، ولا ينشئ PDF أو مسارات متجهة.' : 'The image is converted at its original pixel dimensions. This does not add DPI metadata or a CMYK/ICC profile, and does not create PDF or vector paths.'}
            </p>
          )}

          {exportError && <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/20 p-3 text-xs text-red-300"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{exportError}</p>}
          {exportedSuccess && <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3 text-xs text-emerald-300"><CheckCircle2 className="h-4 w-4" />{isAr ? 'تم إنشاء ملف التصدير وبدء التنزيل.' : 'Export file created and download started.'}</p>}
        </div>

        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/60 px-6 py-4">
          <p className="text-xs text-slate-400">{selectedFormat.includes('PACKAGE') ? (isAr ? 'حزمة بيانات JSON قابلة للحفظ' : 'Downloadable JSON data package') : (isAr ? 'تحويل صورة نقطية؛ لا يتضمن مواصفات طباعة' : 'Raster conversion; no print-production specifications')}</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setIsExportCenterOpen(false)} className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">{isAr ? 'إغلاق' : 'Close'}</button>
            <button type="button" onClick={handleExport} disabled={isExporting} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500 disabled:opacity-50">
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span>{isExporting ? (isAr ? 'جارٍ التصدير...' : 'Exporting...') : `${isAr ? 'تصدير' : 'Export'} ${selectedFormat}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
