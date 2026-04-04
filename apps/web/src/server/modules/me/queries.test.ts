import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetCurrentAuthContext } = vi.hoisted(() => ({
  mockGetCurrentAuthContext: vi.fn()
}));

vi.mock("../../auth/context", () => ({
  getCurrentAuthContext: mockGetCurrentAuthContext
}));

import { getCurrentUser } from "./queries";

describe("getCurrentUser", () => {
  beforeEach(() => {
    mockGetCurrentAuthContext.mockReset();
  });

  it("returns the resolved auth context", async () => {
    mockGetCurrentAuthContext.mockResolvedValue({
      user: { id: "user-huber" },
      membership: { id: "member-jaeger" },
      revier: { id: "revier-attersee" },
      activeRevierId: "revier-attersee",
      availableMemberships: []
    });

    const result = await getCurrentUser();

    expect(result.user.id).toBe("user-huber");
    expect(result.membership.id).toBe("member-jaeger");
    expect(result.revier.id).toBe("revier-attersee");
    expect(result.activeRevierId).toBe("revier-attersee");
  });
});
