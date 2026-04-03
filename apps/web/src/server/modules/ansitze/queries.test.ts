import { describe, expect, it } from "vitest";

import { listAnsitze, listLiveAnsitze, mapAnsitzRowToDomain } from "./queries";

describe("ansitze queries", () => {
  it("returns the default revier ansitze sorted by newest first", async () => {
    const result = await listAnsitze();

    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe("ansitz-2");
    expect(result[1]?.id).toBe("ansitz-1");
  });

  it("returns only active ansitze for the live query", async () => {
    const result = await listLiveAnsitze();

    expect(result).toHaveLength(2);
    expect(result.every((entry) => entry.status === "active")).toBe(true);
  });

  it("maps database rows to the shared domain shape", () => {
    const result = mapAnsitzRowToDomain({
      id: "ansitz-9",
      revierId: "revier-attersee",
      membershipId: "member-jaeger",
      standortId: null,
      standortName: "Buchenhang",
      locationLat: 47.91,
      locationLng: 13.52,
      locationLabel: null,
      startedAt: "2026-04-03T05:45:00+02:00",
      plannedEndAt: null,
      endedAt: null,
      note: null,
      status: "active",
      conflict: false
    });

    expect(result).toEqual({
      id: "ansitz-9",
      revierId: "revier-attersee",
      membershipId: "member-jaeger",
      standortId: undefined,
      standortName: "Buchenhang",
      location: {
        lat: 47.91,
        lng: 13.52,
        label: undefined
      },
      startedAt: "2026-04-03T05:45:00+02:00",
      plannedEndAt: undefined,
      endedAt: undefined,
      note: undefined,
      status: "active",
      conflict: false
    });
  });
});
