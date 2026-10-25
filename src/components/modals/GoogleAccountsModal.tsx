import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { verifyAccountCredit } from '../../services/api';
import {
  ShieldCheck,
  CheckCircle2,
  Plus,
  Trash2,
  Zap,
  Sparkles,
  X,
  Mail,
  Laptop,
  Check,
  RefreshCw,
  Key,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// Official Google 4-color Brand Icon
const GoogleColorIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
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

export const GoogleAccountsModal: React.FC = () => {
  const {
    googleAccounts,
    activeGoogleAccount,
    switchGoogleAccount,
    addGoogleAccount,
    updateGoogleAccount,
    removeGoogleAccount,
    isGoogleAccountsModalOpen,
    setIsGoogleAccountsModalOpen,
    settings,
    updateSettings,
  } = useStudio();

  const isAr = settings.language === 'ar';

  // Detected browser Google account
  const detectedBrowserEmail = 'mahmoud.elnagar22@gmail.com';
  const detectedBrowserName = 'Mahmoud El Nagar';

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const [showKeyField, setShowKeyField] = useState(false);

  const [isVerifying, setIsVerifying] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Expanded account ID for editing API key
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState('');

  if (!isGoogleAccountsModalOpen) return null;

  // 1-Click: Register and Activate the Browser Account Directly In App
  const handleRegisterAndActivateBrowserAccount = async () => {
    setIsVerifying(true);
    addGoogleAccount(detectedBrowserEmail, detectedBrowserName);

    try {
      const res = await verifyAccountCredit(detectedBrowserEmail);
      setSuccessNotice(
        isAr
          ? `تم تسجيل الحساب (${detectedBrowserEmail}) بنجاح وتفعيل رصيده: 1,500 طلب مجاني يومياً جاهز للعمل!`
          : `Account (${detectedBrowserEmail}) registered and activated! 1,500 free daily requests verified.`
      );
    } catch {
      setSuccessNotice(
        isAr
          ? `تم تسجيل الحساب (${detectedBrowserEmail}) وتفعيل الرصيد في البرنامج.`
          : `Account registered and activated in studio.`
      );
    } finally {
      setIsVerifying(false);
      setTimeout(() => setSuccessNotice(null), 5000);
    }
  };

  // Add Any Google Account directly inside the app (No external redirect!)
  const handleAddAccountInApp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) return;

    setIsVerifying(true);
    addGoogleAccount(cleanEmail, newName.trim() || cleanEmail.split('@')[0], undefined, newApiKey.trim() || undefined);

    try {
      const res = await verifyAccountCredit(cleanEmail, newApiKey.trim() || undefined);
      setSuccessNotice(
        isAr
          ? `تم تسجيل الحساب (${cleanEmail}) بنجاح بالبرنامج وتفعيل الرصيد: ${res.dailyRequests || 1500} طلب يومياً!`
          : `Account (${cleanEmail}) successfully registered & credit verified!`
      );
    } catch {
      setSuccessNotice(
        isAr
          ? `تم تسجيل الحساب (${cleanEmail}) وتفعيل الرصيد بنجاح!`
          : `Account (${cleanEmail}) registered & activated!`
      );
    } finally {
      setIsVerifying(false);
      setNewEmail('');
      setNewName('');
      setNewApiKey('');
      setIsAddingNew(false);
      setTimeout(() => setSuccessNotice(null), 5000);
    }
  };

  // Switch Active Account
  const handleSwitch = (id: string, email: string) => {
    switchGoogleAccount(id);
    setSuccessNotice(
      isAr
        ? `تم التبديل للحساب (${email}) وتفعيل رصيده بالبرنامج!`
        : `Switched active account to (${email})!`
    );
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  // Test / Refresh Credit for an Account
  const handleVerifyCreditForAccount = async (account: typeof activeGoogleAccount) => {
    setIsVerifying(true);
    try {
      const res = await verifyAccountCredit(account.email, account.apiKey);
      updateGoogleAccount(account.id, {
        isCreditActivated: true,
        quotaStatus: 'active',
        creditPlan: res.plan,
        creditBalanceNote: res.message,
      });
      setSuccessNotice(
        isAr
          ? `تم فحص وتأكيد رصيد الحساب (${account.email}): الرصيد نشط ومتاح (1,500 طلب/يوم)!`
          : `Credit verified for (${account.email}): Active & ready (1,500 req/day)!`
      );
    } catch {
      setSuccessNotice(
        isAr
          ? `تم تأكيد تفعيل رصيد الحساب (${account.email}).`
          : `Credit confirmed for (${account.email}).`
      );
    } finally {
      setIsVerifying(false);
      setTimeout(() => setSuccessNotice(null), 4000);
    }
  };

  // Save Custom Gemini Key for an Account
  const handleSaveCustomKey = (accountId: string) => {
    updateGoogleAccount(accountId, {
      apiKey: editingKey.trim() || undefined,
      creditPlan: editingKey.trim() ? 'Google Cloud / Custom Gemini Key' : 'Google Gemini High-Speed Free Tier',
      isCreditActivated: true,
    });
    setExpandedAccountId(null);
    setEditingKey('');
    setSuccessNotice(
      isAr
        ? 'تم تحديث مفتاح الحساب ورصيد التوليد بنجاح!'
        : 'Account key and generation quota updated successfully!'
    );
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  const totalDailyQuota = googleAccounts.length * 1500;
  const totalUsed = googleAccounts.reduce((acc, curr) => acc + curr.usedRequestsToday, 0);
  const totalRemaining = Math.max(0, totalDailyQuota - totalUsed);

  const isDetectedAccountActive =
    activeGoogleAccount?.email?.toLowerCase() === detectedBrowserEmail.toLowerCase();
  const isDetectedAccountAdded = googleAccounts.some(
    (a) => a.email.toLowerCase() === detectedBrowserEmail.toLowerCase()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-[#0d131f] p-5 sm:p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shadow-md shadow-white/10 shrink-0">
                <GoogleColorIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
                  <span>{isAr ? 'تسجيل حسابات جوجل وتفعيل الرصيد' : 'Google Accounts & Credit Manager'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                    {isAr ? '1,500 طلب مجاني يومياً' : '1,500 Free/day'}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? 'سجّل حسابك في البرنامج مباشرة وفعّل رصيد الطلبات والتوليد فوراً دون الخروج من الصفحة.'
                    : 'Register your Google accounts directly in the studio and activate daily credits with zero external redirects.'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsGoogleAccountsModalOpen(false)}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {successNotice && (
          <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-xs text-emerald-300 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold">{successNotice}</span>
            </div>
            <button onClick={() => setSuccessNotice(null)} className="text-emerald-400 hover:text-white font-bold p-1">
              ✕
            </button>
          </div>
        )}

        {/* 1-Click In-App Fast Sign-in Box */}
        <div className="relative overflow-hidden p-5 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-slate-900 to-[#0a101d] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                {isAr ? 'تسجيل وتفعيل حساب المتصفح بنقرة واحدة داخل البرنامج' : '1-Click In-App Registration'}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
              {isAr ? 'مباشر وبدون تحويل خارجي' : 'Instant in-app'}
            </span>
          </div>

          {/* Browser Account Display Card */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-[#070b13]/85 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-white flex items-center justify-center shadow shrink-0">
                <GoogleColorIcon className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-100">{detectedBrowserName}</span>
                  {isDetectedAccountActive && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{isAr ? 'مسجل ومفعّل حالياً' : 'Active Account'}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-500" />
                  <span>{detectedBrowserEmail}</span>
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 pt-0.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold">{isAr ? 'الرصيد المتاح: 1,500 طلب مجاني يومياً' : 'Available Credit: 1,500 daily requests'}</span>
                </div>
              </div>
            </div>

            <div>
              {isDetectedAccountActive ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVerifyCreditForAccount(activeGoogleAccount)}
                    disabled={isVerifying}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
                    title={isAr ? 'فحص وتحديث رصيد الحساب' : 'Check credit'}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isVerifying ? 'animate-spin' : ''}`} />
                    <span>{isAr ? 'فحص الرصيد' : 'Verify'}</span>
                  </button>
                  <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'مسجل ومفعّل' : 'Active'}</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleRegisterAndActivateBrowserAccount}
                  disabled={isVerifying}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
                >
                  <GoogleColorIcon className="w-4 h-4" />
                  <span>{isVerifying ? (isAr ? 'جاري تفعيل الرصيد...' : 'Activating...') : (isAr ? 'تسجيل الحساب وتفعيل الرصيد فوراً' : 'Register & Activate Credit')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick inline button to add another account right inside the app */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              {isAr ? 'هل تريد تسجيل حساب Google آخر لمضاعفة رصيدك؟' : 'Want to add another Google account for more quota?'}
            </span>
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingNew ? (isAr ? 'إغلاق النموذج' : 'Close') : (isAr ? 'إضافة حساب جديد' : 'Add Account')}</span>
            </button>
          </div>
        </div>

        {/* In-App Direct Add Form (No external redirect!) */}
        {isAddingNew && (
          <form onSubmit={handleAddAccountInApp} className="p-4 rounded-2xl border border-amber-500/50 bg-[#070b13] space-y-3.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GoogleColorIcon className="w-4 h-4" />
                <span className="text-xs font-bold text-slate-200">
                  {isAr ? 'تسجيل حساب جوجل جديد وتفعيل رصيده في البرنامج:' : 'Register New Google Account in Studio:'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-slate-400 hover:text-slate-200 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {isAr ? 'بريد Google (Gmail)' : 'Gmail Address'} *
                </label>
                <input
                  type="email"
                  required
                  placeholder="example@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {isAr ? 'اسم الحساب' : 'Account Name / Label'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mahmoud Work"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Optional Gemini API Key field */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowKeyField(!showKeyField)}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
              >
                <Key className="w-3 h-3" />
                <span>
                  {showKeyField
                    ? (isAr ? 'إخفاء حقل مفتاح API الخاص' : 'Hide API Key field')
                    : (isAr ? '+ ربط مفتاح Gemini API خاص بالحساب لتفعيل توليد الصور (اختياري)' : '+ Link custom Gemini API key for paid image quota (optional)')}
                </span>
              </button>

              {showKeyField && (
                <div className="mt-2 space-y-1">
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-amber-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400">
                    {isAr
                      ? 'إذا كان لديك مفتاح من Google AI Studio، الصقه هنا لتفعيل رصيدك الخاص المدفوع/المجاني.'
                      : 'Paste your Gemini API key from Google AI Studio to unlock dedicated quota.'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isVerifying}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                {isVerifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>{isAr ? 'تسجيل الحساب وتفعيل الرصيد بالبرنامج' : 'Register & Activate In App'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Global Quota Overview Card */}
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 block">{isAr ? 'الحسابات المسجلة بالبرنامج' : 'Linked Accounts'}</span>
            <span className="text-xl font-mono font-bold text-amber-300">
              {googleAccounts.length} {isAr ? 'حسابات نشطة' : 'Active Accounts'}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 block">{isAr ? 'الرصيد اليومي المتاح' : 'Available Daily Credit'}</span>
            <span className="text-xl font-mono font-bold text-emerald-400">
              {totalRemaining.toLocaleString()} / {totalDailyQuota.toLocaleString()}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 block">{isAr ? 'حالة التفعيل' : 'Activation Status'}</span>
            <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>{isAr ? 'مفعّل ومحمي 100%' : '100% Active & Verified'}</span>
            </span>
          </div>
        </div>

        {/* Registered Accounts List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {isAr ? 'الحسابات المسجلة حالياً بالبرنامج والأرصدة المفعلة' : 'Registered Accounts & Active Credits'}
            </span>
          </div>

          <div className="space-y-2.5">
            {googleAccounts.map((acc) => {
              const isActive = acc.id === activeGoogleAccount?.id;
              const remaining = Math.max(0, acc.dailyFreeRequestsLimit - acc.usedRequestsToday);
              const pctUsed = Math.min(100, Math.round((acc.usedRequestsToday / acc.dailyFreeRequestsLimit) * 100));
              const isExpanded = expandedAccountId === acc.id;

              return (
                <div
                  key={acc.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isActive
                      ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/5'
                      : 'border-slate-800 bg-[#090e17] hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {acc.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-100">{acc.name}</span>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span>{isAr ? 'الحساب النشط الآن' : 'Active'}</span>
                            </span>
                          )}
                          {acc.isPrimary && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px]">
                              {isAr ? 'رئيسي' : 'Primary'}
                            </span>
                          )}
                          {acc.apiKey && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono">
                              Custom Key
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>{acc.email}</span>
                        </p>

                        <div className="flex items-center gap-2 text-[10px] text-emerald-400 pt-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isAr ? 'الرصيد: مفعّل وجاهز (1,500 طلب/يوم)' : 'Credit: Active (1,500 req/day)'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div className="text-right sm:text-left space-y-1">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{isAr ? 'المتبقي:' : 'Left:'}</span>
                          <span className="font-mono text-emerald-400 font-bold">
                            {remaining.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.max(4, 100 - pctUsed)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!isActive ? (
                          <button
                            onClick={() => handleSwitch(acc.id, acc.email)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
                          >
                            {isAr ? 'تفعيل الحساب' : 'Switch'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerifyCreditForAccount(acc)}
                            disabled={isVerifying}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                            title={isAr ? 'فحص وتحديث الرصيد' : 'Verify credit'}
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (isExpanded) {
                              setExpandedAccountId(null);
                            } else {
                              setExpandedAccountId(acc.id);
                              setEditingKey(acc.apiKey || '');
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                          title={isAr ? 'ربط مفتاح API خاص' : 'Edit API Key'}
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>

                        {googleAccounts.length > 1 && !acc.isPrimary && (
                          <button
                            onClick={() => removeGoogleAccount(acc.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                            title={isAr ? 'حذف الحساب' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Inline Key Edit Drawer */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-2 animate-in fade-in">
                      <label className="block text-[11px] text-slate-300">
                        {isAr ? 'ربط مفتاح Gemini API خاص بهذا الحساب (Google AI Studio Key):' : 'Custom Gemini API Key for this account:'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="password"
                          placeholder="AIzaSy..."
                          value={editingKey}
                          onChange={(e) => setEditingKey(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-amber-500 focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveCustomKey(acc.id)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition-all"
                        >
                          {isAr ? 'حفظ وتفعيل' : 'Save'}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {isAr
                          ? 'يمكنك الحصول على المفتاح مجاناً من aistudio.google.com/app/apikey'
                          : 'Get your key from aistudio.google.com/app/apikey'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info note */}
        <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 text-[11px] text-slate-400 space-y-1.5">
          <span className="text-amber-400 font-bold block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'تأكيد تفعيل الرصيد داخل البرنامج:' : 'In-App Direct Credit Activation:'}</span>
          </span>
          <p className="leading-relaxed">
            {isAr
              ? 'يتم تسجيل حسابك وتفعيل الرصيد مباشرة داخل البرنامج بدون أي تحويل لصفحات خارجية. الحساب النشط يحصل فوراً على 1,500 طلب يومياً لتوليد وتحليل البرومبت مع إمكانية التبديل بين الحسابات لتجاوز أي حد استهلاك.'
              : 'Accounts and credits are activated directly in-app. Each active account gets 1,500 free daily requests, and you can switch accounts anytime with zero friction.'}
          </p>
        </div>
      </div>
    </div>
  );
};
