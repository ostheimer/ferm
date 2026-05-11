import type { DashboardResponse, Role } from "@hege/domain";
import { describe, expect, it } from "vitest";

import { computeRoleDashboard } from "./dashboard-role.helpers";

/**
 * Minimaler Snapshot-Builder fuer Tests. Wir interessieren uns nur
 * fuer die Felder, die der Role-Helper liest (overview + Listen +
 * membership.id).
 */
function snapshot(overrides: {
  role?: Role;
  membershipId?: string;
  overview?: Partial<DashboardResponse["overview"]>;
  activeAnsitze?: ReadonlyArray<{ membershipId: string; standortName: string }>;
  recentFallwild?: ReadonlyArray<{
    reportedByMembershipId: string;
    recordedAt: string;
  }>;
}): DashboardResponse {
  return {
    membership: {
      id: overrides.membershipId ?? "m1",
      role: overrides.role ?? "jaeger"
    },
    overview: {
      aktiveAnsitze: overrides.overview?.aktiveAnsitze ?? 0,
      ansitzeMitKonflikt: overrides.overview?.ansitzeMitKonflikt ?? 0,
      offeneWartungen: overrides.overview?.offeneWartungen ?? 0,
      heutigeFallwildBergungen: overrides.overview?.heutigeFallwildBergungen ?? 0,
      unveroeffentlichteProtokolle: overrides.overview?.unveroeffentlichteProtokolle ?? 0,
      offeneAufgaben: overrides.overview?.offeneAufgaben ?? 0,
      letzteBenachrichtigungen: overrides.overview?.letzteBenachrichtigungen ?? [],
      naechsteSitzung: overrides.overview?.naechsteSitzung
    },
    activeAnsitze: (overrides.activeAnsitze ?? []) as DashboardResponse["activeAnsitze"],
    recentFallwild: (overrides.recentFallwild ?? []) as DashboardResponse["recentFallwild"]
  } as unknown as DashboardResponse;
}

describe("computeRoleDashboard — Schriftfuehrer", () => {
  it("zeigt Entwurfs-Count in der Headline, wenn welche da sind", () => {
    const result = computeRoleDashboard(
      "schriftfuehrer",
      snapshot({ overview: { unveroeffentlichteProtokolle: 3 } })
    );

    expect(result.headline.eyebrow).toBe("Schriftfuehrung");
    expect(result.headline.title).toContain("3 Protokolle");
    expect(result.tiles[0].label).toBe("In Freigabe");
    expect(result.tiles[0].value).toBe(3);
  });

  it("singular 1 Protokoll korrekt formatiert", () => {
    const result = computeRoleDashboard(
      "schriftfuehrer",
      snapshot({ overview: { unveroeffentlichteProtokolle: 1 } })
    );

    expect(result.headline.title).toBe("1 Protokoll wartet auf Freigabe.");
  });

  it("ohne Entwuerfe und ohne Sitzung: ruhige Headline", () => {
    const result = computeRoleDashboard("schriftfuehrer", snapshot({}));

    expect(result.headline.title).toBe("Keine Sitzung in Sicht.");
  });
});

describe("computeRoleDashboard — Revier-Admin", () => {
  it("zeigt Konflikt-Warnung in der Headline, wenn welche da sind", () => {
    const result = computeRoleDashboard(
      "revier-admin",
      snapshot({ overview: { ansitzeMitKonflikt: 2 } })
    );

    expect(result.headline.eyebrow).toBe("Revier-Admin");
    expect(result.headline.title).toContain("2 Ansitze");
    expect(result.headline.title).toContain("Konflikte");
  });

  it("priorisiert Konflikt vor Wartungen", () => {
    const result = computeRoleDashboard(
      "revier-admin",
      snapshot({ overview: { ansitzeMitKonflikt: 1, offeneWartungen: 5 } })
    );

    expect(result.headline.title).toContain("Konflikt");
  });

  it("Tiles: Wartungen, Aktive Ansitze, Aufgaben", () => {
    const result = computeRoleDashboard(
      "revier-admin",
      snapshot({
        overview: { offeneWartungen: 4, aktiveAnsitze: 2, offeneAufgaben: 1 }
      })
    );

    expect(result.tiles.map((t) => t.label)).toEqual([
      "Wartungen",
      "Aktive Ansitze",
      "Aufgaben"
    ]);
    expect(result.tiles[0].value).toBe(4);
    expect(result.tiles[1].value).toBe(2);
    expect(result.tiles[2].value).toBe(1);
  });

  it("platform-admin nutzt das gleiche Layout wie revier-admin", () => {
    const a = computeRoleDashboard("platform-admin", snapshot({}));
    const b = computeRoleDashboard("revier-admin", snapshot({}));
    expect(a.headline.eyebrow).toBe(b.headline.eyebrow);
    expect(a.tiles.map((t) => t.label)).toEqual(b.tiles.map((t) => t.label));
  });
});

describe("computeRoleDashboard — Jaeger", () => {
  it("zeigt eigenen aktiven Ansitz in der Headline", () => {
    const result = computeRoleDashboard(
      "jaeger",
      snapshot({
        membershipId: "m1",
        activeAnsitze: [
          { membershipId: "m1", standortName: "Hochstand 4" },
          { membershipId: "m2", standortName: "Kanzel" }
        ]
      })
    );

    expect(result.headline.eyebrow).toBe("Mein Beitrag");
    expect(result.headline.title).toContain("Hochstand 4");
    expect(result.tiles[0].label).toBe("Mein Ansitz");
    expect(result.tiles[0].value).toBe(1);
  });

  it("ignoriert Ansitze anderer Mitglieder", () => {
    const result = computeRoleDashboard(
      "jaeger",
      snapshot({
        membershipId: "m1",
        activeAnsitze: [{ membershipId: "m2", standortName: "Kanzel" }]
      })
    );

    expect(result.tiles[0].value).toBe(0);
    expect(result.headline.title).not.toContain("Kanzel");
  });

  it("zaehlt nur heutiges Fallwild des eigenen Mitglieds", () => {
    const today = new Date();
    const todayIso = today.toISOString();
    const yesterdayIso = new Date(today.getTime() - 86_400_000).toISOString();

    const result = computeRoleDashboard(
      "jaeger",
      snapshot({
        membershipId: "m1",
        recentFallwild: [
          { reportedByMembershipId: "m1", recordedAt: todayIso },
          { reportedByMembershipId: "m1", recordedAt: yesterdayIso },
          { reportedByMembershipId: "m2", recordedAt: todayIso }
        ]
      })
    );

    expect(result.tiles[1].label).toBe("Mein Fallwild");
    expect(result.tiles[1].value).toBe(1);
  });
});

describe("computeRoleDashboard — Ausgeher (default-Fallback)", () => {
  it("zeigt Lagebild mit aktiven Ansitzen", () => {
    const result = computeRoleDashboard(
      "ausgeher",
      snapshot({ overview: { aktiveAnsitze: 3 } })
    );

    expect(result.headline.eyebrow).toBe("Lagebild");
    expect(result.headline.title).toContain("3 aktive Ansitze");
  });

  it("Tiles: Aktive Ansitze, Fallwild heute, Wartungen", () => {
    const result = computeRoleDashboard("ausgeher", snapshot({}));

    expect(result.tiles.map((t) => t.label)).toEqual([
      "Aktive Ansitze",
      "Fallwild heute",
      "Wartungen"
    ]);
  });
});
