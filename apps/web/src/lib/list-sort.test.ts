import { describe, expect, it } from "vitest";

import {
  compareValues,
  nextSortState,
  sortByColumn,
  type SortState
} from "./list-sort";

describe("compareValues", () => {
  it("null wird als groesster Wert behandelt", () => {
    expect(compareValues(null, "a")).toBeGreaterThan(0);
    expect(compareValues("a", null)).toBeLessThan(0);
    expect(compareValues(null, null)).toBe(0);
  });

  it("Numbers werden numerisch verglichen", () => {
    expect(compareValues(1, 2)).toBe(-1);
    expect(compareValues(10, 5)).toBe(5);
    expect(compareValues(2.5, 2.5)).toBe(0);
  });

  it("Strings nutzen dt-AT-Collator (Umlaut-bewusst)", () => {
    expect(compareValues("Auwiese", "Bach")).toBeLessThan(0);
    expect(compareValues("Über", "Zoll")).toBeLessThan(0);
  });
});

describe("sortByColumn", () => {
  interface Row {
    id: string;
    name: string;
    age: number;
    started?: string | null;
  }

  const rows: Row[] = [
    { id: "a", name: "Reh", age: 3, started: "2026-05-10T08:00:00Z" },
    { id: "b", name: "Auerhahn", age: 5, started: null },
    { id: "c", name: "Schwarzwild", age: 2, started: "2026-05-11T07:00:00Z" }
  ];

  const accessors = {
    name: (row: Row) => row.name,
    age: (row: Row) => row.age,
    started: (row: Row) => row.started ?? null
  };

  it("sortiert aufsteigend nach String-Spalte", () => {
    const result = sortByColumn(rows, { column: "name", direction: "asc" }, accessors);
    expect(result.map((row) => row.id)).toEqual(["b", "a", "c"]);
  });

  it("sortiert absteigend nach String-Spalte", () => {
    const result = sortByColumn(rows, { column: "name", direction: "desc" }, accessors);
    expect(result.map((row) => row.id)).toEqual(["c", "a", "b"]);
  });

  it("sortiert nach Zahlen-Spalte", () => {
    const result = sortByColumn(rows, { column: "age", direction: "asc" }, accessors);
    expect(result.map((row) => row.id)).toEqual(["c", "a", "b"]);
  });

  it("null-Werte bleiben bei ASC am Ende", () => {
    const result = sortByColumn(rows, { column: "started", direction: "asc" }, accessors);
    expect(result.map((row) => row.id)).toEqual(["a", "c", "b"]);
  });

  it("null-Werte bleiben bei DESC am Ende der Sicht (b mit null landet zuerst weil null>any)", () => {
    const result = sortByColumn(rows, { column: "started", direction: "desc" }, accessors);
    // Wegen Inverse-Compare landet null jetzt zuerst (groesste -> oben).
    expect(result.map((row) => row.id)).toEqual(["b", "c", "a"]);
  });

  it("unbekannte Spalte gibt unveraenderte Liste zurueck (defensive)", () => {
    const unknownState = { column: "doesnt-exist" as keyof typeof accessors, direction: "asc" as const };
    const result = sortByColumn(rows, unknownState, accessors);
    expect(result).toEqual(rows);
  });
});

describe("nextSortState", () => {
  it("erste Aktivierung einer Spalte setzt ASC", () => {
    const current: SortState<"name" | "age"> = { column: "name", direction: "desc" };
    expect(nextSortState(current, "age")).toEqual({ column: "age", direction: "asc" });
  });

  it("zweite Aktivierung derselben Spalte dreht Richtung", () => {
    expect(
      nextSortState<"name">({ column: "name", direction: "asc" }, "name")
    ).toEqual({ column: "name", direction: "desc" });

    expect(
      nextSortState<"name">({ column: "name", direction: "desc" }, "name")
    ).toEqual({ column: "name", direction: "asc" });
  });
});
