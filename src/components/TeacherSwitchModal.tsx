import React, { useState } from 'react';
import { X, Users, UserPlus, Check, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import { Teacher, Language } from '../types';
import { translations } from '../i18n';
import { AlAndalusLogo } from './AlAndalusLogo';

interface TeacherSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
  currentTeacher: Teacher | null;
  language: Language;
  onSelectTeacher: (teacherId: string) => void;
  onTeacherRegistered: (newTeacher: Teacher) => void;
  onTeacherDeleted?: (deletedTeacherId: string) => void;
  onAllTeachersCleared?: () => void;
}

export const TeacherSwitchModal: React.FC<TeacherSwitchModalProps> = ({
  isOpen,
  onClose,
  teachers,
  currentTeacher,
  language,
  onSelectTeacher,
  onTeacherRegistered,
  onTeacherDeleted,
  onAllTeachersCleared
}) => {
  const t = translations[language];
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [subjectAr, setSubjectAr] = useState('');
  const [role, setRole] = useState<'teacher' | 'admin'>('teacher');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim()) {
      setError(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          nameAr: nameAr.trim() || name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          subjectAr: subjectAr.trim() || subject.trim(),
          role
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      onTeacherRegistered(data.teacher);
      setName('');
      setNameAr('');
      setEmail('');
      setSubject('');
      setSubjectAr('');
      setIsRegistering(false);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error registering teacher');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeacher = async (e: React.MouseEvent, teacherId: string) => {
    e.stopPropagation();

    if (confirmDeleteId !== teacherId) {
      setConfirmDeleteId(teacherId);
      return;
    }

    setIsDeletingId(teacherId);
    setError(null);

    try {
      const res = await fetch(`/api/teachers/${teacherId}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete teacher');

      setConfirmDeleteId(null);
      if (onTeacherDeleted) {
        onTeacherDeleted(teacherId);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error deleting teacher');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm(t.clearAllTeachersConfirm)) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/teachers/clear-all', {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to clear teachers');

      if (onAllTeachersCleared) {
        onAllTeachersCleared();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error clearing teachers');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051020]/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#07162c] border-2 border-white/50 rounded-2xl shadow-2xl overflow-hidden text-white max-h-[90vh] flex flex-col">
        
        {/* Top accent line */}
        <div className="andalus-frieze opacity-60" />

        {/* Header */}
        <div className="p-6 border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlAndalusLogo size={42} showText={false} />
            <div>
              <h3 className="text-xl font-black text-white font-sans">
                {isRegistering ? t.newTeacher : t.selectIdentity}
              </h3>
              <p className="text-xs text-sky-200">
                {t.selectIdentityDesc}
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/50 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isRegistering ? (
            <>
              {teachers.length === 0 ? (
                <div className="p-8 text-center bg-[#0e2a52]/50 border border-dashed border-white/30 rounded-2xl space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#07162c] border border-white/30 flex items-center justify-center text-sky-300">
                    <Users className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">{t.noTeachersYet}</h4>
                    <p className="text-xs text-sky-200/80">
                      {language === 'ar'
                        ? 'تم حذف حسابات المعلمين. اضغط على الزر أدناه لتسجيل معلم جديد.'
                        : 'All teacher accounts have been deleted. Click below to register your first teacher.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRegistering(true)}
                    className="px-5 py-2.5 rounded-lg bg-white hover:bg-sky-50 text-[#07162c] font-black text-xs transition cursor-pointer shadow-md inline-flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{t.newTeacher}</span>
                  </button>
                </div>
              ) : (
                <div className="grid gap-2.5">
                  {teachers.map((teacher) => {
                    const isCurrent = currentTeacher?.id === teacher.id;
                    const isAdmin = teacher.role === 'admin';
                    const isConfirming = confirmDeleteId === teacher.id;
                    const isDeleting = isDeletingId === teacher.id;

                    return (
                      <div
                        key={teacher.id}
                        onClick={() => {
                          onSelectTeacher(teacher.id);
                          onClose();
                        }}
                        className={`w-full p-4 rounded-xl border text-left rtl:text-right flex items-center justify-between transition cursor-pointer select-none ${
                          isCurrent
                            ? 'bg-white text-[#07162c] border-white ring-2 ring-white shadow-xl'
                            : 'bg-[#0e2a52] hover:bg-[#143b72] text-white border-white/25'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="relative shrink-0">
                            <img
                              src={teacher.avatar}
                              alt={teacher.name}
                              className={`w-12 h-12 rounded-full object-cover ring-2 ${
                                isCurrent ? 'ring-[#0e2a52]' : 'ring-white/60'
                              }`}
                            />
                            {isAdmin && (
                              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-[9px] text-[#07162c] font-black shadow">
                                ★
                              </span>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-black text-sm font-sans ${isCurrent ? 'text-[#07162c]' : 'text-white'}`}>
                                {language === 'ar' ? (teacher.nameAr || teacher.name) : teacher.name}
                              </span>
                              {isAdmin && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                  isCurrent
                                    ? 'bg-[#07162c] text-white border-[#07162c]'
                                    : 'bg-white/15 text-sky-200 border-white/30'
                                }`}>
                                  {t.roleAdmin}
                                </span>
                              )}
                            </div>
                            <div className={`text-xs mt-0.5 flex items-center gap-1.5 font-medium ${
                              isCurrent ? 'text-blue-900 font-semibold' : 'text-sky-200'
                            }`}>
                              <BookOpen className="w-3 h-3" />
                              <span>{language === 'ar' ? (teacher.subjectAr || teacher.subject) : teacher.subject}</span>
                            </div>
                            <div className={`text-[11px] ${isCurrent ? 'text-blue-800' : 'text-sky-300/80'}`}>
                              {teacher.email}
                            </div>
                          </div>
                        </div>

                        {/* Actions: Active checkmark & Delete trash button */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isCurrent && (
                            <div className="w-7 h-7 rounded-full bg-[#07162c] text-white flex items-center justify-center font-bold shadow" title={t.activeTeacher}>
                              <Check className="w-4 h-4" />
                            </div>
                          )}

                          {/* Delete Teacher Button */}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteTeacher(e, teacher.id)}
                            disabled={isDeleting}
                            className={`p-2 rounded-lg transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
                              isConfirming
                                ? 'bg-rose-600 text-white hover:bg-rose-700 animate-pulse'
                                : isCurrent
                                ? 'text-rose-600 hover:bg-rose-100'
                                : 'text-rose-300 hover:text-white hover:bg-rose-600/30'
                            }`}
                            title={isConfirming ? (language === 'ar' ? 'اضغط مرة أخرى للتأكيد' : 'Click again to confirm delete') : t.deleteTeacher}
                          >
                            <Trash2 className="w-4 h-4" />
                            {isConfirming && (
                              <span className="text-[11px]">
                                {language === 'ar' ? 'تأكيد الحذف' : 'Confirm'}
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Actions: Register Teacher & Clear All */}
              <div className="pt-3 border-t border-white/20 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="flex-1 py-3 rounded-xl bg-[#0e2a52] hover:bg-[#143b72] border border-dashed border-white/40 text-sky-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer font-sans"
                >
                  <UserPlus className="w-4 h-4 text-sky-300" />
                  <span>{t.newTeacher}</span>
                </button>

                {teachers.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    disabled={isLoading}
                    className="py-3 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    title={t.clearAllTeachers}
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>{t.clearAllTeachers}</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-sky-200 mb-1 font-sans">
                  {t.fullName} (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Prof. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg bg-[#0e2a52] border border-white/30 px-3.5 py-2.5 text-xs text-white placeholder-sky-300/50 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-sky-200 mb-1 font-sans">
                  {t.fullName} (العربية)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثال: أ. سارة أحمد"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full rounded-lg bg-[#0e2a52] border border-white/30 px-3.5 py-2.5 text-xs text-white placeholder-sky-300/50 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-sky-200 mb-1 font-sans">
                  {t.emailAddress} *
                </label>
                <input
                  type="email"
                  required
                  placeholder="teacher@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg bg-[#0e2a52] border border-white/30 px-3.5 py-2.5 text-xs text-white placeholder-sky-300/50 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-sky-200 mb-1 font-sans">
                  {t.subjectSpecialty} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Mathematics & Science / الرياضيات والعلوم"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg bg-[#0e2a52] border border-white/30 px-3.5 py-2.5 text-xs text-white placeholder-sky-300/50 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-sky-200 mb-1 font-sans">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition cursor-pointer font-sans ${
                      role === 'teacher'
                        ? 'bg-white text-[#07162c] border-white font-black'
                        : 'bg-[#0e2a52] text-sky-200 border-white/30 hover:bg-[#143b72]'
                    }`}
                  >
                    {t.roleTeacher}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition cursor-pointer font-sans ${
                      role === 'admin'
                        ? 'bg-white text-[#07162c] border-white font-black'
                        : 'bg-[#0e2a52] text-sky-200 border-white/30 hover:bg-[#143b72]'
                    }`}
                  >
                    {t.roleAdmin}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-lg bg-white hover:bg-sky-50 text-[#07162c] font-black text-xs shadow-md transition cursor-pointer disabled:opacity-50 font-sans"
                >
                  {isLoading ? t.submitting : t.registerBtn}
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="px-4 py-3 rounded-lg bg-[#0e2a52] text-white font-bold text-xs border border-white/30 hover:bg-[#143b72] transition cursor-pointer font-sans"
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
