import { CalendarDays } from 'lucide-react';

export function EmptyState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 dark:border-slate-700 py-12 text-center">
      <div className="mb-3 rounded-full bg-brand-100 dark:bg-brand-900/30 p-3 text-brand-600 dark:text-brand-300">
        <CalendarDays size={28} />
      </div>
      <p className="text-sm font-medium">
        {message ?? 'Belum ada agenda yang cocok dengan filter.'}
      </p>
      <p className="text-xs text-slate-500 mt-1">
        Klik tombol <span className="font-semibold">“Agenda baru”</span> untuk mulai menambahkan.
      </p>
    </div>
  );
}
