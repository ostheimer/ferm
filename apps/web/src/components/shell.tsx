"use client";

import type { AuthContextResponse } from "@hege/domain";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigation = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/sitzungen", label: "Sitzungen" },
  { href: "/app/ansitze", label: "Ansitze" },
  { href: "/app/reviereinrichtungen", label: "Reviereinrichtungen" },
  { href: "/app/fallwild", label: "Fallwild" },
  { href: "/app/protokolle", label: "Protokolle" }
];

interface ShellProps {
  children: ReactNode;
  viewer?: AuthContextResponse | null;
}

export function Shell({ children, viewer }: ShellProps) {
  const pathname = usePathname();
  const currentPath = pathname ?? "";
  const isAuthPage = currentPath === "/login";

  if (isAuthPage) {
    return <main className="auth-layout">{children}</main>;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/app" className="brand-block">
          <div className="brand-mark">h</div>
          <div>
            <p className="eyebrow">Reviermanagement</p>
            <h1>hege</h1>
          </div>
        </Link>

        <nav className="nav-list" aria-label="Hauptnavigation">
          {navigation.map((item) => {
            const active =
              currentPath === item.href ||
              (item.href !== "/app" && currentPath.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "nav-link nav-link-active" : "nav-link"}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-card">
          <p className="eyebrow">Betrieb</p>
          <strong>{viewer?.revier.name ?? "Kein Revier aktiv"}</strong>
          <span>
            {viewer ? `${viewer.revier.flaecheHektar} ha | ${viewer.revier.bundesland}` : "Bitte anmelden."}
          </span>
          <span>
            {viewer
              ? `${viewer.user.name} | ${formatRoleLabel(viewer.membership.role)} | ${viewer.membership.jagdzeichen}`
              : "Ansitze, Fallwild und Protokolle in einem System."}
          </span>
        </div>

        {viewer ? (
          <form action="/api/v1/auth/logout" className="sidebar-actions" method="post">
            <button className="button-control sidebar-logout" type="submit">
              Abmelden
            </button>
          </form>
        ) : null}
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}

function formatRoleLabel(role: AuthContextResponse["membership"]["role"]) {
  switch (role) {
    case "revier-admin":
      return "Admin";
    case "schriftfuehrer":
      return "Schriftfuehrung";
    case "jaeger":
      return "Jaeger";
    case "platform-admin":
      return "Plattform";
    default:
      return role;
  }
}
