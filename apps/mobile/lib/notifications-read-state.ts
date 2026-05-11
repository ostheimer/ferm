import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

/**
 * Lokale Verwaltung des "gelesen"-Status von Benachrichtigungen (P2.3).
 *
 * Der Backend-Notification-Schema in `@hege/domain` traegt aktuell
 * keinen per-User-Read-State. Wir loesen das clientseitig: gelesene
 * IDs landen im AsyncStorage, ein React-Hook stellt sie der UI zur
 * Verfuegung und schickt Aenderungen an Listener.
 *
 * Vorteile dieses Ansatzes:
 * - Kein Backend-Change noetig.
 * - Bei mehreren Devices kein Sync — das ist okay, weil "gelesen"
 *   eine Bequemlichkeits-Markierung ist, keine Vertragspflicht.
 * - Gleicher API-Vertrag, wenn wir spaeter auf Server-State umstellen
 *   (`getReadIds`/`markRead`/`markAllRead` koennen API-Calls werden).
 */

const STORAGE_KEY = "@hege/notifications/read-ids";

type Listener = (readIds: ReadonlyArray<string>) => void;

const listeners = new Set<Listener>();
let cachedReadIds: ReadonlyArray<string> | null = null;

async function loadReadIds(): Promise<ReadonlyArray<string>> {
  if (cachedReadIds !== null) {
    return cachedReadIds;
  }

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cachedReadIds = [];
      return cachedReadIds;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((value) => typeof value === "string")) {
      cachedReadIds = parsed;
      return cachedReadIds;
    }

    cachedReadIds = [];
    return cachedReadIds;
  } catch {
    cachedReadIds = [];
    return cachedReadIds;
  }
}

async function persistReadIds(ids: ReadonlyArray<string>): Promise<void> {
  cachedReadIds = ids;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Bei Storage-Fehlern bleibt der Cache aktuell — die UI ist
    // konsistent, beim naechsten App-Start ist der Stand verloren.
    // Das ist akzeptable Degradation.
  }
  listeners.forEach((listener) => listener(ids));
}

/**
 * Markiert eine Notification als gelesen. Idempotent — doppelte Calls
 * sind harmlos.
 */
export async function markNotificationRead(id: string): Promise<void> {
  const current = await loadReadIds();
  if (current.includes(id)) {
    return;
  }
  await persistReadIds([...current, id]);
}

/**
 * Markiert alle uebergebenen IDs als gelesen. Wird vom "Alle als gelesen
 * markieren"-Button verwendet — der Aufrufer uebergibt die aktuell
 * sichtbaren Notification-IDs.
 */
export async function markAllNotificationsRead(ids: ReadonlyArray<string>): Promise<void> {
  const current = await loadReadIds();
  const merged = new Set([...current, ...ids]);
  if (merged.size === current.length) {
    return;
  }
  await persistReadIds(Array.from(merged));
}

/**
 * Setzt den Read-State zurueck. Hauptsaechlich fuer Tests +
 * "Notifications zuruecksetzen"-Aktion in einem zukuenftigen
 * Settings-Bereich.
 */
export async function resetNotificationReadState(): Promise<void> {
  await persistReadIds([]);
}

/**
 * Hook: liefert die aktuelle Read-ID-Liste und reagiert auf
 * Aenderungen ueber `markNotificationRead` / `markAllNotificationsRead`.
 * Initiale Liste wird beim ersten Mount asynchron geladen.
 */
export function useReadNotificationIds(): ReadonlyArray<string> {
  const [ids, setIds] = useState<ReadonlyArray<string>>(cachedReadIds ?? []);

  useEffect(() => {
    let isMounted = true;

    void loadReadIds().then((loaded) => {
      if (isMounted) {
        setIds(loaded);
      }
    });

    const listener: Listener = (next) => {
      if (isMounted) {
        setIds(next);
      }
    };
    listeners.add(listener);

    return () => {
      isMounted = false;
      listeners.delete(listener);
    };
  }, []);

  return ids;
}

/**
 * Berechnet, welche der uebergebenen Notification-IDs noch nicht
 * gelesen sind. Wird vom Aufrufer kombiniert, um den Badge-Counter
 * zu setzen.
 */
export function countUnread(
  notificationIds: ReadonlyArray<string>,
  readIds: ReadonlyArray<string>
): number {
  const readSet = new Set(readIds);
  return notificationIds.filter((id) => !readSet.has(id)).length;
}

/**
 * Hilfsfunktion fuer Test-Setup: leert den In-Memory-Cache. Nur in
 * Tests aufrufen, in der App nicht noetig.
 */
export function _resetCacheForTests(): void {
  cachedReadIds = null;
  listeners.clear();
}
