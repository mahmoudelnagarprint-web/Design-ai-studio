import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { testAiConnection } from '../../services/api';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Server,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Globe,
  Sliders,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, setIsApiConnectionModalOpen } = useStudio();
  const isAr = settings.language === 'ar';

  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await testAiConnection();
      setTestResult(res);
    } catch {
      setTestResult({ success: false, message: 'Failed to contact backend server' });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SettingsIcon className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-black text-slate-100">
              {isAr ? 'إعدادات الاستوديو ومزودات الذكاء الاصطناعي' : 'Studio & AI Provider Settings'}
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'إدارة نماذج التوليد الافتراضية، بيئة الخادم الآمنة، واختبار الاتصال بمزود الذكاء الاصطناعي.'
              : 'Configure default AI models, test secure server connectivity, and studio preferences.'}
          </p>
        </div>

        <button
          onClick={handleTestConnection}
          disabled={testingConnection}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
        >
          {testingConnection ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" /> : <RefreshCw className="w-3.5 h-3.5 text-amber-400" />}
          <span>{isAr ? 'اختبار الاتصال بالخادم (Connection Test)' : 'Test Connection'}</span>
        </button>
      </div>

      {/* Connection Test Result Banner */}
      {testResult && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
            testResult.success
              ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
              : 'border-red-500/40 bg-red-950/20 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
            <div>
              <span className="font-bold">{testResult.success ? (isAr ? 'الاتصال ناجح ومستقر:' : 'Connected:') : (isAr ? 'تنبيه الاتصال:' : 'Error:')} </span>
              <span>{testResult.message}</span>
            </div>
          </div>
          <button onClick={() => setTestResult(null)} className="font-bold text-xs">✕</button>
        </div>
      )}

      {/* Server-side API key configuration */}
      <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{isAr ? 'إعداد مفتاح API على الخادم' : 'Server-side API key configuration'}</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {isAr
            ? 'ضع GEMINI_API_KEY في أسرار بيئة الخادم أو ملف .env المحلي غير المتعقب. لا يدير هذا التطبيق تسجيل دخول Google أو الحصص اليومية، ولا تلصق المفتاح في المستودع أو المتصفح.'
            : 'Set GEMINI_API_KEY in the server environment or an untracked local .env file. This app does not sign into Google or verify daily quotas. Never commit or paste the key into browser storage.'}
        </p>
      </div>

      {/* Model Selection (Requirement 47) */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-amber-400" />
          <span>{isAr ? 'النماذج الافتراضية (Default AI Models)' : 'Default Model Selection'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Default Image Model */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              {isAr ? 'نموذج توليد الصور الافتراضي (Image Model)' : 'Default Image Generation Model'}
            </label>
            <select
              value={settings.defaultImageModel}
              onChange={(e) => updateSettings({ defaultImageModel: e.target.value })}
              className="w-full bg-[#090e17] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
            >
              <option value="gemini-3.1-flash-lite-image">gemini-3.1-flash-lite-image (Fast & Versatile)</option>
              <option value="gemini-3.1-flash-image">gemini-3.1-flash-image (High Quality 4K)</option>
              <option value="gemini-3-pro-image">gemini-3-pro-image (Pro Luxury Render)</option>
            </select>
          </div>

          {/* Default Vision Model */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              {isAr ? 'نموذج الرؤية والتحليل (Vision Model)' : 'Default Vision Model'}
            </label>
            <select
              value={settings.defaultVisionModel}
              onChange={(e) => updateSettings({ defaultVisionModel: e.target.value })}
              className="w-full bg-[#090e17] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended Vision)</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Advanced STEM & Art Direction)</option>
            </select>
          </div>

          {/* Default Upscale Model */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              {isAr ? 'نموذج الـ Upscale والتكبير' : 'Default Upscale Engine'}
            </label>
            <select
              value={settings.defaultUpscaleModel}
              onChange={(e) => updateSettings({ defaultUpscaleModel: e.target.value })}
              className="w-full bg-[#090e17] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
            >
              <option value="RealESRGAN-4x-Pro">RealESRGAN-4x-Pro (Biometric Facial Lock)</option>
              <option value="ClarityAI-Ultra">ClarityAI-Ultra 8K</option>
            </select>
          </div>

          {/* Default Edit Model */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              {isAr ? 'نموذج التعديل التوليدي (Inpainting Model)' : 'Default Generative Edit Model'}
            </label>
            <select
              value={settings.defaultEditModel}
              onChange={(e) => updateSettings({ defaultEditModel: e.target.value })}
              className="w-full bg-[#090e17] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
            >
              <option value="gemini-3.1-flash-lite-image">gemini-3.1-flash-lite-image</option>
              <option value="gemini-3.1-flash-image">gemini-3.1-flash-image</option>
            </select>
          </div>
        </div>
      </div>

      {/* Language & Interface Preferences */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Globe className="w-4 h-4 text-amber-400" />
          <span>{isAr ? 'لغة الواجهة وتجربة المستخدم' : 'Language & Localization'}</span>
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => updateSettings({ language: 'ar' })}
            className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
              settings.language === 'ar'
                ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                : 'border-slate-800 bg-[#090e17] text-slate-400 hover:text-white'
            }`}
          >
            <span>العربية (افتراضي - RTL)</span>
            {settings.language === 'ar' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            onClick={() => updateSettings({ language: 'en' })}
            className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
              settings.language === 'en'
                ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                : 'border-slate-800 bg-[#090e17] text-slate-400 hover:text-white'
            }`}
          >
            <span>English (LTR)</span>
            {settings.language === 'en' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <div>
          <h3 className="text-sm font-bold text-slate-200">{isAr ? 'حالة اتصال Gemini' : 'Gemini connection status'}</h3>
          <p className="mt-1 text-xs text-slate-400">
            {isAr ? 'اختبار الاتصال لا يثبت هوية حساب Google أو مقدار الحصة.' : 'A connectivity test does not verify Google identity or quota.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsApiConnectionModalOpen(true)}
          className="shrink-0 rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800"
        >
          {isAr ? 'إعداد الاتصال' : 'Connection settings'}
        </button>
      </div>
    </div>
  );
};
