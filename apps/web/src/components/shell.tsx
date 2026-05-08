"use client";

import type { AuthContextResponse, Role } from "@hege/domain";
import {
  Ansitz,
  Fallwild,
  Mitglied,
  Protokoll,
  Reviereinrichtung,
  Sitzung
} from "@hege/icons";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Sidebar-Icons stammen entweder aus `@hege/icons` (Domain-Icons) oder aus
 * `lucide-react` (Dashboard etc.). Beide akzeptieren `size`/`strokeWidth`
 * und rendern ein SVG. Wir verzichten auf `FunctionComponent`/`ComponentType`
 * an dieser Stelle — die generischen React-Component-Typen vergleichen
 * `ReactNode` ueber Workspace-Grenzen hinweg, was bei pnpm-Hoisting in
 * diesem Repo zu False-Positives fuehrt. Ein simpler Funktionstyp ist
 * praezise genug fuer die wenigen Props, die wir uebergeben.
 */
interface NavigationIconProps {
  size?: number | string;
  strokeWidth?: number;
  "aria-hidden"?: boolean | "true" | "false";
}
type NavigationIcon = (props: NavigationIconProps) => React.ReactNode;

interface NavigationItem {
  href: string;
  label: string;
  icon: NavigationIcon;
  allowedRoles?: ReadonlyArray<Role>;
}

const navigation: ReadonlyArray<NavigationItem> = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/app/sitzungen",
    label: "Sitzungen",
    icon: Sitzung,
    allowedRoles: ["schriftfuehrer", "revier-admin", "platform-admin"]
  },
  { href: "/app/ansitze", label: "Ansitze", icon: Ansitz },
  { href: "/app/reviereinrichtungen", label: "Reviereinrichtungen", icon: Reviereinrichtung },
  { href: "/app/fallwild", label: "Fallwild", icon: Fallwild },
  { href: "/app/protokolle", label: "Protokolle", icon: Protokoll },
  {
    href: "/app/mitglieder",
    label: "Mitglieder",
    icon: Mitglied,
    allowedRoles: ["revier-admin", "platform-admin"]
  }
];

export function isNavigationItemVisible(
  item: { allowedRoles?: ReadonlyArray<Role> },
  role: Role | null | undefined
): boolean {
  if (!item.allowedRoles) {
    return true;
  }

  if (!role) {
    return false;
  }

  return item.allowedRoles.includes(role);
}

interface ShellProps {
  children?: React.ReactNode;
  viewer?: AuthContextResponse | null;
}

export function Shell({ children, viewer }: ShellProps) {
  const pathname = usePathname();
  const currentPath = pathname ?? "";
  const isAuthPage = currentPath === "/login";

  if (isAuthPage) {
    return <main className="auth-layout">{children}</main>;
  }

  const visibleNavigation = navigation.filter((item) => isNavigationItemVisible(item, viewer?.membership.role));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/app" className="brand-block">
          <div className="brand-mark" aria-hidden="true">
            <img className="brand-logo-image" src="/brand/hege-logo-mark.png" alt="" />
          </div>
          <div>
            <p className="eyebrow">Reviermanagement</p>
            <h1>hege</h1>
          </div>
        </Link>

        <nav className="nav-list" aria-label="Hauptnavigation">
          {visibleNavigation.map((item) => {
            const active =
              currentPath === item.href ||
              (item.href !== "/app" && currentPath.startsWith(`${item.href}/`));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "nav-link nav-link-active" : "nav-link"}
              >
                <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
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
      return "Schriftführung";
    case "jaeger":
      return "Jäger";
    case "ausgeher":
      return "Ausgeher";
    case "platform-admin":
      return "Plattform";
    default:
      return role;
  }
}
