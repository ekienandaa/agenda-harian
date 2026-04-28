import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  endOfMonth,
  endOfWeek,
  format,
  formatDistanceToNowStrict,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export const DATE_FMT = 'yyyy-MM-dd';
export const TIME_FMT = 'HH:mm';
export const DATETIME_FMT = "yyyy-MM-dd'T'HH:mm";

export function toLocalDateInput(iso: string): string {
  return format(parseISO(iso), DATE_FMT);
}

export function toLocalDateTimeInput(iso: string): string {
  return format(parseISO(iso), DATETIME_FMT);
}

export function fromLocalDateInput(value: string, endOfDayFlag = false): string {
  // value is yyyy-MM-dd
  const [y, m, d] = value.split('-').map((v) => Number(v));
  const dt = new Date(y!, (m ?? 1) - 1, d ?? 1, endOfDayFlag ? 23 : 0, endOfDayFlag ? 59 : 0, 0, 0);
  return dt.toISOString();
}

export function fromLocalDateTimeInput(value: string): string {
  const dt = new Date(value);
  return dt.toISOString();
}

export function formatHuman(iso: string, allDay = false): string {
  const d = parseISO(iso);
  if (allDay) return format(d, 'EEE, d MMM yyyy', { locale: idLocale });
  return format(d, "EEE, d MMM yyyy 'pukul' HH:mm", { locale: idLocale });
}

export function formatShortDate(iso: string): string {
  return format(parseISO(iso), 'd MMM', { locale: idLocale });
}

export function formatTime(iso: string): string {
  return format(parseISO(iso), TIME_FMT, { locale: idLocale });
}

export function formatMonthYear(d: Date): string {
  return format(d, 'MMMM yyyy', { locale: idLocale });
}

export function formatWeekRange(d: Date, weekStartsOn: 0 | 1 = 1): string {
  const start = startOfWeek(d, { weekStartsOn });
  const end = endOfWeek(d, { weekStartsOn });
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${format(start, 'd', { locale: idLocale })} – ${format(end, 'd MMM yyyy', { locale: idLocale })}`;
  }
  return `${format(start, 'd MMM', { locale: idLocale })} – ${format(end, 'd MMM yyyy', { locale: idLocale })}`;
}

export function relative(iso: string): string {
  try {
    return formatDistanceToNowStrict(parseISO(iso), { locale: idLocale, addSuffix: true });
  } catch {
    return '';
  }
}

export {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
};
