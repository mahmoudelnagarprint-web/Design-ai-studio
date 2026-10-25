import React, { useState, useRef, useEffect } from 'react';
import { useStudio } from '../../context/StudioContext';
import { imageToPrompt } from '../../services/api';
import { ReferenceRole, IllustrativePromptCard } from '../../types';
import {
  BrainCircuit,
  Upload,
  Sparkles,
  Copy,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Send,
  Layers,
  BookmarkCheck,
  Download,
  Edit3,
  RefreshCw,
  Sliders,
  Lock,
  Unlock,
  Tag,
  Eye,
  Trash2,
  ExternalLink,
  FileImage,
  Check,
  Plus,
  X,
  Undo2,
  FolderHeart,
  Palette,
  Camera,
  Maximize2,
} from 'lucide-react';

const availableRoles: { role: ReferenceRole; labelAr: string; labelEn: string; icon: string }[] = [
  { role: 'Main Subject', labelAr: 'العنصر / الشخص الرئيسي', labelEn: 'Main Subject', icon: '👤' },
  { role: 'Style Reference', labelAr: 'مرجع النمط الفني والرندر', labelEn: 'Style Reference', icon: '🎨' },
  { role: 'Face Reference', labelAr: 'مرجع تفاصيل الوجه والملامح', labelEn: 'Face Reference', icon: '🧑' },
  { role: 'Pose Reference', labelAr: 'مرجع الوضعية والوقفة', labelEn: 'Pose Reference', icon: '🧍' },
  { role: 'Clothing Reference', labelAr: 'مرجع الأزياء والروب', labelEn: 'Clothing Reference', icon: '🎓' },
  { role: 'Background Reference', labelAr: 'مرجع الخلفية والديكور', labelEn: 'Background Reference', icon: '🏛️' },
  { role: 'Composition Reference', labelAr: 'مرجع التكوين وتوزيع العناصر', labelEn: 'Composition Reference', icon: '📐' },
  { role: 'Color Reference', labelAr: 'مرجع درجات الألوان والإضاءة', labelEn: 'Color Reference', icon: '🌈' },
  { role: 'General Reference', labelAr: 'مرجع عام شامل', labelEn: 'General Reference', icon: '📌' },
];

export const ImageToPromptView: React.FC = () => {
  const {
    activeProject,
    selectedImageForTool,
    createNewPrompt,
    setCurrentView,
    settings,
    createPromptWithReference,
    illustrativeCards,
    deleteIllustrativeCard,
    setActivePromptId,
  } = useStudio();

  const isAr = settings.language === 'ar';

  // Active source image
  const [imageUrl, setImageUrl] = useState<string>(
    selectedImageForTool || activeProject.originalImages?.[0] || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop'
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Raw extracted prompts (for resetting)
  const [originalAnalysis, setOriginalAnalysis] = useState<any>({
    basicPrompt: 'A proud graduate in traditional academic gown and golden stole standing in an ornate interior with dark emerald marble walls.',
    detailedPrompt: 'A cinematic high-end graduation portrait featuring a young male graduate with a confident smile, wearing a tailored black academic robe with satin gold embroidery stole and a mortarboard cap with a swinging golden tassel. The setting is a lavish ceremonial hall with polished emerald green marble backdrop, subtle gold veining, soft Rembrandt key light, and warm golden rim light highlighting hair details.',
    productionPrompt: 'hyperrealistic cinematic graduation portrait, 24yo male graduate, academic honors regalia, black velvet gown, golden silk stole, emerald marble background with gold filigree veins, 85mm f/1.4 lens, shallow depth of field, Hasselblad medium format color grading, volumetric rim lighting, 8k, award-winning editorial photography --ar 3:4 --v 6.1 --style raw',
    negativePrompt: 'blurry, cartoon, 3d render, distorted hands, bad eyes, low resolution, cheap plastic, oversaturated colors, text watermark, extra limbs',
    attributes: {
      people: 'Young male graduate with warm smile, sharp facial features',
      clothing: 'Black academic robe with golden stole and mortarboard cap',
      background: 'Polished emerald green marble with delicate gold veins',
      lighting: 'Soft Rembrandt key light with warm golden rim backlight',
      colors: 'Deep emerald (#0f2a1d), antique gold (#d4af37), and obsidian',
      composition: 'Golden ratio center portrait with regal framing',
      camera: 'Hasselblad 50C medium format',
      lens: '85mm f/1.4 portrait prime',
      style: 'Luxury cinematic photography with rich textural depth',
      materials: '24K gold embroidery, velvet fabric, polished marble',
    },
  });

  // User-edited prompt fields (allowing full live editing!)
  const [editedProductionPrompt, setEditedProductionPrompt] = useState<string>(originalAnalysis.productionPrompt);
  const [editedDetailedPrompt, setEditedDetailedPrompt] = useState<string>(originalAnalysis.detailedPrompt);
  const [editedBasicPrompt, setEditedBasicPrompt] = useState<string>(originalAnalysis.basicPrompt);
  const [editedNegativePrompt, setEditedNegativePrompt] = useState<string>(originalAnalysis.negativePrompt);

  // Active prompt tab for editing
  const [activePromptTab, setActivePromptTab] = useState<'production' | 'detailed' | 'basic' | 'negative'>('production');

  // Copied feedback key
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modal / Drawer state for "Save Prompt with Reference Image as Illustrative Card"
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [cardName, setCardName] = useState('تصميم تخرج خريج زمردي فاخر ٢٠٢٦');
  const [cardRole, setCardRole] = useState<ReferenceRole>('Main Subject');
  const [cardIsLocked, setCardIsLocked] = useState(true);
  const [cardNotes, setCardNotes] = useState('صورة مرجعية رئيسية للحفاظ على هوية الملامح والتطريز الذهبي');
  const [cardSelectedPromptTier, setCardSelectedPromptTier] = useState<'production' | 'detailed' | 'basic'>('production');
  const [isExportingCanvas, setIsExportingCanvas] = useState(false);
  const [saveSuccessNotification, setSaveSuccessNotification] = useState<string | null>(null);

  // Synchronize edited prompts when analysis updates
  useEffect(() => {
    setEditedProductionPrompt(originalAnalysis.productionPrompt);
    setEditedDetailedPrompt(originalAnalysis.detailedPrompt);
    setEditedBasicPrompt(originalAnalysis.basicPrompt);
    setEditedNegativePrompt(originalAnalysis.negativePrompt);
  }, [originalAnalysis]);

  // Handle clipboard paste of images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                setImageUrl(reader.result);
              }
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAnalyze = async () => {
    if (!imageUrl) return;
    setIsAnalyzing(true);
    try {
      const res = await imageToPrompt(imageUrl);
      if (res.success && res.data) {
        setOriginalAnalysis(res.data);
      }
    } catch (err) {
      console.error('Error analyzing image:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Quick append an extracted visual dimension into the currently active prompt
  const handleAppendAttribute = (attrKey: string, attrVal: string) => {
    const addition = `, ${attrKey}: ${attrVal}`;
    if (activePromptTab === 'production') {
      setEditedProductionPrompt((prev) => prev.trim() + addition);
    } else if (activePromptTab === 'detailed') {
      setEditedDetailedPrompt((prev) => prev.trim() + addition);
    } else if (activePromptTab === 'basic') {
      setEditedBasicPrompt((prev) => prev.trim() + addition);
    }
  };

  const handleResetActivePrompt = () => {
    if (activePromptTab === 'production') {
      setEditedProductionPrompt(originalAnalysis.productionPrompt);
    } else if (activePromptTab === 'detailed') {
      setEditedDetailedPrompt(originalAnalysis.detailedPrompt);
    } else if (activePromptTab === 'basic') {
      setEditedBasicPrompt(originalAnalysis.basicPrompt);
    } else if (activePromptTab === 'negative') {
      setEditedNegativePrompt(originalAnalysis.negativePrompt);
    }
  };

  const handleUsePromptInStudio = (text: string) => {
    const newPrompt = createNewPrompt(text);
    setActivePromptId(newPrompt.id);
    setCurrentView('create');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Get current active prompt text based on user selection in modal
  const getPromptForSaving = () => {
    if (cardSelectedPromptTier === 'production') return editedProductionPrompt;
    if (cardSelectedPromptTier === 'detailed') return editedDetailedPrompt;
    return editedBasicPrompt;
  };

  // Save Prompt with Attached Reference Image to Studio Project
  const handleSaveToProject = () => {
    const chosenPrompt = getPromptForSaving();
    if (!cardName.trim() || !chosenPrompt.trim()) return;

    const { prompt } = createPromptWithReference({
      name: cardName.trim(),
      text: chosenPrompt.trim(),
      negativePrompt: editedNegativePrompt.trim(),
      imageUrl,
      imageRole: cardRole,
      isLocked: cardIsLocked,
      notes: cardNotes.trim(),
      tags: ['image-to-prompt', 'reference-card', cardRole],
    });

    setSaveSuccessNotification(
      isAr
        ? `تم حفظ البرومبت والبطاقة التوضيحية بنجاح باسم "${cardName}"`
        : `Successfully saved prompt & illustrative card as "${cardName}"`
    );

    setTimeout(() => {
      setSaveSuccessNotification(null);
    }, 4500);

    setIsSaveModalOpen(false);
  };

  // Render & Download high-resolution Illustrative Card using HTML5 Canvas (1200x800)
  const handleDownloadIllustrativeCardCanvas = async (customCard?: IllustrativePromptCard) => {
    setIsExportingCanvas(true);
    try {
      const cardTitle = customCard?.name || cardName || 'بطاقة برومبت توضيحية';
      const promptToDraw = customCard?.promptText || getPromptForSaving();
      const negativeToDraw = customCard?.negativePrompt || editedNegativePrompt;
      const imgSource = customCard?.imageUrl || imageUrl;
      const roleToDraw = customCard?.role || cardRole;
      const isLocked = customCard ? customCard.isLocked : cardIsLocked;

      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Dark Studio Luxury Background
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 800);
      bgGrad.addColorStop(0, '#070b12');
      bgGrad.addColorStop(0.5, '#0b111c');
      bgGrad.addColorStop(1, '#080d17');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 800);

      // 2. Subtle Golden/Cyan Radial Glow
      const glowGrad = ctx.createRadialGradient(1050, 100, 20, 1050, 100, 500);
      glowGrad.addColorStop(0, 'rgba(217, 119, 6, 0.15)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, 1200, 800);

      // 3. Elegant Outer Border
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#1e293b';
      ctx.strokeRect(16, 16, 1168, 768);

      // Golden corner brackets
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      // top-left
      ctx.beginPath();
      ctx.moveTo(16, 48);
      ctx.lineTo(16, 16);
      ctx.lineTo(48, 16);
      ctx.stroke();
      // top-right
      ctx.beginPath();
      ctx.moveTo(1152, 16);
      ctx.lineTo(1184, 16);
      ctx.lineTo(1184, 48);
      ctx.stroke();
      // bottom-left
      ctx.beginPath();
      ctx.moveTo(16, 752);
      ctx.lineTo(16, 784);
      ctx.lineTo(48, 784);
      ctx.stroke();
      // bottom-right
      ctx.beginPath();
      ctx.moveTo(1152, 784);
      ctx.lineTo(1184, 784);
      ctx.lineTo(1184, 752);
      ctx.stroke();

      // 4. Header Bar
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('NAGAR DESIGN AI STUDIO', 1150, 60);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText('PROMPT REFERENCE CARD • بطاقة مرجعية توضيحية', 1150, 82);

      // 5. Draw Image on Left Column
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = imgSource;
      });

      // Image Card Container
      const imgX = 48;
      const imgY = 110;
      const imgW = 440;
      const imgH = 620;

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, 16);
      ctx.fill();
      ctx.stroke();

      if (img.width && img.height) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(imgX + 8, imgY + 8, imgW - 16, imgH - 16, 12);
        ctx.clip();

        // Calculate aspect fill
        const hRatio = (imgW - 16) / img.width;
        const vRatio = (imgH - 16) / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShiftX = (imgW - 16 - img.width * ratio) / 2;
        const centerShiftY = (imgH - 16 - img.height * ratio) / 2;

        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          imgX + 8 + centerShiftX,
          imgY + 8 + centerShiftY,
          img.width * ratio,
          img.height * ratio
        );
        ctx.restore();
      }

      // Role badge on top of image
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(imgX + 18, imgY + 18, 220, 34, 8);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`ROLE: ${roleToDraw}`, imgX + 30, imgY + 40);

      if (isLocked) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.beginPath();
        ctx.roundRect(imgX + imgW - 110, imgY + 18, 92, 34, 8);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillText('🔒 LOCKED', imgX + imgW - 98, imgY + 40);
      }

      // 6. Right Column: Details & Prompts
      const rightX = 520;

      // Title
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(cardTitle, 1150, 140);

      // Metadata Chips
      ctx.textAlign = 'right';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText(`التاريخ: ${new Date().toLocaleDateString('ar-EG')}  |  الدقة: 2K / 4K  |  النسبة: 3:4`, 1150, 170);

      // Prompt Box Header
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.fillText('البرومبت المعتمد للإنتاج (PRODUCTION PROMPT)', 1150, 215);

      // Prompt Box Container
      const promptBoxY = 230;
      const promptBoxH = 260;
      const promptBoxW = 630;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(rightX, promptBoxY, promptBoxW, promptBoxH, 12);
      ctx.fill();
      ctx.stroke();

      // Wrapped Prompt Text
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '13px monospace, system-ui';
      ctx.textAlign = 'left';

      const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
            if (currentY > promptBoxY + promptBoxH - 15) {
              ctx.fillText(line + '...', x, currentY);
              return;
            }
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, currentY);
      };

      wrapText(promptToDraw, rightX + 16, promptBoxY + 30, promptBoxW - 32, 22);

      // Negative Prompt Box
      const negY = 515;
      const negH = 110;

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('العناصر المستبعدة (NEGATIVE PROMPT)', 1150, negY - 10);

      ctx.fillStyle = 'rgba(239, 68, 68, 0.05)';
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.beginPath();
      ctx.roundRect(rightX, negY, promptBoxW, negH, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fca5a5';
      ctx.font = '12px monospace, system-ui';
      ctx.textAlign = 'left';
      wrapText(negativeToDraw, rightX + 16, negY + 28, promptBoxW - 32, 20);

      // Bottom Bar
      ctx.fillStyle = '#475569';
      ctx.font = '11px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('جاهز للتوليد المباشر في استوديو NAGAR DESIGN • هندسة برومبت احترافية', 1150, 700);

      // Trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${cardTitle.replace(/\s+/g, '_')}_Reference_Card.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating card canvas:', err);
    } finally {
      setIsExportingCanvas(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto select-none">
      {/* Success Notification Banner */}
      {saveSuccessNotification && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold shadow-xl shadow-emerald-950/50 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{saveSuccessNotification}</span>
          </div>
          <button
            onClick={() => setCurrentView('create')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold transition-colors"
          >
            <span>{isAr ? 'الانتقال للاستوديو للتوليد' : 'Go to Studio'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BrainCircuit className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-100">
              {isAr ? 'تحويل الصورة لبرومبت وبطاقة توضيحية' : 'Image → Prompt & Illustrative Card Studio'}
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'تفكيك شامل للصورة إلى 4 صيغ برومبت قابلة للتعديل المباشر، مع إمكانية حفظ البرومبت مع الصورة كبطاقة توضيحية وتحديد الاسم.'
              : 'Reverse engineer any image into fully editable prompts and save as named illustrative reference cards.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Save Prompt with Reference Button */}
          <button
            onClick={() => setIsSaveModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <BookmarkCheck className="w-4 h-4 text-slate-950" />
            <span>{isAr ? 'حفظ البرومبت كصورة توضيحية' : 'Save as Illustrative Card'}</span>
          </button>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!imageUrl || isAnalyzing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Sparkles className="w-4 h-4 text-slate-950" />}
            <span>{isAnalyzing ? (isAr ? 'جاري التحليل واستخراج الأبعاد...' : 'Analyzing Image...') : (isAr ? 'إعادة تحليل الصورة' : 'Analyze Image')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Source & Card Fast Save (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FileImage className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? 'الصورة التوضيحية المرفقة' : 'Attached Source Image'}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-800/50 text-cyan-300 font-mono">
                {imageUrl ? 'جاهزة' : 'بانتظار صورة'}
              </span>
            </div>

            <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group">
              {imageUrl ? (
                <>
                  <img src={imageUrl} alt="Source" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-[11px] text-slate-200">
                      {isAr ? 'يمكنك لصق صورة مباشرة بـ Ctrl+V أو سحب وإفلات صورة جديدة' : 'Drag & drop or paste (Ctrl+V)'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <Upload className="w-8 h-8 text-slate-600 mb-2" />
                  <span className="text-xs text-slate-400">{isAr ? 'ارفع صورة للبدء' : 'Upload an image'}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700 transition-colors">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isAr ? 'رفع صورة جديدة' : 'Upload New'}</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                onClick={() => setIsSaveModalOpen(true)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors"
              >
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? 'حفظ مع الاسم' : 'Save with Name'}</span>
              </button>
            </div>
          </div>

          {/* Quick Preset Stylers to Inject */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              {isAr ? 'إضافات سريعة للبرومبت (انقر للإدراج)' : 'Quick Modifiers (Click to Insert)'}
            </span>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {[
                '8k resolution',
                'Cinematic lighting',
                'Soft Rembrandt light',
                'Gold filigree embroidery',
                'Hasselblad 85mm f/1.4',
                'Award-winning portrait',
                'Polished emerald marble',
                'Volumetric rim light',
                'Luxury royal framing',
              ].map((mod) => (
                <button
                  key={mod}
                  onClick={() => handleAppendAttribute('Modifier', mod)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-700 border border-slate-700/60 text-slate-300 text-[10px] font-mono transition-colors flex items-center gap-1"
                >
                  <Plus className="w-2.5 h-2.5 text-cyan-400" />
                  <span>{mod}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Editable Prompts & Extracted Dimensions (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Prompts Tab Selector (Interactive Tabs for full Editing) */}
          <div className="rounded-2xl border border-slate-800 bg-[#090e17] p-2 flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActivePromptTab('production')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePromptTab === 'production'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'برومبت الإنتاج (Production)' : 'Production Prompt'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20">قابل للتعديل</span>
            </button>

            <button
              onClick={() => setActivePromptTab('detailed')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePromptTab === 'detailed'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isAr ? 'الوصف المفصل (Detailed)' : 'Detailed Prompt'}</span>
            </button>

            <button
              onClick={() => setActivePromptTab('basic')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePromptTab === 'basic'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>{isAr ? 'البرومبت الأساسي (Basic)' : 'Basic Prompt'}</span>
            </button>

            <button
              onClick={() => setActivePromptTab('negative')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePromptTab === 'negative'
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <X className="w-3.5 h-3.5" />
              <span>{isAr ? 'المستبعدات (Negative)' : 'Negative Prompt'}</span>
            </button>
          </div>

          {/* Active Editable Prompt Panel */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-slate-200">
                  {activePromptTab === 'production' && (isAr ? 'تعديل برومبت الإنتاج النهائي' : 'Edit Production Prompt')}
                  {activePromptTab === 'detailed' && (isAr ? 'تعديل الوصف المفصل' : 'Edit Detailed Prompt')}
                  {activePromptTab === 'basic' && (isAr ? 'تعديل البرومبت الأساسي' : 'Edit Basic Prompt')}
                  {activePromptTab === 'negative' && (isAr ? 'تعديل الكلمات المستبعدة' : 'Edit Negative Prompt')}
                </span>
                <span className="text-[10px] text-amber-400/80 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 font-mono">
                  ✏️ {isAr ? 'يمكنك الكتابة والتعديل مباشرة' : 'Directly Editable'}
                </span>
              </div>

              {/* Action Buttons for the active prompt */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetActivePrompt}
                  title={isAr ? 'إعادة تعيين للأصل المستخرج' : 'Reset to AI Extracted'}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700 transition-colors"
                >
                  <Undo2 className="w-3 h-3 text-slate-400" />
                  <span>{isAr ? 'استعادة الأصل' : 'Reset'}</span>
                </button>

                <button
                  onClick={() => {
                    const currentText =
                      activePromptTab === 'production'
                        ? editedProductionPrompt
                        : activePromptTab === 'detailed'
                        ? editedDetailedPrompt
                        : activePromptTab === 'basic'
                        ? editedBasicPrompt
                        : editedNegativePrompt;
                    handleCopy(currentText, activePromptTab);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 transition-colors"
                >
                  <Copy className="w-3 h-3 text-cyan-400" />
                  <span>{copiedKey === activePromptTab ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ البرومبت' : 'Copy')}</span>
                </button>

                <button
                  onClick={() => {
                    const currentText =
                      activePromptTab === 'production'
                        ? editedProductionPrompt
                        : activePromptTab === 'detailed'
                        ? editedDetailedPrompt
                        : editedBasicPrompt;
                    handleUsePromptInStudio(currentText);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] font-bold shadow-md shadow-cyan-500/20 transition-all"
                >
                  <Send className="w-3 h-3" />
                  <span>{isAr ? 'استخدام وتوليد' : 'Use & Generate'}</span>
                </button>
              </div>
            </div>

            {/* Editable Textarea based on active tab */}
            <div className="relative">
              {activePromptTab === 'production' && (
                <textarea
                  value={editedProductionPrompt}
                  onChange={(e) => setEditedProductionPrompt(e.target.value)}
                  rows={5}
                  dir="ltr"
                  className="w-full p-3.5 rounded-xl bg-[#070b12] border border-amber-500/30 text-amber-200 text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-y"
                  placeholder="Production prompt text..."
                />
              )}

              {activePromptTab === 'detailed' && (
                <textarea
                  value={editedDetailedPrompt}
                  onChange={(e) => setEditedDetailedPrompt(e.target.value)}
                  rows={5}
                  dir="ltr"
                  className="w-full p-3.5 rounded-xl bg-[#070b12] border border-cyan-500/30 text-slate-200 text-xs font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-y"
                  placeholder="Detailed prompt text..."
                />
              )}

              {activePromptTab === 'basic' && (
                <textarea
                  value={editedBasicPrompt}
                  onChange={(e) => setEditedBasicPrompt(e.target.value)}
                  rows={4}
                  dir="ltr"
                  className="w-full p-3.5 rounded-xl bg-[#070b12] border border-blue-500/30 text-blue-200 text-xs font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
                  placeholder="Basic prompt text..."
                />
              )}

              {activePromptTab === 'negative' && (
                <textarea
                  value={editedNegativePrompt}
                  onChange={(e) => setEditedNegativePrompt(e.target.value)}
                  rows={4}
                  dir="ltr"
                  className="w-full p-3.5 rounded-xl bg-[#070b12] border border-red-500/30 text-red-200 text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-y"
                  placeholder="Negative prompt constraints..."
                />
              )}

              {/* Counters */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
                <span>
                  {isAr ? 'عدد الكلمات:' : 'Words:'}{' '}
                  <strong className="text-slate-200 font-mono">
                    {(activePromptTab === 'production'
                      ? editedProductionPrompt
                      : activePromptTab === 'detailed'
                      ? editedDetailedPrompt
                      : activePromptTab === 'basic'
                      ? editedBasicPrompt
                      : editedNegativePrompt
                    )
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean).length}
                  </strong>
                </span>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400">
                    {isAr ? 'الحروف:' : 'Characters:'}{' '}
                    <strong className="text-slate-200 font-mono">
                      {(activePromptTab === 'production'
                        ? editedProductionPrompt
                        : activePromptTab === 'detailed'
                        ? editedDetailedPrompt
                        : activePromptTab === 'basic'
                        ? editedBasicPrompt
                        : editedNegativePrompt
                      ).length}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick action bar inside prompt editor */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400 text-[11px]">
                {isAr ? 'هل تريد حفظ هذا البرومبت مع الصورة كبطاقة توضيحية؟' : 'Save this edited prompt with image as reference card?'}
              </span>

              <button
                onClick={() => setIsSaveModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/40 transition-colors"
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>{isAr ? 'حفظ كبطاقة توضيحية مع تحديد الاسم' : 'Save Card with Name'}</span>
              </button>
            </div>
          </div>

          {/* Extracted 15 Visual Attributes (Interactive Click to Insert) */}
          {originalAnalysis.attributes && (
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-cyan-400" />
                  <span>{isAr ? 'الأبعاد البصرية المستخرجة (انقر على أي عنصر لإضافته للبرومبت)' : 'Extracted Visual Dimensions (Click to Append)'}</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {Object.keys(originalAnalysis.attributes).length} {isAr ? 'أبعاد' : 'dimensions'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-[11px]">
                {Object.entries(originalAnalysis.attributes).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => handleAppendAttribute(key, String(val))}
                    className="group p-2.5 rounded-xl bg-[#090e17] hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 text-right transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-cyan-400 text-[9px] uppercase font-bold tracking-wider">{key}</span>
                      <Plus className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <span className="text-slate-300 line-clamp-2 text-right group-hover:text-slate-100 leading-snug">
                      {String(val)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Saved Illustrative Cards Gallery Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <FolderHeart className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {isAr ? 'سجل البطاقات التوضيحية المحفوظة' : 'Saved Illustrative Reference Cards'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isAr
                  ? 'جميع البرومبتات المحفوظة مع صورها التوضيحية وأسمائها المحددة، جاهزة لإعادة التوليد أو التنزيل كصور عالية الدقة.'
                  : 'All saved prompts with linked images & custom names, ready to generate or download as reference cards.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-amber-400 font-bold border border-slate-700">
              {illustrativeCards.length} {isAr ? 'بطاقة محفوظة' : 'Cards'}
            </span>
            <button
              onClick={() => setIsSaveModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? 'حفظ بطاقة جديدة' : 'New Card'}</span>
            </button>
          </div>
        </div>

        {illustrativeCards.length === 0 ? (
          <div className="py-10 text-center space-y-3 border border-dashed border-slate-800 rounded-xl">
            <BookmarkCheck className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">
              {isAr ? 'لم تقم بحفظ أي بطاقة توضيحية بعد. اضغط على "حفظ البرومبت كصورة توضيحية" أعلاه لحفظ أول بطاقة.' : 'No saved illustrative cards yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {illustrativeCards.map((card) => (
              <div
                key={card.id}
                className="group rounded-2xl border border-slate-800 hover:border-amber-500/40 bg-[#090e17] overflow-hidden flex flex-col justify-between transition-all shadow-md hover:shadow-xl hover:shadow-amber-500/5"
              >
                <div>
                  {/* Card Header with Image Thumbnail & Badges */}
                  <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden border-b border-slate-800">
                    <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-amber-500/30">
                        {card.role}
                      </span>
                      {card.isLocked && (
                        <span className="px-1.5 py-0.5 rounded-md bg-red-950/80 text-[10px] font-bold text-red-300 border border-red-500/40 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>قفل</span>
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2 right-3 left-3">
                      <h3 className="text-sm font-black text-slate-100 line-clamp-1">{card.name}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(card.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>

                  {/* Card Prompt Preview */}
                  <div className="p-3.5 space-y-2">
                    <p className="text-[11px] text-slate-300 line-clamp-3 leading-relaxed font-mono bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                      {card.promptText}
                    </p>

                    {card.notes && (
                      <span className="text-[10px] text-slate-400 line-clamp-1 block">
                        📝 {card.notes}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(card.promptText, card.id)}
                      title={isAr ? 'نسخ البرومبت' : 'Copy Prompt'}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDownloadIllustrativeCardCanvas(card)}
                      title={isAr ? 'تنزيل البطاقة كصورة عالية الدقة' : 'Download Card Image'}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-amber-300 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setImageUrl(card.imageUrl);
                        setEditedProductionPrompt(card.promptText);
                        setActivePromptTab('production');
                      }}
                      title={isAr ? 'تحميل للمحرر للتعديل' : 'Load into Editor'}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => deleteIllustrativeCard(card.id)}
                      title={isAr ? 'حذف البطاقة' : 'Delete Card'}
                      className="p-1.5 rounded-lg hover:bg-red-950/50 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (card.promptId) {
                          setActivePromptId(card.promptId);
                        } else {
                          createNewPrompt(card.promptText);
                        }
                        setCurrentView('create');
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-[11px] font-bold transition-all shadow-sm shadow-amber-500/20 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{isAr ? 'توليد بالاستوديو' : 'Generate'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SAVE PROMPT WITH REFERENCE IMAGE MODAL */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b101b] border border-amber-500/30 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl shadow-amber-500/10 animate-in fade-in zoom-in-95 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <BookmarkCheck className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="text-lg font-black text-slate-100">
                    {isAr ? 'حفظ البرومبت مع الصورة كبطاقة توضيحية' : 'Save Prompt as Illustrative Card'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isAr ? 'حدد اسماً للبطاقة واختر الدور المرجعي وقفل المرجع لحفظها واستخدامها مستقبلاً.' : 'Set card name and reference role.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 1. Custom Name Input (مع تحديد الاسم) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
                  <span>{isAr ? 'اسم البطاقة / البرومبت التوضيحي (مطلوب)' : 'Card / Prompt Name (Required)'}</span>
                  <span className="text-[10px] text-slate-400">{isAr ? 'مثال: تصميم تخرج زمردي فاخر' : 'e.g. Luxury Emerald Graduation'}</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    dir={isAr ? 'rtl' : 'ltr'}
                    placeholder={isAr ? 'اكتب اسم التصميم أو البطاقة...' : 'Enter prompt card name...'}
                    className="w-full px-4 py-3 rounded-xl bg-[#070b12] border border-amber-500/40 text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <Tag className="w-4 h-4 text-amber-400 absolute left-3 top-3.5" />
                </div>
              </div>

              {/* 2. Prompt Tier Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  {isAr ? 'اختر البرومبت المعتمد للبطاقة' : 'Select Prompt Version to Save'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCardSelectedPromptTier('production')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                      cardSelectedPromptTier === 'production'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{isAr ? 'برومبت الإنتاج المعدل' : 'Production'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardSelectedPromptTier('detailed')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                      cardSelectedPromptTier === 'detailed'
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{isAr ? 'الوصف المفصل المعدل' : 'Detailed'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardSelectedPromptTier('basic')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                      cardSelectedPromptTier === 'basic'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{isAr ? 'البرومبت الأساسي' : 'Basic'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-[#070b12] border border-slate-800 text-xs font-mono text-slate-300 max-h-24 overflow-y-auto leading-relaxed">
                  {getPromptForSaving()}
                </div>
              </div>

              {/* 3. Reference Role & Locked Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    {isAr ? 'الدور المرجعي للصورة المرفقة' : 'Image Reference Role'}
                  </label>
                  <select
                    value={cardRole}
                    onChange={(e) => setCardRole(e.target.value as ReferenceRole)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#070b12] border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {availableRoles.map((r) => (
                      <option key={r.role} value={r.role}>
                        {r.icon} {isAr ? r.labelAr : r.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="text-xs font-bold text-slate-300">
                    {isAr ? 'قفل المرجع الصارم 🔒' : 'Strict Reference Lock'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setCardIsLocked(!cardIsLocked)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      cardIsLocked
                        ? 'bg-red-950/40 border-red-500/50 text-red-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {cardIsLocked ? <Lock className="w-3.5 h-3.5 text-red-400" /> : <Unlock className="w-3.5 h-3.5" />}
                      <span>{cardIsLocked ? (isAr ? 'المرجع مقفل (إلزام الموديل بالملامح)' : 'Locked') : (isAr ? 'مرجع مرن' : 'Flexible')}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 font-mono">
                      {cardIsLocked ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>
              </div>

              {/* 4. Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  {isAr ? 'ملاحظات أو وسوم توضيحية' : 'Notes & Tags'}
                </label>
                <input
                  type="text"
                  value={cardNotes}
                  onChange={(e) => setCardNotes(e.target.value)}
                  placeholder={isAr ? 'أضف وسوماً أو تعليمات خاصة...' : 'Add notes or instructions...'}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#070b12] border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Live Preview Mini Card */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-amber-950/30 border border-amber-500/20 flex items-center gap-3">
                <div className="relative w-16 h-20 rounded-xl overflow-hidden border border-slate-700 shrink-0">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  {cardIsLocked && (
                    <div className="absolute top-1 right-1 bg-red-600 rounded p-0.5 text-white">
                      <Lock className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                    {cardRole}
                  </span>
                  <h4 className="text-xs font-bold text-slate-100 truncate">{cardName || 'بدون اسم'}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 font-mono">
                    {getPromptForSaving()}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleDownloadIllustrativeCardCanvas()}
                disabled={isExportingCanvas || !cardName.trim()}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isExportingCanvas ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <Download className="w-4 h-4 text-cyan-400" />}
                <span>{isAr ? 'تنزيل كبطاقة صورة توضيحية (PNG)' : 'Download Illustrative Card (PNG)'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToProject}
                disabled={!cardName.trim()}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                <BookmarkCheck className="w-4 h-4 text-slate-950" />
                <span>{isAr ? 'حفظ في المشروع ومكتبة البرومبت' : 'Save to Studio Project'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
