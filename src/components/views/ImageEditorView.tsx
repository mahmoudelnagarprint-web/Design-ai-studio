import React, { useState, useRef, useEffect } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Layer } from '../../types';
import {
  Sliders,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Layers as LayersIcon,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Sparkles,
  Download,
  Brush,
  Eraser,
  Undo2,
  Redo2,
  Crop,
  Sun,
  Contrast,
  Droplet,
  SplitSquareVertical,
  Check,
} from 'lucide-react';

export const ImageEditorView: React.FC = () => {
  const { activeProject, updateActiveProject, selectedImageForTool, settings } = useStudio();
  const isAr = settings.language === 'ar';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filters & Adjustments
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [exposure, setExposure] = useState(0);
  const [sharpness, setSharpness] = useState(0);
  const [blur, setBlur] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Non-destructive preview
  const [showOriginal, setShowOriginal] = useState(false);

  // Tool Selection
  const [activeTool, setActiveTool] = useState<'select' | 'brush' | 'eraser' | 'crop'>('select');
  const [brushSize, setBrushSize] = useState(20);

  // Active layer selection
  const layers = activeProject.layers || [];
  const [selectedLayerId, setSelectedLayerId] = useState<string>(layers[0]?.id || '');

  // Base image to edit
  const currentBaseImage =
    selectedImageForTool ||
    activeProject.prompts?.[0]?.generatedResults?.[0]?.url ||
    activeProject.originalImages?.[0] ||
    '';

  // Redraw canvas with adjustments
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentBaseImage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = currentBaseImage;
    img.onload = () => {
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 1000;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      // Transform center
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      if (!showOriginal) {
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
      } else {
        ctx.filter = 'none';
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    };
  }, [currentBaseImage, brightness, contrast, saturation, blur, rotation, flipH, flipV, showOriginal]);

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setExposure(0);
    setSharpness(0);
    setBlur(0);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `NAGAR_EDITED_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-[#0a0e17]">
      {/* Left Adjustments & Tools Panel */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-800 bg-[#0d131f] flex flex-col overflow-y-auto">
        {/* Top Tools Bar */}
        <div className="p-4 border-b border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {isAr ? 'أدوات التحرير (Editor Tools)' : 'Tools'}
            </h2>
            <button
              onClick={resetFilters}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-medium"
            >
              {isAr ? 'إعادة ضبط' : 'Reset'}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'select', label: 'تحديد', icon: Sliders },
              { id: 'crop', label: 'قص', icon: Crop },
              { id: 'brush', label: 'فرشاة', icon: Brush },
              { id: 'eraser', label: 'ممحاة', icon: Eraser },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTool(t.id as any)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] transition-colors ${
                    activeTool === t.id
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Adjustments Sliders */}
        <div className="p-4 space-y-4 flex-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'الإضاءة والتباين' : 'Light & Color'}</span>
            </span>
          </div>

          {/* Brightness */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{isAr ? 'السطوع (Brightness)' : 'Brightness'}</span>
              <span className="font-mono text-amber-400">{brightness}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="200"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Contrast */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{isAr ? 'التباين (Contrast)' : 'Contrast'}</span>
              <span className="font-mono text-amber-400">{contrast}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="200"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Saturation */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{isAr ? 'التشبع (Saturation)' : 'Saturation'}</span>
              <span className="font-mono text-amber-400">{saturation}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={saturation}
              onChange={(e) => setSaturation(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Blur */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{isAr ? 'التمويه (Blur)' : 'Blur'}</span>
              <span className="font-mono text-amber-400">{blur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={blur}
              onChange={(e) => setBlur(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Transforms */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="block text-[11px] font-bold text-slate-400 uppercase">
              {isAr ? 'التحويل والتدوير' : 'Transform'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
              >
                <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                <span>+90°</span>
              </button>
              <button
                onClick={() => setFlipH((f) => !f)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs ${
                  flipH ? 'border-amber-500 bg-amber-500/20 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span>Flip H</span>
              </button>
              <button
                onClick={() => setFlipV((f) => !f)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs ${
                  flipV ? 'border-amber-500 bg-amber-500/20 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <FlipVertical className="w-3.5 h-3.5" />
                <span>Flip V</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer save/export */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{isAr ? 'تصدير النسخة المعدلة PNG' : 'Export Edited PNG'}</span>
          </button>
        </div>
      </div>

      {/* Center Interactive Canvas Viewport */}
      <div className="flex-1 flex flex-col relative bg-[#060910] overflow-hidden bg-canvas-grid">
        {/* Top Viewport Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200">Canvas</span>
            <span className="text-[10px] text-slate-500 font-mono">
              {activeProject.printSettings?.widthCm}×{activeProject.printSettings?.heightCm} cm
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Non-destructive Original Toggle */}
            <button
              onMouseDown={() => setShowOriginal(true)}
              onMouseUp={() => setShowOriginal(false)}
              onMouseLeave={() => setShowOriginal(false)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                showOriginal
                  ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Hold to view original unedited image"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>{isAr ? 'اضغط لعرض الأصل' : 'Hold for Original'}</span>
            </button>
          </div>
        </div>

        {/* Canvas viewport container */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
          <div className="relative shadow-2xl rounded-lg overflow-hidden border border-slate-800 max-h-[80vh] flex items-center justify-center">
            <canvas ref={canvasRef} className="max-h-[75vh] w-auto object-contain block" />
            {showOriginal && (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                {isAr ? 'الأصل (Original)' : 'Original'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Layers Panel */}
      <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-slate-800 bg-[#0d131f] flex flex-col">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayersIcon className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-200">
              {isAr ? 'الطبقات (Layers)' : 'Layers Stack'}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">{layers.length} Layers</span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {layers.map((layer) => (
            <div
              key={layer.id}
              onClick={() => setSelectedLayerId(layer.id)}
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                selectedLayerId === layer.id
                  ? 'border-amber-500 bg-amber-500/10 text-amber-200'
                  : 'border-slate-800 bg-[#090e17] text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                  {layer.dataUrl ? (
                    <img src={layer.dataUrl} alt={layer.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[9px] text-slate-500">{layer.type[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="truncate">
                  <span className="block text-xs font-bold text-slate-200 truncate">{layer.name}</span>
                  <span className="text-[9px] text-slate-500 uppercase">{layer.type}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {layer.locked && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                {layer.visible ? (
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
