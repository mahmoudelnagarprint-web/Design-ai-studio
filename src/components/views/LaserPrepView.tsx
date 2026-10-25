import React, { useState, useRef, useEffect } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  Flame,
  Sliders,
  AlertTriangle,
  Upload,
} from 'lucide-react';

export const LaserPrepView: React.FC = () => {
  const { activeProject, selectedImageForTool, settings } = useStudio();
  const isAr = settings.language === 'ar';

  const [threshold, setThreshold] = useState(128);
  const [invert, setInvert] = useState(false);
  const [fillMode, setFillMode] = useState<'cut' | 'engrave' | 'outline'>('cut');

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentImage =
    uploadedImage ||
    selectedImageForTool ||
    activeProject.assets?.find((a) => a.category === 'frames')?.url ||
    activeProject.prompts?.[0]?.generatedResults?.[0]?.url ||
    activeProject.originalImages?.[0] ||
    '';

  // Process image on canvas whenever threshold or settings change
  useEffect(() => {
    if (!currentImage) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImage;
    img.onload = () => {
      const maxDim = 800;
      let w = img.naturalWidth || 600;
      let h = img.naturalHeight || 800;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      canvas.width = w;
      canvas.height = h;

      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Threshold binarization
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        let val = gray >= threshold ? 255 : 0;
        if (invert) val = 255 - val;

        if (fillMode === 'cut') {
          // In cut mode, display black cutting foreground on dark laser grid
          if (val === 0) {
            data[i] = 239; // Red cut indicator
            data[i + 1] = 68;
            data[i + 2] = 68;
            data[i + 3] = 255;
          } else {
            data[i] = 11;
            data[i + 1] = 15;
            data[i + 2] = 23;
            data[i + 3] = 200;
          }
        } else if (fillMode === 'engrave') {
          // Engrave fill
          if (val === 0) {
            data[i] = 180;
            data[i + 1] = 83;
            data[i + 2] = 9;
            data[i + 3] = 240;
          } else {
            data[i] = 11;
            data[i + 1] = 15;
            data[i + 2] = 23;
            data[i + 3] = 200;
          }
        } else {
          // High contrast black and white
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
          data[i + 3] = 255;
        }
      }

      ctx.putImageData(imgData, 0, 0);

    };
  }, [currentImage, threshold, invert, fillMode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setUploadedImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-red-500" />
            <h1 className="text-xl font-black text-slate-100">
              {isAr ? 'تجهيز القص بالليزر والراوتر (Laser Preparation)' : 'Laser & CNC Preparation Studio'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
              {isAr ? 'معاينة فقط' : 'Preview only'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'هذه معاينة ثنائية للصورة فقط. لا يتم حاليًا إنشاء مسارات متجهة أو ملفات تشغيل ماكينة.'
              : 'This is a threshold preview only. Vector paths and machine-ready files are not currently generated.'}
          </p>
        </div>

        {/* Source upload; vector export is intentionally unavailable until real tracing exists. */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-red-400" />
            <span>{isAr ? 'رفع تصميم لليزر' : 'Upload Design'}</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          <span className="flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-400">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            {isAr ? 'تصدير المسارات غير متاح بعد' : 'Vector export is not available yet'}
          </span>
        </div>
      </div>

      <div role="alert" className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-950/20 p-3 text-xs text-amber-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <span>{isAr ? 'لا تستخدم هذه المعاينة للقص أو الحفر. لا يوجد في هذه النسخة فحص فعلي للمسارات أو توافق مع إعدادات الماكينة.' : 'Do not use this preview for cutting or engraving. This version does not validate paths or machine settings.'}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Vector Laser Path Preview Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full aspect-[3/4] max-h-[70vh] rounded-2xl overflow-hidden border-2 border-red-500/40 bg-[#070b12] shadow-2xl p-4 flex items-center justify-center">
            {/* Live Canvas Binarization Rendering */}
            <canvas ref={canvasRef} className="max-w-full max-h-full object-contain rounded-lg shadow-inner" />

            {!currentImage && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
                {isAr ? 'ارفع صورة لعرض معاينة العتبة' : 'Upload an image to preview the threshold'}
              </div>
            )}
            {/* This is a pixel preview, not vector path diagnostics. */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
              <span className="px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-md text-amber-300 text-[10px] font-mono font-bold border border-amber-500/40">
                {isAr ? 'معاينة بكسلية — ليست مسارات' : 'Pixel preview — not vector paths'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between w-full mt-2 px-1 text-[11px] text-slate-500">
            <span>{isAr ? 'معاينة تدرج ثنائي للصورة' : 'Binary threshold preview of the image'}</span>
          </div>
        </div>

        {/* Right: Laser Vectorization Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-red-400" />
              <span>{isAr ? 'إعدادات المعاينة' : 'Preview settings'}</span>
            </h3>

            {/* Cut / Engrave Mode */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1.5">{isAr ? 'نمط لون المعاينة' : 'Preview color mode'}</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cut', label: isAr ? 'قص نافذ (Cut)' : 'Cut' },
                  { id: 'engrave', label: isAr ? 'حفر (Engrave)' : 'Engrave' },
                  { id: 'outline', label: isAr ? 'تحديد (Outline)' : 'Outline' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setFillMode(mode.id as any)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      fillMode === mode.id
                        ? 'border-red-500 bg-red-500/20 text-red-300'
                        : 'border-slate-800 bg-[#090e17] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Threshold Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>{isAr ? 'عتبة التحويل بالأبيض والأسود (Threshold)' : 'Black & White Threshold'}</span>
                <span className="font-mono text-red-400 font-bold">{threshold}</span>
              </div>
              <input
                type="range"
                min="10"
                max="245"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-red-500 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Invert toggle */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#090e17] border border-slate-800 cursor-pointer text-xs text-slate-300 hover:border-slate-700">
              <span>{isAr ? 'عكس الألوان (Invert B/W)' : 'Invert Black & White'}</span>
              <input
                type="checkbox"
                checked={invert}
                onChange={(e) => setInvert(e.target.checked)}
                className="accent-red-500 h-4 w-4 cursor-pointer"
              />
            </label>

            <p className="rounded-xl border border-slate-800 bg-[#090e17] p-3 text-xs text-slate-400">
              {isAr ? 'التنعيم وتبسيط المسارات وفحص الإغلاق غير متاح حتى الآن؛ لن يتم احتسابها أو تضمينها في ملف.' : 'Path smoothing, simplification, and closure checks are not implemented yet and are not included in any output.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
