import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { detectFont } from '../../services/api';
import {
  Type,
  Sparkles,
  ExternalLink,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export const FontsView: React.FC = () => {
  const { activeProject, selectedImageForTool, settings } = useStudio();
  const isAr = settings.language === 'ar';

  const [isDetecting, setIsDetecting] = useState(false);
  const [fontData, setFontData] = useState<any>({
    detectedClassification: 'Luxury Serif & Modern Arabic Kufic',
    closestFont: 'Cinzel Decorative & Cairo Bold',
    arabicSuggestions: [
      { name: 'Cairo', style: 'Geometric Modern Arabic Sans', googleFontsUrl: 'https://fonts.google.com/specimen/Cairo' },
      { name: 'Amiri', style: 'Classic Naskh Arabic Serif', googleFontsUrl: 'https://fonts.google.com/specimen/Amiri' },
      { name: 'Reem Kufi', style: 'Decorative Display Kufic', googleFontsUrl: 'https://fonts.google.com/specimen/Reem+Kufi' },
      { name: 'Tajawal', style: 'Clean Contemporary Web Sans', googleFontsUrl: 'https://fonts.google.com/specimen/Tajawal' },
    ],
    englishSuggestions: [
      { name: 'Cinzel Decorative', style: 'High Luxury Trajan Serif', googleFontsUrl: 'https://fonts.google.com/specimen/Cinzel+Decorative' },
      { name: 'Playfair Display', style: 'Editorial Fashion Serif', googleFontsUrl: 'https://fonts.google.com/specimen/Playfair+Display' },
      { name: 'Plus Jakarta Sans', style: 'Geometric Corporate Sans', googleFontsUrl: 'https://fonts.google.com/specimen/Plus+Jakarta+Sans' },
      { name: 'Cormorant Garamond', style: 'Classic Literary Elegance', googleFontsUrl: 'https://fonts.google.com/specimen/Cormorant+Garamond' },
    ],
    recommendations: 'استخدم خط Cairo Bold للنصوص العربية الرئيسية، مع خط Cinzel للأرقام وتواريخ التخرج باللون الذهبي.',
  });

  const currentImage =
    selectedImageForTool ||
    activeProject.prompts?.[0]?.generatedResults?.[0]?.url ||
    activeProject.originalImages?.[0] ||
    '';

  const handleRunDetection = async () => {
    setIsDetecting(true);
    try {
      const res = await detectFont(currentImage);
      if (res.success && res.data) {
        setFontData(res.data);
      }
    } catch {
      console.error('Font detection failed');
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Type className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-black text-slate-100">
              {isAr ? 'اكتشاف وتنسيق الخطوط (Font Studio)' : 'AI Font Detection & Suggestions'}
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'تحليل خطوط التصميم واقتراح أقرب خطوط عربية وإنجليزية متناسقة مع طباعة التخرج.'
              : 'Identify typography style and discover matching Arabic and English Google Fonts.'}
          </p>
        </div>

        <button
          onClick={handleRunDetection}
          disabled={isDetecting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
        >
          {isDetecting ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Sparkles className="w-4 h-4 text-slate-950" />}
          <span>{isDetecting ? (isAr ? 'جاري فحص الخطوط...' : 'Analyzing Fonts...') : (isAr ? 'فحص الخطوط الآن' : 'Detect Fonts')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arabic Suggestions */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
            {isAr ? 'ترشيحات الخطوط العربية (Arabic Fonts)' : 'Arabic Font Suggestions'}
          </span>
          <div className="space-y-3">
            {fontData.arabicSuggestions?.map((f: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#090e17] border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{f.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{f.style}</p>
                </div>
                <a
                  href={f.googleFontsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] text-amber-400 hover:underline font-mono"
                >
                  <span>Google Fonts</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* English Suggestions */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
            {isAr ? 'ترشيحات الخطوط اللاتينية (English Fonts)' : 'English Font Suggestions'}
          </span>
          <div className="space-y-3">
            {fontData.englishSuggestions?.map((f: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#090e17] border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{f.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{f.style}</p>
                </div>
                <a
                  href={f.googleFontsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline font-mono"
                >
                  <span>Google Fonts</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
