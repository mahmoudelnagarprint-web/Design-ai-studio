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

// Official Google 4-color Brand Icon
const GoogleColorIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, activeGoogleAccount, setIsGoogleAccountsModalOpen } = useStudio();
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

      {/* Security Architecture Box (Principle 48) */}
      <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{isAr ? 'حماية وأمان المفاتيح (Zero-Exposure Security)' : 'Zero-Exposure Security Environment'}</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {isAr
            ? 'مفاتيح API مشفرة بالكامل وتعمل داخل بيئة الخادم الآمنة (Backend Proxy). لا يتم كشف أي مفاتيح للمتصفح نهائيًا وفقًا لمعايير الأمان الموصى بها.'
            : 'All Gemini API keys are strictly retained on the Express backend server proxy. Keys are never exposed to the client bundle.'}
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

      {/* Google Accounts & Free Quota Management */}
      <div className="p-5 rounded-2xl border border-amber-500/30 bg-slate-900/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                <GoogleColorIcon className="w-4 h-4" />
              </span>
              <span>{isAr ? 'حسابات جوجل والتسجيل السريع من المتصفح' : 'Google Accounts & 1-Click Sign-In'}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'سجل بحسابات Google المفتوحة في المتصفح بنقرة واحدة، واستفد من 1,500 طلب مجاني يومياً لكل حساب.'
                : '1-click sign in with browser-saved Google accounts and get 1,500 free requests per account.'}
            </p>
          </div>

          <button
            onClick={() => setIsGoogleAccountsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/10 transition-all shrink-0"
          >
            <GoogleColorIcon className="w-3.5 h-3.5" />
            <span>{isAr ? 'فتح نافذة الحسابات والتسجيل' : 'Manage & Sign In'}</span>
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-[#090e17] border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
              <GoogleColorIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-100 block">{activeGoogleAccount?.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">{activeGoogleAccount?.email}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">{isAr ? 'الرصيد المتبقي اليوم (مجاني):' : 'Remaining Free:'}</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {Math.max(0, 1500 - (activeGoogleAccount?.usedRequestsToday || 0))} / 1,500
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
