"use client";

import type { AuthContextResponse, Role } from "@hege/domain";
import {
  Camera,
  FileText,
  LayoutDashboard,
  Map,
  TreePine,
  UserPlus,
  Users,
  type LucideIcon
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
  allowedRoles?: ReadonlyArray<Role>;
}

const navigation: ReadonlyArray<NavigationItem> = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/app/sitzungen",
    label: "Sitzungen",
    icon: Users,
    allowedRoles: ["schriftfuehrer", "revier-admin", "platform-admin"]
  },
  { href: "/app/ansitze", label: "Ansitze", icon: TreePine },
  { href: "/app/reviereinrichtungen", label: "Reviereinrichtungen", icon: Map },
  { href: "/app/fallwild", label: "Fallwild", icon: Camera },
  { href: "/app/protokolle", label: "Protokolle", icon: FileText },
  {
    href: "/app/mitglieder",
    label: "Mitglieder",
    icon: UserPlus,
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
