import type { FallwildVorgang } from "@hege/domain";
import { describe, expect, it } from "vitest";

import {
  applyFallwildFilter,
  DEFAULT_FALLWILD_FILTER,
  isFallwildFilterActive,
  type FallwildFilterState
} from "./fallwild-filter.helpers";

function fallwild(overrides: Partial<FallwildVorgang> & { id: string; recordedAt: string }): FallwildVorgang {
  return {
    id: overrides.id,
    revierId: "r1",
    reportedByMembershipId: "m1",
    recordedAt: overrides.recordedAt,
    location: overrides.location ?? { lat: 48, lng: 16 },
    wildart: overrides.wildart ?? "Reh",
    geschlecht: overrides.geschlecht ?? "unbekannt",
    altersklasse: overrides.altersklasse ?? "Adult",
    bergungsStatus: overrides.bergungsStatus ?? "erfasst",
    gemeinde: overrides.gemeinde ?? "Gänserndorf",
    strasse: overrides.strasse,
    roadReference: overrides.roadReference,
    note: overrides.note,
    photos: overrides.photos ?? []
  } as FallwildVorgang;
}

const NOW = new Date("2026-05-11T12:00:00Z");

describe("applyFallwildFilter — Filter-Kombinationen", () => {
  it("leerer Filter laesst alle Eintraege durch (neueste zuerst)", () => {
    const list = [
      fallwild({ id: "a", recordedAt: "2026-05-10T08:00:00Z" }),
      fallwild({ id: "b", recordedAt: "2026-05-11T10:00:00Z" })
    ];

    const result = applyFallwildFilter(list, DEFAULT_FALLWILD_FILTER, NOW);

    expect(result.map((entry) => entry.id)).toEqual(["b", "a"]);
  });

  it("Zeitraum 'heute' schliesst gestrige Eintraege aus", () => {
    const list = [
      fallwild({ id: "gestern", recordedAt: "2026-05-10T08:00:00Z" }),
      fallwild({ id: "heute", recordedAt: "2026-05-11T10:00:00Z" })
    ];

    const result = applyFallwildFilter(list, { ...DEFAULT_FALLWILD_FILTER, zeitraum: "heute" }, NOW);

    expect(result.map((entry) => entry.id)).toEqual(["heute"]);
  });

  it("Zeitraum 'woche' schliesst >7 Tage alte Eintraege aus", () => {
    const list = [
      fallwild({ id: "alt", recordedAt: "2026-05-01T00:00:00Z" }),
      fallwild({ id: "frisch", recordedAt: "2026-05-09T00:00:00Z" })
    ];

    const result = applyFallwildFilter(list, { ...DEFAULT_FALLWILD_FILTER, zeitraum: "woche" }, NOW);

    expect(result.map((entry) => entry.id)).toEqual(["frisch"]);
  });

  it("Bergungsstatus-Filter laesst nur passende Eintraege durch", () => {
    const list = [
      fallwild({ id: "e", recordedAt: "2026-05-11T08:00:00Z", bergungsStatus: "erfasst" }),
      fallwild({ id: "g", recordedAt: "2026-05-11T09:00:00Z", bergungsStatus: "geborgen" })
    ];

    const result = applyFallwildFilter(
      list,
      { ...DEFAULT_FALLWILD_FILTER, bergungsStatus: "geborgen" },
      NOW
    );

    expect(result.map((entry) => entry.id)).toEqual(["g"]);
  });

  it("Such-Token matcht Wildart, Gemeinde und Notiz (case-insensitive)", () => {
    const list = [
      fallwild({ id: "a", recordedAt: "2026-05-11T08:00:00Z", wildart: "Reh", gemeinde: "Gänserndorf" }),
      fallwild({ id: "b", recordedAt: "2026-05-11T09:00:00Z", wildart: "Schwarzwild", gemeinde: "Strasshof" }),
      fallwild({
        id: "c",
        recordedAt: "2026-05-11T10:00:00Z",
        wildart: "Reh",
        gemeinde: "Strasshof",
        note: "Auf der B8 gefunden"
      })
    ];

    expect(
      applyFallwildFilter(list, { ...DEFAULT_FALLWILD_FILTER, search: "strasshof" }, NOW).map(
        (entry) => entry.id
      )
    ).toEqual(["c", "b"]);

    expect(
      applyFallwildFilter(list, { ...DEFAULT_FALLWILD_FILTER, search: "B8" }, NOW).map(
        (entry) => entry.id
      )
    ).toEqual(["c"]);

    expect(
      applyFallwildFilter(list, { ...DEFAULT_FALLWILD_FILTER, search: "REH" }, NOW).map(
        (entry) => entry.id
      )
    ).toEqual(["c", "a"]);
  });

  it("Mehrere Such-Token muessen ALLE matchen (AND, nicht OR)", () => {
    const list = [
      fallwild({ id: "a", recordedAt: "2026-05-11T08:00:00Z", wildart: "Reh", gemeinde: "Gänserndorf" }),
      fallwild({ id: "b", recordedAt: "2026-05-11T09:00:00Z", wildart: "Reh", gemeinde: "Strasshof" })
    ];

    const result = applyFallwildFilter(
      list,
      { ...DEFAULT_FALLWILD_FILTER, search: "reh strasshof" },
      NOW
    );

    expect(result.map((entry) => entry.id)).toEqual(["b"]);
  });

  it("Sortierung 'aelteste-zuerst' kehrt die Default-Reihenfolge um", () => {
    const list = [
      fallwild({ id: "a", recordedAt: "2026-05-10T08:00:00Z" }),
      fallwild({ id: "b", recordedAt: "2026-05-11T10:00:00Z" })
    ];

    const result = applyFallwildFilter(
      list,
      { ...DEFAULT_FALLWILD_FILTER, sort: "aelteste-zuerst" },
      NOW
    );

    expect(result.map((entry) => entry.id)).toEqual(["a", "b"]);
  });

  it("Sortierung 'nach-wildart' alphabetisch deutsch", () => {
    const list = [
      fallwild({ id: "schwarz", recordedAt: "2026-05-11T08:00:00Z", wildart: "Schwarzwild" }),
      fallwild({ id: "reh", recordedAt: "2026-05-11T07:00:00Z", wildart: "Reh" }),
      fallwild({ id: "muffel", recordedAt: "2026-05-11T06:00:00Z", wildart: "Muffelwild" })
    ];

    const result = applyFallwildFilter(
      list,
      { ...DEFAULT_FALLWILD_FILTER, sort: "nach-wildart" },
      NOW
    );

    expect(result.map((entry) => entry.id)).toEqual(["muffel", "reh", "schwarz"]);
  });

  it("Sortierung 'nach-gemeinde' alphabetisch mit dt. Umlauten", () => {
    const list = [
      fallwild({ id: "z", recordedAt: "2026-05-11T08:00:00Z", gemeinde: "Zwerndorf" }),
      fallwild({ id: "g", recordedAt: "2026-05-11T07:00:00Z", gemeinde: "Gänserndorf" }),
      fallwild({ id: "a", recordedAt: "2026-05-11T06:00:00Z", gemeinde: "Auersthal" })
    ];

    const result = applyFallwildFilter(
      list,
      { ...DEFAULT_FALLWILD_FILTER, sort: "nach-gemeinde" },
      NOW
    );

    expect(result.map((entry) => entry.id)).toEqual(["a", "g", "z"]);
  });

  it("Filter-Kombinationen (Zeitraum + Status + Suche) wirken kumulativ", () => {
    const list = [
      fallwild({
        id: "match",
        recordedAt: "2026-05-11T10:00:00Z",
        bergungsStatus: "geborgen",
        wildart: "Reh",
        gemeinde: "Strasshof"
      }),
      fallwild({
        id: "wrong-status",
        recordedAt: "2026-05-11T10:00:00Z",
        bergungsStatus: "erfasst",
        wildart: "Reh",
        gemeinde: "Strasshof"
      }),
      fallwild({
        id: "wrong-zeit",
        recordedAt: "2026-05-01T10:00:00Z",
        bergungsStatus: "geborgen",
        wildart: "Reh",
        gemeinde: "Strasshof"
      }),
      fallwild({
        id: "wrong-search",
        recordedAt: "2026-05-11T10:00:00Z",
        bergungsStatus: "geborgen",
        wildart: "Schwarzwild",
        gemeinde: "Gänserndorf"
      })
    ];

    const filter: FallwildFilterState = {
      search: "reh",
      bergungsStatus: "geborgen",
      zeitraum: "woche",
      sort: "neueste-zuerst"
    };

    expect(applyFallwildFilter(list, filter, NOW).map((entry) => entry.id)).toEqual(["match"]);
  });
});

describe("isFallwildFilterActive", () => {
  it("Default-Filter ist nicht aktiv", () => {
    expect(isFallwildFilterActive(DEFAULT_FALLWILD_FILTER)).toBe(false);
  });

  it("Search-Token aktiviert den Filter", () => {
    expect(isFallwildFilterActive({ ...DEFAULT_FALLWILD_FILTER, search: "reh" })).toBe(true);
  });

  it("Whitespace-Suche zählt nicht als aktiv", () => {
    expect(isFallwildFilterActive({ ...DEFAULT_FALLWILD_FILTER, search: "   " })).toBe(false);
  });

  it("Bergungsstatus, Zeitraum oder Sort-Wechsel aktiviert", () => {
    expect(isFallwildFilterActive({ ...DEFAULT_FALLWILD_FILTER, bergungsStatus: "geborgen" })).toBe(
      true
    );
    expect(isFallwildFilterActive({ ...DEFAULT_FALLWILD_FILTER, zeitraum: "woche" })).toBe(true);
    expect(isFallwildFilterActive({ ...DEFAULT_FALLWILD_FILTER, sort: "nach-wildart" })).toBe(true);
  });
});
