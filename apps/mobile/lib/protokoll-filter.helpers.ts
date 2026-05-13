import type { ProtokollListItem, ProtokollStatus } from "@hege/domain";

/**
 * Filter- und Sortier-Logik fuer die Protokolle-Liste (Mobile).
 *
 * Pattern aus M1/M2 (Fallwild, Reviereinrichtungen): Helper sind pure
 * und testbar, der Render-State lebt im Screen. Die Web-Sicht hat den
 * gleichen Status-Filter + vier Sort-Optionen — Mobile spiegelt das
 * Verhalten, damit User mit beiden Oberflaechen nichts neu lernen.
 */

export type ProtokollStatusFilter = "alle" | ProtokollStatus;
export type ProtokollSortKey =
  | "termin-neueste"
  | "termin-aelteste"
  | "nach-titel"
  | "nach-beschluesse";

export interface ProtokollFilterState {
  search: string;
  status: ProtokollStatusFilter;
  sort: ProtokollSortKey;
}

export const DEFAULT_PROTOKOLL_FILTER: ProtokollFilterState = {
  search: "",
  status: "alle",
  sort: "termin-neueste"
};

/**
 * Pipeline: Status -> Suche -> Sortierung. Status ist Enum-Vergleich
 * (billig), Volltextsuche teurer, Sort am Ende.
 */
export function applyProtokollFilter(
  entries: ReadonlyArray<ProtokollListItem>,
  filter: ProtokollFilterState
): ProtokollListItem[] {
  const searchTokens = tokenizeSearch(filter.search);

  const filtered = entries.filter((entry) => {
    if (filter.status !== "alle" && entry.status !== filter.status) {
      return false;
    }

    if (searchTokens.length > 0 && !matchesSearch(entry, searchTokens)) {
      return false;
    }

    return true;
  });

  return sortProtokolle(filtered, filter.sort);
}

function tokenizeSearch(raw: string): string[] {
  return raw
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

function matchesSearch(
  entry: ProtokollListItem,
  tokens: ReadonlyArray<string>
): boolean {
  const haystack = [entry.title, entry.locationLabel, entry.summaryPreview ?? ""]
    .join(" ")
    .toLowerCase();

  return tokens.every((token) => haystack.includes(token));
}

function sortProtokolle(
  entries: ReadonlyArray<ProtokollListItem>,
  sort: ProtokollSortKey
): ProtokollListItem[] {
  const list = [...entries];

  switch (sort) {
    case "termin-neueste":
      list.sort((left, right) => right.scheduledAt.localeCompare(left.scheduledAt));
      return list;
    case "termin-aelteste":
      list.sort((left, right) => left.scheduledAt.localeCompare(right.scheduledAt));
      return list;
    case "nach-titel":
      list.sort((left, right) => {
        const titleCmp = left.title.localeCompare(right.title, "de-AT");
        if (titleCmp !== 0) {
          return titleCmp;
        }
        return right.scheduledAt.localeCompare(left.scheduledAt);
      });
      return list;
    case "nach-beschluesse":
      // Absteigend: meiste Beschluesse zuerst (Output-Sicht).
      list.sort((left, right) => {
        const beschlussCmp = right.beschlussCount - left.beschlussCount;
        if (beschlussCmp !== 0) {
          return beschlussCmp;
        }
        return right.scheduledAt.localeCompare(left.scheduledAt);
      });
      return list;
    default:
      return list;
  }
}

export function isProtokollFilterActive(filter: ProtokollFilterState): boolean {
  return (
    filter.search.trim().length > 0 ||
    filter.status !== "alle" ||
    filter.sort !== "termin-neueste"
  );
}
