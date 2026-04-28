import type { AppState, Agenda, Category, Tag } from '@/types';
import { uid, nowIso, colorForString } from './utils';

const STORAGE_KEY = 'agenda-harian:v1';

function seedCategories(): Category[] {
  const defaults = [
    { name: 'Pekerjaan', color: '#3b82f6' },
    { name: 'Pribadi', color: '#22c55e' },
    { name: 'Kuliah', color: '#a855f7' },
    { name: 'Kesehatan', color: '#ef4444' },
  ];
  return defaults.map((c) => ({ id: uid(), name: c.name, color: c.color }));
}

function seedTags(): Tag[] {
  const defaults = ['penting', 'rapat', 'deadline', 'ide'];
  return defaults.map((name) => ({ id: uid(), name, color: colorForString(name) }));
}

function seedAgendas(categories: Category[], tags: Tag[]): Agenda[] {
  const today = new Date();
  today.setHours(9, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  tomorrow.setHours(14, 30, 0, 0);

  const pekerjaan = categories.find((c) => c.name === 'Pekerjaan')?.id;
  const pribadi = categories.find((c) => c.name === 'Pribadi')?.id;
  const tagRapat = tags.find((t) => t.name === 'rapat')?.id;
  const tagPenting = tags.find((t) => t.name === 'penting')?.id;

  return [
    {
      id: uid(),
      title: 'Selamat datang di Agenda Harian!',
      notes:
        '### Fitur lengkap\n\n- Tambah, edit, hapus agenda\n- Kategori, tag, prioritas\n- Kalender bulanan & mingguan\n- Pencarian & filter\n- Reminder browser\n- Markdown support\n- Drag & drop urutan\n- Recurring agenda\n- Export PDF/CSV/JSON\n- Dark mode\n\n**Coba tambah agenda pertamamu!**',
      date: today.toISOString(),
      allDay: false,
      priority: 'medium',
      status: 'todo',
      categoryId: pribadi,
      tagIds: tagPenting ? [tagPenting] : [],
      recurrence: { frequency: 'none' },
      order: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: uid(),
      title: 'Rapat tim mingguan',
      notes: 'Bahas progress sprint dan backlog.',
      date: tomorrow.toISOString(),
      allDay: false,
      priority: 'high',
      status: 'todo',
      categoryId: pekerjaan,
      tagIds: tagRapat ? [tagRapat] : [],
      recurrence: { frequency: 'weekly', interval: 1 },
      reminder: { minutesBefore: 15 },
      order: 1,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ];
}

export function loadState(): AppState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const state = migrateState(parsed);
    return state;
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export function defaultState(): AppState {
  const categories = seedCategories();
  const tags = seedTags();
  return {
    agendas: seedAgendas(categories, tags),
    categories,
    tags,
    theme: 'system',
  };
}

function migrateState(parsed: Partial<AppState>): AppState {
  const base = defaultState();
  const merged: AppState = {
    agendas: Array.isArray(parsed.agendas) ? parsed.agendas : base.agendas,
    categories: Array.isArray(parsed.categories) ? parsed.categories : base.categories,
    tags: Array.isArray(parsed.tags) ? parsed.tags : base.tags,
    theme: parsed.theme ?? base.theme,
    lastReminderCheck: parsed.lastReminderCheck,
  };
  // Fill any missing fields on agendas
  merged.agendas = merged.agendas.map((a, i) => ({
    id: a.id ?? uid(),
    title: a.title ?? '(tanpa judul)',
    notes: a.notes ?? '',
    date: a.date ?? nowIso(),
    endDate: a.endDate,
    allDay: a.allDay ?? false,
    priority: a.priority ?? 'medium',
    status: a.status ?? 'todo',
    categoryId: a.categoryId,
    tagIds: Array.isArray(a.tagIds) ? a.tagIds : [],
    recurrence: a.recurrence ?? { frequency: 'none' },
    reminder: a.reminder,
    order: typeof a.order === 'number' ? a.order : i,
    createdAt: a.createdAt ?? nowIso(),
    updatedAt: a.updatedAt ?? nowIso(),
  }));
  return merged;
}

export function resetState(): AppState {
  const s = defaultState();
  saveState(s);
  return s;
}
