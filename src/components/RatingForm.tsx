import React, { useState, useEffect } from 'react';
import { Award, Check, AlertCircle, Info, Send, RefreshCw, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { VALID_CLASSES, ClassId, CLASS_ARABIC_NAMES, CLASS_DESCRIPTIONS, Language, Teacher, Rating } from '../types';
import { translations } from '../i18n';
import { fireCelebrationConfetti } from '../utils/confetti';
import { formatDateTime } from '../utils/date';
import { AndalusStar } from './AndalusStar';
import { AlAndalusLogo } from './AlAndalusLogo';

interface RatingFormProps {
  currentTeacher: Teacher | null;
  language: Language;
  selectedClassId: ClassId;
  onSelectClassId: (classId: ClassId) => void;
  currentWeekRatings: Rating[];
  onRatingSubmitted: (rating: Rating, isUpdate: boolean) => void;
  onOpenTeacherSwitch: () => void;
}

export const RatingForm: React.FC<RatingFormProps> = ({
  currentTeacher,
  language,
  selectedClassId,
  onSelectClassId,
  currentWeekRatings,
  onRatingSubmitted,
  onOpenTeacherSwitch,
}) => {
  const t = translations[language];

  // Find if current teacher already rated this selected class this week
  const existingTeacherRating = currentTeacher
    ? currentWeekRatings.find(
        r => r.classId === selectedClassId && r.teacherId === currentTeacher.id
      )
    : null;

  const [score, setScore] = useState<number>(existingTeacherRating ? existingTeacherRating.score : 8);
  const [comment, setComment] = useState<string>(existingTeacherRating?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedReceipt, setLastSubmittedReceipt] = useState<{
    rating: Rating;
    isUpdate: boolean;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state whenever selectedClassId or existingTeacherRating changes
  useEffect(() => {
    if (existingTeacherRating) {
      setScore(existingTeacherRating.score);
      setComment(existingTeacherRating.comment || '');
    } else {
      setScore(8); // Standard default
      setComment('');
    }
    setErrorMessage(null);
  }, [selectedClassId, existingTeacherRating?.id, currentTeacher?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentTeacher) {
      setErrorMessage(language === 'ar' ? 'يرجى تسجيل الدخول أو اختيار هوية المعلم أولاً' : 'Please select a teacher profile first');
      onOpenTeacherSwitch();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-teacher-id': currentTeacher.id
        },
        body: JSON.stringify({
          classId: selectedClassId,
          score,
          comment: comment.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit rating');
      }

      const isUpdate = Boolean(existingTeacherRating);
      const savedRating: Rating = data.rating;
      
      onRatingSubmitted(savedRating, isUpdate);
      setLastSubmittedReceipt({
        rating: savedRating,
        isUpdate
      });

      // Trigger celebratory burst for great score (>= 9)
      if (score >= 9) {
        fireCelebrationConfetti();
      }

    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (val: number) => {
    if (val >= 9) return 'text-amber-300';
    if (val >= 7) return 'text-white';
    if (val >= 5) return 'text-sky-300';
    return 'text-rose-400';
  };

  const activeTimestamp = existingTeacherRating
    ? formatDateTime(existingTeacherRating.updatedAt || existingTeacherRating.createdAt, language)
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Page Title & Context in Blue & White Andalusian Card */}
      <div className="andalus-card rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Top frieze */}
        <div className="absolute top-0 left-0 right-0 andalus-frieze opacity-60" />

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/20">
          <div>
            <div className="flex items-center gap-3">
              <AlAndalusLogo size={42} />
              <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 font-serif tracking-wide">
                <Award className="w-8 h-8 text-white" />
                <span>{t.rateClass}</span>
              </h2>
            </div>
            <p className="text-sm text-sky-200 mt-1 font-medium">
              {language === 'ar'
                ? 'تقييم أداء فصول مدارس الأندلس من 0 إلى 10 بنزاهة وشفافية لتعزيز التنافس الأكاديمي'
                : 'Evaluate any of the 5 designated classes from 0 to 10 to crown the Class of the Week'}
            </p>
          </div>

          {/* Teacher Badge */}
          {currentTeacher && (
            <div className="flex items-center gap-3 bg-[#07162c] px-4 py-2.5 rounded-xl border border-white/40 self-start sm:self-auto shadow-inner">
              <img
                src={currentTeacher.avatar}
                alt={currentTeacher.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/80"
              />
              <div className="text-xs">
                <div className="text-sky-300 font-medium">{t.activeTeacher}:</div>
                <div className="font-bold text-white font-serif">
                  {language === 'ar' ? currentTeacher.nameAr || currentTeacher.name : currentTeacher.name}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 1. Class Selection Cards (Exactly 5 Classes: 7/A, 6/A, 5/A, 4/A, 3/A) */}
        <div className="pt-6">
          <label className="block text-sm font-bold text-white mb-3 font-serif flex items-center gap-2">
            <AndalusStar size={14} variant="gold" />
            <span>{t.selectClassPrompt}</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {VALID_CLASSES.map((classId) => {
              const isSelected = selectedClassId === classId;
              const hasRated = currentTeacher
                ? currentWeekRatings.find(
                    r => r.classId === classId && r.teacherId === currentTeacher.id
                  )
                : null;
              const desc = CLASS_DESCRIPTIONS[classId];

              return (
                <button
                  type="button"
                  key={classId}
                  onClick={() => {
                    onSelectClassId(classId);
                    setLastSubmittedReceipt(null);
                  }}
                  className={`relative p-4 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#1e40af] to-[#0f2b5c] text-white border-white ring-2 ring-white/60 shadow-2xl scale-102'
                      : 'bg-[#07162c]/90 hover:bg-[#0c264a] text-white border-white/30 hover:border-white/60'
                  }`}
                >
                  {/* Rated indicator pill */}
                  {hasRated && (
                    <span className="absolute -top-2.5 right-2 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-[#07162c] border border-blue-600 shadow-md flex items-center gap-1 font-serif">
                      <Check className="w-2.5 h-2.5 text-blue-600" />
                      <span>{hasRated.score}/10</span>
                    </span>
                  )}

                  <div className="text-2xl font-black tracking-tight font-serif text-white">
                    {language === 'ar' ? CLASS_ARABIC_NAMES[classId] : classId}
                  </div>
                  <div className="text-[11px] font-medium text-sky-200 mt-1 truncate">
                    {language === 'ar' ? desc.gradeAr : desc.gradeEn}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PROMINENT SUBMISSION RECEIPT WITH TIME AND DATE */}
        {lastSubmittedReceipt && (
          <div className="mt-6 p-5 rounded-xl bg-[#0d2a52] border-2 border-white text-white shadow-2xl animate-fade-in space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-6 h-6 text-sky-300 shrink-0" />
                <div>
                  <h4 className="text-base font-bold text-white font-serif">
                    {lastSubmittedReceipt.isUpdate ? t.ratingUpdated : t.ratingSuccess}
                  </h4>
                  <p className="text-xs text-sky-200">
                    {language === 'ar'
                      ? `تم توثيق التقييم في ديوان الفصل ${CLASS_ARABIC_NAMES[lastSubmittedReceipt.rating.classId]}`
                      : `Successfully recorded rating for Class ${lastSubmittedReceipt.rating.classId}`}
                  </p>
                </div>
              </div>

              <div className="text-2xl font-black text-amber-300 px-3.5 py-1 bg-[#07162c] rounded-lg border border-white/50 font-serif">
                {lastSubmittedReceipt.rating.score} / 10
              </div>
            </div>

            {/* Official Date & Time Badge */}
            <div className="pt-2 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs bg-[#07162c]/90 p-3 rounded-lg border border-white/30">
              <div className="flex items-center gap-2 text-white font-bold font-serif">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
                <span>{t.timeSentLabel}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-white font-semibold">
                <div className="flex items-center gap-1.5 bg-[#0e2a52] px-3 py-1 rounded-md border border-white/30">
                  <Calendar className="w-3.5 h-3.5 text-amber-300" />
                  <span>{formatDateTime(lastSubmittedReceipt.rating.updatedAt || lastSubmittedReceipt.rating.createdAt, language).date}</span>
                </div>

                <div className="flex items-center gap-1.5 bg-[#0e2a52] px-3 py-1 rounded-md border border-white/30">
                  <Clock className="w-3.5 h-3.5 text-sky-300" />
                  <span>{formatDateTime(lastSubmittedReceipt.rating.updatedAt || lastSubmittedReceipt.rating.createdAt, language).time}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notice if teacher already rated this class previously, showing recorded time & date */}
        {existingTeacherRating && !lastSubmittedReceipt && activeTimestamp && (
          <div className="mt-5 p-5 rounded-xl bg-[#091f3d] border border-white/40 text-sky-100 text-xs sm:text-sm space-y-3">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">
                  {t.alreadyRatedNotice}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sky-200">{t.yourCurrentRating}</span>
                  <strong className="text-white font-black text-sm px-2.5 py-0.5 rounded-md bg-[#07162c] border border-white/40 font-serif">
                    {existingTeacherRating.score} / 10
                  </strong>
                </div>
              </div>
            </div>

            {/* Display exact time and date when this existing rating was sent / updated */}
            <div className="pt-2 border-t border-white/20 flex flex-wrap items-center justify-between gap-2 text-xs bg-[#07162c] p-3 rounded-lg border border-white/25">
              <span className="text-sky-200 font-medium">
                {existingTeacherRating.updatedAt !== existingTeacherRating.createdAt ? t.updatedOn : t.submittedOn}
              </span>
              <div className="flex flex-wrap items-center gap-3 text-white font-bold">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{activeTimestamp.date}</span>
                </div>
                <span className="text-white/40">•</span>
                <div className="flex items-center gap-1.5 text-sky-200">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{activeTimestamp.time}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rating Submission Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          
          {/* Dual Rating Selector: Slider + Direct Number Buttons */}
          <div className="bg-[#07162c]/95 rounded-xl p-6 border border-white/30 space-y-6 shadow-inner">
            
            {/* Display Score Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-white font-serif">
                  {t.scoreValue} (0 - 10)
                </span>
                <p className="text-xs text-sky-200">
                  {t.sliderHelp}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-4xl sm:text-5xl font-black tracking-tight flex items-baseline gap-1.5 font-serif text-white">
                  <span className={getScoreColor(score)}>{score}</span>
                  <span className="text-base font-semibold text-sky-200">/ 10</span>
                </div>
              </div>
            </div>

            {/* Slider */}
            <div className="py-2">
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={score}
                onChange={(e) => {
                  setScore(Number(e.target.value));
                  setLastSubmittedReceipt(null);
                }}
                className="w-full"
              />
              <div className="flex justify-between text-[11px] font-bold text-sky-200 px-1 mt-2 font-serif">
                <span>0</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
                <span>8</span>
                <span>9</span>
                <span>10</span>
              </div>
            </div>

            {/* Number Selector Chips (0 to 10) */}
            <div>
              <div className="text-xs font-semibold text-white mb-2 font-serif">
                {t.quickScoreSelector}
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5 sm:gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => {
                      setScore(num);
                      setLastSubmittedReceipt(null);
                    }}
                    className={`py-2 rounded-lg text-sm font-black transition cursor-pointer font-serif ${
                      score === num
                        ? 'bg-white text-[#07162c] border-2 border-blue-400 shadow-xl scale-105'
                        : 'bg-[#0e2a52] hover:bg-[#143b72] text-white border border-white/30'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Rubric descriptor preview */}
            <div className="p-3 rounded-lg bg-[#0e2a52] border border-white/20 text-xs text-white flex items-center gap-2">
              <AndalusStar size={16} variant="gold" />
              <span className="font-semibold text-white">
                {t.scoreDescriptions[score] || `${score}/10`}
              </span>
            </div>

          </div>

          {/* Optional Teacher Notes / Feedback */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white mb-2 font-serif">
              {t.optionalComment}
            </label>
            <textarea
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setLastSubmittedReceipt(null);
              }}
              rows={3}
              placeholder={t.commentPlaceholder}
              className="w-full rounded-xl bg-[#07162c] border border-white/40 p-4 text-sm text-white placeholder-sky-300/60 focus:outline-none focus:ring-2 focus:ring-white transition"
              maxLength={500}
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-400 text-rose-100 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit / Update Button in Crisp White */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-sky-200">
              {language === 'ar'
                ? 'عند إرسال التقييم، يتم تسجيل وحفظ التاريخ والوقت بدقة وتحديث لوحة الصدارة فورياً.'
                : 'When submitted, the exact date and time will be recorded and timestamped on the leaderboard.'}
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-9 py-3.5 rounded-xl font-black text-sm tracking-wide shadow-2xl flex items-center justify-center gap-2 transition cursor-pointer font-serif bg-white hover:bg-slate-100 text-[#07162c] border-2 border-white disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-700" />
                  <span>{t.submitting}</span>
                </>
              ) : existingTeacherRating ? (
                <>
                  <RefreshCw className="w-4 h-4 text-blue-700" />
                  <span>{t.updateRating}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-blue-700" />
                  <span>{t.submitRating}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
