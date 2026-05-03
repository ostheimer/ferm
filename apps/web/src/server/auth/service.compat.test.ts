import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    execute: vi.fn(),
    select: vi.fn()
  }
}));

vi.mock("../db/client", () => ({
  getDb: () => mockDb
}));

vi.mock("../env", () => ({
  getServerEnv: () => ({
    authTokenSecret: "compat-secret",
    demoPassword: "9526",
    useDemoStore: false
  })
}));

import { memberships, reviere, users } from "../db/schema";
import { hashPassword } from "./passwords";
import { login, resolveAuthContext } from "./service";

describe("auth service legacy schema compatibility", () => {
  beforeEach(() => {
    mockDb.execute.mockReset();
    mockDb.select.mockImplementation(() => createSelectBuilder());
  });

  it("logs in with a derived username when users.username is missing", async () => {
    mockDb.execute.mockImplementation(createSeedSyncThenLegacyUserExecuteMock());

    const session = await login({
      identifier: "ostheimer",
      pin: "9526"
    });

    expect(session.user.email).toBe("andreas@ostheimer.at");
    expect(session.user.username).toBe("ostheimer");
    expect(session.membership.role).toBe("ausgeher");
    expect(mockDb.execute).toHaveBeenCalled();
  });

  it("resolves auth context from a legacy users table without username", async () => {
    mockDb.execute.mockResolvedValueOnce({
      rows: [createLegacyUserRow()]
    });

    const context = await resolveAuthContext({
      membershipId: "member-ausgeher",
      revierId: "revier-attersee",
      role: "ausgeher",
      userId: "user-steyrer"
    });

    expect(context.user.email).toBe("andreas@ostheimer.at");
    expect(context.user.username).toBe("ostheimer");
    expect(context.revier.name).toBe("Jagdgesellschaft Gänserndorf");
  });

  it("syncs known seed users on legacy schemas before login", async () => {
    mockDb.execute.mockImplementation(createSeedSyncThenLegacyUserExecuteMock());

    const session = await login({
      identifier: "ostheimer",
      pin: "9526"
    });

    expect(session.user.email).toBe("andreas@ostheimer.at");
    expect(mockDb.execute).toHaveBeenCalled();
  });
});

function createSelectBuilder() {
  return {
    from(table: unknown) {
      if (table === users) {
        return {
          where() {
            return {
              async limit() {
                throw Object.assign(new Error('column "username" does not exist'), {
                  code: "42703"
                });
              }
            };
          }
        };
      }

      if (table === memberships) {
        return {
          async where() {
            return [
              {
                id: "member-ausgeher",
                jagdzeichen: "AO-01",
                pushEnabled: true,
                revierId: "revier-attersee",
                role: "ausgeher",
                userId: "user-steyrer"
              }
            ];
          }
        };
      }

      if (table === reviere) {
        return {
          where() {
            return {
              async limit() {
                return [
                  {
                    bezirk: "Gänserndorf",
                    bundesland: "Niederösterreich",
                    flaecheHektar: 2150,
                    id: "revier-attersee",
                    name: "Jagdgesellschaft Gänserndorf",
                    tenantKey: "gaenserndorf",
                    zentrumLabel: "Gänserndorf",
                    zentrumLat: 48.3394,
                    zentrumLng: 16.7202
                  }
                ];
              }
            };
          }
        };
      }

      throw new Error("Unexpected table access in auth compatibility test.");
    }
  };
}

function createSeedSyncThenLegacyUserExecuteMock() {
  let callCount = 0;

  return async () => {
    callCount += 1;

    if (callCount === 1) {
      return { rows: [{ hasSetupCompletedAt: false }] };
    }

    if (callCount === 3) {
      return { rows: [{ hasUsername: false }] };
    }

    if (callCount === 12) {
      return { rows: [createLegacyUserRow()] };
    }

    return { rows: [] };
  };
}

function createLegacyUserRow() {
  return {
    email: "andreas@ostheimer.at",
    id: "user-steyrer",
    name: "Andreas Ostheimer",
    passwordHash: hashPassword("9526"),
    phone: "+43 660 0000000",
    username: "ostheimer"
  };
}
