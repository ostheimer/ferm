import { describe, expect, it } from "vitest";

import { POST } from "./route";

describe("POST /api/v1/auth/logout", () => {
  it("clears auth cookies and redirects to login", async () => {
    const response = await POST(
      new Request("http://localhost/api/v1/auth/logout", {
        method: "POST"
      })
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://localhost/login");
    expect(response.headers.get("set-cookie")).toContain("hege_access_token=");
    expect(response.headers.get("set-cookie")).toContain("hege_refresh_token=");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});
