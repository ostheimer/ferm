import type { AnsitzSession } from "@hege/domain";
import { describe, expect, it } from "vitest";

import { computeAnsitzSmartDefaults } from "./ansitz-smart-defaults.helpers";

function ansitz(
  overrides: Partial<AnsitzSession> & { id: string; startedAt: string }
): AnsitzSession {
  return {
    id: overrides.id,
    revierId: "r1",
    membershipId: overrides.membershipId ?? "m1",
    standortName: overrides.standortName ?? "Hochstand 1",
    location: overrides.location ?? { lat: 48.0, lng: 16.0 },
    startedAt: overrides.startedAt,
    status: "active",
    conflict: false
  } as AnsitzSession;
}

const NOW = new Date("2026-05-13T12:00:00Z");

describe("computeAnsitzSmartDefaults", () => {
  it("leerer Verlauf liefert leere Defaults", () => {
    expect(computeAnsitzSmartDefaults([], { now: NOW })).toEqual({
      standortName: undefined,
      location: undefined
    });
  });

  it("nimmt den haeufigsten Standort und die Position des neuesten Eintrags fuer ihn", () => {
    const history = [
      ansitz({
        id: "a",
        standortName: "Hochstand 1",
        startedAt: "2026-05-10T08:00:00Z",
        location: { lat: 48.1, lng: 16.1 }
      }),
      ansitz({
        id: "b",
        standortName: "Hochstand 1",
        startedAt: "2026-05-11T08:00:00Z",
        location: { lat: 48.11, lng: 16.11 }
      }),
      ansitz({
        id: "c",
        standortName: "Kanzel",
        startedAt: "2026-05-12T08:00:00Z",
        location: { lat: 48.2, lng: 16.2 }
      })
    ];

    const result = computeAnsitzSmartDefaults(history, { now: NOW });

    expect(result.standortName).toBe("Hochstand 1");
    // Position aus dem neuesten Hochstand-1-Eintrag (id b)
    expect(result.location).toEqual({ lat: 48.11, lng: 16.11 });
  });

  it("Lookback-Filter laesst alte Eintraege fallen", () => {
    const history = [
      ansitz({ id: "old", standortName: "Vergessen", startedAt: "2026-01-01T08:00:00Z" }),
      ansitz({ id: "fresh", standortName: "Aktuell", startedAt: "2026-05-12T08:00:00Z" })
    ];

    const result = computeAnsitzSmartDefaults(history, { lookbackDays: 30, now: NOW });

    expect(result.standortName).toBe("Aktuell");
  });

  it("Fallback bei nichts-im-Lookback: globaler neuester Eintrag", () => {
    const history = [
      ansitz({
        id: "old1",
        standortName: "Hoch 1",
        startedAt: "2025-01-01T08:00:00Z"
      }),
      ansitz({
        id: "old2",
        standortName: "Hoch 2",
        startedAt: "2025-02-01T08:00:00Z"
      })
    ];

    const result = computeAnsitzSmartDefaults(history, { lookbackDays: 30, now: NOW });

    expect(result.standortName).toBe("Hoch 2");
  });

  it("Membership-Filter nimmt nur Ansitze des angegebenen Mitglieds", () => {
    const history = [
      ansitz({
        id: "mine",
        membershipId: "m1",
        standortName: "Mein Hochstand",
        startedAt: "2026-05-12T08:00:00Z"
      }),
      ansitz({
        id: "other",
        membershipId: "m2",
        standortName: "Fremder Hochstand",
        startedAt: "2026-05-12T09:00:00Z"
      }),
      ansitz({
        id: "mine-alt",
        membershipId: "m1",
        standortName: "Mein Hochstand",
        startedAt: "2026-05-11T08:00:00Z"
      })
    ];

    const result = computeAnsitzSmartDefaults(history, { membershipId: "m1", now: NOW });

    expect(result.standortName).toBe("Mein Hochstand");
  });

  it("Ties brechen durch zuletzt-verwendet (filtered ist startedAt-desc sortiert)", () => {
    // Beide Standorte je einmal — der spaeter genutzte gewinnt.
    // mostFrequentStandort iteriert in Map-Insertion-Order (entspricht
    // filtered-Order = neueste zuerst), nimmt den ersten bei
    // count > bestCount. Bei Gleichstand bleibt also der zuerst
    // gesehene (= neueste) als "best".
    const history = [
      ansitz({
        id: "old",
        standortName: "Alt",
        startedAt: "2026-05-10T08:00:00Z"
      }),
      ansitz({
        id: "new",
        standortName: "Neu",
        startedAt: "2026-05-12T08:00:00Z"
      })
    ];

    const result = computeAnsitzSmartDefaults(history, { now: NOW });

    expect(result.standortName).toBe("Neu");
  });
});
