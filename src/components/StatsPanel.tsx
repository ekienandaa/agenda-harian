import { useMemo } from 'react';
import type { Agenda } from '@/types';
import { startOfDay, addDays } from '@/lib/date';
import { agendasInRange } from '@/lib/recurrence';
import { cn } from '@/lib/utils';

export function StatsPanel({ agendas }: { agendas: Agenda[] }) {
  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const in7 = addDays(today, 7);
    const upcoming = agendasInRange(agendas, today, in7).length;
    const total = agendas.length;
    const done = agendas.filter((a) => a.status === 'done').length;
    const high = agendas.filter((a) => a.priority === 'high' && a.status !== 'done').length;
    return { total, done, high, upcoming };
  }, [agendas]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <Stat label="Total" value={stats.total} color="text-slate-900 dark:text-slate-100" />
      <Stat label="Selesai" value={stats.done} color="text-emerald-600 dark:text-emerald-400" />
      <Stat
        label="Prioritas tinggi"
        value={stats.high}
        color="text-red-600 dark:text-red-400"
      />
      <Stat
        label="7 hari ke depan"
        value={stats.upcoming}
        color="text-brand-600 dark:text-brand-400"
      />
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}
      </div>
      <div className={cn('text-2xl font-bold mt-0.5', color)}>{value}</div>
    </div>
  );
}
