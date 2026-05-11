import type { ReviereinrichtungListItem } from "@hege/domain";
import { describe, expect, it } from "vitest";

import {
  applyReviereinrichtungFilter,
  DEFAULT_REVIEREINRICHTUNG_FILTER,
  isReviereinrichtungFilterActive
} from "./reviereinrichtung-filter.helpers";

function einrichtung(
  overrides: Partial<ReviereinrichtungListItem> & { id: string; name: string }
): ReviereinrichtungListItem {
  return {
    id: overrides.id,
    revierId: "r1",
    type: overrides.type ?? "hochstand",
    name: overrides.name,
    status: overrides.status ?? "gut",
    location: overrides.location ?? { lat: 48, lng: 16 },
    beschreibung: overrides.beschreibung,
    photos: overrides.photos ?? [],
    kontrollen: overrides.kontrollen ?? [],
    wartung: overrides.wartung ?? [],
    offeneWartungen: overrides.offeneWartungen ?? 0,
    letzteKontrolleAt: overrides.letzteKontrolleAt
  } as ReviereinrichtungListItem;
}

describe("applyReviereinrichtungFilter", () => {
  it("leerer Filter laesst alle Eintraege durch (alphabetisch)", () => {
    const list = [
      einrichtung({ id: "z", name: "Zentralkanzel" }),
      einrichtung({ id: "a", name: "Auwiese" })
    ];

    const result = applyReviereinrichtungFilter(list, DEFAULT_REVIEREINRICHTUNG_FILTER);

    expect(result.map((entry) => entry.id)).toEqual(["a", "z"]);
  });

  it("Typ-Filter zeigt nur passende Einrichtungen", () => {
    const list = [
      einrichtung({ id: "h", name: "Hochstand 1", type: "hochstand" }),
      einrichtung({ id: "f", name: "Fütterung Süd", type: "fuetterung" }),
      einrichtung({ id: "s", name: "Salzlecke West", type: "salzlecke" })
    ];

    const result = applyReviereinrichtungFilter(list, {
      ...DEFAULT_REVIEREINRICHTUNG_FILTER,
      typ: "fuetterung"
    });

    expect(result.map((entry) => entry.id)).toEqual(["f"]);
  });

  it("Zustand-Filter zeigt nur passende Einrichtungen", () => {
    const list = [
      einrichtung({ id: "ok", name: "A", status: "gut" }),
      einrichtung({ id: "wartung", name: "B", status: "wartung-faellig" }),
      einrichtung({ id: "gesperrt", name: "C", status: "gesperrt" })
    ];

    const result = applyReviereinrichtungFilter(list, {
      ...DEFAULT_REVIEREINRICHTUNG_FILTER,
      zustand: "gesperrt"
    });

    expect(result.map((entry) => entry.id)).toEqual(["gesperrt"]);
  });

  it("Volltext-Suche matcht Name, Typ und Beschreibung", () => {
    const list = [
      einrichtung({ id: "a", name: "Waldrand Nord", beschreibung: "Standfest" }),
      einrichtung({ id: "b", name: "Wiesenrand Süd", beschreibung: "neu gestrichen" }),
      einrichtung({ id: "c", name: "Fluss-West", beschreibung: "Wackelt" })
    ];

    expect(
      applyReviereinrichtungFilter(list, {
        ...DEFAULT_REVIEREINRICHTUNG_FILTER,
        search: "wald"
      }).map((entry) => entry.id)
    ).toEqual(["a"]);

    expect(
      applyReviereinrichtungFilter(list, {
        ...DEFAULT_REVIEREINRICHTUNG_FILTER,
        search: "gestrichen"
      }).map((entry) => entry.id)
    ).toEqual(["b"]);
  });

  it("'nach-zustand'-Sortierung: gesperrt zuerst, gut zuletzt", () => {
    const list = [
      einrichtung({ id: "ok", name: "A", status: "gut" }),
      einrichtung({ id: "wartung", name: "B", status: "wartung-faellig" }),
      einrichtung({ id: "gesperrt", name: "C", status: "gesperrt" })
    ];

    const result = applyReviereinrichtungFilter(list, {
      ...DEFAULT_REVIEREINRICHTUNG_FILTER,
      sort: "nach-zustand"
    });

    expect(result.map((entry) => entry.id)).toEqual(["gesperrt", "wartung", "ok"]);
  });

  it("'nach-wartungen-desc' sortiert nach offeneWartungen absteigend", () => {
    const list = [
      einrichtung({ id: "wenig", name: "A", offeneWartungen: 1 }),
      einrichtung({ id: "viel", name: "B", offeneWartungen: 5 }),
      einrichtung({ id: "keine", name: "C", offeneWartungen: 0 })
    ];

    const result = applyReviereinrichtungFilter(list, {
      ...DEFAULT_REVIEREINRICHTUNG_FILTER,
      sort: "nach-wartungen-desc"
    });

    expect(result.map((entry) => entry.id)).toEqual(["viel", "wenig", "keine"]);
  });

  it("kombiniert Typ + Zustand + Suche kumulativ", () => {
    const list = [
      einrichtung({
        id: "match",
        name: "Suedwiese",
        type: "hochstand",
        status: "wartung-faellig"
      }),
      einrichtung({
        id: "wrong-typ",
        name: "Suedwiese",
        type: "fuetterung",
        status: "wartung-faellig"
      }),
      einrichtung({
        id: "wrong-status",
        name: "Suedwiese",
        type: "hochstand",
        status: "gut"
      }),
      einrichtung({
        id: "wrong-name",
        name: "Nordrand",
        type: "hochstand",
        status: "wartung-faellig"
      })
    ];

    const result = applyReviereinrichtungFilter(list, {
      search: "suedwiese",
      typ: "hochstand",
      zustand: "wartung-faellig",
      sort: "alphabetisch"
    });

    expect(result.map((entry) => entry.id)).toEqual(["match"]);
  });
});

describe("isReviereinrichtungFilterActive", () => {
  it("Default ist nicht aktiv", () => {
    expect(isReviereinrichtungFilterActive(DEFAULT_REVIEREINRICHTUNG_FILTER)).toBe(false);
  });

  it("Search aktiviert", () => {
    expect(
      isReviereinrichtungFilterActive({ ...DEFAULT_REVIEREINRICHTUNG_FILTER, search: "wald" })
    ).toBe(true);
  });

  it("Whitespace-only Search ist nicht aktiv", () => {
    expect(
      isReviereinrichtungFilterActive({ ...DEFAULT_REVIEREINRICHTUNG_FILTER, search: "  " })
    ).toBe(false);
  });

  it("Sort-Wechsel aktiviert", () => {
    expect(
      isReviereinrichtungFilterActive({
        ...DEFAULT_REVIEREINRICHTUNG_FILTER,
        sort: "nach-zustand"
      })
    ).toBe(true);
  });
});
