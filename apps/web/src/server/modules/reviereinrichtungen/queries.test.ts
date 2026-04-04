import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCreateReviereinrichtungenService,
  mockGetRequestContext,
  mockGetServerEnv,
  mockList
} = vi.hoisted(() => {
  const mockList = vi.fn();
  const mockCreateReviereinrichtungenService = vi.fn(() => ({
    list: mockList
  }));
  const mockGetRequestContext = vi.fn();
  const mockGetServerEnv = vi.fn(() => ({
    useDemoStore: false
  }));

  return {
    mockCreateReviereinrichtungenService,
    mockGetRequestContext,
    mockGetServerEnv,
    mockList
  };
});

vi.mock("../../auth/context", () => ({
  getRequestContext: mockGetRequestContext
}));

vi.mock("../../env", () => ({
  getServerEnv: mockGetServerEnv
}));

vi.mock("./service", () => ({
  createReviereinrichtungenService: mockCreateReviereinrichtungenService
}));

import { demoData } from "@hege/domain";

import { listReviereinrichtungen } from "./queries";

describe("reviereinrichtungen queries", () => {
  beforeEach(() => {
    mockGetRequestContext.mockReset();
    mockGetServerEnv.mockReset();
    mockList.mockReset();
    mockGetServerEnv.mockReturnValue({
      useDemoStore: false
    });
    mockGetRequestContext.mockResolvedValue({
      revierId: "revier-attersee"
    });
  });

  it("returns demo store entries sorted by name", async () => {
    mockGetServerEnv.mockReturnValue({
      useDemoStore: true
    });

    const result = await listReviereinrichtungen();

    expect(result.map((entry) => entry.id)).toEqual([
      "einrichtung-3",
      "einrichtung-2",
      "einrichtung-1"
    ]);
    const second = result[1];
    const demoEntry = demoData.reviereinrichtungen[1];

    expect(second).toBeDefined();
    if (!second || !demoEntry) {
      throw new Error("Expected demo reviereinrichtung entries to exist.");
    }
    expect(second).toMatchObject({
      id: demoEntry.id,
      offeneWartungen: 1,
      letzteKontrolleAt: "2026-04-01T07:15:00+02:00"
    });
  });

  it("loads list items through the repository service for the active revier", async () => {
    mockList.mockResolvedValue([
      {
        id: "einrichtung-99",
        revierId: "revier-attersee",
        type: "hochstand",
        name: "Teststand",
        status: "gut",
        location: {
          lat: 47.91,
          lng: 13.52,
          label: "Testhang"
        },
        beschreibung: "Testbeschreibung",
        photos: [],
        kontrollen: [],
        wartung: [],
        letzteKontrolleAt: undefined,
        offeneWartungen: 0
      }
    ]);

    const result = await listReviereinrichtungen();

    expect(result).toHaveLength(1);
    expect(mockGetRequestContext).toHaveBeenCalledTimes(1);
    expect(mockList).toHaveBeenCalledWith("revier-attersee");
  });
});
