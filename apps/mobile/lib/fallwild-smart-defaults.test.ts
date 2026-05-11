import type { FallwildVorgang, Wildart } from "@hege/domain";
import { describe, expect, it } from "vitest";

import { computeFallwildSmartDefaults } from "./fallwild-smart-defaults.helpers";

function fw(
  overrides: { id: string; recordedAt: string; wildart?: Wildart; gemeinde?: string; lat?: number; lng?: number }
): FallwildVorgang {
  return {
    id: overrides.id,
    revierId: "r1",
    reportedByMembershipId: "m1",
    recordedAt: overrides.recordedAt,
    location: { lat: overrides.lat ?? 48, lng: overrides.lng ?? 16 },
    wildart: overrides.wildart ?? "Reh",
    geschlecht: "unbekannt",
    altersklasse: "Adult",
    bergungsStatus: "erfasst",
    gemeinde: overrides.gemeinde ?? "Gänserndorf",
    photos: []
  } as FallwildVorgang;
}

const NOW = new Date("2026-05-11T12:00:00Z");

describe("computeFallwildSmartDefaults", () => {
  it("leere Historie liefert nur undefined-Defaults", () => {
    const result = computeFallwildSmartDefaults([], { now: NOW });

    expect(result.wildart).toBeUndefined();
    expect(result.location).toBeUndefined();
    expect(result.gemeinde).toBeUndefined();
  });

  it("haeufigste Wildart der letzten 30 Tage gewinnt", () => {
    const history = [
      fw({ id: "1", recordedAt: "2026-05-01T08:00:00Z", wildart: "Reh" }),
      fw({ id: "2", recordedAt: "2026-05-02T08:00:00Z", wildart: "Reh" }),
      fw({ id: "3", recordedAt: "2026-05-03T08:00:00Z", wildart: "Schwarzwild" }),
      fw({ id: "4", recordedAt: "2026-05-04T08:00:00Z", wildart: "Fuchs" })
    ];

    expect(computeFallwildSmartDefaults(history, { now: NOW }).wildart).toBe("Reh");
  });

  it("Standort kommt vom neuesten Eintrag im Lookback-Fenster", () => {
    const history = [
      fw({ id: "alt", recordedAt: "2026-05-01T08:00:00Z", lat: 47.0, lng: 14.0 }),
      fw({ id: "neu", recordedAt: "2026-05-10T08:00:00Z", lat: 48.5, lng: 16.5 })
    ];

    const result = computeFallwildSmartDefaults(history, { now: NOW });

    expect(result.location).toEqual({ lat: 48.5, lng: 16.5 });
  });

  it("alte Eintraege (>30 Tage) fliessen NICHT in den Lookback ein", () => {
    const history = [
      fw({ id: "alt", recordedAt: "2026-03-01T08:00:00Z", wildart: "Schwarzwild" }),
      fw({ id: "frisch", recordedAt: "2026-05-10T08:00:00Z", wildart: "Reh" })
    ];

    // Im Lookback ist nur "frisch", also Reh
    expect(computeFallwildSmartDefaults(history, { now: NOW }).wildart).toBe("Reh");
  });

  it("wenn Lookback leer ist, faellt es auf neuesten Global-Eintrag zurueck", () => {
    const history = [
      fw({ id: "alt-1", recordedAt: "2026-02-01T08:00:00Z", wildart: "Reh" }),
      fw({ id: "alt-2", recordedAt: "2026-03-01T08:00:00Z", wildart: "Schwarzwild" })
    ];

    // Beide ausserhalb 30-Tage-Lookback. Fallback nimmt neueste = alt-2.
    expect(computeFallwildSmartDefaults(history, { now: NOW }).wildart).toBe("Schwarzwild");
  });

  it("Gemeinde-Filter schraenkt Lookback ein", () => {
    const history = [
      fw({ id: "g1", recordedAt: "2026-05-10T08:00:00Z", wildart: "Reh", gemeinde: "Gänserndorf" }),
      fw({ id: "g2", recordedAt: "2026-05-09T08:00:00Z", wildart: "Reh", gemeinde: "Gänserndorf" }),
      fw({ id: "s1", recordedAt: "2026-05-10T10:00:00Z", wildart: "Schwarzwild", gemeinde: "Strasshof" })
    ];

    const inGaenserndorf = computeFallwildSmartDefaults(history, {
      now: NOW,
      gemeinde: "Gänserndorf"
    });
    expect(inGaenserndorf.wildart).toBe("Reh");

    const inStrasshof = computeFallwildSmartDefaults(history, {
      now: NOW,
      gemeinde: "Strasshof"
    });
    expect(inStrasshof.wildart).toBe("Schwarzwild");
  });

  it("custom Lookback-Days laesst Aelteres ein", () => {
    const history = [
      fw({ id: "lang-zurueck", recordedAt: "2026-02-01T08:00:00Z", wildart: "Hase" })
    ];

    expect(
      computeFallwildSmartDefaults(history, { now: NOW, lookbackDays: 365 }).wildart
    ).toBe("Hase");
  });
});
