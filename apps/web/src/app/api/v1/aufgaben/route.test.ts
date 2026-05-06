import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCreateAufgabe, mockGetRequestContext, mockListAufgabenForRequest } = vi.hoisted(() => ({
  mockCreateAufgabe: vi.fn(),
  mockGetRequestContext: vi.fn(),
  mockListAufgabenForRequest: vi.fn()
}));

vi.mock("../../../../server/auth/context", () => ({
  getRequestContext: mockGetRequestContext
}));

vi.mock("../../../../server/modules/revierarbeit/queries", () => ({
  listAufgabenForRequest: mockListAufgabenForRequest
}));

vi.mock("../../../../server/modules/revierarbeit/service", () => ({
  REVIERARBEIT_ALLOWED_ROLES: ["jaeger", "ausgeher", "schriftfuehrer", "revier-admin"],
  createAufgabe: mockCreateAufgabe
}));

import { GET, POST } from "./route";

describe("/api/v1/aufgaben", () => {
  beforeEach(() => {
    mockCreateAufgabe.mockReset();
    mockGetRequestContext.mockReset();
    mockListAufgabenForRequest.mockReset();
    mockGetRequestContext.mockResolvedValue({
      membershipId: "member-admin",
      revierId: "revier-attersee",
      role: "revier-admin"
    });
  });

  it("lists aufgaben for allowed roles", async () => {
    mockListAufgabenForRequest.mockResolvedValue([{ id: "aufgabe-1" }]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ id: "aufgabe-1" }]);
  });

  it("creates aufgaben from valid payloads", async () => {
    mockCreateAufgabe.mockResolvedValue({ id: "aufgabe-new" });

    const response = await POST(
      new Request("http://localhost/api/v1/aufgaben", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          sourceType: "reviermeldung",
          sourceId: "reviermeldung-1",
          title: "Zaun kontrollieren",
          priority: "hoch",
          assigneeMembershipIds: ["member-ausgeher"]
        })
      })
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ id: "aufgabe-new" });
    expect(mockCreateAufgabe).toHaveBeenCalledWith(
      expect.objectContaining({
        membershipId: "member-admin",
        revierId: "revier-attersee"
      }),
      expect.objectContaining({
        sourceType: "reviermeldung",
        sourceId: "reviermeldung-1",
        title: "Zaun kontrollieren",
        assigneeMembershipIds: ["member-ausgeher"]
      })
    );
  });

  it("returns 400 for invalid priorities", async () => {
    const response = await POST(
      new Request("http://localhost/api/v1/aufgaben", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          title: "Zaun kontrollieren",
          priority: "sofort"
        })
      })
    );

    expect(response.status).toBe(400);
    expect(mockCreateAufgabe).not.toHaveBeenCalled();
  });
});
