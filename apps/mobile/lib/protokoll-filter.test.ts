import type { ProtokollListItem } from "@hege/domain";
import { describe, expect, it } from "vitest";

import {
  applyProtokollFilter,
  DEFAULT_PROTOKOLL_FILTER,
  isProtokollFilterActive
} from "./protokoll-filter.helpers";

function protokoll(
  overrides: Partial<ProtokollListItem> & { id: string; title: string; scheduledAt: string }
): ProtokollListItem {
  return {
    id: overrides.id,
    revierId: overrides.revierId ?? "r1",
    title: overrides.title,
    scheduledAt: overrides.scheduledAt,
    locationLabel: overrides.locationLabel ?? "Jagdhaus",
    status: overrides.status ?? "freigegeben",
    latestVersionCreatedAt: overrides.latestVersionCreatedAt,
    summaryPreview: overrides.summaryPreview,
    beschlussCount: overrides.beschlussCount ?? 0,
    publishedDocument: overrides.publishedDocument
  } as ProtokollListItem;
}

describe("applyProtokollFilter", () => {
  it("leerer Filter liefert alle Eintraege, Termin DESC", () => {
    const list = [
      protokoll({ id: "alt", title: "Alt", scheduledAt: "2026-01-01T10:00:00Z" }),
      protokoll({ id: "neu", title: "Neu", scheduledAt: "2026-04-01T10:00:00Z" }),
      protokoll({ id: "mit", title: "Mitte", scheduledAt: "2026-02-15T10:00:00Z" })
    ];

    const result = applyProtokollFilter(list, DEFAULT_PROTOKOLL_FILTER);
    expect(result.map((entry) => entry.id)).toEqual(["neu", "mit", "alt"]);
  });

  it("Status-Filter zeigt nur passende Eintraege", () => {
    const list = [
      protokoll({ id: "a", title: "A", scheduledAt: "2026-01-01T10:00:00Z", status: "entwurf" }),
      protokoll({ id: "b", title: "B", scheduledAt: "2026-02-01T10:00:00Z", status: "freigegeben" }),
      protokoll({ id: "c", title: "C", scheduledAt: "2026-03-01T10:00:00Z", status: "entwurf" })
    ];

    const result = applyProtokollFilter(list, {
      ...DEFAULT_PROTOKOLL_FILTER,
      status: "freigegeben"
    });

    expect(result.map((entry) => entry.id)).toEqual(["b"]);
  });

  it("Volltext-Suche matcht Titel, Ort und SummaryPreview", () => {
    const list = [
      protokoll({
        id: "a",
        title: "Jahreshauptversammlung",
        scheduledAt: "2026-01-01T10:00:00Z",
        locationLabel: "Jagdhaus",
        summaryPreview: "Wahlen"
      }),
      protokoll({
        id: "b",
        title: "Reviergespraech",
        scheduledAt: "2026-02-01T10:00:00Z",
        locationLabel: "Gemeindesaal",
        summaryPreview: "Pachtvertrag"
      })
    ];

    // Match in title
    expect(
      applyProtokollFilter(list, { ...DEFAULT_PROTOKOLL_FILTER, search: "jahres" })
        .map((entry) => entry.id)
    ).toEqual(["a"]);

    // Match in summary
    expect(
      applyProtokollFilter(list, { ...DEFAULT_PROTOKOLL_FILTER, search: "pacht" })
        .map((entry) => entry.id)
    ).toEqual(["b"]);

    // Match in locationLabel
    expect(
      applyProtokollFilter(list, { ...DEFAULT_PROTOKOLL_FILTER, search: "gemeinde" })
        .map((entry) => entry.id)
    ).toEqual(["b"]);
  });

  it("Sort termin-aelteste liefert ASC", () => {
    const list = [
      protokoll({ id: "neu", title: "Neu", scheduledAt: "2026-04-01T10:00:00Z" }),
      protokoll({ id: "alt", title: "Alt", scheduledAt: "2026-01-01T10:00:00Z" })
    ];

    const result = applyProtokollFilter(list, {
      ...DEFAULT_PROTOKOLL_FILTER,
      sort: "termin-aelteste"
    });

    expect(result.map((entry) => entry.id)).toEqual(["alt", "neu"]);
  });

  it("Sort nach-titel fuegt termin-DESC als Sekundaerkey ein", () => {
    const list = [
      protokoll({ id: "b1", title: "Beschluss", scheduledAt: "2026-01-01T10:00:00Z" }),
      protokoll({ id: "b2", title: "Beschluss", scheduledAt: "2026-04-01T10:00:00Z" }),
      protokoll({ id: "a1", title: "Anstand", scheduledAt: "2026-02-01T10:00:00Z" })
    ];

    const result = applyProtokollFilter(list, {
      ...DEFAULT_PROTOKOLL_FILTER,
      sort: "nach-titel"
    });

    // Anstand < Beschluss (alphabetisch). Innerhalb von "Beschluss"
    // kommt das spaetere Datum zuerst (Sekundaer-Sort DESC).
    expect(result.map((entry) => entry.id)).toEqual(["a1", "b2", "b1"]);
  });

  it("Sort nach-beschluesse sortiert DESC nach Beschluss-Anzahl", () => {
    const list = [
      protokoll({ id: "viele", title: "A", scheduledAt: "2026-01-01T10:00:00Z", beschlussCount: 5 }),
      protokoll({ id: "wenige", title: "B", scheduledAt: "2026-02-01T10:00:00Z", beschlussCount: 1 }),
      protokoll({ id: "keine", title: "C", scheduledAt: "2026-03-01T10:00:00Z", beschlussCount: 0 })
    ];

    const result = applyProtokollFilter(list, {
      ...DEFAULT_PROTOKOLL_FILTER,
      sort: "nach-beschluesse"
    });

    expect(result.map((entry) => entry.id)).toEqual(["viele", "wenige", "keine"]);
  });
});

describe("isProtokollFilterActive", () => {
  it("Default-Filter ist nicht aktiv", () => {
    expect(isProtokollFilterActive(DEFAULT_PROTOKOLL_FILTER)).toBe(false);
  });

  it("Search trimmt und erkennt nur echte Eingaben", () => {
    expect(
      isProtokollFilterActive({ ...DEFAULT_PROTOKOLL_FILTER, search: "   " })
    ).toBe(false);
    expect(
      isProtokollFilterActive({ ...DEFAULT_PROTOKOLL_FILTER, search: "abc" })
    ).toBe(true);
  });

  it("Status- oder Sort-Wechsel weg vom Default ist aktiv", () => {
    expect(
      isProtokollFilterActive({ ...DEFAULT_PROTOKOLL_FILTER, status: "entwurf" })
    ).toBe(true);
    expect(
      isProtokollFilterActive({ ...DEFAULT_PROTOKOLL_FILTER, sort: "nach-titel" })
    ).toBe(true);
  });
});
