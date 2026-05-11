import type { AnsitzSession } from "@hege/domain";

/**
 * Filter- und Sortier-Logik fuer die Ansitze-Liste (M3).
 *
 * Konsistent zu M1 (Fallwild) und M2 (Reviereinrichtungen): Helper-
 * Funktionen sind pure und testbar, Render-State lebt im Screen.
 */

export type AnsitzKonfliktFilter = "alle" | "mit-konflikt" | "ohne-konflikt";
export type AnsitzZeitraumFilter = "heute" | "woche" | "alle";
export type AnsitzSortKey =
  | "neueste-zuerst"
  | "aelteste-zuerst"
  | "nach-standort";

export interface AnsitzFilterState {
  search: string;
  konflikt: AnsitzKonfliktFilter;
  zeitraum: AnsitzZeitraumFilter;
  sort: AnsitzSortKey;
}

export const DEFAULT_ANSITZ_FILTER: AnsitzFilterState = {
  search: "",
  konflikt: "alle",
  zeitraum: "alle",
  sort: "neueste-zuerst"
};

/**
 * Pipeline: Zeitraum -> Konflikt -> Suche -> Sortierung.
 */
export function applyAnsitzFilter(
  entries: ReadonlyArray<AnsitzSession>,
  filter: AnsitzFilterState,
  now: Date = new Date()
): AnsitzSession[] {
  const zeitraumStart = computeZeitraumStart(filter.zeitraum, now);
  const searchTokens = tokenizeSearch(filter.search);

  const filtered = entries.filter((entry) => {
    if (zeitraumStart && new Date(entry.startedAt) < zeitraumStart) {
      return false;
    }

    if (filter.konflikt === "mit-konflikt" && !entry.conflict) {
      return false;
    }

    if (filter.konflikt === "ohne-konflikt" && entry.conflict) {
      return false;
    }

    if (searchTokens.length > 0 && !matchesSearch(entry, searchTokens)) {
      return false;
    }

    return true;
  });

  return sortAnsitze(filtered, filter.sort);
}

function computeZeitraumStart(filter: AnsitzZeitraumFilter, now: Date): Date | null {
  if (filter === "alle") {
    return null;
  }

  const start = new Date(now);

  if (filter === "heute") {
    start.setHours(0, 0, 0, 0);
    return start;
  }

  // woche
  start.setDate(start.getDate() - 7);
  return start;
}

function tokenizeSearch(raw: string): string[] {
  return raw
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

function matchesSearch(entry: AnsitzSession, tokens: ReadonlyArray<string>): boolean {
  const haystack = [entry.standortName, entry.location.label ?? "", entry.note ?? ""]
    .join(" ")
    .toLowerCase();

  return tokens.every((token) => haystack.includes(token));
}

function sortAnsitze(
  entries: ReadonlyArray<AnsitzSession>,
  sort: AnsitzSortKey
): AnsitzSession[] {
  const list = [...entries];

  switch (sort) {
    case "neueste-zuerst":
      list.sort((left, right) => right.startedAt.localeCompare(left.startedAt));
      return list;
    case "aelteste-zuerst":
      list.sort((left, right) => left.startedAt.localeCompare(right.startedAt));
      return list;
    case "nach-standort":
      list.sort((left, right) => {
        const standortCmp = left.standortName.localeCompare(right.standortName, "de-AT");
        if (standortCmp !== 0) {
          return standortCmp;
        }
        return right.startedAt.localeCompare(left.startedAt);
      });
      return list;
    default:
      return list;
  }
}

export function isAnsitzFilterActive(filter: AnsitzFilterState): boolean {
  return (
    filter.search.trim().length > 0 ||
    filter.konflikt !== "alle" ||
    filter.zeitraum !== "alle" ||
    filter.sort !== "neueste-zuerst"
  );
}
