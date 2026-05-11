"use client";

import type { ReviereinrichtungListItem } from "@hege/domain";
import { useMemo, useState } from "react";

import { ListSearchBar } from "../../../components/list-search-bar";
import { filterBySearch, hasActiveSearch } from "../../../lib/list-search";

interface ReviereinrichtungenListClientProps {
  entries: ReviereinrichtungListItem[];
}

/**
 * Suchbare Liste der Reviereinrichtungen. Wird vom Server-Page in
 * `app/(tabs)/reviereinrichtungen/page.tsx` als Client-Boundary
 * verwendet, sobald die Liste interaktiv werden soll.
 */
export function ReviereinrichtungenListClient({ entries }: ReviereinrichtungenListClientProps) {
  const [search, setSearch] = useState("");

  const visibleEntries = useMemo(
    () =>
      filterBySearch(entries, search, (entry) =>
        [
          entry.name,
          entry.type,
          entry.status,
          entry.beschreibung ?? "",
          entry.location.label ?? ""
        ].join(" ")
      ),
    [entries, search]
  );
  const searchActive = hasActiveSearch(search);
  const resultLabel = searchActive
    ? `${visibleEntries.length} von ${entries.length}`
    : `${entries.length} Eintraege`;

  return (
    <>
      <ListSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Suche Name, Typ, Zustand oder Lagebezeichnung"
        resultLabel={resultLabel}
      />

      {entries.length > 0 && visibleEntries.length === 0 ? (
        <article className="detail-card">
          <strong>Keine Treffer</strong>
          <p>
            Mit der aktuellen Suche („{search}") findet sich keine Einrichtung. Andere Begriffe
            versuchen oder Suche leeren.
          </p>
        </article>
      ) : (
        <div className="card-grid">
          {visibleEntries.map((entry) => (
            <article key={entry.id} className="detail-card">
              <div className="detail-card-header">
                <div>
                  <p className="eyebrow">{entry.type}</p>
                  <h2>{entry.name}</h2>
                </div>
                <span
                  className={
                    entry.status === "gut" ? "status-pill status-ok" : "status-pill status-warning"
                  }
                >
                  {entry.status}
                </span>
              </div>

              <p>{entry.beschreibung ?? "Keine Beschreibung hinterlegt."}</p>
              <strong>{entry.location.label ?? "Ohne Lagebezeichnung"}</strong>
              <p>
                {entry.location.lat.toFixed(4)}, {entry.location.lng.toFixed(4)}
              </p>

              <div className="simple-list">
                <div>
                  <strong>Letzte Kontrolle</strong>
                  <span>
                    {entry.letzteKontrolleAt
                      ? new Date(entry.letzteKontrolleAt).toLocaleString("de-AT")
                      : "Noch keine Kontrolle"}
                  </span>
                </div>
                <div>
                  <strong>Offene Wartungen</strong>
                  <span>{entry.offeneWartungen}</span>
                </div>
                <div>
                  <strong>Kontrollen gesamt</strong>
                  <span>{entry.kontrollen.length}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
