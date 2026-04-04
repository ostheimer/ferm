import { createHmac } from "node:crypto";

import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetRequestContext, mockRunDatabaseMaintenance } = vi.hoisted(() => ({
  mockGetRequestContext: vi.fn(),
  mockRunDatabaseMaintenance: vi.fn()
}));

vi.mock("../../../../server/auth/context", () => ({
  getRequestContext: mockGetRequestContext
}));

vi.mock("../../../../server/db/maintenance", () => ({
  runDatabaseMaintenance: mockRunDatabaseMaintenance
}));

import { POST } from "./route";

describe("POST /api/internal/db-sync", () => {
  const previousSecret = process.env.AUTH_TOKEN_SECRET;
  const maintenanceKey = () =>
    createHmac("sha256", process.env.AUTH_TOKEN_SECRET ?? "").update("db-sync").digest("hex");

  beforeEach(() => {
    process.env.AUTH_TOKEN_SECRET = "test-maintenance-secret";
    delete process.env.VERCEL_ENV;
    mockGetRequestContext.mockReset();
    mockRunDatabaseMaintenance.mockReset();
    mockGetRequestContext.mockResolvedValue({
      userId: "user-steyrer",
      membershipId: "member-admin",
      revierId: "revier-attersee",
      role: "revier-admin"
    });
  });

  afterAll(() => {
    if (previousSecret === undefined) {
      delete process.env.AUTH_TOKEN_SECRET;
    } else {
      process.env.AUTH_TOKEN_SECRET = previousSecret;
    }
  });

  it("runs database maintenance for an authenticated admin request", async () => {
    mockRunDatabaseMaintenance.mockResolvedValue({
      databaseName: "neondb",
      totalMigrationFiles: 3,
      appliedMigrations: 3,
      counts: {
        users: 3,
        reviere: 1,
        memberships: 3,
        notifications: 2,
        reviereinrichtungen: 3,
        sitzungen: 2,
        protokollVersionen: 2,
        beschluesse: 2,
        dokumente: 3
      }
    });

    const response = await POST(
      new Request("http://localhost/api/internal/db-sync", {
        method: "POST",
        headers: {
          "x-hege-maintenance-key": maintenanceKey()
        }
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(
      expect.objectContaining({
        databaseName: "neondb",
        appliedMigrations: 3
      })
    );
    expect(mockRunDatabaseMaintenance).toHaveBeenCalledTimes(1);
  });

  it("rejects requests with an invalid maintenance key", async () => {
    const response = await POST(
      new Request("http://localhost/api/internal/db-sync", {
        method: "POST",
        headers: {
          "x-hege-maintenance-key": "invalid"
        }
      })
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: {
        code: "unauthenticated",
        message: "Maintenance-Key ist ungueltig.",
        status: 401
      }
    });
    expect(mockRunDatabaseMaintenance).not.toHaveBeenCalled();
  });

  it("rejects non-admin roles", async () => {
    mockGetRequestContext.mockResolvedValue({
      userId: "user-mair",
      membershipId: "member-schrift",
      revierId: "revier-attersee",
      role: "schriftfuehrer"
    });

    const response = await POST(
      new Request("http://localhost/api/internal/db-sync", {
        method: "POST",
        headers: {
          "x-hege-maintenance-key": maintenanceKey()
        }
      })
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: {
        code: "forbidden",
        message: "Diese Aktion ist fuer die aktuelle Rolle nicht erlaubt.",
        status: 403
      }
    });
    expect(mockRunDatabaseMaintenance).not.toHaveBeenCalled();
  });
});
