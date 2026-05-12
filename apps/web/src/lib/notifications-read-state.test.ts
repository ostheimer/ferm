import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  countUnread,
  getReadNotificationIds,
  markAllNotificationsRead,
  markNotificationRead,
  resetNotificationReadState
} from "./notifications-read-state";

const STORAGE_KEY = "hege.web.notifications.read-ids";

beforeEach(() => {
  // jsdom-like localStorage simulieren — Vitest "node"-Env hat keinen,
  // also legen wir einen minimalen Stub an.
  const store = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      }
    }
  });
});

describe("getReadNotificationIds", () => {
  it("liefert leeres Array, wenn Storage leer", () => {
    expect(getReadNotificationIds()).toEqual([]);
  });

  it("liefert das gespeicherte Array", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(["a", "b"]));
    expect(getReadNotificationIds()).toEqual(["a", "b"]);
  });

  it("ignoriert kaputtes JSON", () => {
    window.localStorage.setItem(STORAGE_KEY, "not json");
    expect(getReadNotificationIds()).toEqual([]);
  });

  it("ignoriert Nicht-String-Arrays", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 2, 3]));
    expect(getReadNotificationIds()).toEqual([]);
  });
});

describe("markNotificationRead", () => {
  it("schreibt die ID in localStorage", () => {
    markNotificationRead("n1");
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]")).toEqual(["n1"]);
  });

  it("ist idempotent", () => {
    markNotificationRead("n1");
    markNotificationRead("n1");
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]")).toEqual(["n1"]);
  });

  it("appendet an bestehende IDs", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(["old"]));
    markNotificationRead("new");
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]")).toEqual(["old", "new"]);
  });
});

describe("markAllNotificationsRead", () => {
  it("mergt mehrere IDs", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(["a"]));
    markAllNotificationsRead(["b", "c"]);
    expect(new Set(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]"))).toEqual(
      new Set(["a", "b", "c"])
    );
  });

  it("dedupliziert", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(["a", "b"]));
    markAllNotificationsRead(["b", "c"]);
    expect(new Set(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]"))).toEqual(
      new Set(["a", "b", "c"])
    );
  });

  it("schreibt nicht, wenn nichts neu", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(["a", "b"]));
    const before = window.localStorage.getItem(STORAGE_KEY);
    markAllNotificationsRead(["a", "b"]);
    const after = window.localStorage.getItem(STORAGE_KEY);
    expect(after).toBe(before);
  });
});

describe("resetNotificationReadState", () => {
  it("leert den State", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(["a", "b"]));
    resetNotificationReadState();
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]")).toEqual([]);
  });
});

describe("countUnread", () => {
  it("zaehlt ungelesene", () => {
    expect(countUnread(["a", "b", "c"], ["a"])).toBe(2);
  });

  it("0 wenn alle gelesen", () => {
    expect(countUnread(["a"], ["a"])).toBe(0);
  });

  it("0 bei leerer Notification-Liste", () => {
    expect(countUnread([], ["a"])).toBe(0);
  });
});
