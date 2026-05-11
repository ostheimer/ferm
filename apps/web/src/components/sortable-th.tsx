"use client";

import { ArrowDownAZ, ArrowUpDown, ArrowUpAZ } from "lucide-react";

import type { SortDirection, SortState } from "../lib/list-sort";

interface SortableThProps<K extends string> {
  column: K;
  label: string;
  sort: SortState<K>;
  onSort: (column: K) => void;
}

/**
 * `<SortableTh>` — Tabellen-Header der per Klick die Sortierung umstellt.
 * Drei Visual-States via Lucide-Icons:
 *  - aktiv ASC: ArrowDownAZ (kleiner Buchstabe oben → grosser unten)
 *  - aktiv DESC: ArrowUpAZ
 *  - inaktiv: ArrowUpDown (Doppelpfeil, gedimmt)
 *
 * Optisch eine `<th>`-Variante mit `cursor:pointer` und subtilem Hover-
 * Highlight. Tastatur: aktivierbar via Space/Enter (button-Element).
 */
export function SortableTh<K extends string>({
  column,
  label,
  sort,
  onSort
}: SortableThProps<K>) {
  const isActive = sort.column === column;
  const direction: SortDirection = isActive ? sort.direction : "asc";

  const Icon = !isActive ? ArrowUpDown : direction === "asc" ? ArrowDownAZ : ArrowUpAZ;
  const ariaSort = !isActive ? "none" : direction === "asc" ? "ascending" : "descending";

  return (
    <th aria-sort={ariaSort} className={`sortable-th ${isActive ? "sortable-th-active" : ""}`}>
      <button onClick={() => onSort(column)} type="button">
        <span>{label}</span>
        <Icon aria-hidden="true" size={14} />
      </button>
    </th>
  );
}
