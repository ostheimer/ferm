import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetRequestContext, mockListProtokolle } = vi.hoisted(() => ({
  mockGetRequestContext: vi.fn(),
  mockListProtokolle: vi.fn()
}));

vi.mock("../../../../server/auth/context", () => ({
  getRequestContext: mockGetRequestContext
}));

vi.mock("../../../../server/modules/protokolle/queries", () => ({
  listProtokolle: mockListProtokolle
}));

import { GET } from "./route";

describe("GET /api/v1/protokolle", () => {
  beforeEach(() => {
    mockGetRequestContext.mockReset();
    mockListProtokolle.mockReset();
    mockGetRequestContext.mockResolvedValue({
      userId: "user-mair",
      membershipId: "member-schrift",
      revierId: "revier-attersee",
      role: "schriftfuehrer"
    });
  });

  it("returns published protokolle", async () => {
    mockListProtokolle.mockResolvedValue([
      {
        id: "sitzung-2",
        revierId: "revier-attersee",
        title: "Winterabschluss 2025",
        scheduledAt: "2026-02-14T18:30:00+01:00",
        locationLabel: "Jagdhaus Attersee Nord",
        status: "freigegeben",
        latestVersionCreatedAt: "2026-02-15T08:10:00+01:00",
        summaryPreview: "Rueckblick auf die Saison.",
        beschlussCount: 1,
        publishedDocument: {
          id: "document-sitzung-2",
          title: "Winterabschluss 2025 Protokoll",
          fileName: "winterabschluss-2025-protokoll.pdf",
          contentType: "application/pdf",
          url: "/api/v1/documents/document-sitzung-2/download",
          createdAt: "2026-02-15T08:30:00+01:00",
          downloadUrl: "/api/v1/documents/document-sitzung-2/download"
        }
      }
    ]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      expect.objectContaining({
        id: "sitzung-2",
        status: "freigegeben"
      })
    ]);
    expect(mockListProtokolle).toHaveBeenCalledTimes(1);
  });
});
