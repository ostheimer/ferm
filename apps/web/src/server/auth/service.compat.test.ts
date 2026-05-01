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
    mockDb.execute.mockResolvedValueOnce({
      rows: [createLegacyUserRow()]
    });

    const session = await login({
      identifier: "ostheimer",
      pin: "9526"
    });

    expect(session.user.email).toBe("andreas@ostheimer.at");
    expect(session.user.username).toBe("ostheimer");
    expect(session.membership.role).toBe("revier-admin");
    expect(mockDb.execute).toHaveBeenCalledTimes(1);
  });

  it("resolves auth context from a legacy users table without username", async () => {
    mockDb.execute.mockResolvedValueOnce({
      rows: [createLegacyUserRow()]
    });

    const context = await resolveAuthContext({
      membershipId: "member-admin",
      revierId: "revier-attersee",
      role: "revier-admin",
      userId: "user-steyrer"
    });

    expect(context.user.email).toBe("andreas@ostheimer.at");
    expect(context.user.username).toBe("ostheimer");
    expect(context.revier.name).toBe("Jagdgesellschaft Attersee Nord");
  });

  it("repairs known seed users on legacy schemas before retrying login", async () => {
    let callCount = 0;
    mockDb.execute.mockImplementation(async () => {
      callCount += 1;

      if (callCount === 1) {
        return { rows: [] };
      }

      if (callCount === 2) {
        return {
          rows: [{ hasUsername: false }]
        };
      }

      if (callCount >= 8) {
        return {
          rows: [createLegacyUserRow()]
        };
      }

      return { rows: [] };
    });

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
                id: "member-admin",
                jagdzeichen: "AO-01",
                pushEnabled: true,
                revierId: "revier-attersee",
                role: "revier-admin",
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
                    bezirk: "Vöcklabruck",
                    bundesland: "Oberösterreich",
                    flaecheHektar: 1480,
                    id: "revier-attersee",
                    name: "Jagdgesellschaft Attersee Nord",
                    tenantKey: "attersee",
                    zentrumLabel: "Revierzentrum",
                    zentrumLat: 47.91,
                    zentrumLng: 13.52
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
