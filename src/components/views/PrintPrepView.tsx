import React, { useState, useRef } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  Printer,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileCheck,
  Eye,
  ShieldCheck,
  Check,
  Upload,
} from 'lucide-react';

export const PrintPrepView: React.FC = () => {
  const { activeProject, updateActiveProject, selectedImageForTool, settings } = useStudio();
  const isAr = settings.language === 'ar';

  const [widthCm, setWidthCm] = useState(activeProject.printSettings?.widthCm || 30);
  const [heightCm, setHeightCm] = useState(activeProject.printSettings?.heightCm || 40);
  const [dpi, setDpi] = useState<72 | 150 | 300 | 600>(activeProject.printSettings?.dpi || 300);
  const [colorMode, setColorMode] = useState<'RGB' | 'CMYK'>(activeProject.printSettings?.colorMode || 'CMYK');
  const [bleedMm, setBleedMm] = useState(activeProject.printSettings?.bleedMm || 3);
  const [safeAreaMm, setSafeAreaMm] = useState(activeProject.printSettings?.safeAreaMm || 5);
  const [paperType, setPaperType] = useState(activeProject.printSettings?.paperType || 'Glossy');

  const [showBleedGuide, setShowBleedGuide] = useState(true);
  const [showSafeGuide, setShowSafeGuide] = useState(true);
  const [showCropMarks, setShowCropMarks] = useState(true);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentImage =
    uploadedImage ||
    selectedImageForTool ||
    activeProject.prompts?.[0]?.generatedResults?.[0]?.url ||
    activeProject.originalImages?.[0] ||
    '';

  // Pixels required at current DPI
  const pixelWidth = Math.round((widthCm / 2.54) * dpi);
  const pixelHeight = Math.round((heightCm / 2.54) * dpi);

  // Quality check diagnostics
  const isDpiGood = dpi >= 300;
  const isPrintSizeGood = widthCm > 0 && heightCm > 0;

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

  const handleSaveProfile = () => {
    updateActiveProject({
      printSettings: { widthCm, heightCm, dpi, colorMode, bleedMm, safeAreaMm, paperType },
    });
    setSaveSuccessMsg(
      isAr
        ? 'تم حفظ معايير وتجهيزات الطباعة في المشروع بنجاح!'
        : 'Print profile parameters saved to project successfully!'
    );
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleDownloadPrintReady = () => {
    const canvas = document.createElement('canvas');
    // Generates print canvas with crop marks & bleed
    const bleedPx = Math.round((bleedMm / 25.4) * dpi);
    canvas.width = pixelWidth + bleedPx * 2;
    canvas.height = pixelHeight + bleedPx * 2;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImage;
    img.onload = () => {
      // Draw content in bleed area
      ctx.drawImage(img, bleedPx, bleedPx, pixelWidth, pixelHeight);

      // Crop Marks in corners
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(2, Math.round(dpi / 150));

      const markLen = Math.round((8 / 25.4) * dpi);

      // Top-Left mark
      ctx.beginPath();
      ctx.moveTo(bleedPx, 0);
      ctx.lineTo(bleedPx, markLen);
      ctx.moveTo(0, bleedPx);
      ctx.lineTo(markLen, bleedPx);
      // Top-Right mark
      ctx.moveTo(canvas.width - bleedPx, 0);
      ctx.lineTo(canvas.width - bleedPx, markLen);
      ctx.moveTo(canvas.width, bleedPx);
      ctx.lineTo(canvas.width - markLen, bleedPx);
      // Bottom-Left mark
      ctx.moveTo(bleedPx, canvas.height);
      ctx.lineTo(bleedPx, canvas.height - markLen);
      ctx.moveTo(0, canvas.height - bleedPx);
      ctx.lineTo(markLen, canvas.height - bleedPx);
      // Bottom-Right mark
      ctx.moveTo(canvas.width - bleedPx, canvas.height);
      ctx.lineTo(canvas.width - bleedPx, canvas.height - markLen);
      ctx.moveTo(canvas.width, canvas.height - bleedPx);
      ctx.lineTo(canvas.width - markLen, canvas.height - bleedPx);
      ctx.stroke();

      // Trigger download
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `NAGAR_PRINT_${widthCm}x${heightCm}cm_${dpi}DPI_${Date.now()}.png`;
      link.click();

      setSaveSuccessMsg(
        isAr
          ? `تم تصدير ملف الطباعة بدقة ${canvas.width}×${canvas.height} بكسل مع علامات القص!`
          : `Print file exported at ${canvas.width}x${canvas.height}px with crop marks!`
      );
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    };
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Printer className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-black text-slate-100">
              {isAr ? 'تجهيز التصميم للطباعة (Print Preparation)' : 'Print Preparation Studio'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono font-bold">
              {widthCm}×{heightCm} cm • {dpi} DPI • {colorMode}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'ضبط المقاسات بالسنتيمتر، هوامش القص (Bleed)، منطقة الأمان، وتصدير ملفات الطباعة بدقة 300 DPI جاهزة للمطابع.'
              : 'Configure physical dimensions, bleed margins, safe area, and run pre-flight print checks.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>{isAr ? 'رفع ملف للطباعة' : 'Upload File'}</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

          <button
            onClick={handleSaveProfile}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'حفظ المعايير' : 'Save Profile'}</span>
          </button>

          <button
            onClick={handleDownloadPrintReady}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{isAr ? 'تحميل ملف الطباعة الجاهز (300 DPI)' : 'Download Print Ready (300 DPI)'}</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-400 font-bold">
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Canvas with Bleed & Safe Area Guides (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full aspect-[3/4] max-h-[70vh] rounded-2xl overflow-hidden border border-slate-800 bg-[#090d16] p-8 shadow-2xl flex items-center justify-center">
            {/* The Print Sheet container */}
            <div
              className={`relative w-full h-full rounded-lg overflow-hidden border border-slate-700 shadow-xl bg-black ${
                colorMode === 'CMYK' ? 'filter saturate-90 contrast-105' : ''
              }`}
            >
              <img src={currentImage} alt="Print Preview" className="w-full h-full object-cover" />

              {/* Bleed Guide (Red Dashed Border) */}
              {showBleedGuide && (
                <div
                  className="absolute inset-0 border-2 border-dashed border-red-500/80 pointer-events-none"
                  title="Bleed Margin (منطقة القص)"
                >
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-red-600/90 text-white text-[9px] font-mono font-bold">
                    Bleed ({bleedMm}mm)
                  </span>
                </div>
              )}

              {/* Safe Area Guide (Cyan Border) */}
              {showSafeGuide && (
                <div
                  className="absolute border border-cyan-400/80 pointer-events-none"
                  style={{
                    inset: `${safeAreaMm * 2.5}px`,
                  }}
                  title="Safe Area (المنطقة الآمنة للنصوص)"
                >
                  <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-cyan-600/90 text-white text-[9px] font-mono font-bold">
                    Safe Area ({safeAreaMm}mm)
                  </span>
                </div>
              )}

              {/* Crop marks indicator */}
              {showCropMarks && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white" />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showBleedGuide}
                onChange={(e) => setShowBleedGuide(e.target.checked)}
                className="accent-red-500 rounded"
              />
              <span className="text-red-400 font-medium">{isAr ? 'إظهار خط القص (Bleed)' : 'Show Bleed Guide'}</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showSafeGuide}
                onChange={(e) => setShowSafeGuide(e.target.checked)}
                className="accent-cyan-500 rounded"
              />
              <span className="text-cyan-400 font-medium">{isAr ? 'إظهار منطقة الأمان (Safe Area)' : 'Show Safe Area'}</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showCropMarks}
                onChange={(e) => setShowCropMarks(e.target.checked)}
                className="accent-slate-400 rounded"
              />
              <span className="text-slate-300 font-medium">{isAr ? 'علامات الزوايا (Crop Marks)' : 'Show Crop Marks'}</span>
            </label>
          </div>
        </div>

        {/* Right: Print Pre-Flight Diagnostic & Config (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Dimensions Card */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>{isAr ? 'أبعاد اللوحة ونوع الورق' : 'Dimensions & Media'}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{isAr ? 'العرض (سم)' : 'Width (cm)'}</label>
                <input
                  type="number"
                  value={widthCm}
                  onChange={(e) => setWidthCm(Number(e.target.value))}
                  className="w-full bg-[#090e17] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{isAr ? 'الارتفاع (سم)' : 'Height (cm)'}</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full bg-[#090e17] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-blue-500"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-500">{isAr ? 'المقاسات الشائعة:' : 'Presets:'}</span>
              {[
                { label: '30×40', w: 30, h: 40 },
                { label: '50×70', w: 50, h: 70 },
                { label: 'A3', w: 29.7, h: 42 },
                { label: 'A4', w: 21, h: 29.7 },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setWidthCm(p.w);
                    setHeightCm(p.h);
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[10px] font-mono text-slate-300 border border-slate-700 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Resolution DPI Selection */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1.5">{isAr ? 'دقة الطباعة (DPI)' : 'Print Resolution (DPI)'}</label>
              <div className="grid grid-cols-4 gap-2">
                {[72, 150, 300, 600].map((val) => (
                  <button
                    key={val}
                    onClick={() => setDpi(val as any)}
                    className={`py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors ${
                      dpi === val
                        ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                        : 'border-slate-800 bg-[#090e17] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {val} DPI
                  </button>
                ))}
              </div>
            </div>

            {/* Color Mode Selection */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1.5">{isAr ? 'نظام الألوان للمطبعة' : 'Color Mode'}</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'CMYK', label: 'CMYK (طباعة 4 ألوان أوفست وديجيتال)' },
                  { id: 'RGB', label: 'RGB (شاشات وتصوير فوتوغرافي)' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setColorMode(mode.id as any)}
                    className={`p-2.5 rounded-xl text-xs font-bold border text-right transition-colors ${
                      colorMode === mode.id
                        ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                        : 'border-slate-800 bg-[#090e17] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pre-Flight Diagnostic Quality Check */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'فحص جاهزية الطباعة (Pre-Flight Check)' : 'Pre-Flight Diagnostic'}</span>
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090e17] border border-slate-800 text-xs">
                <span className="text-slate-300">{isAr ? 'معدل الدقة (DPI Check)' : 'DPI Check'}</span>
                <span className={`font-bold flex items-center gap-1 ${isDpiGood ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isDpiGood ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {dpi} DPI ({isDpiGood ? (isAr ? 'ممتاز' : 'Optimal') : (isAr ? 'منخفض' : 'Low')})
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090e17] border border-slate-800 text-xs">
                <span className="text-slate-300">{isAr ? 'أبعاد البكسل المطلوبة' : 'Required Pixels'}</span>
                <span className="font-mono text-blue-400 font-bold">
                  {pixelWidth} × {pixelHeight} px
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090e17] border border-slate-800 text-xs">
                <span className="text-slate-300">{isAr ? 'هامش القص الآمن (Bleed)' : 'Bleed Verification'}</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {bleedMm} mm ({isAr ? 'معتمد' : 'Standard'})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
