"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigation = [
  { href: "/", label: "Dashboard" },
  { href: "/ansitze", label: "Ansitze" },
  { href: "/reviereinrichtungen", label: "Reviereinrichtungen" },
  { href: "/fallwild", label: "Fallwild" },
  { href: "/protokolle", label: "Protokolle" }
];

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">f</div>
          <div>
            <p className="eyebrow">Reviermanagement</p>
            <h1>ferm</h1>
          </div>
        </div>

        <nav className="nav-list" aria-label="Hauptnavigation">
          {navigation.map((item) => {
            const active = pathname === item.href;

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
          <strong>Attersee Nord</strong>
          <span>1.480 ha · Oberösterreich</span>
          <span>Live-Ansitze, Fallwild und Protokolle in einem System.</span>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
