import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUploadFallwildPhoto, mockGetRequestContext } = vi.hoisted(() => ({
  mockUploadFallwildPhoto: vi.fn(),
  mockGetRequestContext: vi.fn()
}));

vi.mock("../../../../../../server/auth/context", () => ({
  getRequestContext: mockGetRequestContext
}));

vi.mock("../../../../../../server/modules/fallwild/service", () => ({
  uploadFallwildPhoto: mockUploadFallwildPhoto
}));

import { POST } from "./route";

describe("POST /api/v1/fallwild/:id/fotos", () => {
  beforeEach(() => {
    mockUploadFallwildPhoto.mockReset();
    mockGetRequestContext.mockReset();
    mockGetRequestContext.mockResolvedValue({
      membershipId: "member-jaeger",
      revierId: "revier-attersee",
      role: "jaeger"
    });
  });

  it("uploads a jpeg photo from multipart form data", async () => {
    mockUploadFallwildPhoto.mockResolvedValue({
      id: "photo-1",
      title: "Unfallstelle",
      url: "https://storage.example/photo-1.jpg",
      createdAt: "2026-04-04T06:10:00.000Z"
    });

    const formData = new FormData();
    formData.append("file", new Blob(["photo-data"], { type: "image/jpeg" }), "bild.jpg");
    formData.append("title", "Unfallstelle");

    const response = await POST(
      new Request("http://localhost/api/v1/fallwild/fallwild-1/fotos", {
        method: "POST",
        body: formData
      }),
      {
        params: Promise.resolve({
          id: "fallwild-1"
        })
      }
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      photo: {
        id: "photo-1",
        title: "Unfallstelle",
        url: "https://storage.example/photo-1.jpg",
        createdAt: "2026-04-04T06:10:00.000Z"
      }
    });
    expect(mockUploadFallwildPhoto).toHaveBeenCalledWith({
      body: Buffer.from("photo-data"),
      contentType: "image/jpeg",
      fallwildId: "fallwild-1",
      fileName: "bild.jpg",
      reportedByMembershipId: "member-jaeger",
      revierId: "revier-attersee",
      title: "Unfallstelle"
    });
  });

  it("rejects non-multipart uploads", async () => {
    const response = await POST(
      new Request("http://localhost/api/v1/fallwild/fallwild-1/fotos", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({})
      }),
      {
        params: Promise.resolve({
          id: "fallwild-1"
        })
      }
    );

    expect(response.status).toBe(400);
    expect(mockUploadFallwildPhoto).not.toHaveBeenCalled();
  });

  it("rejects oversized files", async () => {
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([new Uint8Array(10 * 1024 * 1024 + 1)], { type: "image/png" }),
      "bild.png"
    );

    const response = await POST(
      new Request("http://localhost/api/v1/fallwild/fallwild-1/fotos", {
        method: "POST",
        body: formData
      }),
      {
        params: Promise.resolve({
          id: "fallwild-1"
        })
      }
    );

    expect(response.status).toBe(400);
    expect(mockUploadFallwildPhoto).not.toHaveBeenCalled();
  });

  it("returns 403 for forbidden roles", async () => {
    mockGetRequestContext.mockResolvedValueOnce({
      membershipId: "member-admin",
      revierId: "revier-attersee",
      role: "platform-admin"
    });

    const formData = new FormData();
    formData.append("file", new Blob(["photo-data"], { type: "image/jpeg" }), "bild.jpg");

    const response = await POST(
      new Request("http://localhost/api/v1/fallwild/fallwild-1/fotos", {
        method: "POST",
        body: formData
      }),
      {
        params: Promise.resolve({
          id: "fallwild-1"
        })
      }
    );

    expect(response.status).toBe(403);
    expect(mockUploadFallwildPhoto).not.toHaveBeenCalled();
  });
});
