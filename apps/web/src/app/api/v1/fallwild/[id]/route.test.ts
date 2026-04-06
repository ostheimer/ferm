import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetFallwildById, mockGetRequestContext } = vi.hoisted(() => ({
  mockGetFallwildById: vi.fn(),
  mockGetRequestContext: vi.fn()
}));

vi.mock("../../../../../server/auth/context", () => ({
  getRequestContext: mockGetRequestContext
}));

vi.mock("../../../../../server/modules/fallwild/queries", () => ({
  getFallwildById: mockGetFallwildById
}));

import { GET } from "./route";

describe("GET /api/v1/fallwild/:id", () => {
  beforeEach(() => {
    mockGetFallwildById.mockReset();
    mockGetRequestContext.mockReset();
    mockGetRequestContext.mockResolvedValue({
      membershipId: "member-jaeger",
      revierId: "revier-attersee",
      role: "jaeger"
    });
  });

  it("returns the requested fallwild detail with photos", async () => {
    mockGetFallwildById.mockResolvedValue({
      id: "fallwild-1",
      photos: [
        {
          id: "photo-1",
          title: "Unfallstelle",
          url: "https://storage.example/photo-1.jpg",
          createdAt: "2026-04-03T06:56:00.000Z"
        }
      ]
    });

    const response = await GET(new Request("http://localhost/api/v1/fallwild/fallwild-1"), {
      params: Promise.resolve({
        id: "fallwild-1"
      })
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      id: "fallwild-1",
      photos: [
        {
          id: "photo-1",
          title: "Unfallstelle",
          url: "https://storage.example/photo-1.jpg",
          createdAt: "2026-04-03T06:56:00.000Z"
        }
      ]
    });
    expect(mockGetFallwildById).toHaveBeenCalledWith("fallwild-1");
  });

  it("returns 404 when the fallwild entry does not exist", async () => {
    mockGetFallwildById.mockResolvedValue(undefined);

    const response = await GET(new Request("http://localhost/api/v1/fallwild/fallwild-404"), {
      params: Promise.resolve({
        id: "fallwild-404"
      })
    });

    expect(response.status).toBe(404);
  });

  it("returns 403 for forbidden roles", async () => {
    mockGetRequestContext.mockResolvedValueOnce({
      membershipId: "member-admin",
      revierId: "revier-attersee",
      role: "platform-admin"
    });

    const response = await GET(new Request("http://localhost/api/v1/fallwild/fallwild-1"), {
      params: Promise.resolve({
        id: "fallwild-1"
      })
    });

    expect(response.status).toBe(403);
    expect(mockGetFallwildById).not.toHaveBeenCalled();
  });
});
