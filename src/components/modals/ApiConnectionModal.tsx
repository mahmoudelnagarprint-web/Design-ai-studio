import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { testAiConnection } from '../../services/api';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Server, X } from 'lucide-react';

export const ApiConnectionModal: React.FC = () => {
  const { isApiConnectionModalOpen, setIsApiConnectionModalOpen, settings } = useStudio();
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const isAr = settings.language === 'ar';

  if (!isApiConnectionModalOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setResult(null);
    try {
      setResult(await testAiConnection());
    } catch {
      setResult({ success: false, message: 'Could not contact the application server.' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-connection-title"
        className="w-full max-w-lg space-y-5 rounded-2xl border border-slate-700 bg-[#0d131f] p-6 shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-amber-400">
              <Server className="h-5 w-5" />
            </span>
            <div>
              <h2 id="ai-connection-title" className="text-base font-bold text-slate-100">
                {isAr ? 'اتصال Gemini API' : 'Gemini API Connection'}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {isAr ? 'فحص اتصال الخادم فقط' : 'Checks server connectivity only'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsApiConnectionModalOpen(false)}
            aria-label={isAr ? 'إغلاق' : 'Close'}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <p className="text-sm leading-6 text-slate-300">
          {isAr
            ? 'لا يسجّل هذا التطبيق الدخول إلى حساب Google ولا يقرأ حصتك اليومية. لإعداد الاتصال، أضف GEMINI_API_KEY إلى أسرار بيئة الخادم. لا تضع المفتاح في رسالة أو مستودع عام.'
            : 'This app does not sign in to a Google account or read your daily quota. Configure GEMINI_API_KEY in the server environment. Do not put the key in a message or public repository.'}
        </p>

        {result && (
          <div
            role="status"
            className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${
              result.success
                ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                : 'border-red-500/40 bg-red-950/30 text-red-200'
            }`}
          >
            {result.success ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
            <span>{result.message}</span>
          </div>
        )}

        <footer className="flex justify-end gap-2 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={() => setIsApiConnectionModalOpen(false)}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {isTesting ? (isAr ? 'جارٍ الفحص...' : 'Testing...') : (isAr ? 'اختبار الاتصال' : 'Test connection')}
          </button>
        </footer>
      </section>
    </div>
  );
};
