import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

import {
  createAnsitz,
  createFallwild,
  isRecoverableMutationError,
  type CreateAnsitzRequest,
  type CreateFallwildRequest
} from "./api";

const STORAGE_KEY = "hege.offline-queue";

export type OfflineQueueStatus = "pending" | "syncing" | "failed";

interface OfflineQueueEntryBase {
  id: string;
  title: string;
  createdAt: string;
  status: OfflineQueueStatus;
  attemptCount: number;
  lastAttemptAt?: string;
  lastError?: string;
}

export interface OfflineAnsitzOperation extends OfflineQueueEntryBase {
  kind: "ansitz-create";
  payload: CreateAnsitzRequest;
}

export interface OfflineFallwildOperation extends OfflineQueueEntryBase {
  kind: "fallwild-create";
  payload: CreateFallwildRequest;
}

export type OfflineOperation = OfflineAnsitzOperation | OfflineFallwildOperation;

interface OfflineQueueSnapshot {
  hydrated: boolean;
  entries: OfflineOperation[];
  isSyncing: boolean;
}

export interface QueueMutationResult {
  mode: "sent" | "queued";
  id?: string;
  entry?: OfflineOperation;
}

const listeners = new Set<() => void>();

let snapshot: OfflineQueueSnapshot = {
  hydrated: false,
  entries: [],
  isSyncing: false
};

let hydratePromise: Promise<OfflineOperation[]> | null = null;
let syncPromise: Promise<OfflineOperation[]> | null = null;

export function getOfflineQueueSnapshot(): OfflineQueueSnapshot {
  return snapshot;
}

export function subscribeOfflineQueue(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useOfflineQueueSnapshot() {
  return useSyncExternalStore(subscribeOfflineQueue, getOfflineQueueSnapshot, getOfflineQueueSnapshot);
}

export async function hydrateOfflineQueue() {
  await ensureHydrated();
  return snapshot;
}

export async function readOfflineQueue(): Promise<OfflineOperation[]> {
  return ensureHydrated();
}

export async function submitAnsitzWithOfflineFallback(payload: CreateAnsitzRequest): Promise<QueueMutationResult> {
  try {
    const result = await createAnsitz(payload);
    void syncOfflineQueue();
    return {
      mode: "sent",
      id: result.id
    };
  } catch (error) {
    if (!isRecoverableMutationError(error)) {
      throw error;
    }

    const entry: OfflineAnsitzOperation = {
      id: createQueueId("ansitz"),
      kind: "ansitz-create",
      title: `Ansitz ${payload.standortName}`,
      createdAt: new Date().toISOString(),
      status: "pending",
      attemptCount: 0,
      payload
    };

    await appendEntry(entry);

    return {
      mode: "queued",
      entry
    };
  }
}

export async function submitFallwildWithOfflineFallback(
  payload: CreateFallwildRequest
): Promise<QueueMutationResult> {
  try {
    const result = await createFallwild(payload);
    void syncOfflineQueue();
    return {
      mode: "sent",
      id: result.id
    };
  } catch (error) {
    if (!isRecoverableMutationError(error)) {
      throw error;
    }

    const entry: OfflineFallwildOperation = {
      id: createQueueId("fallwild"),
      kind: "fallwild-create",
      title: `${payload.wildart} / ${payload.gemeinde}`,
      createdAt: new Date().toISOString(),
      status: "pending",
      attemptCount: 0,
      payload
    };

    await appendEntry(entry);

    return {
      mode: "queued",
      entry
    };
  }
}

export async function syncOfflineQueue(): Promise<OfflineOperation[]> {
  await ensureHydrated();

  if (snapshot.entries.length === 0) {
    setSnapshot({
      ...snapshot,
      isSyncing: false
    });
    return snapshot.entries;
  }

  if (syncPromise) {
    return syncPromise;
  }

  syncPromise = runQueueSync().finally(() => {
    syncPromise = null;
  });

  return syncPromise;
}

async function runQueueSync() {
  setSnapshot({
    ...snapshot,
    isSyncing: true
  });

  const initialEntries = [...snapshot.entries];

  for (const entry of [...initialEntries].reverse()) {
    await patchEntry(entry.id, {
      status: "syncing",
      lastAttemptAt: new Date().toISOString(),
      lastError: undefined
    });

    try {
      if (entry.kind === "ansitz-create") {
        await createAnsitz(entry.payload);
      } else {
        await createFallwild(entry.payload);
      }

      await removeEntry(entry.id);
    } catch (error) {
      await patchEntry(entry.id, {
        status: "failed",
        attemptCount: entry.attemptCount + 1,
        lastAttemptAt: new Date().toISOString(),
        lastError: error instanceof Error ? error.message : "Synchronisierung fehlgeschlagen."
      });

      if (!isRecoverableMutationError(error)) {
        continue;
      }
    }
  }

  setSnapshot({
    ...snapshot,
    isSyncing: false
  });

  return snapshot.entries;
}

async function appendEntry(entry: OfflineOperation) {
  const entries = await ensureHydrated();
  const nextEntries = [entry, ...entries];
  await persistEntries(nextEntries);
  return nextEntries;
}

async function removeEntry(entryId: string) {
  const entries = await ensureHydrated();
  const nextEntries = entries.filter((entry) => entry.id !== entryId);
  await persistEntries(nextEntries);
  return nextEntries;
}

async function patchEntry(entryId: string, patch: Partial<OfflineOperation>) {
  const entries = await ensureHydrated();
  const nextEntries = entries.map((entry) => {
    if (entry.id !== entryId) {
      return entry;
    }

    return {
      ...entry,
      ...patch
    } as OfflineOperation;
  });

  await persistEntries(nextEntries);
  return nextEntries;
}

async function ensureHydrated(): Promise<OfflineOperation[]> {
  if (snapshot.hydrated) {
    return snapshot.entries;
  }

  if (hydratePromise) {
    return hydratePromise;
  }

  hydratePromise = (async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const entries = parseQueue(raw);

    setSnapshot({
      entries,
      hydrated: true,
      isSyncing: false
    });

    return entries;
  })().finally(() => {
    hydratePromise = null;
  });

  return hydratePromise;
}

async function persistEntries(entries: OfflineOperation[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  setSnapshot({
    ...snapshot,
    hydrated: true,
    entries
  });
}

function parseQueue(raw: string | null): OfflineOperation[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isOfflineOperation);
  } catch {
    return [];
  }
}

function isOfflineOperation(value: unknown): value is OfflineOperation {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const entry = value as Partial<OfflineOperation>;

  return (
    typeof entry.id === "string" &&
    typeof entry.title === "string" &&
    typeof entry.createdAt === "string" &&
    typeof entry.attemptCount === "number" &&
    (entry.status === "pending" || entry.status === "syncing" || entry.status === "failed") &&
    (entry.kind === "ansitz-create" || entry.kind === "fallwild-create")
  );
}

function createQueueId(prefix: "ansitz" | "fallwild") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function setSnapshot(nextSnapshot: OfflineQueueSnapshot) {
  snapshot = nextSnapshot;

  for (const listener of listeners) {
    listener();
  }
}
