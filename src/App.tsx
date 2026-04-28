import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Agenda, Filter, View } from '@/types';
import { useAppState } from '@/hooks/useAppState';
import { useApplyTheme } from '@/hooks/useTheme';
import { Topbar } from '@/components/Topbar';
import { FilterBar } from '@/components/FilterBar';
import { AgendaList } from '@/components/AgendaList';
import { AgendaForm } from '@/components/AgendaForm';
import { CalendarView } from '@/components/CalendarView';
import { TagCategoryManager } from '@/components/TagCategoryManager';
import { StatsPanel } from '@/components/StatsPanel';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  dueReminders,
  notify,
  notificationsSupported,
  requestNotificationPermission,
} from '@/lib/reminder';
import { exportCSV, exportJSON, exportPDF, importJSON } from '@/lib/export';
import { parseISO, startOfDay } from '@/lib/date';

const DEFAULT_FILTER: Filter = { query: '', tagIds: [] };

export default function App() {
  const [state, actions] = useAppState();
  useApplyTheme(state.theme);

  const [view, setView] = useState<View>('list');
  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Agenda | null>(null);
  const [initialData, setInitialData] = useState<Partial<Agenda> | undefined>();

  const [managerOpen, setManagerOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const [notifPerm, setNotifPerm] = useState<NotificationPermission>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
    return Notification.permission;
  });

  // Reminder polling
  useEffect(() => {
    if (!notificationsSupported() || notifPerm !== 'granted') return;
    const fired = new Set<string>();
    const tick = () => {
      const due = dueReminders(state.agendas, new Date());
      for (const a of due) {
        if (fired.has(a.id)) continue;
        fired.add(a.id);
        notify(a);
      }
    };
    tick();
    const iv = window.setInterval(tick, 30_000);
    return () => window.clearInterval(iv);
  }, [state.agendas, notifPerm]);

  const handleRequestNotifications = useCallback(async () => {
    const perm = await requestNotificationPermission();
    setNotifPerm(perm);
  }, []);

  const openNew = useCallback((initial?: Partial<Agenda>) => {
    setEditing(null);
    setInitialData(initial);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((a: Agenda) => {
    setEditing(a);
    setInitialData(undefined);
    setFormOpen(true);
  }, []);

  const handleImportClick = useCallback(() => {
    importInputRef.current?.click();
  }, []);

  const handleImportFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      try {
        const next = await importJSON(file);
        actions.replaceAll(next);
      } catch (err) {
        window.alert('File tidak valid: ' + String(err));
      }
    },
    [actions],
  );

  const filteredAgendas = useMemo(() => {
    const q = filter.query.trim().toLowerCase();
    return [...state.agendas]
      .filter((a) => {
        if (filter.categoryId && a.categoryId !== filter.categoryId) return false;
        if (filter.priority && a.priority !== filter.priority) return false;
        if (filter.status && a.status !== filter.status) return false;
        if (filter.tagIds.length > 0) {
          const ok = filter.tagIds.every((t) => a.tagIds.includes(t));
          if (!ok) return false;
        }
        if (filter.from) {
          const start = startOfDay(parseISO(filter.from));
          if (parseISO(a.date) < start) return false;
        }
        if (filter.to) {
          const end = new Date(startOfDay(parseISO(filter.to)).getTime() + 24 * 60 * 60 * 1000 - 1);
          if (parseISO(a.date) > end) return false;
        }
        if (q) {
          const tagNames = a.tagIds
            .map((id) => state.tags.find((t) => t.id === id)?.name ?? '')
            .join(' ');
          const hay = `${a.title} ${a.notes} ${tagNames}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // When no custom filter, order by manual order; otherwise by date asc
        if (
          !filter.query &&
          !filter.categoryId &&
          !filter.priority &&
          !filter.status &&
          filter.tagIds.length === 0 &&
          !filter.from &&
          !filter.to
        ) {
          return a.order - b.order;
        }
        return a.date.localeCompare(b.date);
      });
  }, [state.agendas, state.tags, filter]);

  const isListView = view === 'list';
  const allowReorder =
    isListView &&
    !filter.query &&
    !filter.categoryId &&
    !filter.priority &&
    !filter.status &&
    filter.tagIds.length === 0 &&
    !filter.from &&
    !filter.to;

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar
        state={state}
        actions={actions}
        view={view}
        onChangeView={setView}
        onNewAgenda={() => openNew()}
        onOpenCategories={() => setManagerOpen(true)}
        onExportJSON={() => exportJSON(state)}
        onExportCSV={() => exportCSV(state.agendas, state.categories, state.tags)}
        onExportPDF={() => exportPDF(state.agendas, state.categories, state.tags)}
        onImport={handleImportClick}
        onReset={() => setResetOpen(true)}
        notificationPermission={notifPerm}
        onRequestNotifications={handleRequestNotifications}
      />

      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImportFile}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-5 space-y-4">
        <StatsPanel agendas={state.agendas} />

        {isListView && (
          <FilterBar filter={filter} setFilter={setFilter} state={state} />
        )}

        {isListView ? (
          <AgendaList
            agendas={filteredAgendas}
            state={state}
            actions={actions}
            onEdit={openEdit}
            allowReorder={allowReorder}
          />
        ) : (
          <CalendarView
            view={view}
            state={state}
            actions={actions}
            onEdit={openEdit}
            onCreate={(iso) => openNew({ date: iso, allDay: false })}
            onChangeView={setView}
          />
        )}
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        Dibuat dengan ❤ — data kamu tersimpan aman di browser (localStorage). Ekspor JSON
        untuk backup.
      </footer>

      <AgendaForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        state={state}
        actions={actions}
        editing={editing}
        initial={initialData}
      />

      <TagCategoryManager
        open={managerOpen}
        onClose={() => setManagerOpen(false)}
        state={state}
        actions={actions}
      />

      <ConfirmDialog
        open={resetOpen}
        title="Reset semua data?"
        description="Semua agenda, kategori, dan tag akan dikembalikan ke kondisi awal. Tindakan ini tidak bisa dibatalkan. Pertimbangkan untuk ekspor JSON terlebih dahulu."
        confirmLabel="Reset data"
        danger
        onConfirm={() => actions.resetAll()}
        onClose={() => setResetOpen(false)}
      />
    </div>
  );
}
