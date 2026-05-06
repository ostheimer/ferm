import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCreateReviermeldung, mockGetRequestContext, mockListReviermeldungenForRequest } = vi.hoisted(() => ({
  mockCreateReviermeldung: vi.fn(),
  mockGetRequestContext: vi.fn(),
  mockListReviermeldungenForRequest: vi.fn()
}));

vi.mock("../../../../server/auth/context", () => ({
  getRequestContext: mockGetRequestContext
}));

vi.mock("../../../../server/modules/revierarbeit/queries", () => ({
  listReviermeldungenForRequest: mockListReviermeldungenForRequest
}));

vi.mock("../../../../server/modules/revierarbeit/service", () => ({
  REVIERARBEIT_ALLOWED_ROLES: ["jaeger", "ausgeher", "schriftfuehrer", "revier-admin"],
  createReviermeldung: mockCreateReviermeldung
}));

import { GET, POST } from "./route";

describe("/api/v1/reviermeldungen", () => {
  beforeEach(() => {
    mockCreateReviermeldung.mockReset();
    mockGetRequestContext.mockReset();
    mockListReviermeldungenForRequest.mockReset();
    mockGetRequestContext.mockResolvedValue({
      membershipId: "member-ausgeher",
      revierId: "revier-attersee",
      role: "ausgeher"
    });
  });

  it("lists reviermeldungen for allowed roles", async () => {
    mockListReviermeldungenForRequest.mockResolvedValue([{ id: "reviermeldung-1" }]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ id: "reviermeldung-1" }]);
  });

  it("creates a reviermeldung from valid payloads", async () => {
    mockCreateReviermeldung.mockResolvedValue({ id: "reviermeldung-new" });

    const response = await POST(
      new Request("http://localhost/api/v1/reviermeldungen", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          category: "schaden",
          title: "Zaun beschädigt",
          description: "Am Feldweg hängt ein Draht lose.",
          location: {
            lat: 48.34,
            lng: 16.72,
            label: "Feldweg Süd"
          }
        })
      })
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ id: "reviermeldung-new" });
    expect(mockCreateReviermeldung).toHaveBeenCalledWith(
      expect.objectContaining({
        membershipId: "member-ausgeher",
        revierId: "revier-attersee"
      }),
      expect.objectContaining({
        category: "schaden",
        title: "Zaun beschädigt"
      })
    );
  });

  it("rejects forbidden roles", async () => {
    mockGetRequestContext.mockResolvedValueOnce({
      membershipId: "member-platform",
      revierId: "revier-attersee",
      role: "platform-admin"
    });

    const response = await POST(
      new Request("http://localhost/api/v1/reviermeldungen", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          category: "sichtung",
          title: "Rehwild am Waldrand"
        })
      })
    );

    expect(response.status).toBe(403);
    expect(mockCreateReviermeldung).not.toHaveBeenCalled();
  });
});
