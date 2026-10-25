import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { ReferenceRole, ReferenceImage } from '../../types';
import { updatePromptWithReference, analyzePromptBreakdown, generateAiImage } from '../../services/api';
import {
  BookmarkCheck,
  Sparkles,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Copy,
  Download,
  RotateCw,
  Crop,
  ArrowUp,
  ArrowDown,
  Wand2,
  BrainCircuit,
  Eye,
  History,
  Layers,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sliders,
  Send,
  Star,
  FileCode,
  Tag,
  ExternalLink,
} from 'lucide-react';

const availableRoles: ReferenceRole[] = [
  'Main Subject',
  'Face Reference',
  'Person Reference',
  'Background Reference',
  'Frame Reference',
  'Decoration Reference',
  'Style Reference',
  'Color Reference',
  'Pose Reference',
  'Clothing Reference',
  'Composition Reference',
  'Object Reference',
  'General Reference',
  'Custom Role',
];

export const PromptStudioView: React.FC<{ initialMode?: 'library' | 'generate' }> = ({ initialMode = 'library' }) => {
  const {
    activeProject,
    activePrompt,
    updateCurrentPrompt,
    restorePromptVersion,
    addReferenceImage,
    updateReferenceImage,
    removeReferenceImage,
    toggleLockReference,
    reorderReferences,
    addGenerationResult,
    toggleFavoriteResult,
    sendImageToTool,
    settings,
  } = useStudio();

  const isAr = settings.language === 'ar';

  // Local state for prompt editing
  const [promptText, setPromptText] = useState(activePrompt?.text || '');
  const [negativePrompt, setNegativePrompt] = useState(activePrompt?.negativePrompt || '');
  const [promptNotes, setPromptNotes] = useState(activePrompt?.notes || '');
  const [selectedVersionForCompare, setSelectedVersionForCompare] = useState<number | null>(null);

  // Reference management modal / new ref
  const [newRefUrl, setNewRefUrl] = useState('');
  const [newRefName, setNewRefName] = useState('');
  const [newRefRole, setNewRefRole] = useState<ReferenceRole>('General Reference');
  const [newRefLocked, setNewRefLocked] = useState(false);
  const [isAddingRef, setIsAddingRef] = useState(false);

  // AI Operation States
  const [isUpdatingWithAi, setIsUpdatingWithAi] = useState(false);
  const [isAnalyzingPrompt, setIsAnalyzingPrompt] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationFeedback, setGenerationFeedback] = useState<string | null>(null);
  const [quotaNotice, setQuotaNotice] = useState<string | null>(null);
  const [layoutPreview, setLayoutPreview] = useState<string | null>(null);

  // Sync state if activePrompt changed
  React.useEffect(() => {
    if (activePrompt) {
      setPromptText(activePrompt.text);
      setNegativePrompt(activePrompt.negativePrompt || '');
      setPromptNotes(activePrompt.notes || '');
    }
  }, [activePrompt?.id, activePrompt?.version]);

  // Handle Save / Create New Version
  const handleSaveAsNewVersion = () => {
    if (!promptText.trim()) return;
    updateCurrentPrompt(promptText, promptNotes, negativePrompt);
  };

  // AI: UPDATE PROMPT WITH NEW REFERENCE
  const handleUpdatePromptWithNewReference = async (ref: ReferenceImage) => {
    setIsUpdatingWithAi(true);
    setGenerationFeedback(null);

    try {
      const response = await updatePromptWithReference({
        currentPrompt: promptText,
        existingReferences: activePrompt?.references || [],
        newReferenceImageBase64: ref.url,
        newReferenceRole: ref.role,
      });

      if (response.success && response.data?.updatedPrompt) {
        setPromptText(response.data.updatedPrompt);
        // Automatically save as next version
        updateCurrentPrompt(
          response.data.updatedPrompt,
          `تم التحديث بالذكاء الاصطناعي لاستيعاب "${ref.name}" (${ref.role})`,
          response.data.recommendedNegativePromptAdditions
            ? `${negativePrompt}, ${response.data.recommendedNegativePromptAdditions}`
            : negativePrompt
        );
        setGenerationFeedback(
          isAr
            ? `تم تحديث البرومبت بنجاح: ${response.data.explanation}`
            : `Prompt updated successfully: ${response.data.explanation}`
        );
      } else {
        setGenerationFeedback(response.error || 'Failed to update prompt');
      }
    } catch {
      setGenerationFeedback('Error during AI prompt update');
    } finally {
      setIsUpdatingWithAi(false);
    }
  };

  // AI: ANALYZE PROMPT
  const handleAnalyzePrompt = async () => {
    setIsAnalyzingPrompt(true);
    try {
      const res = await analyzePromptBreakdown(promptText);
      if (res.success && res.data) {
        setAnalysisResult(res.data);
      }
    } catch {
      console.error('Failed to analyze prompt');
    } finally {
      setIsAnalyzingPrompt(false);
    }
  };

  // GENERATE IMAGE FROM PROMPT + REFERENCES
  const handleGenerate = async () => {
    if (!promptText.trim() || isGenerating) return;
    setIsGenerating(true);
    setQuotaNotice(null);
    setLayoutPreview(null);
    setGenerationFeedback(
      isAr
        ? 'جاري التوليد بواسطة موديل الذكاء الاصطناعي مع الصور المرجعية...'
        : 'Generating image with AI...'
    );

    try {
      const res = await generateAiImage({
        prompt: promptText,
        negativePrompt,
        aspectRatio: activePrompt?.aspectRatio || '3:4',
        style: activePrompt?.style || 'Cinematic High Luxury Photo',
        referenceImages: activePrompt?.references || [],
      });

      if (res.success && res.imageUrl) {
        addGenerationResult({
          url: res.imageUrl,
          model: activePrompt?.model || 'gemini-3.1-flash-image',
          settings: activePrompt?.settings,
          notes: `نتيجة التوليد للإصدار v${activePrompt?.version || 1}`,
          aspectRatio: activePrompt?.aspectRatio,
        });
        setGenerationFeedback(
          isAr
            ? 'تم توليد الصورة بالذكاء الاصطناعي بنجاح وربطها بهذا الإصدار!'
            : 'Image generated and linked!'
        );
      } else {
        if (res.isQuotaError || res.requiresPaidKey) {
          setQuotaNotice(
            isAr
              ? 'تعذر توليد الصورة من مزود الخادم. تحقق من إعداد مفتاح Gemini وصلاحية النموذج وحالة المزود.'
              : 'Image generation is unavailable. Check the server API key, model access, and provider response.'
          );
        }
        if (res.previewCardUrl) {
          setLayoutPreview(res.previewCardUrl);
        }
        setGenerationFeedback(
          res.error || (isAr ? 'لم يكتمل التوليد بسبب متطلبات مفتاح الحصص' : 'Generation failed')
        );
      }
    } catch (err: any) {
      setGenerationFeedback(`Error: ${err?.message || 'Generation failed'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Add a new reference
  const handleAddNewReference = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRefUrl) return;

    addReferenceImage({
      name: newRefName || `صورة مرجعية ${(activePrompt?.references || []).length + 1}`,
      url: newRefUrl,
      role: newRefRole,
      isLocked: newRefLocked,
      notes: newRefLocked ? 'هذا العنصر مقفل الهوية 🔒' : '',
    });

    setNewRefUrl('');
    setNewRefName('');
    setNewRefRole('General Reference');
    setNewRefLocked(false);
    setIsAddingRef(false);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setNewRefUrl(reader.result as string);
      if (!newRefName) {
        setNewRefName(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  if (!activePrompt) {
    return (
      <div className="p-8 text-center text-slate-400">
        {isAr ? 'لم يتم العثور على برومبت نشط للمشروع.' : 'No active prompt found.'}
      </div>
    );
  }

  const versionsList = activePrompt.versions || [];
  const comparedVersion = versionsList.find((v) => v.versionNumber === selectedVersionForCompare);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Version Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookmarkCheck className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-black text-slate-100">
              {isAr ? 'استوديو البرومبت والصور المرجعية' : 'Prompt & Reference Studio'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
              v{activePrompt.version}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'كل تعديل ينشئ Version جديدة مع الحفاظ على النسخ القديمة والصور المقفلة 🔒'
              : 'Every modification creates a new version preserving past iterations and locked references.'}
          </p>
        </div>

        {/* Generate & Quick Actions Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Copy prompt for external use */}
          <button
            onClick={() => {
              const fullPromptForGemini = `Create a photorealistic, ultra-high-definition design:\n\n${promptText}\n\nStyle: ${activePrompt.style || 'Photorealistic luxury'}\nAspect Ratio: ${activePrompt.aspectRatio || '3:4'}${negativePrompt ? `\nAvoid / Negative: ${negativePrompt}` : ''}`;
              navigator.clipboard.writeText(fullPromptForGemini);
              setGenerationFeedback(
                isAr
                  ? 'تم نسخ البرومبت. يمكنك لصقه في خدمة خارجية؛ الأسعار والحدود تعتمد على حسابك ومزود الخدمة.'
                  : 'Prompt copied. External service pricing and limits depend on your account and provider.'
              );
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 text-xs font-semibold border border-purple-500/40 transition-colors shadow-sm"
            title={isAr ? 'نسخ البرومبت لاستخدامه خارجيًا؛ لا يربط هذا التطبيق حساب Google.' : 'Copy prompt for external use; this app does not connect a Google account.'}
          >
            <Copy className="w-3.5 h-3.5 text-purple-400" />
            <span>{isAr ? 'نسخ لـ Gemini' : 'Copy for Gemini'}</span>
          </button>

          <button
            onClick={handleAnalyzePrompt}
            disabled={isAnalyzingPrompt}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            {isAnalyzingPrompt ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" /> : <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{isAr ? 'تحليل البرومبت' : 'Analyze Prompt'}</span>
          </button>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Sparkles className="w-4 h-4 text-slate-950" />}
            <span>{isGenerating ? (isAr ? 'جاري التوليد...' : 'Generating...') : (isAr ? 'توليد الصورة' : 'Generate Image')}</span>
          </button>
        </div>
      </div>

      {/* Generation Feedback Toast */}
      {generationFeedback && (
        <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{generationFeedback}</span>
          </div>
          <button onClick={() => setGenerationFeedback(null)} className="text-amber-400 hover:text-white font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Quota & Billing Requirement Notice */}
      {quotaNotice && (
        <div className="p-4 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-300">
                {isAr ? 'مزود التوليد غير متاح' : 'Image provider unavailable'}
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {isAr
                  ? 'لم يتوفر مزود التوليد من الخادم. تحقق من إعداد GEMINI_API_KEY وصلاحية النموذج في بيئة الخادم، أو أعد المحاولة لاحقاً.'
                  : 'The server image provider is unavailable. Check GEMINI_API_KEY and model access on the server, or try again later.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const fullPromptForGemini = `Create a photorealistic, ultra-high-definition design:\n\n${promptText}\n\nStyle: ${activePrompt.style || 'Photorealistic luxury'}\nAspect Ratio: ${activePrompt.aspectRatio || '3:4'}${negativePrompt ? `\nAvoid / Negative: ${negativePrompt}` : ''}`;
                  navigator.clipboard.writeText(fullPromptForGemini);
                  window.open('https://gemini.google.com/app', '_blank');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-900/30"
              >
                <span>{isAr ? 'نسخ وفتح Gemini' : 'Copy & Open Gemini'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setQuotaNotice(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                {isAr ? 'إغلاق التنبيه' : 'Dismiss'}
              </button>
            </div>

            {layoutPreview && (
              <button
                type="button"
                onClick={() => {
                  addGenerationResult({
                    url: layoutPreview,
                    model: 'Layout-Preview-Draft',
                    settings: activePrompt?.settings,
                    notes: `مسودة تخطيط البرومبت v${activePrompt?.version || 1}`,
                    aspectRatio: activePrompt?.aspectRatio,
                  });
                  setGenerationFeedback(isAr ? 'تمت إضافة مسودة التخطيط لقائمة النتائج' : 'Added layout draft to results');
                  setLayoutPreview(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40 transition-colors"
              >
                {isAr ? 'حفظ مسودة تخطيط البرومبت بالنتائج' : 'Save Layout Draft'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Studio 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center: Prompt Editor & Generation Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Prompt Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span>{isAr ? 'نص البرومبت الإبداعي (Prompt Text)' : 'Creative Prompt'}</span>
                <span className="text-[10px] text-amber-400 font-mono">v{activePrompt.version}</span>
              </label>
              <button
                onClick={handleSaveAsNewVersion}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors"
                title="Save as new Version (v+1)"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'حفظ كإصدار جديد (v' + (activePrompt.version + 1) + ')' : 'Save as v' + (activePrompt.version + 1)}</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder={isAr ? 'اكتب وصف التصميم هنا بالتفصيل...' : 'Enter prompt description...'}
              className="w-full rounded-xl border border-slate-800 bg-[#090e17] p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
            />

            {/* Negative Prompt */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {isAr ? 'البرومبت السلبي (Negative Prompt - ما يجب تجنبه)' : 'Negative Prompt'}
              </label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="blurry, distorted face, cartoon, low resolution, artifacts"
                className="w-full rounded-xl border border-slate-800 bg-[#090e17] px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Prompt Notes */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {isAr ? 'ملاحظات الإصدار (Notes)' : 'Version Notes'}
              </label>
              <input
                type="text"
                value={promptNotes}
                onChange={(e) => setPromptNotes(e.target.value)}
                placeholder={isAr ? 'مثال: حافظ على ملامح الشخص واعتمد خلفية الزمرد للطباعة' : 'Add version notes...'}
                className="w-full rounded-xl border border-slate-800 bg-[#090e17] px-3 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Generation Parameters Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
              <div>
                <span className="block text-[10px] text-slate-400 mb-1">{isAr ? 'النموذج' : 'Model'}</span>
                <span className="block text-xs font-bold text-slate-200 truncate">
                  {activePrompt.settings?.model || 'gemini-3.1-flash-lite-image'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 mb-1">{isAr ? 'نسبة الأبعاد' : 'Aspect Ratio'}</span>
                <span className="block text-xs font-bold text-amber-400 font-mono">
                  {activePrompt.aspectRatio || '3:4'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 mb-1">{isAr ? 'الدقة' : 'Resolution'}</span>
                <span className="block text-xs font-bold text-slate-200 font-mono">
                  {activePrompt.resolution || '2K'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 mb-1">{isAr ? 'النمط' : 'Style'}</span>
                <span className="block text-xs font-bold text-slate-200 truncate">
                  {activePrompt.style || 'Luxury'}
                </span>
              </div>
            </div>
          </div>

          {/* AI Prompt Analysis Breakdown Box (if analyzed) */}
          {analysisResult && (
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/10 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-cyan-200">
                    {isAr ? 'تحليل أبعاد البرومبت الإبداعية (Prompt Breakdown)' : 'Prompt Dimensions Breakdown'}
                  </h3>
                </div>
                <button onClick={() => setAnalysisResult(null)} className="text-xs text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">الموضوع (Subject)</span>
                  <span className="text-slate-200 font-medium">{analysisResult.subject || '—'}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">الإضاءة (Lighting)</span>
                  <span className="text-slate-200 font-medium">{analysisResult.lighting || '—'}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">التركيب (Composition)</span>
                  <span className="text-slate-200 font-medium">{analysisResult.composition || '—'}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">الكاميرا والعدسة</span>
                  <span className="text-slate-200 font-medium">{analysisResult.camera} • {analysisResult.lens}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">الخامات والمواد</span>
                  <span className="text-slate-200 font-medium">{analysisResult.materials || '—'}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">الألوان والباليت</span>
                  <span className="text-slate-200 font-medium">{analysisResult.colors || '—'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Generated Results linked to this Version */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{isAr ? 'النتائج المولدة المرتبطة بهذا الإصدار' : 'Generated Results for this Version'}</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {activePrompt.generatedResults?.length || 0} Results
              </span>
            </div>

            {activePrompt.generatedResults && activePrompt.generatedResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activePrompt.generatedResults.map((result) => (
                  <div
                    key={result.id}
                    className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-[3/4]"
                  >
                    <img src={result.url} alt="Generation" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        onClick={() => toggleFavoriteResult(result.id)}
                        className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                          result.isFavorite ? 'bg-amber-500 text-slate-950' : 'bg-black/60 text-slate-300 hover:text-white'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                      <span className="text-xs font-bold text-amber-300">{result.notes || 'Result Output'}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Model: {result.model}</span>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5">{new Date(result.createdAt).toLocaleString()}</span>

                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => sendImageToTool(result.url, 'image-editor')}
                          className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 text-[10px] font-bold"
                        >
                          {isAr ? 'تعديل' : 'Edit'}
                        </button>
                        <button
                          onClick={() => sendImageToTool(result.url, 'ai-enhance')}
                          className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 text-[10px] font-medium"
                        >
                          {isAr ? 'تحسين' : 'Enhance'}
                        </button>
                        <button
                          onClick={() => sendImageToTool(result.url, 'laser-prep')}
                          className="px-2.5 py-1 rounded bg-red-600/30 text-red-200 text-[10px] font-medium border border-red-500/30"
                        >
                          {isAr ? 'ليزر' : 'Laser'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                {isAr ? 'لا توجد نتائج مولدة لهذا الإصدار بعد. اضغط "توليد الصورة الآن".' : 'No results generated yet.'}
              </div>
            )}
          </div>
        </div>

        {/* Right: Reference Images Manager with Roles & Lock System (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Reference Images Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <span>{isAr ? 'الصور المرجعية (Reference Images)' : 'Reference Images'}</span>
                  <span className="text-amber-400 font-mono text-[10px]">
                    ({activePrompt.references?.length || 0})
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {isAr ? 'حدد دور كل صورة، وقفل الهوية 🔒 للعناصر الأساسية' : 'Assign role & lock critical subjects'}
                </p>
              </div>

              <button
                onClick={() => setIsAddingRef(!isAddingRef)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'إضافة' : 'Add'}</span>
              </button>
            </div>

            {/* Add Reference Form */}
            {isAddingRef && (
              <form onSubmit={handleAddNewReference} className="p-3.5 rounded-xl border border-amber-500/30 bg-[#090e17] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">{isAr ? 'إضافة صورة مرجعية جديدة' : 'Add New Reference'}</span>
                  <button type="button" onClick={() => setIsAddingRef(false)} className="text-slate-400 hover:text-white text-xs">
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">{isAr ? 'اسم الصورة' : 'Reference Name'}</label>
                  <input
                    type="text"
                    value={newRefName}
                    onChange={(e) => setNewRefName(e.target.value)}
                    placeholder="e.g. Person, Background, Gold Frame"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">{isAr ? 'اختر ملف الصورة' : 'Upload Image'}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">{isAr ? 'وظيفة الصورة (Role)' : 'Role'}</label>
                    <select
                      value={newRefRole}
                      onChange={(e) => setNewRefRole(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
                    >
                      {availableRoles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRefLocked}
                        onChange={(e) => setNewRefLocked(e.target.checked)}
                        className="accent-amber-500 rounded"
                      />
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                        🔒 {isAr ? 'قفل الملامح' : 'Lock Identity'}
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!newRefUrl}
                  className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold disabled:opacity-40"
                >
                  {isAr ? 'تأكيد الإضافة' : 'Confirm Add'}
                </button>
              </form>
            )}

            {/* References List */}
            <div className="space-y-3">
              {(activePrompt.references || []).map((ref, idx) => (
                <div
                  key={ref.id}
                  className={`p-3 rounded-xl border transition-all ${
                    ref.isLocked
                      ? 'border-amber-500/50 bg-amber-950/10 shadow-sm shadow-amber-950/30'
                      : 'border-slate-800 bg-[#090e17]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shrink-0">
                      <img src={ref.url} alt={ref.name} className="w-full h-full object-cover" />
                      {ref.isLocked && (
                        <span className="absolute top-1 right-1 p-0.5 rounded bg-amber-500 text-slate-950 text-[10px] shadow font-bold">
                          🔒
                        </span>
                      )}
                    </div>

                    {/* Metadata & Controls */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 truncate">{ref.name}</span>
                        <div className="flex items-center gap-1">
                          {/* Reorder Up / Down */}
                          {idx > 0 && (
                            <button
                              onClick={() => reorderReferences(idx, idx - 1)}
                              className="p-1 text-slate-400 hover:text-white"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                          )}
                          {idx < (activePrompt.references || []).length - 1 && (
                            <button
                              onClick={() => reorderReferences(idx, idx + 1)}
                              className="p-1 text-slate-400 hover:text-white"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          )}
                          {/* Lock Toggle */}
                          <button
                            onClick={() => toggleLockReference(ref.id)}
                            className={`p-1 rounded transition-colors ${
                              ref.isLocked
                                ? 'text-amber-400 hover:text-amber-300'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                            title={ref.isLocked ? 'Unlocked' : 'Lock Reference'}
                          >
                            {ref.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => removeReferenceImage(ref.id)}
                            className="p-1 text-red-400 hover:text-red-300"
                            title="Delete Reference"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Role Selector */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <select
                          value={ref.role}
                          onChange={(e) => updateReferenceImage(ref.id, { role: e.target.value as any })}
                          className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-amber-300 font-medium"
                        >
                          {availableRoles.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>

                        {ref.isLocked && (
                          <span className="text-[10px] text-amber-400 font-semibold">
                            {isAr ? 'عنصر مقفل (حافظ على الملامح)' : 'Locked Identity'}
                          </span>
                        )}
                      </div>

                      {ref.notes && (
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 italic">
                          {ref.notes}
                        </p>
                      )}

                      {/* AI: UPDATE PROMPT WITH THIS REFERENCE BUTTON */}
                      <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                        <button
                          onClick={() => handleUpdatePromptWithNewReference(ref)}
                          disabled={isUpdatingWithAi}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          <Wand2 className="w-3 h-3 text-amber-400" />
                          <span>{isAr ? 'تحديث البرومبت بهذا العنصر بالذكاء الاصطناعي' : 'UPDATE PROMPT WITH THIS REF'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt Version History */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" />
                <span>{isAr ? 'سجل إصدارات البرومبت (Version History)' : 'Version History'}</span>
              </h3>
              <span className="text-xs font-mono text-purple-400">{versionsList.length} Versions</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {versionsList.map((ver) => {
                const isCurrent = ver.versionNumber === activePrompt.version;
                return (
                  <div
                    key={ver.id}
                    className={`p-2.5 rounded-xl border text-xs transition-colors ${
                      isCurrent
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-200'
                        : 'border-slate-800 bg-[#090e17] text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold font-mono">Version {ver.versionNumber} {isCurrent && '✓ (Active)'}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(ver.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{ver.text}</p>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/50 text-[10px]">
                      <span className="text-slate-500">{ver.references?.length || 0} References</span>
                      {!isCurrent && (
                        <button
                          onClick={() => restorePromptVersion(ver.versionNumber)}
                          className="text-amber-400 hover:underline font-bold"
                        >
                          {isAr ? 'استعادة هذا الإصدار' : 'Restore Version'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
