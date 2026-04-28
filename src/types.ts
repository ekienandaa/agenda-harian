export type Priority = 'low' | 'medium' | 'high';

export type Status = 'todo' | 'in_progress' | 'done';

export type RecurrenceFrequency =
  | 'none'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly';

export interface Recurrence {
  frequency: RecurrenceFrequency;
  /** For weekly: 1 = every week, 2 = every 2 weeks, etc. Defaults to 1. */
  interval?: number;
  /** Optional end date (ISO). If omitted, recurrence has no end. */
  until?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Reminder {
  /** Minutes before `date` when reminder should fire. */
  minutesBefore: number;
  /** Whether user already dismissed this reminder today. */
  lastNotifiedAt?: string;
}

export interface Agenda {
  id: string;
  title: string;
  /** Markdown-supported description. */
  notes: string;
  /** ISO datetime — the date/time the agenda is scheduled for. */
  date: string;
  /** Optional end datetime (ISO). */
  endDate?: string;
  /** Whether this is an all-day event (no specific time). */
  allDay: boolean;
  priority: Priority;
  status: Status;
  categoryId?: string;
  tagIds: string[];
  recurrence: Recurrence;
  reminder?: Reminder;
  /** Ordering index for manual sort (drag & drop). */
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  agendas: Agenda[];
  categories: Category[];
  tags: Tag[];
  theme: 'light' | 'dark' | 'system';
  /** ISO date of last reminder check, used to reset daily notifications. */
  lastReminderCheck?: string;
}

export type View = 'list' | 'calendar-month' | 'calendar-week';

export interface Filter {
  query: string;
  categoryId?: string;
  tagIds: string[];
  priority?: Priority;
  status?: Status;
  /** ISO date range. */
  from?: string;
  to?: string;
}
