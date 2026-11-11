import React, { useState } from 'react';
import { X, Settings, ShieldAlert, Calendar, RotateCcw, Check, AlertTriangle, Globe, Lock } from 'lucide-react';
import { Teacher, AppSettings, Language } from '../types';
import { translations } from '../i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTeacher: Teacher | null;
  settings: AppSettings;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onSettingsUpdated: (newSettings: AppSettings) => void;
  onWeekReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTeacher,
  settings,
  language,
  onLanguageChange,
  onSettingsUpdated,
  onWeekReset
}) => {
  const t = translations[language];

  const [resetDay, setResetDay] = useState<number>(settings.resetDayOfWeek);
  const [schoolNameEn, setSchoolNameEn] = useState<string>(settings.schoolName);
  const [schoolNameAr, setSchoolNameAr] = useState<string>(settings.schoolNameAr);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const isAdmin = currentTeacher?.role === 'admin';

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-teacher-id': currentTeacher.id
        },
        body: JSON.stringify({
          resetDayOfWeek: resetDay,
          schoolName: schoolNameEn,
          schoolNameAr: schoolNameAr
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');

      onSettingsUpdated(data.settings);
      setMessage({ text: t.settingsSaved, type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      setMessage({ text: err instanceof Error ? err.message : 'Error saving settings', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecuteReset = async () => {
    if (!isAdmin || !currentTeacher) return;

    setIsResetting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/reset-week', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-teacher-id': currentTeacher.id
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset week');

      setShowConfirmReset(false);
      onWeekReset();
      setMessage({ text: t.resetSuccessMsg, type: 'success' });
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 2000);
    } catch (err: unknown) {
      setMessage({ text: err instanceof Error ? err.message : 'Error executing reset', type: 'error' });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051020]/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#07162c] border-2 border-white/50 rounded-2xl shadow-2xl overflow-hidden text-white max-h-[90vh] flex flex-col">
        
        {/* Top frieze */}
        <div className="andalus-frieze opacity-60" />

        {/* Header */}
        <div className="p-6 border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#0e2a52] text-amber-300 border border-white/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-serif">{t.settings}</h3>
              <p className="text-xs text-sky-200">
                {language === 'ar' ? 'إعدادات النظام وصلاحيات المشرف المعتمد لمدارس الأندلس' : 'System preferences & authorized administrator controls'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#0e2a52] hover:bg-[#143b72] text-white transition cursor-pointer border border-white/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Language Selection */}
          <div className="bg-[#0e2a52] p-5 rounded-xl border border-white/30">
            <label className="block text-xs font-bold uppercase tracking-wider text-sky-200 mb-3 flex items-center gap-2 font-serif">
              <Globe className="w-4 h-4 text-sky-300" />
              <span>{language === 'ar' ? 'لغة التطبيق (Language)' : 'Application Language'}</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`py-3 px-4 rounded-xl border font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2 ${
                  language === 'en'
                    ? 'bg-white text-[#07162c] border-white shadow-md font-black'
                    : 'bg-[#07162c] hover:bg-[#0b2548] text-white border-white/30'
                }`}
              >
                <span>English (LTR)</span>
                {language === 'en' && <Check className="w-4 h-4 text-blue-700" />}
              </button>

              <button
                type="button"
                onClick={() => onLanguageChange('ar')}
                className={`py-3 px-4 rounded-xl border font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2 ${
                  language === 'ar'
                    ? 'bg-white text-[#07162c] border-white shadow-md font-black font-serif'
                    : 'bg-[#07162c] hover:bg-[#0b2548] text-white border-white/30 font-serif'
                }`}
              >
                <span>العربية (RTL)</span>
                {language === 'ar' && <Check className="w-4 h-4 text-blue-700" />}
              </button>
            </div>
          </div>

          {/* Admin Verification Card */}
          {!isAdmin ? (
            <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-300/40 text-amber-200 text-xs flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-100">{t.adminOnlyNotice}</p>
                <p className="text-amber-200/90 mt-1">
                  {language === 'ar'
                    ? 'أنت مسجل حالياً كمعلم اعتيادي. يمكنك الانتقال إلى حساب المشرف من خلال قائمة تبديل الحسابات لتعديل الإعدادات أو تصفير الأسبوع.'
                    : 'You are signed in as a faculty teacher. Switch to an Administrator profile using the switch profile menu to adjust reset days or reset ratings.'}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-5">
              
              {/* Weekly Reset Day Selector */}
              <div className="bg-[#0e2a52] p-5 rounded-xl border border-white/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-300" />
                  <label className="text-xs font-bold uppercase tracking-wider text-sky-200 font-serif">
                    {t.weeklyResetDay}
                  </label>
                </div>
                <p className="text-xs text-sky-200/80">{t.resetDayHelp}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {t.daysOfWeek.map((dayName, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setResetDay(idx)}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold transition cursor-pointer text-center ${
                        resetDay === idx
                          ? 'bg-white text-[#07162c] border-white shadow-md font-black'
                          : 'bg-[#07162c] hover:bg-[#143b72] text-white border-white/30'
                      }`}
                    >
                      {dayName}
                    </button>
                  ))}
                </div>
              </div>

              {/* School Name */}
              <div className="bg-[#0e2a52] p-5 rounded-xl border border-white/30 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-sky-200 font-serif">
                  {t.schoolName}
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-sky-300 block mb-1">English:</span>
                    <input
                      type="text"
                      value={schoolNameEn}
                      onChange={(e) => setSchoolNameEn(e.target.value)}
                      className="w-full rounded-lg bg-[#07162c] border border-white/30 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-sky-300 block mb-1">العربية:</span>
                    <input
                      type="text"
                      value={schoolNameAr}
                      onChange={(e) => setSchoolNameAr(e.target.value)}
                      dir="rtl"
                      className="w-full rounded-lg bg-[#07162c] border border-white/30 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-400 font-serif"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-lg bg-white hover:bg-sky-50 text-[#07162c] font-black text-xs shadow-md transition cursor-pointer disabled:opacity-50 font-serif"
                >
                  {isSaving ? t.submitting : t.saveSettings}
                </button>
              </div>

            </form>
          )}

          {/* Reset Current Week Section */}
          <div className="bg-rose-950/40 border border-rose-500/40 p-5 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-rose-300">
              <RotateCcw className="w-5 h-5 text-rose-400" />
              <h4 className="font-bold text-sm font-serif">{t.resetCurrentWeek}</h4>
            </div>
            <p className="text-xs text-rose-200/90 leading-relaxed">
              {t.resetWeekDesc}
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                disabled={!isAdmin}
                className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:bg-rose-950 disabled:text-rose-400/50 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t.resetCurrentWeek}</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div
              className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-blue-500/20 text-white border border-white/50'
                  : 'bg-rose-500/20 text-rose-200 border border-rose-400/50'
              }`}
            >
              {message.text}
            </div>
          )}

        </div>

        {/* 2-Step Confirmation Modal for Reset */}
        {showConfirmReset && (
          <div className="absolute inset-0 bg-[#07162c]/95 backdrop-blur-md p-6 flex flex-col justify-center items-center text-center animate-fade-in z-20">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-400/50 text-rose-300 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h4 className="text-lg font-black text-white mb-2 font-serif">{t.confirmResetTitle}</h4>
            <p className="text-xs text-sky-200 max-w-md mb-6 leading-relaxed">
              {t.confirmResetWarning}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              <button
                type="button"
                disabled={isResetting}
                onClick={handleExecuteReset}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
              >
                {isResetting ? t.submitting : t.proceedReset}
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setShowConfirmReset(false)}
                className="w-full py-3 rounded-xl bg-[#0e2a52] hover:bg-[#143b72] text-white font-bold text-xs border border-white/30 transition cursor-pointer"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
