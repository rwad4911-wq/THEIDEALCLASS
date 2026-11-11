import React from 'react';
import { Trophy, RefreshCw, Globe, Settings, History, Award } from 'lucide-react';
import { Teacher, Language } from '../types';
import { translations } from '../i18n';
import { AlAndalusLogo } from './AlAndalusLogo';

interface HeaderProps {
  currentTeacher: Teacher | null;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenTeacherSwitch: () => void;
  onOpenSettings: () => void;
  activeTab: 'leaderboard' | 'rate' | 'history';
  onTabChange: (tab: 'leaderboard' | 'rate' | 'history') => void;
  isLiveSync: boolean;
  schoolName: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTeacher,
  language,
  onLanguageChange,
  onOpenTeacherSwitch,
  onOpenSettings,
  activeTab,
  onTabChange,
  isLiveSync,
  schoolName
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 bg-[#07162c]/95 backdrop-blur-md border-b border-white/20 text-white shadow-xl">
      {/* Blue & White top decorative trim line */}
      <div className="h-1 bg-gradient-to-r from-blue-700 via-white to-blue-700" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Official Al-Andalus Logo & School Title */}
          <div className="flex items-center gap-3.5">
            <AlAndalusLogo size={52} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2 font-serif">
                  <span className="text-white drop-shadow-sm">{t.appTitle}</span>
                  <span className="hidden sm:inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#0e2a52] text-sky-200 border border-white/30">
                    {language === 'ar' ? '٥ فصول معتمدة' : '5 Classes'}
                  </span>
                </h1>
              </div>
              <p className="text-xs text-sky-300 font-medium tracking-wide">
                {schoolName} • {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Right Navigation & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Live Sync Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a2140] border border-white/20 text-xs text-sky-200" title={t.liveSync}>
              <span className={`w-2 h-2 rounded-full ${isLiveSync ? 'bg-[#38bdf8] animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-medium">{isLiveSync ? t.liveSync : t.offline}</span>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => onLanguageChange(language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0a2140] hover:bg-[#123462] border border-white/25 text-xs font-semibold text-white transition shadow-sm cursor-pointer"
              title="Toggle English / العربية"
            >
              <Globe className="w-3.5 h-3.5 text-sky-300" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* Teacher Profile / Identity Switch */}
            <button
              onClick={onOpenTeacherSwitch}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#0e2a52] hover:bg-[#143b72] border border-white/30 transition shadow-md cursor-pointer group"
              title={t.switchTeacher}
            >
              <div className="relative">
                <img
                  src={currentTeacher?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={currentTeacher?.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-white/70"
                />
                {currentTeacher?.role === 'admin' && (
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center text-[8px] text-[#07162c] font-bold" title={t.administratorPrivileges}>
                    ★
                  </span>
                )}
              </div>
              <div className="text-left hidden sm:block rtl:text-right">
                <div className="text-xs font-bold text-white flex items-center gap-1.5 font-serif">
                  <span>{language === 'ar' ? (currentTeacher?.nameAr || currentTeacher?.name) : currentTeacher?.name}</span>
                  {currentTeacher?.role === 'admin' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-400/25 text-amber-200 border border-amber-300/50">
                      {t.adminBadge}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-sky-300 truncate max-w-[140px]">
                  {language === 'ar' ? (currentTeacher?.subjectAr || currentTeacher?.subject) : currentTeacher?.subject}
                </div>
              </div>
              <RefreshCw className="w-3.5 h-3.5 text-sky-300 group-hover:rotate-180 transition-transform duration-300 ml-1 rtl:mr-1 rtl:ml-0" />
            </button>

            {/* Admin Settings Button */}
            <button
              onClick={onOpenSettings}
              className={`p-2 rounded-lg border transition cursor-pointer ${
                currentTeacher?.role === 'admin'
                  ? 'bg-amber-400/20 hover:bg-amber-400/30 border-amber-300/60 text-amber-200'
                  : 'bg-[#0a2140] hover:bg-[#123462] border-white/20 text-sky-200'
              }`}
              title={t.settings}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation in Crisp Blue and White */}
        <div className="flex items-center gap-1 sm:gap-2 pb-3 overflow-x-auto scrollbar-none pt-1">
          <button
            onClick={() => onTabChange('leaderboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer shrink-0 ${
              activeTab === 'leaderboard'
                ? 'bg-white text-[#07162c] font-black shadow-lg scale-102'
                : 'text-sky-200 hover:bg-[#0e2a52] hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>{t.leaderboard}</span>
          </button>

          <button
            onClick={() => onTabChange('rate')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer shrink-0 ${
              activeTab === 'rate'
                ? 'bg-white text-[#07162c] font-black shadow-lg scale-102'
                : 'text-sky-200 hover:bg-[#0e2a52] hover:text-white'
            }`}
          >
            <Award className="w-4 h-4 text-blue-600" />
            <span>{t.rateClass}</span>
          </button>

          <button
            onClick={() => onTabChange('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer shrink-0 ${
              activeTab === 'history'
                ? 'bg-white text-[#07162c] font-black shadow-lg scale-102'
                : 'text-sky-200 hover:bg-[#0e2a52] hover:text-white'
            }`}
          >
            <History className="w-4 h-4 text-sky-600" />
            <span>{t.history}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
