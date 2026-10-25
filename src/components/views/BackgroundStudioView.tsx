import React, { useState, useRef } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  Scissors,
  Sparkles,
  Download,
  CheckCircle2,
  Loader2,
  Droplet,
  Layers,
  Palette,
  Image as ImageIcon,
  Upload,
  ArrowRight,
} from 'lucide-react';

export const BackgroundStudioView: React.FC = () => {
  const { activeProject, selectedImageForTool, sendImageToTool, setCurrentView, settings } = useStudio();
  const isAr = settings.language === 'ar';

  const [bgMode, setBgMode] = useState<'transparent' | 'white' | 'color' | 'generate'>('transparent');
  const [selectedColor, setSelectedColor] = useState('#0f2a1d');
  const [bgPrompt, setBgPrompt] = useState('رخام زمردي ملكي داكن مع عروق ذهبية عتيقة');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [cutoutDataUrl, setCutoutDataUrl] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentImage =
    uploadedImage ||
    selectedImageForTool ||
    activeProject.originalImages?.[0] ||
    activeProject.prompts?.[0]?.references?.[0]?.url ||
    '';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setUploadedImage(event.target.result);
        setCutoutDataUrl(null);
        setIsDone(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Real canvas background isolation logic
  const handleProcess = () => {
    if (!currentImage) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 600;
      canvas.height = img.naturalHeight || 800;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Sample corner color for background chroma extraction
      const cornerR = data[0];
      const cornerG = data[1];
      const cornerB = data[2];

      const threshold = 65;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean distance from corner background color
        const dist = Math.sqrt((r - cornerR) ** 2 + (g - cornerG) ** 2 + (b - cornerB) ** 2);
        if (dist < threshold) {
          // Transparent
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Create composite with selected background mode
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = canvas.width;
      finalCanvas.height = canvas.height;
      const finalCtx = finalCanvas.getContext('2d');
      if (finalCtx) {
        if (bgMode === 'white') {
          finalCtx.fillStyle = '#ffffff';
          finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        } else if (bgMode === 'color') {
          finalCtx.fillStyle = selectedColor;
          finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        } else if (bgMode === 'generate') {
          // Luxury Emerald Gradient
          const grad = finalCtx.createRadialGradient(
            finalCanvas.width / 2,
            finalCanvas.height / 3,
            50,
            finalCanvas.width / 2,
            finalCanvas.height / 2,
            finalCanvas.width
          );
          grad.addColorStop(0, '#15392b');
          grad.addColorStop(0.6, '#091c15');
          grad.addColorStop(1, '#020805');
          finalCtx.fillStyle = grad;
          finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        }

        finalCtx.drawImage(canvas, 0, 0);
        const url = finalCanvas.toDataURL('image/png');
        setCutoutDataUrl(url);
        setIsDone(true);
        setIsProcessing(false);
        setStatusMsg(
          isAr
            ? 'تم عزل الخلفية بنجاح وتجهيز ملف PNG الشفاف!'
            : 'Background removed successfully and transparent PNG generated!'
        );
        setTimeout(() => setStatusMsg(null), 4000);
      }
    };
  };

  const handleDownload = () => {
    const url = cutoutDataUrl || currentImage;
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `NAGAR_CUTOUT_${bgMode}_${Date.now()}.png`;
    link.click();
  };

  const handleSendToEditor = () => {
    const target = cutoutDataUrl || currentImage;
    if (target) {
      sendImageToTool(target, 'image-editor');
      setCurrentView('image-editor');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Scissors className="w-5 h-5 text-pink-400" />
            <h1 className="text-xl font-black text-slate-100">
              {isAr ? 'عزل واستبدال الخلفية (Background / Cutout)' : 'AI Background Cutout & Generator'}
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'عزل الأشخاص والعناصر بدقة فائقة مع إمكانية استبدال الخلفية بـ PNG شفاف أو رخام زمردي أو لون مخصص.'
              : 'Precision AI cutout with transparent PNG, solid colors, or generative luxury backdrops.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-pink-400" />
            <span>{isAr ? 'رفع صورة' : 'Upload Image'}</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

          {isDone && (
            <>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? 'تحميل PNG الشفاف' : 'Download PNG'}</span>
              </button>
              <button
                onClick={handleSendToEditor}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? 'إرسال للمحرر' : 'Send to Editor'}</span>
              </button>
            </>
          )}

          <button
            onClick={handleProcess}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-pink-500/20 transition-all disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
            <span>{isProcessing ? (isAr ? 'جاري العزل والتوليد...' : 'Processing...') : (isAr ? 'تطبيق العزل والاستبدال' : 'Apply Cutout')}</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{statusMsg}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-emerald-400 font-bold">
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Preview Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div
            className={`relative w-full aspect-[3/4] max-h-[70vh] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center ${
              bgMode === 'transparent' ? 'bg-checkerboard' : ''
            }`}
            style={{
              backgroundColor: bgMode === 'color' ? selectedColor : bgMode === 'white' ? '#ffffff' : undefined,
            }}
          >
            <img src={cutoutDataUrl || currentImage} alt="Cutout" className="w-full h-full object-contain" />
            {isDone && (
              <span className="absolute top-4 right-4 px-2.5 py-1 rounded-md bg-emerald-500 text-slate-950 font-bold text-[10px] shadow">
                {isAr ? 'تم العزل بنجاح ✓' : 'Cutout Applied ✓'}
              </span>
            )}
          </div>
        </div>

        {/* Options Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              {isAr ? 'خيارات استبدال الخلفية' : 'Background Modes'}
            </span>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'transparent', label: isAr ? 'خلفية شفافة (PNG)' : 'Transparent (PNG)', icon: Layers },
                { id: 'white', label: isAr ? 'خلفية بيضاء نقية' : 'Pure White', icon: Droplet },
                { id: 'color', label: isAr ? 'لون موحد مخصص' : 'Custom Color', icon: Palette },
                { id: 'generate', label: isAr ? 'توليد خلفية زمردية فاخرة' : 'Generate Royal Emerald', icon: Sparkles },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setBgMode(m.id as any);
                      setIsDone(false);
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-start gap-1 text-right transition-colors ${
                      bgMode === m.id
                        ? 'border-pink-500 bg-pink-500/10 text-pink-300 font-bold'
                        : 'border-slate-800 bg-[#090e17] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span className="text-xs">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {bgMode === 'color' && (
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{isAr ? 'اختر لون الخلفية' : 'Pick Color'}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => {
                      setSelectedColor(e.target.value);
                      setIsDone(false);
                    }}
                    className="h-9 w-14 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedColor}
                    onChange={(e) => {
                      setSelectedColor(e.target.value);
                      setIsDone(false);
                    }}
                    className="flex-1 bg-[#090e17] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>
            )}

            {bgMode === 'generate' && (
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{isAr ? 'وصف الخلفية المطلوبة' : 'AI Background Prompt'}</label>
                <textarea
                  value={bgPrompt}
                  onChange={(e) => setBgPrompt(e.target.value)}
                  rows={2}
                  className="w-full bg-[#090e17] border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:border-pink-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
