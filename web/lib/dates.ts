import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

export function todayIso(now = new Date()): string {
  return format(now, 'yyyy-MM-dd');
}

export function weekBounds(dateIso: string): { from: string; to: string } {
  const date = parseISO(dateIso);
  return {
    from: format(startOfWeek(date, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
    to: format(endOfWeek(date, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
  };
}

export function monthBounds(dateIso: string): { from: string; to: string } {
  const date = parseISO(dateIso);
  return {
    from: format(startOfMonth(date), 'yyyy-MM-dd'),
    to: format(endOfMonth(date), 'yyyy-MM-dd'),
  };
}

export function addDaysIso(dateIso: string, days: number): string {
  return format(addDays(parseISO(dateIso), days), 'yyyy-MM-dd');
}

export function formatLongDate(dateIso: string): string {
  return format(parseISO(dateIso), 'EEEE, MMM d');
}

export function daysInWeek(fromIso: string, toIso: string): string[] {
  return eachDayOfInterval({
    start: parseISO(fromIso),
    end: parseISO(toIso),
  }).map((d) => format(d, 'yyyy-MM-dd'));
}

export function formatDayHeading(dateIso: string): string {
  return format(parseISO(dateIso), 'EEE MMM d');
}

export function formatTime(time: string | null): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return format(date, 'h:mm a');
}

export function nextDay(dateIso: string): string {
  return format(addDays(parseISO(dateIso), 1), 'yyyy-MM-dd');
}
