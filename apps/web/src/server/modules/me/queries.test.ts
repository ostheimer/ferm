import { describe, expect, it } from "vitest";

import { getCurrentUser } from "./queries";

describe("getCurrentUser", () => {
  it("returns the default dev context", async () => {
    const result = await getCurrentUser();

    expect(result.user.id).toBe("user-huber");
    expect(result.membership.id).toBe("member-jaeger");
    expect(result.revier.id).toBe("revier-attersee");
  });
});
