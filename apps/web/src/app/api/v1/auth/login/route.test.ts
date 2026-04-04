import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockLogin } = vi.hoisted(() => ({
  mockLogin: vi.fn()
}));

vi.mock("../../../../../server/auth/service", () => ({
  login: mockLogin
}));

import { POST } from "./route";

describe("POST /api/v1/auth/login", () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  it("returns auth context and sets cookies", async () => {
    mockLogin.mockResolvedValue({
      user: {
        id: "user-mair"
      },
      membership: {
        id: "member-schrift"
      },
      revier: {
        id: "revier-attersee"
      },
      activeRevierId: "revier-attersee",
      availableMemberships: [],
      tokens: {
        accessToken: "access-token",
        refreshToken: "refresh-token",
        expiresAt: "2026-04-04T12:00:00.000Z",
        refreshExpiresAt: "2026-05-04T12:00:00.000Z"
      }
    });

    const response = await POST(
      new Request("http://localhost/api/v1/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          email: "martin.mair@hege.app",
          password: "hege-demo-2026"
        })
      })
    );

    expect(response.status).toBe(200);
    expect((await response.json()).user.id).toBe("user-mair");
    expect(response.headers.get("set-cookie")).toContain("hege_access_token=");
  });

  it("returns 400 for invalid bodies", async () => {
    const response = await POST(
      new Request("http://localhost/api/v1/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          email: "",
          password: ""
        })
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: {
        code: "validation-error",
        message: "email muss ein nicht-leerer String sein.",
        status: 400
      }
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });
});
