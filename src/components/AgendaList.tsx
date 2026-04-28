import { useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { Agenda, AppState } from '@/types';
import type { AppActions } from '@/hooks/useAppState';
import { AgendaCard } from './AgendaCard';
import { EmptyState } from './EmptyState';
import { ConfirmDialog } from './ui/ConfirmDialog';

export interface AgendaListProps {
  agendas: Agenda[];
  state: AppState;
  actions: AppActions;
  onEdit: (a: Agenda) => void;
  allowReorder?: boolean;
}

function SortableAgenda({
  agenda,
  state,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
}: {
  agenda: Agenda;
  state: AppState;
  onEdit: (a: Agenda) => void;
  onDelete: (a: Agenda) => void;
  onDuplicate: (a: Agenda) => void;
  onToggleStatus: (a: Agenda) => void;
}) {
  const sortable = useSortable({ id: agenda.id });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };
  return (
    <div ref={sortable.setNodeRef} style={style}>
      <AgendaCard
        agenda={agenda}
        state={state}
        onEdit={onEdit}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onToggleStatus={onToggleStatus}
        isDragging={sortable.isDragging}
        dragHandleProps={{
          ref: sortable.setActivatorNodeRef,
          ...sortable.attributes,
          ...sortable.listeners,
        }}
      />
    </div>
  );
}

export function AgendaList({
  agendas,
  state,
  actions,
  onEdit,
  allowReorder = true,
}: AgendaListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const [toDelete, setToDelete] = useState<Agenda | null>(null);

  // Only original agendas (no occurrence suffix) are reorderable.
  const baseIds = useMemo(
    () => agendas.filter((a) => !a.id.includes('::')).map((a) => a.id),
    [agendas],
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = baseIds.indexOf(String(active.id));
    const newIndex = baseIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const newOrder = arrayMove(baseIds, oldIndex, newIndex);
    actions.reorderAgendas(newOrder);
  };

  if (agendas.length === 0) {
    return <EmptyState />;
  }

  const canReorder = allowReorder && baseIds.length === agendas.length;

  if (canReorder) {
    return (
      <>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={baseIds} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-2">
              {agendas.map((a) => (
                <li key={a.id}>
                  <SortableAgenda
                    agenda={a}
                    state={state}
                    onEdit={onEdit}
                    onDelete={setToDelete}
                    onDuplicate={(x) => actions.duplicateAgenda(x.id)}
                    onToggleStatus={(x) => actions.toggleStatus(x.id)}
                  />
                </li>
              ))}
            </ul>
          </SortableContext>
        </DndContext>
        <ConfirmDialog
          open={!!toDelete}
          title="Hapus agenda?"
          description={toDelete ? `Agenda "${toDelete.title}" akan dihapus permanen.` : ''}
          confirmLabel="Hapus"
          danger
          onConfirm={() => toDelete && actions.deleteAgenda(toDelete.id)}
          onClose={() => setToDelete(null)}
        />
      </>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-2">
        {agendas.map((a) => (
          <li key={a.id}>
            <AgendaCard
              agenda={a}
              state={state}
              onEdit={onEdit}
              onDelete={setToDelete}
              onDuplicate={(x) => actions.duplicateAgenda(x.id.split('::')[0]!)}
              onToggleStatus={(x) => actions.toggleStatus(x.id.split('::')[0]!)}
            />
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={!!toDelete}
        title="Hapus agenda?"
        description={toDelete ? `Agenda "${toDelete.title}" akan dihapus permanen.` : ''}
        confirmLabel="Hapus"
        danger
        onConfirm={() => toDelete && actions.deleteAgenda(toDelete.id.split('::')[0]!)}
        onClose={() => setToDelete(null)}
      />
    </>
  );
}
