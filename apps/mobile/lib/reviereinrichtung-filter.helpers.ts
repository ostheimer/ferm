import type { EinrichtungTyp, EinrichtungZustand, ReviereinrichtungListItem } from "@hege/domain";

/**
 * Filter- und Sortier-Logik fuer die Reviereinrichtungen-Liste (M2).
 *
 * Konsistent zum Pattern aus M1 (Fallwild): Helper-Funktionen sind
 * pure und testbar, der Render-State lebt im Screen.
 */

export type EinrichtungTypFilter = "alle" | EinrichtungTyp;
export type EinrichtungZustandFilter = "alle" | EinrichtungZustand;
export type ReviereinrichtungSortKey =
  | "alphabetisch"
  | "nach-zustand"
  | "nach-wartungen-desc"
  | "nach-typ";

export interface ReviereinrichtungFilterState {
  search: string;
  typ: EinrichtungTypFilter;
  zustand: EinrichtungZustandFilter;
  sort: ReviereinrichtungSortKey;
}

export const DEFAULT_REVIEREINRICHTUNG_FILTER: ReviereinrichtungFilterState = {
  search: "",
  typ: "alle",
  zustand: "alle",
  sort: "alphabetisch"
};

/**
 * Pipeline: Typ -> Zustand -> Suche -> Sortierung. Wie bei Fallwild
 * sind die billigen Filter (Enum-Vergleich) vorne, die teure Volltext-
 * suche hinten.
 */
export function applyReviereinrichtungFilter(
  entries: ReadonlyArray<ReviereinrichtungListItem>,
  filter: ReviereinrichtungFilterState
): ReviereinrichtungListItem[] {
  const searchTokens = tokenizeSearch(filter.search);

  const filtered = entries.filter((entry) => {
    if (filter.typ !== "alle" && entry.type !== filter.typ) {
      return false;
    }

    if (filter.zustand !== "alle" && entry.status !== filter.zustand) {
      return false;
    }

    if (searchTokens.length > 0 && !matchesSearch(entry, searchTokens)) {
      return false;
    }

    return true;
  });

  return sortReviereinrichtungen(filtered, filter.sort);
}

function tokenizeSearch(raw: string): string[] {
  return raw
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

function matchesSearch(
  entry: ReviereinrichtungListItem,
  tokens: ReadonlyArray<string>
): boolean {
  const haystack = [
    entry.name,
    entry.type,
    entry.beschreibung ?? "",
    entry.location.label ?? ""
  ]
    .join(" ")
    .toLowerCase();

  return tokens.every((token) => haystack.includes(token));
}

/**
 * Zustands-Rang fuer die "nach-zustand"-Sortierung. Niedriger ist
 * dringender — gesperrt zuerst, wartung-faellig dann, gut zuletzt.
 */
const ZUSTAND_RANK: Record<EinrichtungZustand, number> = {
  gesperrt: 0,
  "wartung-faellig": 1,
  gut: 2
};

function sortReviereinrichtungen(
  entries: ReadonlyArray<ReviereinrichtungListItem>,
  sort: ReviereinrichtungSortKey
): ReviereinrichtungListItem[] {
  const list = [...entries];

  switch (sort) {
    case "alphabetisch":
      list.sort((left, right) => left.name.localeCompare(right.name, "de-AT"));
      return list;
    case "nach-zustand":
      list.sort((left, right) => {
        const rankCmp = ZUSTAND_RANK[left.status] - ZUSTAND_RANK[right.status];
        if (rankCmp !== 0) {
          return rankCmp;
        }
        return left.name.localeCompare(right.name, "de-AT");
      });
      return list;
    case "nach-wartungen-desc":
      list.sort((left, right) => {
        const wartungsCmp = right.offeneWartungen - left.offeneWartungen;
        if (wartungsCmp !== 0) {
          return wartungsCmp;
        }
        return left.name.localeCompare(right.name, "de-AT");
      });
      return list;
    case "nach-typ":
      list.sort((left, right) => {
        const typCmp = left.type.localeCompare(right.type, "de-AT");
        if (typCmp !== 0) {
          return typCmp;
        }
        return left.name.localeCompare(right.name, "de-AT");
      });
      return list;
    default:
      return list;
  }
}

export function isReviereinrichtungFilterActive(
  filter: ReviereinrichtungFilterState
): boolean {
  return (
    filter.search.trim().length > 0 ||
    filter.typ !== "alle" ||
    filter.zustand !== "alle" ||
    filter.sort !== "alphabetisch"
  );
}
