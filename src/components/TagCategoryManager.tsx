import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { AppState } from '@/types';
import type { AppActions } from '@/hooks/useAppState';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { ConfirmDialog } from './ui/ConfirmDialog';

export interface TagCategoryManagerProps {
  open: boolean;
  onClose: () => void;
  state: AppState;
  actions: AppActions;
}

type Tab = 'categories' | 'tags';

export function TagCategoryManager({
  open,
  onClose,
  state,
  actions,
}: TagCategoryManagerProps) {
  const [tab, setTab] = useState<Tab>('categories');
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
    kind: Tab;
  } | null>(null);

  const add = () => {
    const name = newName.trim();
    if (!name) return;
    if (tab === 'categories') actions.addCategory(name, newColor);
    else actions.addTag(name, newColor);
    setNewName('');
  };

  const items = tab === 'categories' ? state.categories : state.tags;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Kelola kategori & tag"
        size="md"
      >
        <div className="flex gap-1 mb-4">
          <button
            onClick={() => setTab('categories')}
            className={tabBtn(tab === 'categories')}
          >
            Kategori ({state.categories.length})
          </button>
          <button
            onClick={() => setTab('tags')}
            className={tabBtn(tab === 'tags')}
          >
            Tag ({state.tags.length})
          </button>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add();
              }
            }}
            placeholder={tab === 'categories' ? 'Nama kategori baru' : 'Nama tag baru'}
          />
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="h-9 w-10 rounded border border-slate-300 dark:border-slate-700 cursor-pointer bg-transparent"
            aria-label="Warna"
          />
          <Button variant="primary" onClick={add}>
            <Plus size={14} />
            Tambah
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">
            Belum ada {tab === 'categories' ? 'kategori' : 'tag'}.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-2 py-2">
                <input
                  type="color"
                  value={item.color}
                  onChange={(e) => {
                    if (tab === 'categories')
                      actions.updateCategory(item.id, { color: e.target.value });
                    else actions.updateTag(item.id, { color: e.target.value });
                  }}
                  className="h-7 w-9 rounded border border-slate-300 dark:border-slate-700 cursor-pointer bg-transparent"
                  aria-label="Warna"
                />
                <Input
                  value={item.name}
                  onChange={(e) => {
                    if (tab === 'categories')
                      actions.updateCategory(item.id, { name: e.target.value });
                    else actions.updateTag(item.id, { name: e.target.value });
                  }}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setDeleteConfirm({ id: item.id, name: item.name, kind: tab })
                  }
                  aria-label="Hapus"
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteConfirm}
        title={`Hapus ${deleteConfirm?.kind === 'categories' ? 'kategori' : 'tag'}?`}
        description={
          deleteConfirm
            ? `“${deleteConfirm.name}” akan dihapus. Agenda yang menggunakannya akan tetap ada, tapi referensinya dilepas.`
            : ''
        }
        confirmLabel="Hapus"
        danger
        onConfirm={() => {
          if (!deleteConfirm) return;
          if (deleteConfirm.kind === 'categories')
            actions.deleteCategory(deleteConfirm.id);
          else actions.deleteTag(deleteConfirm.id);
        }}
        onClose={() => setDeleteConfirm(null)}
      />
    </>
  );
}

function tabBtn(active: boolean): string {
  return [
    'px-3 py-1.5 text-sm font-medium rounded-md',
    active
      ? 'bg-brand-600 text-white'
      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
  ].join(' ');
}
