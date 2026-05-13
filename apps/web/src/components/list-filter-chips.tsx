"use client";

import type { Key, KeyboardEvent } from "react";
import { useCallback, useRef } from "react";

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
 *
 * Tastaturnavigation (WAI-ARIA-Radio-Group-Pattern):
 * - Tab betritt die Gruppe und landet auf dem aktiven Chip (einziger
 *   tabIndex=0; alle anderen haben tabIndex=-1).
 * - Pfeil rechts/runter -> naechster Chip (wraps around).
 * - Pfeil links/hoch -> vorheriger Chip.
 * - Home/End -> erster/letzter Chip.
 * - Pfeil/Home/End aktivieren die Auswahl, nicht nur den Fokus —
 *   das entspricht der ARIA-Authoring-Practices-Empfehlung fuer
 *   Radio-Gruppen.
 */
export function ListFilterChips<K extends string>({
  value,
  options,
  onChange,
  eyebrow,
  ariaLabel
}: ListFilterChipsProps<K>) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusAndSelect = useCallback(
    (index: number) => {
      const option = options[index];
      if (!option) return;
      onChange(option.key);
      // Focus muss nach dem onChange laufen — React rerendert die Liste
      // (anderer Chip ist jetzt aktiv mit tabIndex=0). Ohne den
      // requestAnimationFrame waere der gerade re-renderte Button noch
      // tabIndex=-1, und .focus() wuerde den Tabstop nicht setzen.
      requestAnimationFrame(() => {
        buttonRefs.current[index]?.focus();
      });
    },
    [options, onChange]
  );

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown": {
        event.preventDefault();
        const next = (currentIndex + 1) % options.length;
        focusAndSelect(next);
        return;
      }
      case "ArrowLeft":
      case "ArrowUp": {
        event.preventDefault();
        const prev = (currentIndex - 1 + options.length) % options.length;
        focusAndSelect(prev);
        return;
      }
      case "Home": {
        event.preventDefault();
        focusAndSelect(0);
        return;
      }
      case "End": {
        event.preventDefault();
        focusAndSelect(options.length - 1);
        return;
      }
      default:
        return;
    }
  }

  return (
    <div className="list-filter-row" role="radiogroup" aria-label={ariaLabel ?? eyebrow}>
      {eyebrow ? <span className="list-filter-eyebrow">{eyebrow}</span> : null}
      <div className="list-filter-chip-group">
        {options.map((option, index) => {
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
              onKeyDown={(event) => handleKeyDown(event, index)}
              ref={(node) => {
                buttonRefs.current[index] = node;
              }}
              role="radio"
              tabIndex={isActive ? 0 : -1}
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
