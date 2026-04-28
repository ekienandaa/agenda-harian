import { useEffect, useState } from 'react';
import type { Agenda, AppState, Priority, RecurrenceFrequency } from '@/types';
import type { AppActions } from '@/hooks/useAppState';
import { Input, Textarea, Select, Label } from './ui/Input';
import { Button } from './ui/Button';
import { Checkbox } from './ui/Checkbox';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import {
  DATETIME_FMT,
  fromLocalDateInput,
  fromLocalDateTimeInput,
  toLocalDateInput,
  toLocalDateTimeInput,
} from '@/lib/date';
import { format } from 'date-fns';
import { Plus, Trash2, Tag as TagIcon } from 'lucide-react';

export interface AgendaFormProps {
  open: boolean;
  onClose: () => void;
  state: AppState;
  actions: AppActions;
  initial?: Partial<Agenda>;
  editing?: Agenda | null;
}

interface FormData {
  title: string;
  notes: string;
  date: string;
  endDate: string;
  allDay: boolean;
  priority: Priority;
  status: Agenda['status'];
  categoryId: string;
  tagIds: string[];
  recurrence: RecurrenceFrequency;
  recurrenceInterval: number;
  recurrenceUntil: string;
  reminderEnabled: boolean;
  reminderMinutes: number;
}

function toForm(a: Partial<Agenda> | undefined, allDay: boolean): FormData {
  const now = new Date();
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0);
  return {
    title: a?.title ?? '',
    notes: a?.notes ?? '',
    date: a?.date
      ? allDay
        ? toLocalDateInput(a.date)
        : toLocalDateTimeInput(a.date)
      : allDay
        ? format(defaultStart, 'yyyy-MM-dd')
        : format(defaultStart, DATETIME_FMT),
    endDate: a?.endDate
      ? allDay
        ? toLocalDateInput(a.endDate)
        : toLocalDateTimeInput(a.endDate)
      : '',
    allDay: a?.allDay ?? allDay,
    priority: a?.priority ?? 'medium',
    status: a?.status ?? 'todo',
    categoryId: a?.categoryId ?? '',
    tagIds: a?.tagIds ?? [],
    recurrence: a?.recurrence?.frequency ?? 'none',
    recurrenceInterval: a?.recurrence?.interval ?? 1,
    recurrenceUntil: a?.recurrence?.until ? toLocalDateInput(a.recurrence.until) : '',
    reminderEnabled: !!a?.reminder,
    reminderMinutes: a?.reminder?.minutesBefore ?? 15,
  };
}

export function AgendaForm({
  open,
  onClose,
  state,
  actions,
  initial,
  editing,
}: AgendaFormProps) {
  const [form, setForm] = useState<FormData>(() =>
    toForm(editing ?? initial, editing?.allDay ?? initial?.allDay ?? false),
  );
  const [quickTag, setQuickTag] = useState('');

  useEffect(() => {
    if (open) {
      setForm(toForm(editing ?? initial, editing?.allDay ?? initial?.allDay ?? false));
      setQuickTag('');
    }
  }, [open, editing, initial]);

  // When toggling allDay, re-format date to the right input type
  useEffect(() => {
    setForm((f) => {
      if (!f.date) return f;
      try {
        const iso = f.allDay ? fromLocalDateInput(f.date) : fromLocalDateTimeInput(f.date);
        return {
          ...f,
          date: f.allDay ? toLocalDateInput(iso) : toLocalDateTimeInput(iso),
        };
      } catch {
        return f;
      }
    });
  }, [form.allDay]);

  const setField = <K extends keyof FormData>(k: K, v: FormData[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  const toggleTag = (id: string) => {
    setForm((f) => ({
      ...f,
      tagIds: f.tagIds.includes(id)
        ? f.tagIds.filter((t) => t !== id)
        : [...f.tagIds, id],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const isoDate = form.allDay
      ? fromLocalDateInput(form.date)
      : fromLocalDateTimeInput(form.date);
    const isoEnd = form.endDate
      ? form.allDay
        ? fromLocalDateInput(form.endDate, true)
        : fromLocalDateTimeInput(form.endDate)
      : undefined;

    const payload: Omit<Agenda, 'id' | 'createdAt' | 'updatedAt' | 'order'> = {
      title: form.title.trim(),
      notes: form.notes,
      date: isoDate,
      endDate: isoEnd,
      allDay: form.allDay,
      priority: form.priority,
      status: form.status,
      categoryId: form.categoryId || undefined,
      tagIds: form.tagIds,
      recurrence: {
        frequency: form.recurrence,
        interval: form.recurrenceInterval,
        until: form.recurrenceUntil
          ? fromLocalDateInput(form.recurrenceUntil, true)
          : undefined,
      },
      reminder: form.reminderEnabled
        ? { minutesBefore: form.reminderMinutes }
        : undefined,
    };

    if (editing) {
      actions.updateAgenda(editing.id, payload);
    } else {
      actions.addAgenda(payload);
    }
    onClose();
  };

  const handleQuickAddTag = () => {
    const name = quickTag.trim();
    if (!name) return;
    const existing = state.tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    const tag = existing ?? actions.addTag(name);
    if (!form.tagIds.includes(tag.id)) {
      setForm((f) => ({ ...f, tagIds: [...f.tagIds, tag.id] }));
    }
    setQuickTag('');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit agenda' : 'Agenda baru'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          {editing && (
            <Button
              variant="danger"
              onClick={() => {
                actions.deleteAgenda(editing.id);
                onClose();
              }}
            >
              <Trash2 size={14} />
              Hapus
            </Button>
          )}
          <Button variant="primary" onClick={handleSubmit}>
            {editing ? 'Simpan' : 'Tambah'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Judul</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            placeholder="Contoh: Rapat tim marketing"
            required
            autoFocus
          />
        </div>

        <div>
          <Label htmlFor="notes">Catatan (mendukung Markdown)</Label>
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
            placeholder="Tulis detail agenda. **bold**, *italic*, - list, [link](url), `code`, dst."
            rows={4}
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="allDay"
            checked={form.allDay}
            onChange={(e) => setField('allDay', e.target.checked)}
          />
          <label htmlFor="allDay" className="text-sm cursor-pointer">
            Sepanjang hari (tanpa jam spesifik)
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="date">Mulai</Label>
            <Input
              id="date"
              type={form.allDay ? 'date' : 'datetime-local'}
              value={form.date}
              onChange={(e) => setField('date', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="endDate">Selesai (opsional)</Label>
            <Input
              id="endDate"
              type={form.allDay ? 'date' : 'datetime-local'}
              value={form.endDate}
              onChange={(e) => setField('endDate', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="priority">Prioritas</Label>
            <Select
              id="priority"
              value={form.priority}
              onChange={(e) => setField('priority', e.target.value as Priority)}
            >
              <option value="low">Rendah</option>
              <option value="medium">Sedang</option>
              <option value="high">Tinggi</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={form.status}
              onChange={(e) => setField('status', e.target.value as Agenda['status'])}
            >
              <option value="todo">Belum</option>
              <option value="in_progress">Dikerjakan</option>
              <option value="done">Selesai</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="category">Kategori</Label>
            <Select
              id="category"
              value={form.categoryId}
              onChange={(e) => setField('categoryId', e.target.value)}
            >
              <option value="">— tanpa kategori —</option>
              {state.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label>Tag</Label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {state.tags.length === 0 && (
              <span className="text-xs text-slate-500">Belum ada tag. Tambahkan di bawah.</span>
            )}
            {state.tags.map((t) => {
              const active = form.tagIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTag(t.id)}
                  className="transition-opacity"
                  style={{ opacity: active ? 1 : 0.5 }}
                >
                  <Badge color={t.color} variant={active ? 'solid' : 'soft'}>
                    <TagIcon size={10} />
                    {t.name}
                  </Badge>
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Tambah tag baru…"
              value={quickTag}
              onChange={(e) => setQuickTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleQuickAddTag();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={handleQuickAddTag}>
              <Plus size={14} />
              Tambah
            </Button>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 dark:border-slate-800 p-3 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="recurrence">Ulangi</Label>
              <Select
                id="recurrence"
                value={form.recurrence}
                onChange={(e) =>
                  setField('recurrence', e.target.value as RecurrenceFrequency)
                }
              >
                <option value="none">Tidak berulang</option>
                <option value="daily">Setiap hari</option>
                <option value="weekly">Setiap minggu</option>
                <option value="monthly">Setiap bulan</option>
                <option value="yearly">Setiap tahun</option>
              </Select>
            </div>
            {form.recurrence !== 'none' && (
              <>
                <div>
                  <Label htmlFor="interval">Setiap</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="interval"
                      type="number"
                      min={1}
                      value={form.recurrenceInterval}
                      onChange={(e) =>
                        setField('recurrenceInterval', Math.max(1, Number(e.target.value) || 1))
                      }
                    />
                    <span className="text-xs text-slate-500">
                      {form.recurrence === 'daily' && 'hari'}
                      {form.recurrence === 'weekly' && 'minggu'}
                      {form.recurrence === 'monthly' && 'bulan'}
                      {form.recurrence === 'yearly' && 'tahun'}
                    </span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="until">Sampai (opsional)</Label>
                  <Input
                    id="until"
                    type="date"
                    value={form.recurrenceUntil}
                    onChange={(e) => setField('recurrenceUntil', e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="rounded-md border border-slate-200 dark:border-slate-800 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="reminderEnabled"
              checked={form.reminderEnabled}
              onChange={(e) => setField('reminderEnabled', e.target.checked)}
            />
            <label htmlFor="reminderEnabled" className="text-sm cursor-pointer">
              Aktifkan pengingat
            </label>
          </div>
          {form.reminderEnabled && (
            <div className="flex items-center gap-2">
              <Label className="!mb-0">Ingatkan</Label>
              <Select
                value={form.reminderMinutes.toString()}
                onChange={(e) => setField('reminderMinutes', Number(e.target.value))}
                className="max-w-[220px]"
              >
                <option value="0">Tepat waktu</option>
                <option value="5">5 menit sebelumnya</option>
                <option value="15">15 menit sebelumnya</option>
                <option value="30">30 menit sebelumnya</option>
                <option value="60">1 jam sebelumnya</option>
                <option value="120">2 jam sebelumnya</option>
                <option value="1440">1 hari sebelumnya</option>
              </Select>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
