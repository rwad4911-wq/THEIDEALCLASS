import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { LeaderboardView } from './components/LeaderboardView';
import { RatingForm } from './components/RatingForm';
import { HistoryView } from './components/HistoryView';
import { SettingsModal } from './components/SettingsModal';
import { TeacherSwitchModal } from './components/TeacherSwitchModal';
import { AlAndalusLogo } from './components/AlAndalusLogo';
import { 
  AppStateResponse, 
  ClassId, 
  ClassSummary, 
  Language, 
  Rating, 
  Teacher, 
  WeeklyHistory, 
  AppSettings,
  VALID_CLASSES 
} from './types';
import { translations } from './i18n';

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('cc_language') as Language) || 'en';
  });

  const [activeTab, setActiveTab] = useState<'leaderboard' | 'rate' | 'history'>('leaderboard');
  const [selectedClassId, setSelectedClassId] = useState<ClassId>('7/A');

  // Server state
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    resetDayOfWeek: 0,
    currentWeekId: '2026-W44',
    weekStartDate: '2026-10-25',
    schoolName: 'Al-Andalus School',
    schoolNameAr: 'مدارس الأندلس'
  });
  const [summaries, setSummaries] = useState<ClassSummary[]>([]);
  const [currentWeekRatings, setCurrentWeekRatings] = useState<Rating[]>([]);
  const [history, setHistory] = useState<WeeklyHistory[]>([]);
  const [isLiveSync, setIsLiveSync] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isTeacherSwitchOpen, setIsTeacherSwitchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Apply RTL direction when language changes
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('cc_language', language);
  }, [language]);

  // Load app state from backend
  const fetchState = useCallback(async (teacherIdOverride?: string) => {
    try {
      const activeTeacherId = teacherIdOverride || localStorage.getItem('cc_active_teacher_id') || '';
      const headers: Record<string, string> = {};
      if (activeTeacherId) {
        headers['x-teacher-id'] = activeTeacherId;
      }

      const res = await fetch('/api/state', { headers });
      if (!res.ok) throw new Error('Failed to load state');
      const data: AppStateResponse = await res.json();

      setTeachers(data.teachers);
      setSettings(data.settings);
      setSummaries(data.summaries);
      setCurrentWeekRatings(data.currentWeekRatings);
      setHistory(data.history);

      // Resolve current teacher
      if (data.currentTeacher) {
        setCurrentTeacher(data.currentTeacher);
        localStorage.setItem('cc_active_teacher_id', data.currentTeacher.id);
      } else if (data.teachers.length > 0) {
        // Default to admin or first teacher
        const defaultT = data.teachers.find(t => t.role === 'admin') || data.teachers[0];
        setCurrentTeacher(defaultT);
        localStorage.setItem('cc_active_teacher_id', defaultT.id);
      }
    } catch (err) {
      console.error('Error fetching state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load + Real-time SSE setup
  useEffect(() => {
    fetchState();

    // Setup Server-Sent Events (SSE) for instant cross-device live synchronization
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.addEventListener('connected', () => {
        setIsLiveSync(true);
      });

      eventSource.addEventListener('state_updated', (event) => {
        try {
          const data: AppStateResponse = JSON.parse(event.data);
          setTeachers(data.teachers);
          setSettings(data.settings);
          setSummaries(data.summaries);
          setCurrentWeekRatings(data.currentWeekRatings);
          setHistory(data.history);
          setIsLiveSync(true);
        } catch (e) {
          console.error('Error parsing SSE state update:', e);
        }
      });

      eventSource.onerror = () => {
        setIsLiveSync(false);
      };
    } catch (err) {
      console.warn('SSE not supported or connection error:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [fetchState]);

  // Handle teacher switch
  const handleSelectTeacher = async (teacherId: string) => {
    localStorage.setItem('cc_active_teacher_id', teacherId);
    await fetchState(teacherId);
  };

  const handleTeacherRegistered = (newTeacher: Teacher) => {
    setTeachers(prev => [...prev, newTeacher]);
    setCurrentTeacher(newTeacher);
    localStorage.setItem('cc_active_teacher_id', newTeacher.id);
  };

  const handleTeacherDeleted = async (deletedTeacherId: string) => {
    setTeachers(prev => prev.filter(t => t.id !== deletedTeacherId));
    if (currentTeacher?.id === deletedTeacherId) {
      const remaining = teachers.filter(t => t.id !== deletedTeacherId);
      const nextTeacher = remaining[0] || null;
      setCurrentTeacher(nextTeacher);
      if (nextTeacher) {
        localStorage.setItem('cc_active_teacher_id', nextTeacher.id);
      } else {
        localStorage.removeItem('cc_active_teacher_id');
      }
    }
    await fetchState();
  };

  const handleAllTeachersCleared = async () => {
    setTeachers([]);
    setCurrentTeacher(null);
    localStorage.removeItem('cc_active_teacher_id');
    await fetchState();
  };

  const handleRatingSubmitted = (newRating: Rating, isUpdate: boolean) => {
    // Re-fetch to ensure exact summaries calculation
    fetchState();
  };

  const handleRateClassFromLeaderboard = (classId: ClassId) => {
    setSelectedClassId(classId);
    setActiveTab('rate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const schoolDisplayName = language === 'ar' ? settings.schoolNameAr : settings.schoolName;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07162c] flex items-center justify-center text-sky-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          <p className="font-semibold text-sm font-serif">Al-Andalus School • {language === 'ar' ? 'جارٍ التحميل...' : 'Loading system...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white selection:bg-white selection:text-[#07162c]">
      
      {/* Main Header */}
      <Header
        currentTeacher={currentTeacher}
        language={language}
        onLanguageChange={setLanguage}
        onOpenTeacherSwitch={() => setIsTeacherSwitchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isLiveSync={isLiveSync}
        schoolName={schoolDisplayName}
      />

      {/* Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'leaderboard' && (
          <LeaderboardView
            summaries={summaries}
            language={language}
            currentTeacher={currentTeacher}
            onRateClass={handleRateClassFromLeaderboard}
          />
        )}

        {activeTab === 'rate' && (
          <RatingForm
            currentTeacher={currentTeacher}
            language={language}
            selectedClassId={selectedClassId}
            onSelectClassId={setSelectedClassId}
            currentWeekRatings={currentWeekRatings}
            onRatingSubmitted={handleRatingSubmitted}
            onOpenTeacherSwitch={() => setIsTeacherSwitchOpen(true)}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            history={history}
            language={language}
          />
        )}

      </main>

      {/* Footer with Al-Andalus Official Emblem */}
      <footer className="mt-16 border-t border-white/20 py-10 text-center text-xs text-sky-200/90 bg-[#051020]/80">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-3">
          <AlAndalusLogo size={48} showText={true} />
          <p className="font-bold text-white tracking-wide font-serif text-sm">
            {schoolDisplayName} • {translations[language].appTitle}
          </p>
          <p className="text-sky-200/80 max-w-xl mx-auto leading-relaxed">
            {language === 'ar'
              ? 'ديوان تقييم الفصول المعتمد لمدارس الأندلس للخمس فصول: 7/A، 6/A، 5/A، 4/A، 3/A • احتساب المتوسط الحسابي للتقييمات • طابع زمني دقيق لكل إرسال'
              : 'Official Teacher Rating System for Al-Andalus School classes 7/A, 6/A, 5/A, 4/A, and 3/A • Real-time Cross-Device Synchronization with Certified Submission Timestamps'}
          </p>
        </div>
      </footer>

      {/* Teacher Switch & Registration Modal */}
      <TeacherSwitchModal
        isOpen={isTeacherSwitchOpen}
        onClose={() => setIsTeacherSwitchOpen(false)}
        teachers={teachers}
        currentTeacher={currentTeacher}
        language={language}
        onSelectTeacher={handleSelectTeacher}
        onTeacherRegistered={handleTeacherRegistered}
        onTeacherDeleted={handleTeacherDeleted}
        onAllTeachersCleared={handleAllTeachersCleared}
      />

      {/* Settings & Admin Reset Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTeacher={currentTeacher}
        settings={settings}
        language={language}
        onLanguageChange={setLanguage}
        onSettingsUpdated={(newSettings) => setSettings(newSettings)}
        onWeekReset={() => fetchState()}
      />

    </div>
  );
}
