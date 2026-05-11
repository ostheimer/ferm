/**
 * Generische Sortier-Helpers fuer Tabellen-Listen (W2 — klickbare
 * Sortier-Spalten-Header). Pattern: jede Spalte definiert eine
 * `accessor`-Funktion `(entry) => string | number | null`. Der
 * Comparator nutzt den jeweils passenden Vergleich (Collator fuer
 * Strings, numerische Differenz fuer Numbers, ISO-Lex fuer Date-ISO-
 * Strings).
 *
 * `null` wird als groesster Wert behandelt — fehlende Daten landen
 * unten (ASC) bzw. oben (DESC). Das ist konventionell fuer Tabellen.
 */

export type SortDirection = "asc" | "desc";
export type SortableValue = string | number | null;

export interface SortState<K extends string> {
  column: K;
  direction: SortDirection;
}

export function compareValues(left: SortableValue, right: SortableValue): number {
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left).localeCompare(String(right), "de-AT");
}

/**
 * Sortiert eine Liste anhand des aktuellen Sort-States. Wenn das Sort-
 * State eine Spalte ohne Accessor referenziert, wird die unveraenderte
 * Liste zurueckgegeben (defensive: hilft beim Refactor, wenn Spalten
 * umbenannt werden).
 */
export function sortByColumn<T, K extends string>(
  entries: ReadonlyArray<T>,
  state: SortState<K>,
  accessors: Record<K, (entry: T) => SortableValue>
): T[] {
  const accessor = accessors[state.column];
  if (!accessor) {
    return [...entries];
  }

  const list = [...entries];
  list.sort((leftEntry, rightEntry) => {
    const cmp = compareValues(accessor(leftEntry), accessor(rightEntry));
    return state.direction === "asc" ? cmp : -cmp;
  });

  return list;
}

/**
 * Erzeugt den naechsten Sort-State, wenn der Nutzer auf einen Header
 * klickt. Wenn die geklickte Spalte schon aktiv ist, wird die Richtung
 * gedreht. Sonst auf neue Spalte mit `asc` umschalten.
 */
export function nextSortState<K extends string>(
  current: SortState<K>,
  column: K
): SortState<K> {
  if (current.column === column) {
    return { column, direction: current.direction === "asc" ? "desc" : "asc" };
  }
  return { column, direction: "asc" };
}
