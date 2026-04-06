import { describe, expect, it } from "vitest";

import { login } from "./service";

describe("auth service", () => {
  it("logs a seeded admin in with username and pin", async () => {
    const session = await login({
      identifier: "ostheimer",
      pin: "9526"
    });

    expect(session.user.email).toBe("andreas@ostheimer.at");
    expect(session.user.name).toBe("Andreas Ostheimer");
    expect(session.membership.role).toBe("revier-admin");
    expect(session.user).not.toHaveProperty("passwordHash");
  });

  it("logs a seeded user in with email and pin", async () => {
    const session = await login({
      identifier: "martin.mair@hege.app",
      pin: "9526"
    });

    expect(session.user.name).toBe("Martin Mair");
    expect(session.membership.role).toBe("schriftfuehrer");
    expect(session.user).not.toHaveProperty("passwordHash");
  });

  it("rejects invalid pins", async () => {
    await expect(
      login({
        identifier: "ostheimer",
        pin: "1111"
      })
    ).rejects.toMatchObject({
      code: "unauthenticated",
      status: 401
    });
  });
});
