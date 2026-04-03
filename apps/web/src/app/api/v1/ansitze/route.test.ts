import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetRequestContext, mockStartAnsitzSession } = vi.hoisted(() => ({
  mockGetRequestContext: vi.fn(),
  mockStartAnsitzSession: vi.fn()
}));

vi.mock("../../../../server/auth/context", () => ({
  getRequestContext: mockGetRequestContext
}));

vi.mock("../../../../server/modules/ansitze/service", () => ({
  startAnsitzSession: mockStartAnsitzSession
}));

import { POST } from "./route";

describe("POST /api/v1/ansitze", () => {
  beforeEach(() => {
    mockGetRequestContext.mockReset();
    mockStartAnsitzSession.mockReset();
    mockGetRequestContext.mockResolvedValue({
      membershipId: "member-jaeger",
      revierId: "revier-attersee"
    });
  });

  it("returns 201 for valid payloads", async () => {
    mockStartAnsitzSession.mockResolvedValue({
      id: "ansitz-new"
    });

    const response = await POST(
      new Request("http://localhost/api/v1/ansitze", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          standortName: "Wiesenrand",
          location: {
            lat: 47.91,
            lng: 13.52
          }
        })
      })
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      id: "ansitz-new"
    });
    expect(mockStartAnsitzSession).toHaveBeenCalledWith({
      membershipId: "member-jaeger",
      revierId: "revier-attersee",
      standortName: "Wiesenrand",
      location: {
        lat: 47.91,
        lng: 13.52
      }
    });
  });

  it("returns 400 for invalid payloads", async () => {
    const response = await POST(
      new Request("http://localhost/api/v1/ansitze", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          standortName: "",
          location: {
            lat: 47.91,
            lng: 13.52
          }
        })
      })
    );

    expect(response.status).toBe(400);
    expect(mockStartAnsitzSession).not.toHaveBeenCalled();
  });
});
