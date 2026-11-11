import React, { useState } from 'react';
import { Trophy, Users, ChevronDown, ChevronUp, Info, Edit3, Check, Calendar, Clock } from 'lucide-react';
import { ClassSummary, CLASS_ARABIC_NAMES, CLASS_DESCRIPTIONS, ClassId, Language, Teacher, Rating } from '../types';
import { translations } from '../i18n';
import { ClassOfTheWeekBanner } from './ClassOfTheWeekBanner';
import { AndalusStar } from './AndalusStar';
import { formatDateTime } from '../utils/date';

interface LeaderboardViewProps {
  summaries: ClassSummary[];
  language: Language;
  currentTeacher: Teacher | null;
  onRateClass: (classId: ClassId) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  summaries,
  language,
  currentTeacher,
  onRateClass
}) => {
  const t = translations[language];
  const [expandedClass, setExpandedClass] = useState<ClassId | null>(null);

  // Sort summaries for display:
  // Ranked classes first (by rank ascending), then unrated classes in standard order
  const sortedSummaries = [...summaries].sort((a, b) => {
    if (a.averageScore === null && b.averageScore === null) return 0;
    if (a.averageScore === null) return 1;
    if (b.averageScore === null) return -1;
    return a.rank - b.rank;
  });

  const getRankBadge = (rank: number, isWinner: boolean, averageScore: number | null) => {
    if (averageScore === null) {
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#07162c] text-sky-300 border border-white/30 font-serif">
          {language === 'ar' ? 'غير مصنّف' : 'Unranked'}
        </span>
      );
    }
    if (isWinner) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-white text-[#07162c] shadow-md border-2 border-amber-300">
          <AndalusStar size={14} variant="gold" />
          <span>{rank === 1 ? t.firstPlace : `#${rank}`}</span>
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#0e2a52] text-white border border-white/60 shadow-sm">
          <span>🥈</span>
          <span>{t.secondPlace}</span>
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#0e2a52] text-amber-300 border border-amber-400/50">
          <span>🥉</span>
          <span>{t.thirdPlace}</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#07162c] text-sky-200 border border-white/30 font-serif">
        #{rank}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Class of the Week Champion Banner */}
      <ClassOfTheWeekBanner
        summaries={summaries}
        language={language}
        onRateClass={onRateClass}
      />

      {/* Educational Notice with Blue & White Cartouche Styling */}
      <div className="p-4 sm:p-5 rounded-2xl andalus-card text-xs sm:text-sm text-sky-100 flex items-start gap-3 shadow-md relative overflow-hidden">
        <div className="w-1.5 bg-white self-stretch rounded-full shrink-0" />
        <div className="space-y-1">
          <p className="font-bold text-white flex items-center gap-2 tracking-wide font-serif">
            <AndalusStar size={14} variant="gold" />
            <span>{language === 'ar' ? 'معايير ديوان التقييم والاحتساب لمدارس الأندلس' : 'Official Class Scoring Rules'}</span>
          </p>
          <p className="text-sky-100/90 leading-relaxed font-normal">
            {t.promptExampleNotice}
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] text-sky-200 font-medium">
            <span className="px-2.5 py-0.5 rounded bg-[#07162c] border border-white/30 font-serif">
              {t.classesBadge}
            </span>
            <span>•</span>
            <span>{language === 'ar' ? 'الفصول غير المقيمة لا تُحتسب كصفر' : 'Unsubmitted ratings are not counted as zero'}</span>
          </div>
        </div>
      </div>

      {/* The 5 Classes Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-white/20">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5 font-serif tracking-wide">
            <AndalusStar size={18} variant="gold" />
            <span>{t.leaderboard}</span>
            <span className="text-xs font-normal text-sky-300">
              ({summaries.length} {language === 'ar' ? 'فصول معتمدة' : 'Official Classes'})
            </span>
          </h2>
        </div>

        <div className="grid gap-4">
          {sortedSummaries.map((summary) => {
            const classInfo = CLASS_DESCRIPTIONS[summary.classId];
            const isExpanded = expandedClass === summary.classId;
            const myRating = currentTeacher
              ? summary.ratings.find(r => r.teacherId === currentTeacher.id)
              : null;

            // Find most recent rating's timestamp for this class
            const latestRating: Rating | null = summary.ratings.length > 0
              ? summary.ratings.reduce((prev, curr) => {
                  const prevTime = new Date(prev.updatedAt || prev.createdAt).getTime();
                  const currTime = new Date(curr.updatedAt || curr.createdAt).getTime();
                  return currTime > prevTime ? curr : prev;
                }, summary.ratings[0])
              : null;

            const latestTimestamp = latestRating
              ? formatDateTime(latestRating.updatedAt || latestRating.createdAt, language)
              : null;

            return (
              <div
                key={summary.classId}
                className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
                  summary.isWinner
                    ? 'andalus-card-champion ring-2 ring-white/60'
                    : 'andalus-card hover:border-white/60'
                }`}
              >
                {/* Main Card Row */}
                <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Class Identity & Grade with Ceramic Inlay */}
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${classInfo.color} border-2 border-white/80 flex items-center justify-center text-white font-black text-2xl shadow-lg shrink-0 font-serif`}>
                      {language === 'ar' ? CLASS_ARABIC_NAMES[summary.classId] : summary.classId}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xl sm:text-2xl font-black text-white tracking-tight font-serif">
                          {language === 'ar' ? CLASS_ARABIC_NAMES[summary.classId] : summary.classId}
                        </span>
                        {getRankBadge(summary.rank, summary.isWinner, summary.averageScore)}
                        {myRating && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#07162c] text-sky-200 border border-white/40">
                            <Check className="w-3 h-3 text-[#38bdf8]" />
                            <span>{language === 'ar' ? `تقييمك: ${myRating.score}/10` : `You rated: ${myRating.score}/10`}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-sky-100/90 font-medium">
                        {language === 'ar' ? classInfo.gradeAr : classInfo.gradeEn}
                      </p>

                      {/* Display Latest Rating Timestamp on the card */}
                      {latestTimestamp && (
                        <div className="flex items-center gap-2 text-[11px] text-sky-200/90 mt-1.5 font-medium">
                          <span className="text-white font-semibold">{t.latestSubmission}</span>
                          <span className="inline-flex items-center gap-1.5 bg-[#07162c] px-2.5 py-0.5 rounded-md border border-white/25 text-sky-100">
                            <Calendar className="w-3 h-3 text-amber-300" />
                            <span>{latestTimestamp.date}</span>
                            <span className="text-white/40">•</span>
                            <Clock className="w-3 h-3 text-sky-300" />
                            <span>{latestTimestamp.time}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Class Score Display */}
                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-white/20">
                    <div className="text-left md:text-right rtl:text-right md:rtl:text-left">
                      {summary.averageScore !== null ? (
                        <div>
                          <div className="text-xs font-medium text-sky-200 tracking-wide">
                            {language === 'ar' ? 'متوسط الدرجات' : 'Average Score'}
                          </div>
                          <div className="text-2xl sm:text-3xl font-black text-white flex items-baseline md:justify-end rtl:md:justify-start gap-1 font-serif">
                            <span className="text-amber-300">{summary.averageScore.toFixed(1)}</span>
                            <span className="text-xs font-semibold text-sky-200">/ 10</span>
                          </div>
                          <div className="text-[11px] text-sky-200 flex items-center gap-1 md:justify-end rtl:md:justify-start">
                            <Users className="w-3 h-3 text-amber-300" />
                            <span>{t.ratingsCount(summary.ratingsCount)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-1">
                          <span className="inline-block px-3 py-1 rounded-lg bg-[#07162c] border border-white/30 text-sky-200 text-xs font-medium font-serif">
                            {t.notRatedYet}
                          </span>
                          <div className="text-[11px] text-sky-300/80 mt-1">
                            {language === 'ar' ? 'لم تُسجل تقييمات بعد' : '0 evaluations yet'}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions: Rate Class & Toggle Breakdown */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onRateClass(summary.classId)}
                        className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition shadow-md cursor-pointer ${
                          myRating
                            ? 'bg-[#0e2a52] hover:bg-[#143b72] text-white border border-white/40'
                            : 'bg-white hover:bg-slate-100 text-[#07162c] font-black'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{myRating ? t.updateRating : t.rateClass}</span>
                      </button>

                      {summary.ratingsCount > 0 && (
                        <button
                          onClick={() => setExpandedClass(isExpanded ? null : summary.classId)}
                          className="p-2 rounded-lg bg-[#07162c] hover:bg-[#0e2a52] border border-white/30 text-white transition cursor-pointer"
                          title={isExpanded ? t.hideTeacherRatings : t.viewTeacherRatings}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                </div>

                {/* Andalusian Blue & White Progress Bar (0 to 10) */}
                {summary.averageScore !== null && (
                  <div className="px-5 sm:px-6 pb-2.5">
                    <div className="w-full bg-[#07162c] rounded-full h-2 overflow-hidden border border-white/20">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-600 via-sky-300 to-white"
                        style={{ width: `${(summary.averageScore / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Expanded Breakdown of Submitting Teachers */}
                {isExpanded && summary.ratingsCount > 0 && (
                  <div className="bg-[#07162c]/95 border-t border-white/20 p-5 sm:p-6 space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-white flex items-center justify-between font-serif">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-sky-300" />
                        <span>{t.viewTeacherRatings}</span>
                      </span>
                      <span className="text-[11px] font-normal text-sky-200">
                        {summary.ratings.length} {language === 'ar' ? 'معلمين قاموا بالتقييم مع الطابع الزمني' : 'teachers rated with timestamps'}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {summary.ratings.map((rating) => {
                        const isCurrentTeacherRating = currentTeacher?.id === rating.teacherId;
                        const ratingTimeInfo = formatDateTime(rating.updatedAt || rating.createdAt, language);
                        const wasUpdated = Boolean(rating.updatedAt && rating.updatedAt !== rating.createdAt);

                        return (
                          <div
                            key={rating.id}
                            className={`p-4 rounded-xl border text-xs flex flex-col justify-between gap-3 ${
                              isCurrentTeacherRating
                                ? 'bg-[#0e2a52] border-white text-white shadow-md ring-1 ring-white/50'
                                : 'bg-[#071a33] border-white/20 text-sky-100'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-bold text-white text-sm flex items-center gap-1.5 font-serif">
                                  <span>{language === 'ar' ? (rating.teacherNameAr || rating.teacherName) : rating.teacherName}</span>
                                  {isCurrentTeacherRating && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-[#07162c] font-bold">
                                      {language === 'ar' ? 'أنت' : 'You'}
                                    </span>
                                  )}
                                </span>
                                <span className="font-black text-amber-300 text-sm px-2.5 py-1 rounded-lg bg-[#07162c] border border-white/40 shadow-inner">
                                  {rating.score} / 10
                                </span>
                              </div>

                              {rating.teacherSubject && (
                                <div className="text-[11px] text-sky-200 mb-1 font-medium">
                                  {rating.teacherSubject}
                                </div>
                              )}

                              {rating.comment && (
                                <div className="italic text-white text-xs mt-2 p-2.5 rounded-lg bg-[#07162c]/80 border border-white/20 leading-relaxed">
                                  "{rating.comment}"
                                </div>
                              )}
                            </div>

                            {/* Blue & White Date and Time Badge */}
                            <div className="pt-2 border-t border-white/20 flex flex-col gap-1 text-[11px] bg-[#07162c] p-2.5 rounded-lg border border-white/15">
                              <div className="flex items-center justify-between text-sky-200 font-medium">
                                <span>{wasUpdated ? t.updatedOn : t.submittedOn}</span>
                                {wasUpdated && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-200 border border-sky-400/30">
                                    {language === 'ar' ? 'محدّث' : 'Revised'}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between text-white font-bold pt-0.5">
                                <div className="flex items-center gap-1.5 text-amber-300">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>{ratingTimeInfo.date}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sky-200">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{ratingTimeInfo.time}</span>
                                </div>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
