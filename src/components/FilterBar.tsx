import { Search, X } from 'lucide-react';
import type { AppState, Filter } from '@/types';
import { Input, Select } from './ui/Input';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

export interface FilterBarProps {
  filter: Filter;
  setFilter: (f: Filter) => void;
  state: AppState;
}

export function FilterBar({ filter, setFilter, state }: FilterBarProps) {
  const toggleTag = (id: string) => {
    setFilter({
      ...filter,
      tagIds: filter.tagIds.includes(id)
        ? filter.tagIds.filter((t) => t !== id)
        : [...filter.tagIds, id],
    });
  };

  const hasActive =
    !!filter.query ||
    !!filter.categoryId ||
    filter.tagIds.length > 0 ||
    !!filter.priority ||
    !!filter.status ||
    !!filter.from ||
    !!filter.to;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <Input
          placeholder="Cari agenda, catatan, atau tag…"
          value={filter.query}
          onChange={(e) => setFilter({ ...filter, query: e.target.value })}
          className="pl-9"
        />
        {filter.query && (
          <button
            onClick={() => setFilter({ ...filter, query: '' })}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            aria-label="Bersihkan pencarian"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Select
          value={filter.categoryId ?? ''}
          onChange={(e) =>
            setFilter({ ...filter, categoryId: e.target.value || undefined })
          }
        >
          <option value="">Semua kategori</option>
          {state.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          value={filter.priority ?? ''}
          onChange={(e) =>
            setFilter({ ...filter, priority: (e.target.value as Filter['priority']) || undefined })
          }
        >
          <option value="">Semua prioritas</option>
          <option value="low">Rendah</option>
          <option value="medium">Sedang</option>
          <option value="high">Tinggi</option>
        </Select>
        <Select
          value={filter.status ?? ''}
          onChange={(e) =>
            setFilter({ ...filter, status: (e.target.value as Filter['status']) || undefined })
          }
        >
          <option value="">Semua status</option>
          <option value="todo">Belum</option>
          <option value="in_progress">Dikerjakan</option>
          <option value="done">Selesai</option>
        </Select>
        <div className="flex gap-1">
          <Input
            type="date"
            value={filter.from ?? ''}
            onChange={(e) => setFilter({ ...filter, from: e.target.value || undefined })}
            aria-label="Dari tanggal"
          />
          <Input
            type="date"
            value={filter.to ?? ''}
            onChange={(e) => setFilter({ ...filter, to: e.target.value || undefined })}
            aria-label="Sampai tanggal"
          />
        </div>
      </div>

      {state.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">Tag:</span>
          {state.tags.map((t) => {
            const active = filter.tagIds.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTag(t.id)}
                style={{ opacity: active ? 1 : 0.55 }}
                className="transition-opacity"
              >
                <Badge color={t.color} variant={active ? 'solid' : 'soft'}>
                  #{t.name}
                </Badge>
              </button>
            );
          })}
        </div>
      )}

      {hasActive && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setFilter({ query: '', tagIds: [] })
            }
          >
            <X size={12} />
            Bersihkan filter
          </Button>
        </div>
      )}
    </div>
  );
}
