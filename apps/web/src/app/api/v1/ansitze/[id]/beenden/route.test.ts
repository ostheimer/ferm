import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockEndAnsitzSession, mockGetRequestContext } = vi.hoisted(() => ({
  mockEndAnsitzSession: vi.fn(),
  mockGetRequestContext: vi.fn()
}));

vi.mock("../../../../../../server/auth/context", () => ({
  getRequestContext: mockGetRequestContext
}));

vi.mock("../../../../../../server/modules/ansitze/service", () => ({
  endAnsitzSession: mockEndAnsitzSession
}));

import { PATCH } from "./route";

describe("PATCH /api/v1/ansitze/[id]/beenden", () => {
  beforeEach(() => {
    mockGetRequestContext.mockReset();
    mockEndAnsitzSession.mockReset();
    mockGetRequestContext.mockResolvedValue({
      revierId: "revier-attersee"
    });
  });

  it("returns 200 for valid payloads", async () => {
    mockEndAnsitzSession.mockResolvedValue({
      id: "ansitz-1",
      status: "completed"
    });

    const response = await PATCH(
      new Request("http://localhost/api/v1/ansitze/ansitz-1/beenden", {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          endedAt: "2026-04-03T07:30:00.000Z"
        })
      }),
      {
        params: Promise.resolve({
          id: "ansitz-1"
        })
      }
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      id: "ansitz-1",
      status: "completed"
    });
    expect(mockEndAnsitzSession).toHaveBeenCalledWith({
      ansitzId: "ansitz-1",
      revierId: "revier-attersee",
      endedAt: "2026-04-03T07:30:00.000Z"
    });
  });

  it("returns 404 when the ansitz does not exist", async () => {
    mockEndAnsitzSession.mockRejectedValue(Object.assign(new Error("Ansitz wurde nicht gefunden."), { status: 404 }));

    const response = await PATCH(
      new Request("http://localhost/api/v1/ansitze/ansitz-missing/beenden", {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({})
      }),
      {
        params: Promise.resolve({
          id: "ansitz-missing"
        })
      }
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: "Ansitz wurde nicht gefunden."
    });
  });
});
