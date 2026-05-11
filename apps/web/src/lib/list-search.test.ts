import { describe, expect, it } from "vitest";

import { filterBySearch, hasActiveSearch, tokenizeSearch } from "./list-search";

describe("tokenizeSearch", () => {
  it("liefert leeres Array bei leerer Eingabe", () => {
    expect(tokenizeSearch("")).toEqual([]);
    expect(tokenizeSearch("   ")).toEqual([]);
  });

  it("zerlegt mehrere Tokens und normalisiert Klein-/Grossbuchstaben", () => {
    expect(tokenizeSearch("REH Strasshof")).toEqual(["reh", "strasshof"]);
  });

  it("ignoriert mehrfache Whitespaces", () => {
    expect(tokenizeSearch("  reh   strasshof  ")).toEqual(["reh", "strasshof"]);
  });
});

describe("filterBySearch", () => {
  interface Entry {
    id: string;
    name: string;
    note?: string;
  }

  const entries: Entry[] = [
    { id: "a", name: "Hochstand 4", note: "Waldrand Nord" },
    { id: "b", name: "Kanzel Süd" },
    { id: "c", name: "Salzlecke West", note: "neu gestrichen" }
  ];

  function toHaystack(entry: Entry): string {
    return `${entry.name} ${entry.note ?? ""}`;
  }

  it("leere Suche gibt alle Eintraege durch", () => {
    expect(filterBySearch(entries, "", toHaystack)).toHaveLength(3);
  });

  it("filtert nach einem Token", () => {
    const result = filterBySearch(entries, "kanzel", toHaystack);
    expect(result.map((entry) => entry.id)).toEqual(["b"]);
  });

  it("AND-Semantik: alle Tokens muessen matchen", () => {
    const result = filterBySearch(entries, "salzlecke gestrichen", toHaystack);
    expect(result.map((entry) => entry.id)).toEqual(["c"]);

    const noMatch = filterBySearch(entries, "salzlecke schwarzwild", toHaystack);
    expect(noMatch).toHaveLength(0);
  });

  it("case-insensitive", () => {
    expect(filterBySearch(entries, "WALDRAND", toHaystack).map((entry) => entry.id)).toEqual(["a"]);
  });

  it("matcht Teil-Strings (nicht nur Wortgrenzen)", () => {
    expect(filterBySearch(entries, "hoch", toHaystack).map((entry) => entry.id)).toEqual(["a"]);
  });
});

describe("hasActiveSearch", () => {
  it("false bei leeren oder whitespace-only Eingaben", () => {
    expect(hasActiveSearch("")).toBe(false);
    expect(hasActiveSearch("   ")).toBe(false);
  });

  it("true sobald ein Token darin ist", () => {
    expect(hasActiveSearch("reh")).toBe(true);
    expect(hasActiveSearch("  strasshof  ")).toBe(true);
  });
});
