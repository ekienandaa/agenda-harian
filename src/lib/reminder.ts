import type { Agenda } from '@/types';
import { agendasInRange } from './recurrence';

/**
 * Check if browser notifications are supported and permission is granted.
 */
export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

/**
 * Return agendas whose reminder should fire "now". Uses occurrence expansion so recurring
 * agendas still trigger on each occurrence.
 */
export function dueReminders(agendas: Agenda[], now: Date): Agenda[] {
  const lookahead = 24 * 60 * 60 * 1000; // 24h window
  const from = new Date(now.getTime() - 60 * 1000); // 1m slack
  const to = new Date(now.getTime() + lookahead);
  const occ = agendasInRange(
    agendas.filter((a) => a.reminder && a.status !== 'done'),
    from,
    to,
  );
  const due: Agenda[] = [];
  for (const a of occ) {
    const rem = a.reminder;
    if (!rem) continue;
    const fireAt = new Date(new Date(a.date).getTime() - rem.minutesBefore * 60 * 1000);
    if (fireAt <= now && fireAt >= from) {
      due.push(a);
    }
  }
  return due;
}

/** Fire a browser notification. No-op if unsupported / denied. */
export function notify(agenda: Agenda): void {
  if (!notificationsSupported()) return;
  if (Notification.permission !== 'granted') return;
  try {
    const n = new Notification(`Pengingat: ${agenda.title}`, {
      body: new Date(agenda.date).toLocaleString('id-ID'),
      tag: `agenda-${agenda.id}`,
      icon: '/favicon.svg',
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {
    // ignore
  }
}
