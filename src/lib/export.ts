import type { Agenda, Category, Tag, AppState } from '@/types';
import { formatHuman } from './date';

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportJSON(state: AppState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: 'application/json',
  });
  triggerDownload(blob, `agenda-harian-${stamp()}.json`);
}

export function exportCSV(
  agendas: Agenda[],
  categories: Category[],
  tags: Tag[],
): void {
  const catById = new Map(categories.map((c) => [c.id, c.name]));
  const tagById = new Map(tags.map((t) => [t.id, t.name]));
  const header = [
    'id',
    'title',
    'date',
    'endDate',
    'allDay',
    'priority',
    'status',
    'category',
    'tags',
    'recurrence',
    'reminderMinutesBefore',
    'notes',
  ];
  const rows = agendas.map((a) => [
    a.id,
    a.title,
    a.date,
    a.endDate ?? '',
    a.allDay ? 'true' : 'false',
    a.priority,
    a.status,
    a.categoryId ? (catById.get(a.categoryId) ?? '') : '',
    a.tagIds.map((t) => tagById.get(t) ?? '').join('|'),
    a.recurrence.frequency,
    a.reminder?.minutesBefore?.toString() ?? '',
    a.notes.replace(/\r?\n/g, '\\n'),
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map(csvEscape).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, `agenda-harian-${stamp()}.csv`);
}

function csvEscape(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export async function exportPDF(
  agendas: Agenda[],
  categories: Category[],
  tags: Tag[],
): Promise<void> {
  // Lazy-load jsPDF to keep main bundle light.
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const catById = new Map(categories.map((c) => [c.id, c]));
  const tagById = new Map(tags.map((t) => [t.id, t]));

  const margin = 40;
  let y = margin;
  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();
  const contentW = pageW - margin * 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Agenda Harian', margin, y);
  y += 24;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Diekspor: ${new Date().toLocaleString('id-ID')}`, margin, y);
  doc.setTextColor(0);
  y += 20;

  const sorted = [...agendas].sort((a, b) => a.date.localeCompare(b.date));

  sorted.forEach((a, idx) => {
    if (y > pageH - margin - 80) {
      doc.addPage();
      y = margin;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const titleLines = doc.splitTextToSize(`${idx + 1}. ${a.title}`, contentW);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(90);
    doc.text(formatHuman(a.date, a.allDay), margin, y);
    y += 12;

    const meta: string[] = [
      `Prioritas: ${a.priority}`,
      `Status: ${a.status}`,
    ];
    if (a.categoryId && catById.has(a.categoryId)) {
      meta.push(`Kategori: ${catById.get(a.categoryId)!.name}`);
    }
    if (a.tagIds.length) {
      meta.push(
        `Tag: ${a.tagIds.map((t) => tagById.get(t)?.name ?? '').filter(Boolean).join(', ')}`,
      );
    }
    if (a.recurrence.frequency !== 'none') {
      meta.push(`Berulang: ${a.recurrence.frequency}`);
    }
    doc.text(meta.join('  •  '), margin, y);
    y += 12;
    doc.setTextColor(0);

    if (a.notes.trim()) {
      doc.setFontSize(10);
      const notesLines = doc.splitTextToSize(a.notes, contentW);
      for (const line of notesLines) {
        if (y > pageH - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 12;
      }
    }
    y += 10;
    doc.setDrawColor(220);
    doc.line(margin, y, pageW - margin, y);
    y += 12;
  });

  doc.save(`agenda-harian-${stamp()}.pdf`);
}

export function importJSON(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '');
        const parsed = JSON.parse(text) as AppState;
        resolve(parsed);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function stamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}
