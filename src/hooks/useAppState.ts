import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppState, Agenda, Category, Tag } from '@/types';
import { loadState, saveState, defaultState } from '@/lib/storage';
import { nowIso, uid, colorForString } from '@/lib/utils';

export interface AppActions {
  addAgenda: (a: Omit<Agenda, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => Agenda;
  updateAgenda: (id: string, patch: Partial<Agenda>) => void;
  deleteAgenda: (id: string) => void;
  duplicateAgenda: (id: string) => void;
  toggleStatus: (id: string) => void;
  reorderAgendas: (orderedIds: string[]) => void;

  addCategory: (name: string, color?: string) => Category;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addTag: (name: string, color?: string) => Tag;
  updateTag: (id: string, patch: Partial<Tag>) => void;
  deleteTag: (id: string) => void;

  setTheme: (t: AppState['theme']) => void;
  setLastReminderCheck: (iso: string) => void;

  replaceAll: (next: AppState) => void;
  resetAll: () => void;
}

export function useAppState(): [AppState, AppActions] {
  const [state, setState] = useState<AppState>(() => loadState());
  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
    }
    saveState(state);
  }, [state]);

  // Cross-tab sync
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'agenda-harian:v1' && e.newValue) {
        try {
          setState(JSON.parse(e.newValue) as AppState);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const addAgenda = useCallback<AppActions['addAgenda']>((a) => {
    const agenda: Agenda = {
      ...a,
      id: uid(),
      order: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    setState((s) => {
      const withNew = [agenda, ...s.agendas].map((x, i) => ({ ...x, order: i }));
      return { ...s, agendas: withNew };
    });
    return agenda;
  }, []);

  const updateAgenda = useCallback<AppActions['updateAgenda']>((id, patch) => {
    setState((s) => ({
      ...s,
      agendas: s.agendas.map((a) =>
        a.id === id ? { ...a, ...patch, updatedAt: nowIso() } : a,
      ),
    }));
  }, []);

  const deleteAgenda = useCallback<AppActions['deleteAgenda']>((id) => {
    setState((s) => ({ ...s, agendas: s.agendas.filter((a) => a.id !== id) }));
  }, []);

  const duplicateAgenda = useCallback<AppActions['duplicateAgenda']>((id) => {
    setState((s) => {
      const src = s.agendas.find((a) => a.id === id);
      if (!src) return s;
      const copy: Agenda = {
        ...src,
        id: uid(),
        title: `${src.title} (salinan)`,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        order: 0,
      };
      const withNew = [copy, ...s.agendas].map((x, i) => ({ ...x, order: i }));
      return { ...s, agendas: withNew };
    });
  }, []);

  const toggleStatus = useCallback<AppActions['toggleStatus']>((id) => {
    setState((s) => ({
      ...s,
      agendas: s.agendas.map((a) =>
        a.id === id
          ? {
              ...a,
              status: a.status === 'done' ? 'todo' : 'done',
              updatedAt: nowIso(),
            }
          : a,
      ),
    }));
  }, []);

  const reorderAgendas = useCallback<AppActions['reorderAgendas']>((orderedIds) => {
    setState((s) => {
      const byId = new Map(s.agendas.map((a) => [a.id, a]));
      const reordered: Agenda[] = [];
      orderedIds.forEach((id, i) => {
        const a = byId.get(id);
        if (a) reordered.push({ ...a, order: i });
      });
      // append any that weren't in the list (safety)
      s.agendas.forEach((a) => {
        if (!orderedIds.includes(a.id)) {
          reordered.push({ ...a, order: reordered.length });
        }
      });
      return { ...s, agendas: reordered };
    });
  }, []);

  const addCategory = useCallback<AppActions['addCategory']>((name, color) => {
    const cat: Category = { id: uid(), name, color: color ?? colorForString(name) };
    setState((s) => ({ ...s, categories: [...s.categories, cat] }));
    return cat;
  }, []);

  const updateCategory = useCallback<AppActions['updateCategory']>((id, patch) => {
    setState((s) => ({
      ...s,
      categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const deleteCategory = useCallback<AppActions['deleteCategory']>((id) => {
    setState((s) => ({
      ...s,
      categories: s.categories.filter((c) => c.id !== id),
      agendas: s.agendas.map((a) =>
        a.categoryId === id ? { ...a, categoryId: undefined } : a,
      ),
    }));
  }, []);

  const addTag = useCallback<AppActions['addTag']>((name, color) => {
    const tag: Tag = { id: uid(), name, color: color ?? colorForString(name) };
    setState((s) => ({ ...s, tags: [...s.tags, tag] }));
    return tag;
  }, []);

  const updateTag = useCallback<AppActions['updateTag']>((id, patch) => {
    setState((s) => ({
      ...s,
      tags: s.tags.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }, []);

  const deleteTag = useCallback<AppActions['deleteTag']>((id) => {
    setState((s) => ({
      ...s,
      tags: s.tags.filter((t) => t.id !== id),
      agendas: s.agendas.map((a) => ({
        ...a,
        tagIds: a.tagIds.filter((tid) => tid !== id),
      })),
    }));
  }, []);

  const setTheme = useCallback<AppActions['setTheme']>((t) => {
    setState((s) => ({ ...s, theme: t }));
  }, []);

  const setLastReminderCheck = useCallback<AppActions['setLastReminderCheck']>(
    (iso) => {
      setState((s) => ({ ...s, lastReminderCheck: iso }));
    },
    [],
  );

  const replaceAll = useCallback<AppActions['replaceAll']>((next) => {
    setState(next);
  }, []);

  const resetAll = useCallback<AppActions['resetAll']>(() => {
    setState(defaultState());
  }, []);

  const actions: AppActions = {
    addAgenda,
    updateAgenda,
    deleteAgenda,
    duplicateAgenda,
    toggleStatus,
    reorderAgendas,
    addCategory,
    updateCategory,
    deleteCategory,
    addTag,
    updateTag,
    deleteTag,
    setTheme,
    setLastReminderCheck,
    replaceAll,
    resetAll,
  };

  return [state, actions];
}
