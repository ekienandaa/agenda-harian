import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bell,
  Calendar as CalendarIcon,
  Check,
  Copy,
  GripVertical,
  Pencil,
  Repeat,
  Trash2,
} from 'lucide-react';
import type { Agenda, AppState } from '@/types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';
import { formatHuman, relative } from '@/lib/date';

export interface AgendaCardProps {
  agenda: Agenda;
  state: AppState;
  onEdit: (a: Agenda) => void;
  onDelete: (a: Agenda) => void;
  onDuplicate: (a: Agenda) => void;
  onToggleStatus: (a: Agenda) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement> & {
    ref?: (node: HTMLButtonElement | null) => void;
  };
  isDragging?: boolean;
  compact?: boolean;
}

const priorityMeta: Record<
  Agenda['priority'],
  { label: string; className: string; dot: string }
> = {
  low: {
    label: 'Rendah',
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  medium: {
    label: 'Sedang',
    className:
      'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  high: {
    label: 'Tinggi',
    className:
      'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    dot: 'bg-red-500',
  },
};

export function AgendaCard({
  agenda,
  state,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
  dragHandleProps,
  isDragging,
  compact,
}: AgendaCardProps) {
  const cat = state.categories.find((c) => c.id === agenda.categoryId);
  const tags = agenda.tagIds
    .map((id) => state.tags.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => !!t);
  const done = agenda.status === 'done';
  const pri = priorityMeta[agenda.priority];
  const realId = agenda.id.split('::')[0]!;

  return (
    <div
      className={cn(
        'group relative rounded-lg border bg-white dark:bg-slate-900 shadow-sm transition-all animate-fade-in',
        'border-slate-200 dark:border-slate-800',
        isDragging && 'ring-2 ring-brand-400 shadow-md',
        done && 'opacity-60',
      )}
    >
      <div className="flex gap-2 p-3">
        {dragHandleProps && (
          <button
            {...dragHandleProps}
            className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing self-stretch flex items-center"
            aria-label="Geser untuk urutkan"
          >
            <GripVertical size={16} />
          </button>
        )}

        <button
          onClick={() => onToggleStatus(agenda)}
          className={cn(
            'mt-0.5 shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors',
            done
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-slate-300 dark:border-slate-600 hover:border-brand-400',
          )}
          aria-label={done ? 'Tandai belum selesai' : 'Tandai selesai'}
        >
          {done && <Check size={12} strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                'font-semibold text-sm leading-snug break-words',
                done && 'line-through text-slate-500',
              )}
            >
              <span
                className={cn('inline-block align-middle mr-1.5 h-2 w-2 rounded-full', pri.dot)}
                title={`Prioritas ${pri.label.toLowerCase()}`}
              />
              {agenda.title}
            </h3>

            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(agenda)}
                aria-label="Edit"
                className="h-7 w-7"
              >
                <Pencil size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDuplicate(agenda)}
                aria-label="Duplikasi"
                className="h-7 w-7"
              >
                <Copy size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(agenda)}
                aria-label="Hapus"
                className="h-7 w-7 text-red-500 hover:text-red-600"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <CalendarIcon size={12} />
              {formatHuman(agenda.date, agenda.allDay)}
            </span>
            <span className="text-slate-400 dark:text-slate-500">
              • {relative(agenda.date)}
            </span>
            {agenda.recurrence.frequency !== 'none' && (
              <span className="inline-flex items-center gap-1">
                <Repeat size={12} />
                {recurrenceLabel(agenda.recurrence.frequency)}
              </span>
            )}
            {agenda.reminder && (
              <span className="inline-flex items-center gap-1">
                <Bell size={12} />
                {reminderLabel(agenda.reminder.minutesBefore)}
              </span>
            )}
          </div>

          {!compact && agenda.notes.trim() && (
            <div className="prose-agenda mt-2 text-slate-700 dark:text-slate-300 break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{agenda.notes}</ReactMarkdown>
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', pri.className)}>
              {pri.label}
            </span>
            {cat && <Badge color={cat.color}>{cat.name}</Badge>}
            {tags.map((t) => (
              <Badge key={t.id} color={t.color}>
                #{t.name}
              </Badge>
            ))}
            {!compact && (
              <span className="text-[10px] text-slate-400 ml-auto">ID: {realId.slice(0, 8)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function recurrenceLabel(f: Agenda['recurrence']['frequency']): string {
  switch (f) {
    case 'daily':
      return 'Harian';
    case 'weekly':
      return 'Mingguan';
    case 'monthly':
      return 'Bulanan';
    case 'yearly':
      return 'Tahunan';
    default:
      return '';
  }
}

function reminderLabel(m: number): string {
  if (m === 0) return 'Tepat waktu';
  if (m < 60) return `${m}m sebelumnya`;
  if (m < 1440) return `${Math.round(m / 60)}j sebelumnya`;
  return `${Math.round(m / 1440)}h sebelumnya`;
}
