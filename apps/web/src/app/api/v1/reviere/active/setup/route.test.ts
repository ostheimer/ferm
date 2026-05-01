import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCompleteActiveRevierSetup, mockGetCurrentAuthContext, mockGetRequestContext } = vi.hoisted(() => ({
  mockCompleteActiveRevierSetup: vi.fn(),
  mockGetCurrentAuthContext: vi.fn(),
  mockGetRequestContext: vi.fn()
}));

vi.mock("../../../../../../server/auth/context", () => ({
  getCurrentAuthContext: mockGetCurrentAuthContext,
  getRequestContext: mockGetRequestContext
}));

vi.mock("../../../../../../server/modules/public-registration/service", () => ({
  completeActiveRevierSetup: mockCompleteActiveRevierSetup
}));

import { PATCH } from "./route";

describe("PATCH /api/v1/reviere/active/setup", () => {
  beforeEach(() => {
    mockCompleteActiveRevierSetup.mockReset();
    mockGetCurrentAuthContext.mockReset();
    mockGetRequestContext.mockReset();
    mockGetRequestContext.mockResolvedValue({
      membershipId: "member-new",
      revierId: "revier-new",
      role: "revier-admin"
    });
    mockGetCurrentAuthContext.mockResolvedValue({
      user: {
        id: "user-new"
      },
      membership: {
        id: "member-new"
      },
      revier: {
        id: "revier-new"
      },
      activeRevierId: "revier-new",
      setupRequired: false,
      availableMemberships: []
    });
  });

  it("completes the setup and returns the refreshed auth context", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/v1/reviere/active/setup", {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          revierName: "Jagdgesellschaft Beispielwald",
          bundesland: "Oberösterreich",
          bezirk: "Vöcklabruck",
          flaecheHektar: 1480
        })
      })
    );

    expect(response.status).toBe(200);
    expect((await response.json()).setupRequired).toBe(false);
    expect(mockCompleteActiveRevierSetup).toHaveBeenCalledWith(
      {
        membershipId: "member-new",
        revierId: "revier-new",
        role: "revier-admin"
      },
      {
        revierName: "Jagdgesellschaft Beispielwald",
        bundesland: "Oberösterreich",
        bezirk: "Vöcklabruck",
        flaecheHektar: 1480
      }
    );
  });
});
