import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { extractColors } from '../../services/api';
import {
  Palette,
  Sparkles,
  Copy,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Sliders,
} from 'lucide-react';

export const ColorsView: React.FC = () => {
  const { activeProject, selectedImageForTool, settings } = useStudio();
  const isAr = settings.language === 'ar';

  const [isExtracting, setIsExtracting] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const [colorData, setColorData] = useState<any>({
    paletteName: 'Royal Emerald & Antique Gold (الزمرد الملكي والذهب)',
    mainColors: [
      { hex: '#0F2A1D', name: 'Deep Emerald Green', percentage: 48 },
      { hex: '#0B1410', name: 'Obsidian Velvet', percentage: 32 },
    ],
    secondaryColors: [
      { hex: '#2F5D48', name: 'Sage Highlight', percentage: 12 },
      { hex: '#E2DCD5', name: 'Parchment Academic', percentage: 5 },
    ],
    accentColors: [
      { hex: '#D4AF37', name: 'Metallic Antique Gold', percentage: 2 },
      { hex: '#FDE047', name: 'Champagne Shimmer', percentage: 1 },
    ],
    suggestedAlternatives: [
      { name: 'Midnight Sapphire & Rose Gold', colors: ['#0A1931', '#152D53', '#D48C70', '#F7E7CE'] },
      { name: 'Imperial Ruby & Champagne', colors: ['#4A0E17', '#2A080D', '#E5E4E2', '#D4AF37'] },
      { name: 'Monochrome Luxe & Platinum', colors: ['#111827', '#1F2937', '#E5E7EB', '#FFFFFF'] },
    ],
  });

  const currentImage =
    selectedImageForTool ||
    activeProject.prompts?.[0]?.generatedResults?.[0]?.url ||
    activeProject.originalImages?.[0] ||
    '';

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleExtract = async () => {
    setIsExtracting(true);
    try {
      const res = await extractColors(currentImage);
      if (res.success && res.data) {
        setColorData(res.data);
      }
    } catch {
      console.error('Color extraction failed');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Palette className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-black text-slate-100">
              {isAr ? 'استوديو الألوان والباليتات (Color Studio)' : 'Color Studio & Palette Extraction'}
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'استخراج الألوان الأساسية، الثانوية، والـAccent مع إمكانية استبدال الباليت بالكامل.'
              : 'Extract Main, Secondary, and Accent palettes; simulate full palette harmony shifts.'}
          </p>
        </div>

        <button
          onClick={handleExtract}
          disabled={isExtracting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
        >
          {isExtracting ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Sparkles className="w-4 h-4 text-slate-950" />}
          <span>{isExtracting ? (isAr ? 'جاري الاستخراج...' : 'Extracting...') : (isAr ? 'استخراج باليت الألوان' : 'Extract Palette')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Source Image (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
              {isAr ? 'الصورة المصدر' : 'Source Image'}
            </span>
            <div className="aspect-[3/4] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <img src={currentImage} alt="Color Source" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Palettes Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Main Colors */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
              {isAr ? 'الألوان الأساسية (Main Dominant Colors)' : 'Main Dominant Colors'}
            </span>
            <div className="grid grid-cols-2 gap-3">
              {colorData.mainColors?.map((c: any) => (
                <div
                  key={c.hex}
                  onClick={() => handleCopy(c.hex)}
                  className="p-3 rounded-xl border border-slate-800 bg-[#090e17] flex items-center gap-3 cursor-pointer hover:border-slate-700 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg shadow shrink-0" style={{ backgroundColor: c.hex }} />
                  <div className="truncate">
                    <span className="block text-xs font-bold text-slate-200">{c.name}</span>
                    <span className="text-[11px] font-mono text-amber-400">{c.hex} ({c.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accent Colors */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
              {isAr ? 'ألوان التمييز واللمعان (Accent & Metallic Colors)' : 'Accent & Metallic Colors'}
            </span>
            <div className="grid grid-cols-2 gap-3">
              {colorData.accentColors?.map((c: any) => (
                <div
                  key={c.hex}
                  onClick={() => handleCopy(c.hex)}
                  className="p-3 rounded-xl border border-slate-800 bg-[#090e17] flex items-center gap-3 cursor-pointer hover:border-slate-700 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg shadow shrink-0" style={{ backgroundColor: c.hex }} />
                  <div className="truncate">
                    <span className="block text-xs font-bold text-slate-200">{c.name}</span>
                    <span className="text-[11px] font-mono text-amber-400">{c.hex}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alternative Harmony Palettes */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              {isAr ? 'باليتات بديلة متناسقة (Alternative Color Themes)' : 'Alternative Color Themes'}
            </span>
            <div className="space-y-2">
              {colorData.suggestedAlternatives?.map((alt: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#090e17] border border-slate-800 flex items-center justify-between"
                >
                  <span className="text-xs font-bold text-slate-200">{alt.name}</span>
                  <div className="flex items-center gap-1.5">
                    {alt.colors?.map((col: string, cIdx: number) => (
                      <div
                        key={cIdx}
                        className="w-6 h-6 rounded-md shadow border border-white/10"
                        style={{ backgroundColor: col }}
                        title={col}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
