import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthSessionResponse } from "@hege/domain";
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "hege.mobile.session";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export interface SessionSnapshot {
  status: SessionStatus;
  session: AuthSessionResponse | null;
  hydrated: boolean;
}

const listeners = new Set<() => void>();

let snapshot: SessionSnapshot = {
  status: "loading",
  session: null,
  hydrated: false
};

export function getSessionSnapshot(): SessionSnapshot {
  return snapshot;
}

export function getSession(): AuthSessionResponse | null {
  return snapshot.session;
}

export function getAccessToken(): string | null {
  return snapshot.session?.tokens.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return snapshot.session?.tokens.refreshToken ?? null;
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSessionSnapshot() {
  return useSyncExternalStore(subscribe, getSessionSnapshot, getSessionSnapshot);
}

export async function restoreSession() {
  if (snapshot.hydrated) {
    return snapshot;
  }

  const rawSession = await AsyncStorage.getItem(STORAGE_KEY);

  if (!rawSession) {
    setSnapshot({
      status: "unauthenticated",
      session: null,
      hydrated: true
    });

    return snapshot;
  }

  try {
    const session = JSON.parse(rawSession) as AuthSessionResponse;

    setSnapshot({
      status: "authenticated",
      session,
      hydrated: true
    });
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setSnapshot({
      status: "unauthenticated",
      session: null,
      hydrated: true
    });
  }

  return snapshot;
}

export async function saveSession(session: AuthSessionResponse) {
  setSnapshot({
    status: "authenticated",
    session,
    hydrated: true
  });

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

export async function clearSession() {
  setSnapshot({
    status: "unauthenticated",
    session: null,
    hydrated: true
  });

  await AsyncStorage.removeItem(STORAGE_KEY);
}

function setSnapshot(nextSnapshot: SessionSnapshot) {
  snapshot = nextSnapshot;

  for (const listener of listeners) {
    listener();
  }
}
