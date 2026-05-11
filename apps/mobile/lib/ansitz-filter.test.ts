import type { AnsitzSession } from "@hege/domain";
import { describe, expect, it } from "vitest";

import {
  applyAnsitzFilter,
  DEFAULT_ANSITZ_FILTER,
  isAnsitzFilterActive
} from "./ansitz-filter.helpers";

function ansitz(
  overrides: Partial<AnsitzSession> & { id: string; startedAt: string }
): AnsitzSession {
  return {
    id: overrides.id,
    revierId: "r1",
    membershipId: "m1",
    standortName: overrides.standortName ?? "Hochstand",
    standortId: overrides.standortId,
    location: overrides.location ?? { lat: 48, lng: 16 },
    startedAt: overrides.startedAt,
    plannedEndAt: overrides.plannedEndAt,
    endedAt: overrides.endedAt,
    note: overrides.note,
    status: overrides.status ?? "active",
    conflict: overrides.conflict ?? false
  } as AnsitzSession;
}

const NOW = new Date("2026-05-11T12:00:00Z");

describe("applyAnsitzFilter", () => {
  it("leerer Filter laesst alle Eintraege durch (neueste zuerst)", () => {
    const list = [
      ansitz({ id: "a", startedAt: "2026-05-10T08:00:00Z" }),
      ansitz({ id: "b", startedAt: "2026-05-11T10:00:00Z" })
    ];

    expect(applyAnsitzFilter(list, DEFAULT_ANSITZ_FILTER, NOW).map((entry) => entry.id)).toEqual([
      "b",
      "a"
    ]);
  });

  it("Zeitraum 'heute' schliesst gestrige Ansitze aus", () => {
    const list = [
      ansitz({ id: "gestern", startedAt: "2026-05-10T08:00:00Z" }),
      ansitz({ id: "heute", startedAt: "2026-05-11T10:00:00Z" })
    ];

    const result = applyAnsitzFilter(
      list,
      { ...DEFAULT_ANSITZ_FILTER, zeitraum: "heute" },
      NOW
    );

    expect(result.map((entry) => entry.id)).toEqual(["heute"]);
  });

  it("Konflikt-Filter 'mit-konflikt' zeigt nur Konflikt-Ansitze", () => {
    const list = [
      ansitz({ id: "ok", startedAt: "2026-05-11T08:00:00Z", conflict: false }),
      ansitz({ id: "conflict", startedAt: "2026-05-11T09:00:00Z", conflict: true })
    ];

    const result = applyAnsitzFilter(list, { ...DEFAULT_ANSITZ_FILTER, konflikt: "mit-konflikt" }, NOW);

    expect(result.map((entry) => entry.id)).toEqual(["conflict"]);
  });

  it("Konflikt-Filter 'ohne-konflikt' verbirgt Konflikt-Ansitze", () => {
    const list = [
      ansitz({ id: "ok", startedAt: "2026-05-11T08:00:00Z", conflict: false }),
      ansitz({ id: "conflict", startedAt: "2026-05-11T09:00:00Z", conflict: true })
    ];

    const result = applyAnsitzFilter(
      list,
      { ...DEFAULT_ANSITZ_FILTER, konflikt: "ohne-konflikt" },
      NOW
    );

    expect(result.map((entry) => entry.id)).toEqual(["ok"]);
  });

  it("Volltextsuche matcht Standortname, Lagebezeichnung und Notiz", () => {
    const list = [
      ansitz({
        id: "a",
        startedAt: "2026-05-11T08:00:00Z",
        standortName: "Hochstand Nord",
        note: "Wackelig"
      }),
      ansitz({
        id: "b",
        startedAt: "2026-05-11T09:00:00Z",
        standortName: "Kanzel Süd",
        location: { lat: 0, lng: 0, label: "Wiese" }
      }),
      ansitz({
        id: "c",
        startedAt: "2026-05-11T10:00:00Z",
        standortName: "Salzlecke",
        note: "Nord-Westen, gut sichtbar"
      })
    ];

    expect(
      applyAnsitzFilter(list, { ...DEFAULT_ANSITZ_FILTER, search: "nord" }, NOW).map(
        (entry) => entry.id
      )
    ).toEqual(["c", "a"]);

    expect(
      applyAnsitzFilter(list, { ...DEFAULT_ANSITZ_FILTER, search: "wiese" }, NOW).map(
        (entry) => entry.id
      )
    ).toEqual(["b"]);
  });

  it("Sortierung 'nach-standort' alphabetisch mit dt. Umlauten", () => {
    const list = [
      ansitz({ id: "z", startedAt: "2026-05-11T08:00:00Z", standortName: "Zollhütte" }),
      ansitz({ id: "a", startedAt: "2026-05-11T09:00:00Z", standortName: "Auwald" }),
      ansitz({ id: "u", startedAt: "2026-05-11T10:00:00Z", standortName: "Über dem Bach" })
    ];

    const result = applyAnsitzFilter(list, { ...DEFAULT_ANSITZ_FILTER, sort: "nach-standort" }, NOW);

    expect(result.map((entry) => entry.id)).toEqual(["a", "u", "z"]);
  });

  it("kombiniert Zeitraum + Konflikt + Suche kumulativ", () => {
    const list = [
      ansitz({
        id: "match",
        startedAt: "2026-05-11T08:00:00Z",
        conflict: true,
        standortName: "Hochstand 4"
      }),
      ansitz({
        id: "wrong-zeit",
        startedAt: "2026-05-01T08:00:00Z",
        conflict: true,
        standortName: "Hochstand 4"
      }),
      ansitz({
        id: "wrong-konflikt",
        startedAt: "2026-05-11T08:00:00Z",
        conflict: false,
        standortName: "Hochstand 4"
      }),
      ansitz({
        id: "wrong-name",
        startedAt: "2026-05-11T08:00:00Z",
        conflict: true,
        standortName: "Kanzel"
      })
    ];

    const result = applyAnsitzFilter(
      list,
      {
        search: "hochstand",
        konflikt: "mit-konflikt",
        zeitraum: "woche",
        sort: "neueste-zuerst"
      },
      NOW
    );

    expect(result.map((entry) => entry.id)).toEqual(["match"]);
  });
});

describe("isAnsitzFilterActive", () => {
  it("Default ist nicht aktiv", () => {
    expect(isAnsitzFilterActive(DEFAULT_ANSITZ_FILTER)).toBe(false);
  });

  it("Whitespace-Suche zaehlt nicht", () => {
    expect(isAnsitzFilterActive({ ...DEFAULT_ANSITZ_FILTER, search: "  " })).toBe(false);
  });

  it("Konflikt/Zeitraum/Sort-Wechsel aktiviert", () => {
    expect(
      isAnsitzFilterActive({ ...DEFAULT_ANSITZ_FILTER, konflikt: "mit-konflikt" })
    ).toBe(true);
    expect(isAnsitzFilterActive({ ...DEFAULT_ANSITZ_FILTER, zeitraum: "heute" })).toBe(true);
    expect(
      isAnsitzFilterActive({ ...DEFAULT_ANSITZ_FILTER, sort: "nach-standort" })
    ).toBe(true);
  });
});
