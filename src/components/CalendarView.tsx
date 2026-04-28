import { useMemo, useState } from 'react';
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
  formatMonthYear,
  formatWeekRange,
} from '@/lib/date';
import { id as idLocale } from 'date-fns/locale';
import type { Agenda, AppState, View } from '@/types';
import type { AppActions } from '@/hooks/useAppState';
import { agendasInRange, agendasOnDay } from '@/lib/recurrence';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';
import { AgendaCard } from './AgendaCard';
import { Modal } from './ui/Modal';

const WEEKDAY_SHORT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export interface CalendarViewProps {
  view: 'calendar-month' | 'calendar-week';
  state: AppState;
  actions: AppActions;
  onEdit: (a: Agenda) => void;
  onCreate: (dateIso: string) => void;
  onChangeView: (v: View) => void;
}

export function CalendarView({
  view,
  state,
  actions,
  onEdit,
  onCreate,
  onChangeView,
}: CalendarViewProps) {
  const [cursor, setCursor] = useState<Date>(new Date());
  const [dayDetail, setDayDetail] = useState<Date | null>(null);

  const isMonth = view === 'calendar-month';
  const weekStartsOn = 1 as const;

  const gridRange = useMemo(() => {
    if (isMonth) {
      const start = startOfWeek(startOfMonth(cursor), { weekStartsOn });
      const end = endOfWeek(endOfMonth(cursor), { weekStartsOn });
      return { start, end };
    }
    const start = startOfWeek(cursor, { weekStartsOn });
    const end = endOfWeek(cursor, { weekStartsOn });
    return { start, end };
  }, [cursor, isMonth]);

  const agendasByDay = useMemo(() => {
    const occ = agendasInRange(state.agendas, gridRange.start, gridRange.end);
    const map = new Map<string, Agenda[]>();
    for (const a of occ) {
      const d = new Date(a.date);
      const key = format(d, 'yyyy-MM-dd');
      const arr = map.get(key) ?? [];
      arr.push(a);
      map.set(key, arr);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.date.localeCompare(b.date));
    return map;
  }, [state.agendas, gridRange]);

  const days: Date[] = [];
  for (let d = gridRange.start; d <= gridRange.end; d = addDays(d, 1)) {
    days.push(d);
  }

  const title = isMonth ? formatMonthYear(cursor) : formatWeekRange(cursor);
  const today = new Date();

  const goPrev = () => setCursor((c) => (isMonth ? addMonths(c, -1) : addWeeks(c, -1)));
  const goNext = () => setCursor((c) => (isMonth ? addMonths(c, 1) : addWeeks(c, 1)));
  const goToday = () => setCursor(new Date());

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={goPrev} aria-label="Sebelumnya">
            <ChevronLeft size={16} />
          </Button>
          <Button variant="outline" size="icon" onClick={goNext} aria-label="Berikutnya">
            <ChevronRight size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToday}>
            Hari ini
          </Button>
          <h2 className="ml-2 text-lg font-semibold capitalize">{title}</h2>
        </div>
        <div className="flex items-center rounded-md border border-slate-300 dark:border-slate-700 p-0.5">
          <button
            onClick={() => onChangeView('calendar-month')}
            className={cn(
              'px-3 py-1 text-xs rounded',
              view === 'calendar-month'
                ? 'bg-brand-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
            )}
          >
            Bulanan
          </button>
          <button
            onClick={() => onChangeView('calendar-week')}
            className={cn(
              'px-3 py-1 text-xs rounded',
              view === 'calendar-week'
                ? 'bg-brand-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
            )}
          >
            Mingguan
          </button>
          <button
            onClick={() => onChangeView('list')}
            className="px-3 py-1 text-xs rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Daftar
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
          {WEEKDAY_SHORT.map((w) => (
            <div key={w} className="px-2 py-2 text-center">
              {w}
            </div>
          ))}
        </div>
        <div
          className={cn(
            'grid grid-cols-7',
            isMonth ? 'auto-rows-[minmax(104px,auto)]' : 'auto-rows-[minmax(300px,auto)]',
          )}
        >
          {days.map((d) => {
            const key = format(d, 'yyyy-MM-dd');
            const list = agendasByDay.get(key) ?? [];
            const outOfMonth = isMonth && d.getMonth() !== cursor.getMonth();
            const isToday = isSameDay(d, today);
            return (
              <div
                key={key}
                className={cn(
                  'border-t border-l border-slate-200 dark:border-slate-800 p-1.5 flex flex-col gap-1',
                  'first:border-l-0',
                  outOfMonth && 'bg-slate-50 dark:bg-slate-950/40 text-slate-400',
                )}
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setDayDetail(d)}
                    className={cn(
                      'text-xs font-semibold rounded px-1.5 py-0.5',
                      isToday
                        ? 'bg-brand-600 text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
                    )}
                  >
                    {format(d, 'd', { locale: idLocale })}
                  </button>
                  <button
                    onClick={() => {
                      const iso = new Date(
                        d.getFullYear(),
                        d.getMonth(),
                        d.getDate(),
                        9,
                        0,
                        0,
                      ).toISOString();
                      onCreate(iso);
                    }}
                    className="opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-100 rounded p-0.5 text-slate-400 hover:text-brand-600"
                    aria-label="Tambah agenda"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <div className="flex flex-col gap-1 overflow-hidden">
                  {list.slice(0, isMonth ? 3 : 10).map((a) => {
                    const cat = state.categories.find((c) => c.id === a.categoryId);
                    const color = cat?.color ?? '#64748b';
                    return (
                      <button
                        key={a.id}
                        onClick={() => onEdit(normalizeAgendaForEdit(a, state))}
                        className="text-left truncate rounded px-1.5 py-0.5 text-[11px] hover:ring-1 hover:ring-brand-300"
                        style={{
                          backgroundColor: hexWithAlpha(color, 0.18),
                          color,
                        }}
                        title={`${a.allDay ? '' : format(new Date(a.date), 'HH:mm') + ' '}${a.title}`}
                      >
                        {!a.allDay && (
                          <span className="font-semibold mr-1">
                            {format(new Date(a.date), 'HH:mm')}
                          </span>
                        )}
                        <span
                          className={cn(
                            a.status === 'done' && 'line-through opacity-60',
                          )}
                        >
                          {a.title}
                        </span>
                      </button>
                    );
                  })}
                  {list.length > (isMonth ? 3 : 10) && (
                    <button
                      onClick={() => setDayDetail(d)}
                      className="text-[10px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 text-left"
                    >
                      +{list.length - (isMonth ? 3 : 10)} lainnya…
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DayDetailModal
        date={dayDetail}
        state={state}
        actions={actions}
        onClose={() => setDayDetail(null)}
        onEdit={onEdit}
        onCreate={onCreate}
      />
    </div>
  );
}

function DayDetailModal({
  date,
  state,
  actions,
  onClose,
  onEdit,
  onCreate,
}: {
  date: Date | null;
  state: AppState;
  actions: AppActions;
  onClose: () => void;
  onEdit: (a: Agenda) => void;
  onCreate: (dateIso: string) => void;
}) {
  if (!date) return null;
  const list = agendasOnDay(state.agendas, date);
  return (
    <Modal
      open={!!date}
      onClose={onClose}
      title={format(date, "EEEE, d MMMM yyyy", { locale: idLocale })}
      size="lg"
      footer={
        <Button
          variant="primary"
          onClick={() => {
            const iso = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              9,
              0,
              0,
            ).toISOString();
            onCreate(iso);
            onClose();
          }}
        >
          <Plus size={14} />
          Tambah agenda
        </Button>
      }
    >
      {list.length === 0 ? (
        <p className="text-sm text-slate-500 py-4 text-center">
          Tidak ada agenda pada tanggal ini.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((a) => (
            <li key={a.id}>
              <AgendaCard
                agenda={a}
                state={state}
                onEdit={(x) => {
                  onEdit(normalizeAgendaForEdit(x, state));
                  onClose();
                }}
                onDelete={(x) => actions.deleteAgenda(x.id.split('::')[0]!)}
                onDuplicate={(x) => actions.duplicateAgenda(x.id.split('::')[0]!)}
                onToggleStatus={(x) => actions.toggleStatus(x.id.split('::')[0]!)}
                compact
              />
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

function normalizeAgendaForEdit(a: Agenda, state: AppState): Agenda {
  if (!a.id.includes('::')) return a;
  const baseId = a.id.split('::')[0]!;
  return state.agendas.find((x) => x.id === baseId) ?? a;
}

function hexWithAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
