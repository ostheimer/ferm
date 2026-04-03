import type { AnsitzSession } from "@hege/domain";
import { describe, expect, it } from "vitest";

import { createAnsitzeService } from "./service";

describe("ansitze service", () => {
  it("marks a new ansitz as conflict when the same standort is already active", async () => {
    const service = createAnsitzeService({
      generateId: () => "ansitz-new",
      repository: createMemoryRepository([
        {
          id: "ansitz-1",
          revierId: "revier-attersee",
          membershipId: "member-jaeger",
          standortId: "einrichtung-1",
          standortName: "Hochstand Buchenhang",
          location: { lat: 47.9161, lng: 13.5182 },
          startedAt: "2026-04-03T05:45:00.000Z",
          status: "active",
          conflict: false
        }
      ]),
      useDemoStore: false
    });

    const result = await service.start({
      revierId: "revier-attersee",
      membershipId: "member-admin",
      standortId: "einrichtung-1",
      standortName: "Hochstand Buchenhang",
      location: { lat: 47.9161, lng: 13.5182 },
      startedAt: "2026-04-03T06:10:00.000Z"
    });

    expect(result.id).toBe("ansitz-new");
    expect(result.conflict).toBe(true);
  });

  it("marks a new ansitz as conflict when another active ansitz is too close", async () => {
    const service = createAnsitzeService({
      generateId: () => "ansitz-new",
      repository: createMemoryRepository([
        {
          id: "ansitz-1",
          revierId: "revier-attersee",
          membershipId: "member-jaeger",
          standortName: "Wiesenrand",
          location: { lat: 47.9161, lng: 13.5182 },
          startedAt: "2026-04-03T05:45:00.000Z",
          status: "active",
          conflict: false
        }
      ]),
      useDemoStore: false
    });

    const result = await service.start({
      revierId: "revier-attersee",
      membershipId: "member-admin",
      standortName: "Nahe am Hang",
      location: { lat: 47.9165, lng: 13.5186 },
      startedAt: "2026-04-03T06:10:00.000Z"
    });

    expect(result.conflict).toBe(true);
  });

  it("starts a new ansitz without conflict when no active overlap exists", async () => {
    const service = createAnsitzeService({
      generateId: () => "ansitz-new",
      repository: createMemoryRepository([]),
      useDemoStore: false
    });

    const result = await service.start({
      revierId: "revier-attersee",
      membershipId: "member-admin",
      standortName: "Sonnenwald",
      location: { lat: 47.92, lng: 13.51, label: "Sonnenwald" },
      note: "Kurzansitz",
      startedAt: "2026-04-03T06:10:00.000Z"
    });

    expect(result).toMatchObject({
      id: "ansitz-new",
      status: "active",
      conflict: false,
      note: "Kurzansitz"
    });
  });

  it("ends an active ansitz", async () => {
    const service = createAnsitzeService({
      repository: createMemoryRepository([
        {
          id: "ansitz-1",
          revierId: "revier-attersee",
          membershipId: "member-jaeger",
          standortName: "Wiesenrand",
          location: { lat: 47.9161, lng: 13.5182 },
          startedAt: "2026-04-03T05:45:00.000Z",
          status: "active",
          conflict: false
        }
      ]),
      useDemoStore: false
    });

    const result = await service.end({
      ansitzId: "ansitz-1",
      revierId: "revier-attersee",
      endedAt: "2026-04-03T07:30:00.000Z"
    });

    expect(result.status).toBe("completed");
    expect(result.endedAt).toBe("2026-04-03T07:30:00.000Z");
  });

  it("throws not found for unknown ansitz ids", async () => {
    const service = createAnsitzeService({
      repository: createMemoryRepository([]),
      useDemoStore: false
    });

    await expect(
      service.end({
        ansitzId: "ansitz-missing",
        revierId: "revier-attersee"
      })
    ).rejects.toMatchObject({
      message: "Ansitz wurde nicht gefunden.",
      status: 404
    });
  });
});

function createMemoryRepository(seed: AnsitzSession[]) {
  const store = [...seed];

  return {
    async findById(revierId: string, ansitzId: string) {
      return store.find((entry) => entry.revierId === revierId && entry.id === ansitzId);
    },
    async insert(entry: AnsitzSession) {
      store.unshift(entry);
      return entry;
    },
    async listActiveByRevier(revierId: string) {
      return store.filter((entry) => entry.revierId === revierId && entry.status === "active");
    },
    async markCompleted(revierId: string, ansitzId: string, endedAt: string) {
      const entry = store.find((current) => current.revierId === revierId && current.id === ansitzId);

      if (!entry) {
        return undefined;
      }

      entry.status = "completed";
      entry.endedAt = endedAt;

      return entry;
    }
  };
}
