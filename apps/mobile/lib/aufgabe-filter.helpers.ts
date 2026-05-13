import type { Aufgabe, AufgabePrioritaet, AufgabeStatus } from "@hege/domain";

/**
 * Filter- und Sortier-Logik fuer die Aufgaben-Liste in der Revierarbeit.
 *
 * Im Unterschied zum Web-Pendant arbeitet diese Liste fast nur mit
 * AKTIVEN Aufgaben — der User-Flow ist "Was muss heute weg?". Deshalb:
 * Status-Filter als Bucket (offen/erledigt) statt feinkoernig pro
 * AufgabeStatus, und ein Default-Sort, der ueberfaellige Aufgaben oben
 * zeigt.
 *
 * Pattern wie `fallwild-filter.helpers.ts` und
 * `reviereinrichtung-filter.helpers.ts`: pure, testbar, getrennt vom
 * Render-Code.
 */

/**
 * Bucket-Filter statt feinkoerniger AufgabeStatus:
 * - `offen`: alles was noch Arbeit braucht (offen / angenommen / in_arbeit / blockiert)
 * - `erledigt`: abgeschlossen
 * - `alle`: incl. abgelehnt + archiviert
 */
export type AufgabeStatusFilter = "alle" | "offen" | "erledigt";

/**
 * Prioritaets-Filter zeigt nur die kritischen Buckets als eigenen Chip,
 * "normal" und "niedrig" leben in "alle". Sonst wuerde der Filter
 * fuer Quasi-Default-Eintraege Zeit kosten.
 */
export type AufgabePrioritaetFilter = "alle" | AufgabePrioritaet;

export type AufgabeSortKey =
  | "faellig-zuerst"
  | "neueste-zuerst"
  | "prioritaet-hoch"
  | "alphabetisch";

export interface AufgabeFilterState {
  search: string;
  status: AufgabeStatusFilter;
  prioritaet: AufgabePrioritaetFilter;
  sort: AufgabeSortKey;
}

export const DEFAULT_AUFGABE_FILTER: AufgabeFilterState = {
  search: "",
  status: "offen",
  prioritaet: "alle",
  sort: "faellig-zuerst"
};

const OFFEN_STATUSES: ReadonlyArray<AufgabeStatus> = [
  "offen",
  "angenommen",
  "in_arbeit",
  "blockiert"
];

const PRIORITAET_RANK: Record<AufgabePrioritaet, number> = {
  dringend: 0,
  hoch: 1,
  normal: 2,
  niedrig: 3
};

/**
 * Pipeline: Status -> Prioritaet -> Suche -> Sortierung.
 *
 * Status + Prioritaet sind Enum-Vergleiche (billig) und schaffen die
 * groessten Listen-Reduktionen — sie kommen vor der Volltextsuche.
 */
export function applyAufgabeFilter(
  entries: ReadonlyArray<Aufgabe>,
  filter: AufgabeFilterState
): Aufgabe[] {
  const searchTokens = tokenizeSearch(filter.search);

  const filtered = entries.filter((entry) => {
    if (!matchesStatusBucket(entry.status, filter.status)) {
      return false;
    }

    if (filter.prioritaet !== "alle" && entry.priority !== filter.prioritaet) {
      return false;
    }

    if (searchTokens.length > 0 && !matchesSearch(entry, searchTokens)) {
      return false;
    }

    return true;
  });

  return sortAufgaben(filtered, filter.sort);
}

function matchesStatusBucket(status: AufgabeStatus, filter: AufgabeStatusFilter): boolean {
  if (filter === "alle") return true;
  if (filter === "erledigt") return status === "erledigt";
  // offen-bucket: alles Aktive (siehe OFFEN_STATUSES). "abgelehnt" und
  // "archiviert" landen NICHT in "offen" — die sind explizit raus.
  return OFFEN_STATUSES.includes(status);
}

function tokenizeSearch(raw: string): string[] {
  return raw
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

function matchesSearch(entry: Aufgabe, tokens: ReadonlyArray<string>): boolean {
  const haystack = [entry.title, entry.description ?? "", entry.completionNote ?? ""]
    .join(" ")
    .toLowerCase();

  return tokens.every((token) => haystack.includes(token));
}

function sortAufgaben(entries: ReadonlyArray<Aufgabe>, sort: AufgabeSortKey): Aufgabe[] {
  const list = [...entries];

  switch (sort) {
    case "faellig-zuerst":
      // dueAt ASC, undefined ans Ende. Innerhalb gleicher dueAt fallback
      // auf Prioritaet (dringend zuerst).
      list.sort((left, right) => {
        const leftHasDue = left.dueAt !== undefined && left.dueAt !== null;
        const rightHasDue = right.dueAt !== undefined && right.dueAt !== null;
        if (leftHasDue && !rightHasDue) return -1;
        if (!leftHasDue && rightHasDue) return 1;
        if (leftHasDue && rightHasDue) {
          const dueCmp = left.dueAt!.localeCompare(right.dueAt!);
          if (dueCmp !== 0) return dueCmp;
        }
        return PRIORITAET_RANK[left.priority] - PRIORITAET_RANK[right.priority];
      });
      return list;
    case "neueste-zuerst":
      list.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
      return list;
    case "prioritaet-hoch":
      list.sort((left, right) => {
        const prioCmp = PRIORITAET_RANK[left.priority] - PRIORITAET_RANK[right.priority];
        if (prioCmp !== 0) return prioCmp;
        return right.createdAt.localeCompare(left.createdAt);
      });
      return list;
    case "alphabetisch":
      list.sort((left, right) => left.title.localeCompare(right.title, "de-AT"));
      return list;
    default:
      return list;
  }
}

export function isAufgabeFilterActive(filter: AufgabeFilterState): boolean {
  return (
    filter.search.trim().length > 0 ||
    filter.status !== "offen" ||
    filter.prioritaet !== "alle" ||
    filter.sort !== "faellig-zuerst"
  );
}
