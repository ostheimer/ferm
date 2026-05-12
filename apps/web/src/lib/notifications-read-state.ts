/**
 * Web-Pendant zum Mobile-Notification-Read-State (P2.3).
 *
 * Speichert die IDs gelesener Benachrichtigungen im `localStorage`.
 * Verhaelt sich SSR-sicher (kein Zugriff vor Mount). Listener-Hook
 * fuer die Client-Komponente.
 */

const STORAGE_KEY = "hege.web.notifications.read-ids";

type Listener = (readIds: ReadonlyArray<string>) => void;

const listeners = new Set<Listener>();

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getReadNotificationIds(): ReadonlyArray<string> {
  if (!isBrowser()) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((value) => typeof value === "string")) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

function persist(ids: ReadonlyArray<string>): void {
  if (!isBrowser()) {
    listeners.forEach((listener) => listener(ids));
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage voll oder disabled — UI bleibt konsistent, nach Reload weg.
  }
  listeners.forEach((listener) => listener(ids));
}

export function markNotificationRead(id: string): void {
  const current = getReadNotificationIds();
  if (current.includes(id)) {
    return;
  }
  persist([...current, id]);
}

export function markAllNotificationsRead(ids: ReadonlyArray<string>): void {
  const current = getReadNotificationIds();
  const merged = new Set([...current, ...ids]);
  if (merged.size === current.length) {
    return;
  }
  persist(Array.from(merged));
}

export function resetNotificationReadState(): void {
  persist([]);
}

export function countUnread(
  notificationIds: ReadonlyArray<string>,
  readIds: ReadonlyArray<string>
): number {
  const readSet = new Set(readIds);
  return notificationIds.filter((id) => !readSet.has(id)).length;
}

/**
 * React-Hook fuer Client-Components. Lazy-importiert React — der File
 * bleibt damit auch fuer Pure-Test-Runs nutzbar, wo kein React-Tree
 * existiert.
 */
export function subscribeReadIds(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
