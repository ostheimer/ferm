import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRegisterPublicAccount } = vi.hoisted(() => ({
  mockRegisterPublicAccount: vi.fn()
}));

vi.mock("../../../../../server/modules/public-registration/service", () => ({
  registerPublicAccount: mockRegisterPublicAccount
}));

import { POST } from "./route";

describe("POST /api/v1/public/register", () => {
  beforeEach(() => {
    mockRegisterPublicAccount.mockReset();
  });

  it("returns the created session and sets auth cookies", async () => {
    mockRegisterPublicAccount.mockResolvedValue({
      user: {
        id: "user-new",
        name: "Andreas Ostheimer",
        phone: "+43 660 0000000",
        email: "andreas@example.at",
        username: "ostheimer"
      },
      membership: {
        id: "member-new",
        userId: "user-new",
        revierId: "revier-new",
        role: "revier-admin",
        jagdzeichen: "AO-01",
        pushEnabled: false
      },
      revier: {
        id: "revier-new",
        tenantKey: "jagdgesellschaft-beispielwald",
        name: "Jagdgesellschaft Beispielwald",
        bundesland: "Oberoesterreich",
        bezirk: "Voecklabruck",
        flaecheHektar: 0,
        zentrum: {
          lat: 48.234913,
          lng: 16.413725,
          label: "Austria Center Wien"
        },
        setupCompletedAt: undefined
      },
      activeRevierId: "revier-new",
      setupRequired: true,
      availableMemberships: [],
      tokens: {
        accessToken: "access-token",
        refreshToken: "refresh-token",
        expiresAt: "2026-04-04T12:00:00.000Z",
        refreshExpiresAt: "2026-05-04T12:00:00.000Z"
      }
    });

    const response = await POST(
      new Request("http://localhost/api/v1/public/register", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          firstName: "Andreas",
          lastName: "Ostheimer",
          email: "andreas@example.at",
          username: "ostheimer",
          phone: "+43 660 0000000",
          pin: "1234",
          jagdzeichen: "AO-01",
          revierName: "Jagdgesellschaft Beispielwald",
          bundesland: "Oberoesterreich",
          bezirk: "Voecklabruck",
          planKey: "starter"
        })
      })
    );

    expect(response.status).toBe(201);
    expect((await response.json()).user.id).toBe("user-new");
    expect(response.headers.get("set-cookie")).toContain("hege_access_token=");
    expect(mockRegisterPublicAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        planKey: "starter",
        pin: "1234"
      })
    );
  });

  it("returns 400 for invalid plan keys", async () => {
    const response = await POST(
      new Request("http://localhost/api/v1/public/register", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          firstName: "Andreas",
          lastName: "Ostheimer",
          email: "andreas@example.at",
          username: "ostheimer",
          phone: "+43 660 0000000",
          pin: "1234",
          jagdzeichen: "AO-01",
          revierName: "Jagdgesellschaft Beispielwald",
          bundesland: "Oberoesterreich",
          bezirk: "Voecklabruck",
          planKey: "organisation"
        })
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: {
        code: "validation-error",
        message: "planKey muss starter oder revier sein.",
        status: 400
      }
    });
    expect(mockRegisterPublicAccount).not.toHaveBeenCalled();
  });
});
