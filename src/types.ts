export const VALID_CLASSES = ['7/A', '6/A', '5/A', '4/A', '3/A'] as const;
export type ClassId = typeof VALID_CLASSES[number];

export const CLASS_ARABIC_NAMES: Record<ClassId, string> = {
  '7/A': '7/أ',
  '6/A': '6/أ',
  '5/A': '5/أ',
  '4/A': '4/أ',
  '3/A': '3/أ',
};

export const CLASS_DESCRIPTIONS: Record<ClassId, { gradeEn: string; gradeAr: string; color: string; badgeBg: string }> = {
  '7/A': { gradeEn: 'Grade 7 - Section A', gradeAr: 'الصف السابع - أ', color: 'from-[#c49b29] to-[#7d5e16]', badgeBg: 'bg-[#031710] text-[#e6be44] border-[#c89d2d]/60' },
  '6/A': { gradeEn: 'Grade 6 - Section A', gradeAr: 'الصف السادس - أ', color: 'from-[#0f523c] to-[#062c20]', badgeBg: 'bg-[#031710] text-emerald-300 border-[#10b981]/50' },
  '5/A': { gradeEn: 'Grade 5 - Section A', gradeAr: 'الصف الخامس - أ', color: 'from-[#8c3b1e] to-[#5c2411]', badgeBg: 'bg-[#031710] text-amber-200 border-[#8c3b1e]/60' },
  '4/A': { gradeEn: 'Grade 4 - Section A', gradeAr: 'الصف الرابع - أ', color: 'from-[#1c446c] to-[#0f2742]', badgeBg: 'bg-[#031710] text-sky-200 border-[#1c446c]/60' },
  '3/A': { gradeEn: 'Grade 3 - Section A', gradeAr: 'الصف الثالث - أ', color: 'from-[#6e213b] to-[#421222]', badgeBg: 'bg-[#031710] text-rose-200 border-[#6e213b]/60' },
};

export interface Teacher {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  role: 'admin' | 'teacher';
  subject: string;
  subjectAr: string;
  avatar: string;
}

export interface Rating {
  id: string;
  weekId: string;
  classId: ClassId;
  teacherId: string;
  teacherName: string;
  teacherNameAr?: string;
  teacherSubject?: string;
  score: number; // 0 to 10
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassSummary {
  classId: ClassId;
  averageScore: number | null; // null if 0 ratings
  ratingsCount: number;
  rank: number;
  isWinner: boolean;
  ratings: Rating[];
}

export interface WeeklyHistory {
  id: string;
  weekId: string;
  startDate: string;
  endDate: string;
  winningClasses: ClassId[];
  winningScore: number;
  totalRatings: number;
  classesSummary: Record<ClassId, { averageScore: number | null; ratingsCount: number }>;
  finalizedAt: string;
  resetBy: string;
}

export interface AppSettings {
  resetDayOfWeek: number; // 0: Sunday, 1: Monday, 5: Friday, etc.
  currentWeekId: string;
  weekStartDate: string;
  schoolName: string;
  schoolNameAr: string;
}

export interface AppStateResponse {
  currentTeacher: Teacher | null;
  teachers: Teacher[];
  settings: AppSettings;
  classes: ClassId[];
  summaries: ClassSummary[];
  currentWeekRatings: Rating[];
  history: WeeklyHistory[];
  serverTime: string;
}

export type Language = 'en' | 'ar';
