import type { AuthContextResponse } from "@hege/domain";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetOptionalAuthContext, mockRedirect } = vi.hoisted(() => ({
  mockGetOptionalAuthContext: vi.fn(),
  mockRedirect: vi.fn((target: string) => {
    throw new Error(`redirect:${target}`);
  })
}));

vi.mock("next/navigation", () => ({
  redirect: mockRedirect
}));

vi.mock("./context", () => ({
  getOptionalAuthContext: mockGetOptionalAuthContext
}));

import { toSafePostAuthPath } from "../../lib/auth-redirects";
import { requirePageAuth, requireSetupPageAuth, redirectAuthenticatedUser } from "./guards";

describe("auth redirects", () => {
  const authenticatedContext = createContext({ setupRequired: false });
  const setupRequiredContext = createContext({ setupRequired: true });

  beforeEach(() => {
    mockGetOptionalAuthContext.mockReset();
    mockRedirect.mockClear();
  });

  it("sanitizes post-auth targets", () => {
    expect(toSafePostAuthPath(undefined)).toBe("/app");
    expect(toSafePostAuthPath("/login")).toBe("/app");
    expect(toSafePostAuthPath("/registrieren")).toBe("/app");
    expect(toSafePostAuthPath("https://example.com/preview")).toBe("/app");
    expect(toSafePostAuthPath("/app/setup")).toBe("/app/setup");
  });

  it("redirects anonymous users to the login page with a next target", async () => {
    mockGetOptionalAuthContext.mockResolvedValue(null);

    await expect(requirePageAuth({ next: "/app/reviereinrichtungen" })).rejects.toThrow(
      "redirect:/login?next=%2Fapp%2Freviereinrichtungen"
    );
    expect(mockRedirect).toHaveBeenCalledWith("/login?next=%2Fapp%2Freviereinrichtungen");
  });

  it("redirects authenticated users to the app shell", async () => {
    mockGetOptionalAuthContext.mockResolvedValue(authenticatedContext);

    await expect(redirectAuthenticatedUser()).rejects.toThrow("redirect:/app");
    expect(mockRedirect).toHaveBeenCalledWith("/app");
  });

  it("redirects setup-required users to the setup flow", async () => {
    mockGetOptionalAuthContext.mockResolvedValue(setupRequiredContext);

    await expect(redirectAuthenticatedUser()).rejects.toThrow("redirect:/app/setup");
    expect(mockRedirect).toHaveBeenCalledWith("/app/setup");
  });

  it("lets setup-required users stay on the setup page", async () => {
    mockGetOptionalAuthContext.mockResolvedValue(setupRequiredContext);

    await expect(requireSetupPageAuth()).resolves.toBe(setupRequiredContext);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("sends completed users away from setup", async () => {
    mockGetOptionalAuthContext.mockResolvedValue(authenticatedContext);

    await expect(requireSetupPageAuth()).rejects.toThrow("redirect:/app");
    expect(mockRedirect).toHaveBeenCalledWith("/app");
  });
});

function createContext({ setupRequired }: { setupRequired: boolean }): AuthContextResponse {
  return {
    user: {
      id: "user-mair",
      name: "Martin Mair",
      phone: "+43 660 0000000",
      email: "martin.mair@hege.app"
    },
    membership: {
      id: "member-schrift",
      userId: "user-mair",
      revierId: "revier-attersee",
      role: "schriftfuehrer",
      jagdzeichen: "MM-04",
      pushEnabled: true
    },
    revier: {
      id: "revier-attersee",
      tenantKey: "attersee-nord",
      name: "Jagdgesellschaft Attersee Nord",
      bundesland: "Oberösterreich",
      bezirk: "Vöcklabruck",
      flaecheHektar: 1480,
      zentrum: {
        lat: 47.9134,
        lng: 13.5251,
        label: "Attersee Nord"
      }
    },
    activeRevierId: "revier-attersee",
    setupRequired,
    availableMemberships: []
  };
}
