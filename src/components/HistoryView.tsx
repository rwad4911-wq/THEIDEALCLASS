import React from 'react';
import { History, Trophy, Calendar, Users, Star, Clock } from 'lucide-react';
import { WeeklyHistory, CLASS_ARABIC_NAMES, Language, VALID_CLASSES } from '../types';
import { translations } from '../i18n';
import { AndalusStar } from './AndalusStar';
import { AlAndalusLogo } from './AlAndalusLogo';

interface HistoryViewProps {
  history: WeeklyHistory[];
  language: Language;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, language }) => {
  const t = translations[language];

  if (history.length === 0) {
    return (
      <div className="max-w-4xl mx-auto rounded-2xl andalus-card p-12 text-center text-white shadow-xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#0e2a52] border-2 border-white/60 flex items-center justify-center text-amber-300">
          <History className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2 font-serif">{t.historyTitle}</h3>
        <p className="text-sm text-sky-200 max-w-md mx-auto">
          {t.noHistoryYet}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="andalus-card rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Top frieze */}
        <div className="absolute top-0 left-0 right-0 andalus-frieze opacity-60" />

        <div className="pt-2 flex items-center justify-between gap-3 mb-2 pb-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#07162c] text-amber-300 border border-white/40 shadow-inner">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white font-serif tracking-wide">{t.historyTitle}</h2>
              <p className="text-xs sm:text-sm text-sky-200">{t.historySubtitle}</p>
            </div>
          </div>
          <div className="hidden sm:block">
            <AlAndalusLogo size={42} />
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {history.map((record) => {
            const isTie = record.winningClasses.length > 1;

            return (
              <div
                key={record.id}
                className="rounded-xl bg-[#07162c]/95 border border-white/30 p-5 sm:p-6 space-y-5 shadow-lg"
              >
                {/* Header row: Week label & Winner announcement */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-white font-serif">
                    <Calendar className="w-4 h-4 text-sky-300" />
                    <span>{record.weekId}</span>
                    <span className="text-sky-200 font-sans">({record.startDate} → {record.endDate})</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-sky-200">
                    <span>
                      {t.resetByLabel} <strong className="text-white font-serif">{record.resetBy}</strong>
                    </span>
                    {record.finalizedAt && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0e2a52] border border-white/30 text-white">
                        <Clock className="w-3 h-3 text-sky-300" />
                        <span>{new Date(record.finalizedAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>•</span>
                        <span>{new Date(record.finalizedAt).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Champion highlight */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-[#1e40af] via-[#17387d] to-[#0a1e3a] border-2 border-white/50 shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white text-[#07162c] flex items-center justify-center font-black shadow-md border-2 border-blue-400">
                      <Trophy className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 font-serif">
                        <AndalusStar size={13} variant="gold" />
                        <span>{isTie ? t.classesTiedWinner : t.classOfTheWeek}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {record.winningClasses.map(cid => (
                          <span
                            key={cid}
                            className="px-3 py-1 rounded-lg bg-[#07162c] border-2 border-white text-lg font-black text-amber-300 font-serif"
                          >
                            {language === 'ar' ? CLASS_ARABIC_NAMES[cid] : cid}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right rtl:text-right sm:rtl:text-left">
                    <div className="text-xs text-sky-200 font-medium">{t.winnerScoreLabel}</div>
                    <div className="text-2xl font-black text-white font-serif">
                      <span className="text-amber-300">{record.winningScore.toFixed(1)}</span> <span className="text-xs text-sky-200">/ 10</span>
                    </div>
                    <div className="text-[11px] text-sky-200 flex items-center gap-1 sm:justify-end rtl:sm:justify-start">
                      <Users className="w-3 h-3 text-sky-300" />
                      <span>{record.totalRatings} {language === 'ar' ? 'تقييم كلي' : 'total ratings'}</span>
                    </div>
                  </div>
                </div>

                {/* All 5 classes performance in that week */}
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider mb-2 font-serif">
                    {t.classesBreakdown}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {VALID_CLASSES.map(cid => {
                      const summary = record.classesSummary?.[cid];
                      const isWinner = record.winningClasses.includes(cid);

                      return (
                        <div
                          key={cid}
                          className={`p-3 rounded-lg border text-center ${
                            isWinner
                              ? 'bg-[#1e40af] border-2 border-white text-white font-bold shadow-md'
                              : 'bg-[#07162c] border-white/20 text-sky-100'
                          }`}
                        >
                          <div className="text-sm font-black flex items-center justify-center gap-1 font-serif text-white">
                            <span>{language === 'ar' ? CLASS_ARABIC_NAMES[cid] : cid}</span>
                            {isWinner && <Star className="w-3 h-3 text-amber-300 fill-amber-300" />}
                          </div>
                          <div className="text-xs font-semibold text-amber-300 mt-1 font-serif">
                            {summary?.averageScore !== null && summary?.averageScore !== undefined
                              ? `${summary.averageScore.toFixed(1)}/10`
                              : t.notRatedYet}
                          </div>
                          <div className="text-[10px] text-sky-200">
                            {summary?.ratingsCount || 0} {language === 'ar' ? 'تقييم' : 'ratings'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
