import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetDashboardSnapshot } = vi.hoisted(() => ({
  mockGetDashboardSnapshot: vi.fn()
}));

vi.mock("../../../../server/modules/dashboard/queries", () => ({
  getDashboardSnapshot: mockGetDashboardSnapshot
}));

import { GET } from "./route";

describe("GET /api/v1/dashboard", () => {
  beforeEach(() => {
    mockGetDashboardSnapshot.mockReset();
  });

  it("returns the dashboard snapshot", async () => {
    mockGetDashboardSnapshot.mockResolvedValue({
      user: {
        id: "user-huber",
        name: "Lukas Huber",
        phone: "+43 676 1002003",
        email: "lukas.huber@hege.app"
      },
      membership: {
        id: "member-jaeger",
        userId: "user-huber",
        revierId: "revier-attersee",
        role: "jaeger",
        jagdzeichen: "LH-07",
        pushEnabled: true
      },
      revier: {
        id: "revier-attersee",
        tenantKey: "attersee-nord",
        name: "Jagdgesellschaft Attersee Nord",
        bundesland: "Oberoesterreich",
        bezirk: "Voecklabruck",
        flaecheHektar: 1480,
        zentrum: {
          lat: 47.9134,
          lng: 13.5251,
          label: "Attersee Nord"
        }
      },
      activeRevierId: "revier-attersee",
      setupRequired: false,
      availableMemberships: [],
      overview: {
        revier: {
          id: "revier-attersee",
          tenantKey: "attersee-nord",
          name: "Jagdgesellschaft Attersee Nord",
          bundesland: "Oberoesterreich",
          bezirk: "Voecklabruck",
          flaecheHektar: 1480,
          zentrum: {
            lat: 47.9134,
            lng: 13.5251,
            label: "Attersee Nord"
          }
        },
        aktiveAnsitze: 2,
        ansitzeMitKonflikt: 0,
        offeneWartungen: 1,
        heutigeFallwildBergungen: 1,
        unveroeffentlichteProtokolle: 1,
        letzteBenachrichtigungen: [],
        naechsteSitzung: undefined
      },
      activeAnsitze: [],
      recentFallwild: []
    });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(
      expect.objectContaining({
        activeRevierId: "revier-attersee",
        overview: expect.objectContaining({
          aktiveAnsitze: 2
        })
      })
    );
    expect(mockGetDashboardSnapshot).toHaveBeenCalledTimes(1);
  });
});
