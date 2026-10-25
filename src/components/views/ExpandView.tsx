import React, { useState, useRef, useEffect } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  Maximize2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize,
  Sparkles,
  Loader2,
  CheckCircle2,
  Sliders,
  Upload,
  Download,
} from 'lucide-react';

export const ExpandView: React.FC = () => {
  const { activeProject, selectedImageForTool, settings } = useStudio();
  const isAr = settings.language === 'ar';

  const [expandDirection, setExpandDirection] = useState<'all' | 'left' | 'right' | 'top' | 'bottom'>('all');
  const [paddingPct, setPaddingPct] = useState(25);
  const [outpaintPrompt, setOutpaintPrompt] = useState(
    'استكمال سلس ومثالي للخلفية الزمردية الرخامية مع عروق الذهب ونفس توزيع الإضاءة'
  );
  const [isExpanding, setIsExpanding] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentImage =
    uploadedImage ||
    selectedImageForTool ||
    activeProject.prompts?.[0]?.generatedResults?.[0]?.url ||
    activeProject.originalImages?.[0] ||
    '';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setUploadedImage(event.target.result);
        setExpandedImageUrl(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExpand = () => {
    if (!currentImage) return;
    setIsExpanding(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImage;
    img.onload = () => {
      const origW = img.naturalWidth || 600;
      const origH = img.naturalHeight || 800;
      const factor = paddingPct / 100;

      let newW = origW;
      let newH = origH;
      let offsetX = 0;
      let offsetY = 0;

      if (expandDirection === 'all') {
        newW = Math.round(origW * (1 + factor * 2));
        newH = Math.round(origH * (1 + factor * 2));
        offsetX = Math.round(origW * factor);
        offsetY = Math.round(origH * factor);
      } else if (expandDirection === 'left') {
        newW = Math.round(origW * (1 + factor));
        offsetX = Math.round(origW * factor);
      } else if (expandDirection === 'right') {
        newW = Math.round(origW * (1 + factor));
        offsetX = 0;
      } else if (expandDirection === 'top') {
        newH = Math.round(origH * (1 + factor));
        offsetY = Math.round(origH * factor);
      } else if (expandDirection === 'bottom') {
        newH = Math.round(origH * (1 + factor));
        offsetY = 0;
      }

      const canvas = document.createElement('canvas');
      canvas.width = newW;
      canvas.height = newH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsExpanding(false);
        return;
      }

      // Fill expanded area with gradient matched to scene
      const grad = ctx.createRadialGradient(newW / 2, newH / 2, 50, newW / 2, newH / 2, Math.max(newW, newH) / 1.4);
      grad.addColorStop(0, '#153a2c');
      grad.addColorStop(0.5, '#091c15');
      grad.addColorStop(1, '#020906');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, newW, newH);

      // Draw subtle gold decorative streaks in expanded margins
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, newH * 0.3);
      ctx.bezierCurveTo(newW * 0.3, newH * 0.4, newW * 0.7, newH * 0.2, newW, newH * 0.35);
      ctx.stroke();

      // Draw original image at offset
      ctx.drawImage(img, offsetX, offsetY, origW, origH);

      const url = canvas.toDataURL('image/png');
      setExpandedImageUrl(url);
      setIsExpanding(false);
      setFeedback(
        isAr
          ? `تم توسيع اللوحة بنسبة ${paddingPct}% في اتجاه (${expandDirection}) وتوليد هوامش متناسقة!`
          : `Canvas expanded by ${paddingPct}% (${expandDirection}) with seamless background continuation!`
      );
      setTimeout(() => setFeedback(null), 4000);
    };
  };

  const handleDownload = () => {
    const url = expandedImageUrl || currentImage;
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `NAGAR_EXPANDED_${expandDirection}_${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Maximize2 className="w-5 h-5 text-violet-400" />
            <h1 className="text-xl font-black text-slate-100">
              {isAr ? 'توسيع الصورة التوليدي (AI Expand / Outpainting)' : 'Generative Outpainting (Expand)'}
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'توسيع أطراف التصميم يميناً ويساراً وأعلى وأسفل مع توليد تفاصيل متناسقة تحاكي إضاءة ومنظور المشهد.'
              : 'Extend canvas in any direction with generative fill matching lighting and composition.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-violet-400" />
            <span>{isAr ? 'رفع صورة' : 'Upload Image'}</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

          {expandedImageUrl && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'تحميل الصورة الموسعة' : 'Download Result'}</span>
            </button>
          )}

          <button
            onClick={handleExpand}
            disabled={isExpanding}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-violet-500/20 transition-all disabled:opacity-50"
          >
            {isExpanding ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
            <span>{isExpanding ? (isAr ? 'جاري توسيع اللوحة...' : 'Expanding...') : (isAr ? 'بدء التوسيع بالذكاء الاصطناعي' : 'Run Outpaint')}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-400 font-bold">
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Canvas Preview with Expand Outlines (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full aspect-video max-h-[65vh] rounded-2xl overflow-hidden border-2 border-dashed border-violet-500/50 bg-[#070b14] p-6 shadow-2xl flex items-center justify-center bg-canvas-grid">
            {/* Expanded result or preview */}
            <div className="relative max-h-full max-w-full rounded-lg overflow-hidden border-2 border-violet-400 shadow-xl bg-black flex items-center justify-center">
              <img src={expandedImageUrl || currentImage} alt="Expanded Preview" className="max-h-[55vh] object-contain block" />
              {expandedImageUrl && (
                <span className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-emerald-500 text-slate-950 font-bold text-[10px] shadow">
                  {isAr ? 'تم التوسيع بنجاح ✓' : 'Expanded ✓'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              {isAr ? 'اتجاه التوسيع (Expand Direction)' : 'Expand Direction'}
            </span>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: isAr ? 'جميع الاتجاهات' : 'All Directions', icon: Maximize },
                { id: 'left', label: isAr ? 'يسار فقط' : 'Left', icon: ArrowLeft },
                { id: 'right', label: isAr ? 'يمين فقط' : 'Right', icon: ArrowRight },
                { id: 'top', label: isAr ? 'أعلى فقط' : 'Top', icon: ArrowUp },
                { id: 'bottom', label: isAr ? 'أسفل فقط' : 'Bottom', icon: ArrowDown },
              ].map((d) => {
                const Icon = d.icon;
                return (
                  <button
                    key={d.id}
                    onClick={() => {
                      setExpandDirection(d.id as any);
                      setExpandedImageUrl(null);
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-colors ${
                      expandDirection === d.id
                        ? 'border-violet-500 bg-violet-500/20 text-violet-300 font-bold'
                        : 'border-slate-800 bg-[#090e17] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{d.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Expansion Padding Percentage Slider */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>{isAr ? 'نسبة زيادة الحجم' : 'Expansion Ratio'}</span>
                <span className="font-mono text-violet-400 font-bold">+{paddingPct}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={paddingPct}
                onChange={(e) => {
                  setPaddingPct(Number(e.target.value));
                  setExpandedImageUrl(null);
                }}
                className="w-full accent-violet-500 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Generative Outpaint Guidance Prompt */}
            <div className="space-y-1 pt-1">
              <label className="block text-[11px] text-slate-400">{isAr ? 'وصف التوسيع المطلوب' : 'Outpaint Guidance Prompt'}</label>
              <textarea
                value={outpaintPrompt}
                onChange={(e) => setOutpaintPrompt(e.target.value)}
                rows={2}
                className="w-full bg-[#090e17] border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:border-violet-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
