import { Language } from '../types';

export function formatDateTime(isoString: string | undefined | null, language: Language): {
  date: string;
  time: string;
  full: string;
} {
  if (!isoString) {
    return { date: '', time: '', full: '' };
  }

  const d = new Date(isoString);
  if (isNaN(d.getTime())) {
    return { date: '', time: '', full: '' };
  }

  const locale = language === 'ar' ? 'ar-EG' : 'en-US';

  const date = d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  });

  const time = d.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const full = language === 'ar' ? `${date} • ${time}` : `${date} at ${time}`;

  return { date, time, full };
}
