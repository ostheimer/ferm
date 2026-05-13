"use client";

import type { Key } from "react";

interface FilterOption<K extends string> {
  key: K;
  label: string;
  /** Optionaler Counter rechts neben dem Label. */
  count?: number;
}

interface ListFilterChipsProps<K extends string> {
  value: K;
  options: ReadonlyArray<FilterOption<K>>;
  onChange: (key: K) => void;
  /** Optionales Eyebrow-Label vor den Chips. */
  eyebrow?: string;
  ariaLabel?: string;
}

/**
 * `<ListFilterChips>` — horizontale Chip-Reihe fuer Web-Listen (P2.4).
 *
 * Web-Pendant zur Mobile-`FilterChipRow`. Klassen-basiert; Styles
 * leben in globals.css (`.list-filter-row` / `.list-filter-chip`).
 * Generic-Parameter `K` haelt die Keys typsicher (z.B.
 * `"alle" | "geborgen" | ...`).
 */
export function ListFilterChips<K extends string>({
  value,
  options,
  onChange,
  eyebrow,
  ariaLabel
}: ListFilterChipsProps<K>) {
  return (
    <div className="list-filter-row" role="radiogroup" aria-label={ariaLabel ?? eyebrow}>
      {eyebrow ? <span className="list-filter-eyebrow">{eyebrow}</span> : null}
      <div className="list-filter-chip-group">
        {options.map((option) => {
          const isActive = option.key === value;
          return (
            // Innerhalb einer `radiogroup` muessen die Optionen `role="radio"`
            // + `aria-checked` tragen (nicht `aria-pressed`, das waere ein
            // Toggle-Button-Modell). Screenreader interpretieren die Auswahl
            // sonst falsch — wir wollen "von 3 Optionen ist eine aktiv",
            // nicht "drei unabhaengige Schalter".
            <button
              aria-checked={isActive}
              className={
                isActive ? "list-filter-chip list-filter-chip-active" : "list-filter-chip"
              }
              key={option.key as Key}
              onClick={() => onChange(option.key)}
              role="radio"
              type="button"
            >
              {option.label}
              {typeof option.count === "number" ? (
                <span className="list-filter-count">{option.count}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
