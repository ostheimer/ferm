import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Tests fuer den Notification-Read-State-Helper. Wir mocken
 * AsyncStorage mit einer Map und importieren das Modul pro Test
 * neu, damit der modul-interne Cache geleert ist.
 */

interface LoadedModule {
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: (ids: ReadonlyArray<string>) => Promise<void>;
  resetNotificationReadState: () => Promise<void>;
  countUnread: (
    notificationIds: ReadonlyArray<string>,
    readIds: ReadonlyArray<string>
  ) => number;
}

async function loadFreshModule(initial: Record<string, string> = {}): Promise<{
  module: LoadedModule;
  storage: Map<string, string>;
  AsyncStorage: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
  };
}> {
  const storage = new Map<string, string>(Object.entries(initial));
  const AsyncStorage = {
    getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      storage.set(key, value);
    })
  };

  vi.resetModules();
  vi.doMock("@react-native-async-storage/async-storage", () => ({
    default: AsyncStorage
  }));

  const module = (await import("./notifications-read-state")) as unknown as LoadedModule & {
    _resetCacheForTests: () => void;
  };
  module._resetCacheForTests();

  return { module, storage, AsyncStorage };
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.doUnmock("@react-native-async-storage/async-storage");
});

describe("markNotificationRead", () => {
  it("schreibt die ID in AsyncStorage", async () => {
    const { module, storage } = await loadFreshModule();
    await module.markNotificationRead("n1");
    const persisted = JSON.parse(storage.get("@hege/notifications/read-ids") ?? "[]");
    expect(persisted).toEqual(["n1"]);
  });

  it("doppelte Aufrufe sind idempotent", async () => {
    const { module, storage, AsyncStorage } = await loadFreshModule();
    await module.markNotificationRead("n1");
    await module.markNotificationRead("n1");
    const persisted = JSON.parse(storage.get("@hege/notifications/read-ids") ?? "[]");
    expect(persisted).toEqual(["n1"]);
    // setItem nur einmal gerufen (zweiter Call kurz-circuitet)
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it("haengt an bestehenden Eintraegen an", async () => {
    const { module, storage } = await loadFreshModule({
      "@hege/notifications/read-ids": JSON.stringify(["old1", "old2"])
    });
    await module.markNotificationRead("new");
    const persisted = JSON.parse(storage.get("@hege/notifications/read-ids") ?? "[]");
    expect(persisted).toEqual(["old1", "old2", "new"]);
  });
});

describe("markAllNotificationsRead", () => {
  it("mergt mehrere IDs gleichzeitig", async () => {
    const { module, storage } = await loadFreshModule({
      "@hege/notifications/read-ids": JSON.stringify(["existing"])
    });
    await module.markAllNotificationsRead(["a", "b", "c"]);
    const persisted = JSON.parse(storage.get("@hege/notifications/read-ids") ?? "[]");
    expect(persisted).toEqual(["existing", "a", "b", "c"]);
  });

  it("dedupliziert beim Mergen", async () => {
    const { module, storage } = await loadFreshModule({
      "@hege/notifications/read-ids": JSON.stringify(["a", "b"])
    });
    await module.markAllNotificationsRead(["b", "c", "a"]);
    const persisted = JSON.parse(storage.get("@hege/notifications/read-ids") ?? "[]");
    expect(new Set(persisted)).toEqual(new Set(["a", "b", "c"]));
  });

  it("schreibt nicht, wenn alles bereits drin ist", async () => {
    const { module, AsyncStorage } = await loadFreshModule({
      "@hege/notifications/read-ids": JSON.stringify(["a", "b"])
    });
    await module.markAllNotificationsRead(["a", "b"]);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });
});

describe("resetNotificationReadState", () => {
  it("leert den persistierten State", async () => {
    const { module, storage } = await loadFreshModule({
      "@hege/notifications/read-ids": JSON.stringify(["a", "b"])
    });
    await module.resetNotificationReadState();
    const persisted = JSON.parse(storage.get("@hege/notifications/read-ids") ?? "[]");
    expect(persisted).toEqual([]);
  });
});

describe("countUnread", () => {
  it("zaehlt nur die nicht gelesenen IDs", async () => {
    const { module } = await loadFreshModule();
    expect(module.countUnread(["a", "b", "c", "d"], ["b", "d"])).toBe(2);
  });

  it("liefert 0, wenn alle gelesen sind", async () => {
    const { module } = await loadFreshModule();
    expect(module.countUnread(["a"], ["a"])).toBe(0);
  });

  it("liefert 0 bei leerer Notification-Liste", async () => {
    const { module } = await loadFreshModule();
    expect(module.countUnread([], ["a", "b"])).toBe(0);
  });
});
