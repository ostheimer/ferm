import type { BergungsStatus, FallwildVorgang } from "@hege/domain";

/**
 * Filter- und Sortier-Logik fuer die Fallwild-Liste (M1).
 *
 * Wir trennen reine Helper von Render: die Liste muss man frueh testen
 * koennen (Edge-Cases bei leeren Suchen, Sonderzeichen, Zeitfenstern),
 * ohne dabei einen RN-Renderer hochzuziehen. Render-State lebt in
 * `fallwild.tsx`, Logik hier.
 */

export type BergungsStatusFilter = "alle" | BergungsStatus;
export type ZeitraumFilter = "heute" | "woche" | "monat" | "alle";
export type FallwildSortKey =
  | "neueste-zuerst"
  | "aelteste-zuerst"
  | "nach-wildart"
  | "nach-gemeinde";

export interface FallwildFilterState {
  search: string;
  bergungsStatus: BergungsStatusFilter;
  zeitraum: ZeitraumFilter;
  sort: FallwildSortKey;
}

export const DEFAULT_FALLWILD_FILTER: FallwildFilterState = {
  search: "",
  bergungsStatus: "alle",
  zeitraum: "alle",
  sort: "neueste-zuerst"
};

/**
 * Wendet alle Filter und die Sortierung auf eine Fallwild-Liste an.
 * Reihenfolge: Erst Zeitraum, dann BergungsStatus, dann Suche, dann
 * Sortierung. Das ist die effizienteste Reihenfolge: Zeitraum und
 * Status sind billige Index-Vergleiche und schaffen die groessten
 * Listen-Reduktionen, die Volltextsuche ist teurer.
 */
export function applyFallwildFilter(
  entries: ReadonlyArray<FallwildVorgang>,
  filter: FallwildFilterState,
  now: Date = new Date()
): FallwildVorgang[] {
  const zeitraumStart = computeZeitraumStart(filter.zeitraum, now);
  const searchTokens = tokenizeSearch(filter.search);

  const filtered = entries.filter((entry) => {
    if (zeitraumStart && new Date(entry.recordedAt) < zeitraumStart) {
      return false;
    }

    if (filter.bergungsStatus !== "alle" && entry.bergungsStatus !== filter.bergungsStatus) {
      return false;
    }

    if (searchTokens.length > 0 && !matchesSearch(entry, searchTokens)) {
      return false;
    }

    return true;
  });

  return sortFallwild(filtered, filter.sort);
}

function computeZeitraumStart(filter: ZeitraumFilter, now: Date): Date | null {
  if (filter === "alle") {
    return null;
  }

  const start = new Date(now);

  if (filter === "heute") {
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (filter === "woche") {
    start.setDate(start.getDate() - 7);
    return start;
  }

  // monat
  start.setDate(start.getDate() - 30);
  return start;
}

function tokenizeSearch(raw: string): string[] {
  return raw
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

function matchesSearch(entry: FallwildVorgang, tokens: ReadonlyArray<string>): boolean {
  const haystack = [
    entry.wildart,
    entry.gemeinde,
    entry.strasse ?? "",
    entry.note ?? "",
    entry.location.label ?? "",
    entry.location.addressLabel ?? ""
  ]
    .join(" ")
    .toLowerCase();

  return tokens.every((token) => haystack.includes(token));
}

function sortFallwild(
  entries: ReadonlyArray<FallwildVorgang>,
  sort: FallwildSortKey
): FallwildVorgang[] {
  const list = [...entries];

  switch (sort) {
    case "neueste-zuerst":
      list.sort((left, right) => right.recordedAt.localeCompare(left.recordedAt));
      return list;
    case "aelteste-zuerst":
      list.sort((left, right) => left.recordedAt.localeCompare(right.recordedAt));
      return list;
    case "nach-wildart":
      list.sort((left, right) => {
        const wildartCmp = left.wildart.localeCompare(right.wildart, "de-AT");
        if (wildartCmp !== 0) {
          return wildartCmp;
        }
        return right.recordedAt.localeCompare(left.recordedAt);
      });
      return list;
    case "nach-gemeinde":
      list.sort((left, right) => {
        const gemeindeCmp = left.gemeinde.localeCompare(right.gemeinde, "de-AT");
        if (gemeindeCmp !== 0) {
          return gemeindeCmp;
        }
        return right.recordedAt.localeCompare(left.recordedAt);
      });
      return list;
    default:
      return list;
  }
}

/**
 * Bestimmt, ob der Filter aktuell etwas einschraenkt (gegenueber dem
 * Default). Wird vom UI genutzt, um einen "Filter zuruecksetzen"-
 * Button nur dann anzuzeigen, wenn er sinnvoll ist.
 */
export function isFallwildFilterActive(filter: FallwildFilterState): boolean {
  return (
    filter.search.trim().length > 0 ||
    filter.bergungsStatus !== "alle" ||
    filter.zeitraum !== "alle" ||
    filter.sort !== "neueste-zuerst"
  );
}
