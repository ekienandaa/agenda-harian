import {
  Bell,
  BellOff,
  Calendar as CalendarIcon,
  Download,
  FolderOpen,
  List,
  Moon,
  Plus,
  RotateCcw,
  Settings2,
  Sun,
  Upload,
} from 'lucide-react';
import type { AppState, View } from '@/types';
import type { AppActions } from '@/hooks/useAppState';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';

export interface TopbarProps {
  state: AppState;
  actions: AppActions;
  view: View;
  onChangeView: (v: View) => void;
  onNewAgenda: () => void;
  onOpenCategories: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  onImport: () => void;
  onReset: () => void;
  notificationPermission: NotificationPermission;
  onRequestNotifications: () => void;
}

export function Topbar({
  state,
  actions,
  view,
  onChangeView,
  onNewAgenda,
  onOpenCategories,
  onExportJSON,
  onExportCSV,
  onExportPDF,
  onImport,
  onReset,
  notificationPermission,
  onRequestNotifications,
}: TopbarProps) {
  const cycleTheme = () => {
    const order: AppState['theme'][] = ['light', 'dark', 'system'];
    const idx = order.indexOf(state.theme);
    actions.setTheme(order[(idx + 1) % order.length]!);
  };

  const themeLabel =
    state.theme === 'light'
      ? 'Terang'
      : state.theme === 'dark'
        ? 'Gelap'
        : 'Sistem';

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 mr-2">
          <div className="h-8 w-8 rounded-md bg-brand-600 flex items-center justify-center text-white font-bold shadow-sm">
            AH
          </div>
          <h1 className="text-base font-semibold tracking-tight">
            Agenda Harian
          </h1>
        </div>

        <div className="flex items-center rounded-md border border-slate-300 dark:border-slate-700 p-0.5">
          <ViewTab active={view === 'list'} onClick={() => onChangeView('list')}>
            <List size={14} />
            Daftar
          </ViewTab>
          <ViewTab
            active={view === 'calendar-month'}
            onClick={() => onChangeView('calendar-month')}
          >
            <CalendarIcon size={14} />
            Bulanan
          </ViewTab>
          <ViewTab
            active={view === 'calendar-week'}
            onClick={() => onChangeView('calendar-week')}
          >
            <CalendarIcon size={14} />
            Mingguan
          </ViewTab>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <Button
            variant={notificationPermission === 'granted' ? 'ghost' : 'outline'}
            size="sm"
            onClick={onRequestNotifications}
            title={
              notificationPermission === 'granted'
                ? 'Notifikasi aktif'
                : 'Aktifkan notifikasi browser'
            }
          >
            {notificationPermission === 'granted' ? (
              <Bell size={14} />
            ) : (
              <BellOff size={14} />
            )}
            <span className="hidden sm:inline">
              {notificationPermission === 'granted' ? 'Notifikasi' : 'Aktifkan'}
            </span>
          </Button>

          <Button variant="outline" size="sm" onClick={onOpenCategories}>
            <Settings2 size={14} />
            <span className="hidden sm:inline">Kelola</span>
          </Button>

          <details className="relative">
            <summary className="list-none cursor-pointer inline-flex items-center justify-center font-medium h-8 px-2.5 text-xs rounded-md gap-1 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 select-none">
              <Download size={14} />
              <span className="hidden sm:inline">Export</span>
            </summary>
            <div className="absolute right-0 mt-1 w-44 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg z-20 py-1">
              <MenuItem onClick={onExportJSON}>Ekspor JSON (backup)</MenuItem>
              <MenuItem onClick={onExportCSV}>Ekspor CSV</MenuItem>
              <MenuItem onClick={onExportPDF}>Ekspor PDF</MenuItem>
              <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
              <MenuItem onClick={onImport}>
                <Upload size={12} className="inline mr-1" />
                Impor JSON
              </MenuItem>
              <MenuItem onClick={onReset} danger>
                <RotateCcw size={12} className="inline mr-1" />
                Reset data
              </MenuItem>
            </div>
          </details>

          <Button variant="outline" size="sm" onClick={cycleTheme} title={`Tema: ${themeLabel}`}>
            {state.theme === 'dark' ? (
              <Moon size={14} />
            ) : state.theme === 'light' ? (
              <Sun size={14} />
            ) : (
              <FolderOpen size={14} />
            )}
            <span className="hidden sm:inline">{themeLabel}</span>
          </Button>

          <Button variant="primary" size="sm" onClick={onNewAgenda}>
            <Plus size={14} />
            Agenda baru
          </Button>
        </div>
      </div>
    </header>
  );
}

function ViewTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded',
        active
          ? 'bg-brand-600 text-white'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
      )}
    >
      {children}
    </button>
  );
}

function MenuItem({
  onClick,
  children,
  danger,
}: {
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        const details = (e.currentTarget.closest('details') as HTMLDetailsElement | null);
        if (details) details.open = false;
        onClick();
      }}
      className={cn(
        'w-full text-left px-3 py-1.5 text-xs',
        danger
          ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800',
      )}
    >
      {children}
    </button>
  );
}
