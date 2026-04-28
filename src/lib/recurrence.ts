import type { Agenda, Recurrence } from '@/types';
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfDay,
} from './date';

/**
 * Expand a potentially recurring agenda into concrete occurrences within [rangeStart, rangeEnd].
 * Each occurrence returned is a shallow clone with the `date` (and `endDate`) shifted to the
 * occurrence start. Non-recurring agendas are returned as a single entry if their date falls in range.
 *
 * `id` is suffixed with `::<iso>` for occurrences after the first so React keys stay unique.
 */
export function expandOccurrences(
  agenda: Agenda,
  rangeStart: Date,
  rangeEnd: Date,
  maxOccurrences = 366,
): Agenda[] {
  const startIso = agenda.date;
  const start = parseISO(startIso);
  const end = agenda.endDate ? parseISO(agenda.endDate) : null;
  const rec = agenda.recurrence;

  const interval = Math.max(1, rec.interval ?? 1);
  const until = rec.until ? parseISO(rec.until) : null;

  if (rec.frequency === 'none') {
    if (isWithinInterval(start, { start: rangeStart, end: rangeEnd })) {
      return [agenda];
    }
    return [];
  }

  const out: Agenda[] = [];
  let cursor = start;
  let count = 0;
  while (cursor <= rangeEnd && count < maxOccurrences) {
    if (until && cursor > until) break;
    if (cursor >= rangeStart) {
      const diffMs = end ? end.getTime() - start.getTime() : 0;
      const occEnd = end ? new Date(cursor.getTime() + diffMs) : undefined;
      const isFirst = isSameDay(cursor, start);
      out.push({
        ...agenda,
        id: isFirst ? agenda.id : `${agenda.id}::${cursor.toISOString()}`,
        date: cursor.toISOString(),
        endDate: occEnd ? occEnd.toISOString() : undefined,
      });
    }
    cursor = advance(cursor, rec, interval);
    count += 1;
  }
  return out;
}

function advance(d: Date, rec: Recurrence, interval: number): Date {
  switch (rec.frequency) {
    case 'daily':
      return addDays(d, interval);
    case 'weekly':
      return addWeeks(d, interval);
    case 'monthly':
      return addMonths(d, interval);
    case 'yearly':
      return addYears(d, interval);
    case 'none':
    default:
      return addDays(d, interval);
  }
}

export function agendasOnDay(agendas: Agenda[], day: Date): Agenda[] {
  const dayStart = startOfDay(day);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
  const out: Agenda[] = [];
  for (const a of agendas) {
    out.push(...expandOccurrences(a, dayStart, dayEnd));
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

export function agendasInRange(
  agendas: Agenda[],
  rangeStart: Date,
  rangeEnd: Date,
): Agenda[] {
  const out: Agenda[] = [];
  for (const a of agendas) {
    out.push(...expandOccurrences(a, rangeStart, rangeEnd));
  }
  return out;
}
