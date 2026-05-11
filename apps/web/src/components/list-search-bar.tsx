"use client";

import { Search, X } from "lucide-react";
import type { ChangeEvent } from "react";

interface ListSearchBarProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  /** Optionaler Zaehler, der rechts vom Such-Feld angezeigt wird (z.B. "5 von 30"). */
  resultLabel?: string;
}

/**
 * `<ListSearchBar>` — vereinheitlichter Such-Input fuer Listen-Seiten
 * im Web (Fallwild, Sitzungen, Mitglieder, ...). Konsistente Optik mit
 * den anderen Form-Elementen via globale `.button-control` und
 * `.search-bar`-Klassen. Tailwind-frei, weil das Repo CSS-only ist.
 */
export function ListSearchBar({ value, onChange, placeholder, resultLabel }: ListSearchBarProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.currentTarget.value);
  }

  function clear() {
    onChange("");
  }

  return (
    <div className="list-search-bar">
      <div className="list-search-input">
        <Search aria-hidden="true" size={16} />
        <input
          aria-label={placeholder ?? "Suchen"}
          autoComplete="off"
          onChange={handleChange}
          placeholder={placeholder ?? "Suchen ..."}
          type="search"
          value={value}
        />
        {value.length > 0 ? (
          <button
            aria-label="Suchfeld leeren"
            className="list-search-clear"
            onClick={clear}
            type="button"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>
      {resultLabel ? <span className="list-search-result">{resultLabel}</span> : null}
    </div>
  );
}
