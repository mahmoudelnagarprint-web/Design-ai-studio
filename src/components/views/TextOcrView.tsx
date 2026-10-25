import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { ocrText } from '../../services/api';
import {
  FileText,
  Sparkles,
  Copy,
  Edit2,
  Globe,
  Loader2,
  CheckCircle2,
  Trash2,
  Check,
} from 'lucide-react';

export const TextOcrView: React.FC = () => {
  const { activeProject, selectedImageForTool, settings } = useStudio();
  const isAr = settings.language === 'ar';

  const [extractedTexts, setExtractedTexts] = useState<any[]>([]);

  const [isExtracting, setIsExtracting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const currentImage =
    selectedImageForTool ||
    activeProject.prompts?.[0]?.generatedResults?.[0]?.url ||
    activeProject.originalImages?.[0] ||
    '';

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRunOcr = async () => {
    setAnalysisError(null);
    if (!currentImage) {
      setAnalysisError(isAr ? 'اختر صورة قبل تشغيل OCR.' : 'Select an image before running OCR.');
      return;
    }
    setIsExtracting(true);
    try {
      const res = await ocrText(currentImage);
      if (res.success && res.data?.detectedTexts) {
        setExtractedTexts(res.data.detectedTexts);
      } else {
        setAnalysisError(res.error || (isAr ? 'تعذر استخراج النصوص.' : 'Text extraction failed.'));
      }
    } catch {
      setAnalysisError(isAr ? 'تعذر الاتصال بخدمة OCR.' : 'Could not contact the OCR service.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-black text-slate-100">
              {isAr ? 'استخراج وتعديل النصوص (Text & OCR Studio)' : 'Text OCR & Typography Studio'}
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'استخراج النصوص العربية والإنجليزية من التصميم مع إمكانية التعديل، النسخ، والترجمة الفورية.'
              : 'Extract, edit, translate, copy, and restyle typography detected inside images.'}
          </p>
        </div>

        <button
          onClick={handleRunOcr}
          disabled={isExtracting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
        >
          {isExtracting ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Sparkles className="w-4 h-4 text-slate-950" />}
          <span>{isExtracting ? (isAr ? 'جاري قراءة النصوص...' : 'Extracting...') : (isAr ? 'إعادة مسح واستخراج النصوص' : 'Run OCR')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
              {isAr ? 'صورة التصميم' : 'Source Image'}
            </span>
            <div className="aspect-[3/4] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <img src={currentImage} alt="OCR Source" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            {isAr ? 'النصوص المستخرجة (Detected Texts)' : 'Detected Texts'}
          </span>

          {analysisError && <p role="alert" className="rounded-xl border border-red-500/40 bg-red-950/20 p-3 text-xs text-red-300">{analysisError}</p>}
          {!analysisError && extractedTexts.length === 0 && (
            <p className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-400">
              {isAr ? 'لا توجد نتائج بعد. شغّل OCR على صورة لتحليلها.' : 'No results yet. Run OCR on an image to analyze it.'}
            </p>
          )}

          {extractedTexts.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/40 space-y-3 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 font-mono">{item.language}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(item.text, String(idx))}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedId === String(idx) ? (isAr ? 'تم النسخ' : 'Copied') : isAr ? 'نسخ' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Text Input */}
              <input
                type="text"
                value={item.text}
                onChange={(e) => {
                  const val = e.target.value;
                  setExtractedTexts((prev) =>
                    prev.map((t, i) => (i === idx ? { ...t, text: val } : t))
                  );
                }}
                className="w-full bg-[#090e17] border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-100"
              />

              {/* Translation & Style info */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                <span className="truncate">Translation: {item.translated}</span>
                <span className="text-amber-400 font-mono shrink-0">{item.color}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
