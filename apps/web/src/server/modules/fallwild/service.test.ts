import type { FallwildVorgang } from "@hege/domain";
import { describe, expect, it } from "vitest";

import { createFallwildService } from "./service";

describe("fallwild service", () => {
  it("creates a new fallwild entry with default timestamp", async () => {
    const service = createFallwildService({
      generateId: () => "fallwild-new",
      getNow: () => "2026-04-04T06:00:00.000Z",
      repository: createMemoryRepository(),
      useDemoStore: false
    });

    const result = await service.create({
      revierId: "revier-attersee",
      reportedByMembershipId: "member-jaeger",
      location: { lat: 47.92, lng: 13.51, label: "Nordrand" },
      wildart: "Fuchs",
      geschlecht: "weiblich",
      altersklasse: "Adult",
      bergungsStatus: "geborgen",
      gemeinde: "Steinbach am Attersee",
      note: "Browsertest"
    });

    expect(result).toMatchObject({
      id: "fallwild-new",
      recordedAt: "2026-04-04T06:00:00.000Z",
      wildart: "Fuchs",
      photos: []
    });
  });

  it("rejects mutations without a database-backed store", async () => {
    const service = createFallwildService({
      repository: createMemoryRepository(),
      useDemoStore: true
    });

    await expect(
      service.create({
        revierId: "revier-attersee",
        reportedByMembershipId: "member-jaeger",
        location: { lat: 47.92, lng: 13.51 },
        wildart: "Fuchs",
        geschlecht: "weiblich",
        altersklasse: "Adult",
        bergungsStatus: "geborgen",
        gemeinde: "Steinbach am Attersee"
      })
    ).rejects.toMatchObject({
      message: "Fallwild-Mutationen benoetigen eine aktive Datenbank.",
      status: 503
    });
  });
});

function createMemoryRepository() {
  const store: FallwildVorgang[] = [];

  return {
    async insert(entry: FallwildVorgang) {
      store.unshift(entry);
      return entry;
    }
  };
}
