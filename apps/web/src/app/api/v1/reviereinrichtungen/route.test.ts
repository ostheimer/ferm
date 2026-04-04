import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockListReviereinrichtungen } = vi.hoisted(() => ({
  mockListReviereinrichtungen: vi.fn()
}));

vi.mock("../../../../server/modules/reviereinrichtungen/queries", () => ({
  listReviereinrichtungen: mockListReviereinrichtungen
}));

import { GET } from "./route";

describe("GET /api/v1/reviereinrichtungen", () => {
  beforeEach(() => {
    mockListReviereinrichtungen.mockReset();
  });

  it("returns the list slice", async () => {
    mockListReviereinrichtungen.mockResolvedValue([
      {
        id: "einrichtung-1",
        revierId: "revier-attersee",
        type: "hochstand",
        name: "Hochstand Buchenhang",
        status: "gut",
        location: {
          lat: 47.9161,
          lng: 13.5182,
          label: "Buchenhang"
        },
        beschreibung: "Leiterstand mit Blick auf Schneise und Graben.",
        photos: [],
        kontrollen: [],
        wartung: [],
        letzteKontrolleAt: "2026-03-28T10:00:00+01:00",
        offeneWartungen: 0
      }
    ]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      expect.objectContaining({
        id: "einrichtung-1",
        name: "Hochstand Buchenhang"
      })
    ]);
    expect(mockListReviereinrichtungen).toHaveBeenCalledTimes(1);
  });
});
