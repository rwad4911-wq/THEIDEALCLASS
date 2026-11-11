import React from 'react';
import { Trophy, Sparkles, Users } from 'lucide-react';
import { ClassSummary, CLASS_ARABIC_NAMES, CLASS_DESCRIPTIONS, Language, ClassId } from '../types';
import { translations } from '../i18n';
import { fireCelebrationConfetti } from '../utils/confetti';
import { AndalusStar } from './AndalusStar';
import { AlAndalusLogo } from './AlAndalusLogo';

interface ClassOfTheWeekBannerProps {
  summaries: ClassSummary[];
  language: Language;
  onRateClass: (classId: ClassId) => void;
}

export const ClassOfTheWeekBanner: React.FC<ClassOfTheWeekBannerProps> = ({
  summaries,
  language,
}) => {
  const t = translations[language];

  // Winners are all classes with isWinner === true
  const winners = summaries.filter(s => s.isWinner && s.averageScore !== null);
  const isTie = winners.length > 1;

  if (winners.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl andalus-card p-6 sm:p-8 text-center text-white">
        <div className="andalus-frieze mb-4 opacity-50" />
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-[#0e2a52] border-2 border-white/50 flex items-center justify-center text-amber-300 shadow-inner">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-wide font-serif">
            {t.classOfTheWeek}
          </h2>
          <p className="text-sm text-sky-200/90 font-medium leading-relaxed">
            {language === 'ar'
              ? 'لم يتم تسجيل تقييمات هذا الأسبوع حتى الآن في مدارس الأندلس. ابدأ بتقييم الفصول لتتويج فصل الأسبوع في ديوان الشرف!'
              : 'No ratings submitted yet this week. Submit evaluations to crown the Class of the Week!'}
          </p>
        </div>
      </div>
    );
  }

  const winningScore = winners[0].averageScore as number;

  return (
    <div className="relative overflow-hidden rounded-2xl andalus-card-champion p-6 sm:p-8 text-white shadow-2xl">
      {/* Top decorative Blue & White accent line */}
      <div className="absolute top-0 left-0 right-0 andalus-frieze opacity-70" />

      <div className="relative z-10 pt-2 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Moorish Royal Insignia & Title */}
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left rtl:sm:text-right">
          <div className="relative flex items-center gap-2">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1e40af] via-[#1d4ed8] to-[#0f2b5c] border-2 border-white shadow-2xl flex items-center justify-center text-white font-black">
                <Trophy className="w-10 h-10 text-amber-300 drop-shadow" />
              </div>
              <button
                onClick={() => fireCelebrationConfetti()}
                title="Celebrate with Confetti!"
                className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-[#07162c] border-2 border-white text-amber-300 hover:scale-110 active:scale-95 transition shadow cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
            {/* Al-Andalus Official Seal */}
            <div className="hidden sm:block">
              <AlAndalusLogo size={58} />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#07162c]/90 border border-white/40 text-amber-200 text-xs font-bold uppercase tracking-wider mb-2">
              <AndalusStar size={14} variant="gold" />
              <span>{isTie ? t.classesTiedWinner : t.classOfTheWeek}</span>
              <AndalusStar size={14} variant="gold" />
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              {winners.map(winner => (
                <div
                  key={winner.classId}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#091f3d] border-2 border-white/60 shadow-inner"
                >
                  <span className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight font-serif">
                    {language === 'ar' ? CLASS_ARABIC_NAMES[winner.classId] : winner.classId}
                  </span>
                  <span className="text-xs text-sky-100 font-medium hidden sm:inline">
                    {language === 'ar' ? CLASS_DESCRIPTIONS[winner.classId].gradeAr : CLASS_DESCRIPTIONS[winner.classId].gradeEn}
                  </span>
                </div>
              ))}
            </div>

            {isTie && (
              <p className="text-xs text-amber-200 font-medium mt-2">
                {language === 'ar'
                  ? 'تعادلت هذه الفصول في أعلى معدل تقييم لهذا الأسبوع وتتشارك وسام فصل الأسبوع بالتساوي!'
                  : 'These classes tied with the exact same highest average and share the Class of the Week title!'}
              </p>
            )}
          </div>
        </div>

        {/* Right: Blue & White Score Inlay */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#07162c]/95 rounded-xl p-4 sm:p-5 border-2 border-white/40 shadow-2xl">
          <div className="text-center sm:text-right rtl:text-right sm:rtl:text-left px-3">
            <div className="text-xs font-semibold text-sky-200 uppercase tracking-wider">
              {t.scoreValue}
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-baseline justify-center sm:justify-end gap-1 font-serif">
              <span className="text-amber-300">{winningScore.toFixed(1)}</span>
              <span className="text-sm font-semibold text-sky-300">/ 10</span>
            </div>
          </div>

          <div className="h-10 w-px bg-white/30 hidden sm:block" />

          <div className="flex flex-col items-center sm:items-start text-xs text-sky-100">
            <div className="flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-amber-300" />
              <span>{t.ratingsCount(winners.reduce((sum, w) => sum + w.ratingsCount, 0))}</span>
            </div>
            <button
              onClick={() => fireCelebrationConfetti()}
              className="mt-2 text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'احتفال بالتتويج 🎉' : 'Celebrate Honor 🎉'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom decorative Blue & White Frieze border */}
      <div className="absolute bottom-0 left-0 right-0 andalus-frieze opacity-50 rotate-180" />
    </div>
  );
};
