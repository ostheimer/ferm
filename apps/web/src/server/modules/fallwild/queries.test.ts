import { describe, expect, it, vi } from "vitest";

vi.mock("../../auth/context", () => ({
  getRequestContext: vi.fn(async () => ({
    revierId: "revier-attersee"
  }))
}));

import { exportFallwildCsv, mapFallwildRowToDomain } from "./queries";

describe("fallwild queries", () => {
  it("maps db rows to the shared domain shape", () => {
    expect(
      mapFallwildRowToDomain({
        id: "fallwild-1",
        revierId: "revier-attersee",
        reportedByMembershipId: "member-jaeger",
        recordedAt: "2026-04-03T06:55:00.000Z",
        locationLat: 47.9201,
        locationLng: 13.5194,
        locationLabel: "L127",
        wildart: "Reh",
        geschlecht: "weiblich",
        altersklasse: "Adult",
        bergungsStatus: "geborgen",
        gemeinde: "Steinbach am Attersee",
        strasse: "L127",
        note: "Gesichert."
      })
    ).toMatchObject({
      id: "fallwild-1",
      location: {
        lat: 47.9201,
        lng: 13.5194,
        label: "L127"
      },
      photos: []
    });
  });

  it("exports commas and quotes as CSV-safe values", async () => {
    vi.doMock("../../env", () => ({
      getServerEnv: () => ({
        useDemoStore: true
      })
    }));

    const csv = await exportFallwildCsv();

    expect(csv).toContain("id,recorded_at,wildart");
    expect(csv).toContain("fallwild-1");
  });
});
