import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import type { PhotoAsset } from "@hege/domain";

import {
  createAnsitz,
  createFallwild,
  isRecoverableMutationError,
  type CreateAnsitzRequest,
  type CreateFallwildRequest
} from "./api";

const STORAGE_KEY = "hege.offline-queue";

export type OfflineQueueStatus = "pending" | "syncing" | "uploading" | "failed" | "conflict";

export interface LocalPendingPhoto {
  id: string;
  uri: string;
  fileName: string;
  mimeType: "image/jpeg" | "image/png";
  title?: string;
}

interface OfflineQueueEntryBase {
  id: string;
  title: string;
  createdAt: string;
  status: OfflineQueueStatus;
  attemptCount: number;
  lastAttemptAt?: string;
  lastError?: string;
}

interface QueuedFallwildCreatePayload extends CreateFallwildRequest {
  attachments?: LocalPendingPhoto[];
}

export interface OfflineAnsitzOperation extends OfflineQueueEntryBase {
  kind: "ansitz-create";
  payload: CreateAnsitzRequest;
}

export interface OfflineFallwildOperation extends OfflineQueueEntryBase {
  kind: "fallwild-create";
  payload: QueuedFallwildCreatePayload;
}

export interface OfflineFallwildPhotoUploadOperation extends OfflineQueueEntryBase {
  kind: "fallwild-photo-upload";
  fallwildId: string;
  attachment: LocalPendingPhoto;
}

export type OfflineOperation = OfflineAnsitzOperation | OfflineFallwildOperation | OfflineFallwildPhotoUploadOperation;

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
  payload: CreateFallwildRequest,
  attachments: LocalPendingPhoto[] = []
): Promise<QueueMutationResult> {
  try {
    const result = await createFallwild(payload);
    if (attachments.length > 0) {
      await queueFallwildPhotoUploads(result.id, attachments);
      void syncOfflineQueue();
    }

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
      title: attachments.length > 0 ? `${payload.wildart} / ${payload.gemeinde} (${attachments.length} Foto(s))` : `${payload.wildart} / ${payload.gemeinde}`,
      createdAt: new Date().toISOString(),
      status: "pending",
      attemptCount: 0,
      payload: {
        ...payload,
        attachments: cloneAttachments(attachments)
      }
    };

    await appendEntry(entry);

    return {
      mode: "queued",
      entry
    };
  }
}

export async function queueFallwildPhotoUploads(
  fallwildId: string,
  attachments: LocalPendingPhoto[]
): Promise<OfflineOperation[]> {
  await ensureHydrated();

  if (attachments.length === 0) {
    return snapshot.entries;
  }

  const nextEntries = [
    ...attachments.map<OfflineFallwildPhotoUploadOperation>((attachment) => ({
      id: createQueueId("fallwild-photo"),
      kind: "fallwild-photo-upload",
      title: attachment.title ?? attachment.fileName,
      createdAt: new Date().toISOString(),
      status: "pending",
      attemptCount: 0,
      fallwildId,
      attachment: cloneAttachment(attachment)
    })),
    ...snapshot.entries
  ];

  await persistEntries(nextEntries);
  return nextEntries;
}

export async function discardOfflineQueueEntry(entryId: string): Promise<OfflineOperation[]> {
  await ensureHydrated();
  return removeEntry(entryId);
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
    try {
      if (entry.kind === "ansitz-create") {
        await patchEntry(entry.id, syncPatch("syncing"));
        await createAnsitz(entry.payload);
        await removeEntry(entry.id);
      } else if (entry.kind === "fallwild-create") {
        await patchEntry(entry.id, syncPatch("syncing"));
        const created = await createFallwild(stripAttachments(entry.payload));

        await removeEntry(entry.id);

        const attachments = entry.payload.attachments ?? [];
        if (attachments.length > 0) {
          await queueFallwildPhotoUploads(created.id, attachments);
        }
      } else {
        await patchEntry(entry.id, syncPatch("uploading"));
        await uploadFallwildPhoto(entry.fallwildId, entry.attachment);
        await removeEntry(entry.id);
      }
    } catch (error) {
      await patchEntry(entry.id, failurePatch(entry.attemptCount + 1, error));
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

function syncPatch(status: "syncing" | "uploading") {
  return {
    status,
    lastAttemptAt: new Date().toISOString(),
    lastError: undefined
  } satisfies Partial<OfflineOperation>;
}

function failurePatch(attemptCount: number, error: unknown): Partial<OfflineOperation> {
  const conflict = isConflictError(error);

  return {
    status: conflict ? "conflict" : "failed",
    attemptCount,
    lastAttemptAt: new Date().toISOString(),
    lastError: error instanceof Error ? error.message : "Synchronisierung fehlgeschlagen."
  } satisfies Partial<OfflineOperation>;
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

  const hasValidPayload =
    entry.kind === "ansitz-create"
      ? isCreateAnsitzPayload(entry.payload)
      : entry.kind === "fallwild-create"
        ? isQueuedFallwildCreatePayload(entry.payload)
        : isOfflineFallwildPhotoUploadPayload(entry);

  return (
    typeof entry.id === "string" &&
    typeof entry.title === "string" &&
    typeof entry.createdAt === "string" &&
    typeof entry.attemptCount === "number" &&
    (entry.status === "pending" || entry.status === "syncing" || entry.status === "uploading" || entry.status === "failed" || entry.status === "conflict") &&
    (entry.kind === "ansitz-create" || entry.kind === "fallwild-create" || entry.kind === "fallwild-photo-upload") &&
    hasValidPayload
  );
}

function createQueueId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function cloneAttachment(attachment: LocalPendingPhoto): LocalPendingPhoto {
  return {
    ...attachment
  };
}

function cloneAttachments(attachments: LocalPendingPhoto[]): LocalPendingPhoto[] {
  return attachments.map(cloneAttachment);
}

function stripAttachments(payload: QueuedFallwildCreatePayload): CreateFallwildRequest {
  const { attachments: _attachments, ...createPayload } = payload;
  return createPayload;
}

async function uploadFallwildPhoto(fallwildId: string, attachment: LocalPendingPhoto) {
  const api = await import("./api");
  const uploader = (api as typeof api & {
    uploadFallwildPhoto?: (fallwildId: string, attachment: LocalPendingPhoto) => Promise<{ photo: PhotoAsset }>;
  }).uploadFallwildPhoto;

  if (!uploader) {
    throw Object.assign(new Error("Foto-Upload ist nicht verfuegbar."), {
      status: 503,
      code: "service-unavailable"
    });
  }

  await uploader(fallwildId, attachment);
}

function isConflictError(error: unknown) {
  if (error instanceof Error) {
    const status = typeof (error as { status?: number }).status === "number" ? (error as { status?: number }).status : undefined;
    const code = typeof (error as { code?: string }).code === "string" ? (error as { code?: string }).code : undefined;

    return status === 409 || code === "conflict";
  }

  return false;
}

function isCreateAnsitzPayload(value: unknown): value is CreateAnsitzRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const payload = value as Partial<CreateAnsitzRequest>;

  return typeof payload.standortName === "string" && payload.location != null;
}

function isQueuedFallwildCreatePayload(value: unknown): value is QueuedFallwildCreatePayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const payload = value as Partial<QueuedFallwildCreatePayload>;

  return (
    typeof payload.wildart === "string" &&
    typeof payload.geschlecht === "string" &&
    typeof payload.altersklasse === "string" &&
    typeof payload.bergungsStatus === "string" &&
    typeof payload.gemeinde === "string" &&
    payload.location != null &&
    (payload.attachments == null || (Array.isArray(payload.attachments) && payload.attachments.every(isLocalPendingPhoto)))
  );
}

function isOfflineFallwildPhotoUploadPayload(value: unknown): value is OfflineFallwildPhotoUploadOperation {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const payload = value as Partial<OfflineFallwildPhotoUploadOperation>;

  return (
    typeof payload.fallwildId === "string" &&
    isLocalPendingPhoto(payload.attachment)
  );
}

function isLocalPendingPhoto(value: unknown): value is LocalPendingPhoto {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const photo = value as Partial<LocalPendingPhoto>;

  return (
    typeof photo.id === "string" &&
    typeof photo.uri === "string" &&
    typeof photo.fileName === "string" &&
    (photo.mimeType === "image/jpeg" || photo.mimeType === "image/png") &&
    (photo.title == null || typeof photo.title === "string")
  );
}

function setSnapshot(nextSnapshot: OfflineQueueSnapshot) {
  snapshot = nextSnapshot;

  for (const listener of listeners) {
    listener();
  }
}
