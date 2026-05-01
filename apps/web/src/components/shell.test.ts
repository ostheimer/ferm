import type { AuthContextResponse } from "@hege/domain";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

(globalThis as unknown as { React?: typeof React }).React = React;

const { mockUsePathname } = vi.hoisted(() => ({
  mockUsePathname: vi.fn()
}));

vi.mock("next/navigation", () => ({
  usePathname: mockUsePathname
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    className,
    href
  }: {
    children: React.ReactNode;
    className?: string;
    href: string;
  }) => React.createElement("a", { className, href }, children)
}));

import { Shell } from "./shell";

const viewer: AuthContextResponse = {
  user: {
    id: "user-mair",
    name: "Martin Mair",
    phone: "+43 676 1002002",
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
    bundesland: "Oberoesterreich",
    bezirk: "Voecklabruck",
    flaecheHektar: 1480,
    zentrum: {
      lat: 47.9134,
      lng: 13.5251,
      label: "Attersee Nord"
    }
  },
  activeRevierId: "revier-attersee",
  setupRequired: false,
  availableMemberships: []
};

describe("Shell", () => {
  beforeEach(() => {
    mockUsePathname.mockReset();
    mockUsePathname.mockReturnValue("/");
  });

  it("renders a logout action for authenticated users", () => {
    const html = renderToStaticMarkup(
      React.createElement(Shell, {
        viewer,
        children: React.createElement("div", null, "Dashboard")
      })
    );

    expect(html).toContain("Abmelden");
  });
});
