"use client";

import type { EinrichtungTyp, EinrichtungZustand, ReviereinrichtungListItem } from "@hege/domain";
import { useMemo, useState } from "react";

import { ListFilterChips } from "../../../components/list-filter-chips";
import { ListSearchBar } from "../../../components/list-search-bar";
import { filterBySearch, hasActiveSearch } from "../../../lib/list-search";

type TypFilter = "alle" | EinrichtungTyp;
type ZustandFilter = "alle" | EinrichtungZustand;

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
  const [typFilter, setTypFilter] = useState<TypFilter>("alle");
  const [zustandFilter, setZustandFilter] = useState<ZustandFilter>("alle");

  const filteredByChips = useMemo(() => {
    return entries.filter((entry) => {
      if (typFilter !== "alle" && entry.type !== typFilter) return false;
      if (zustandFilter !== "alle" && entry.status !== zustandFilter) return false;
      return true;
    });
  }, [entries, typFilter, zustandFilter]);

  const visibleEntries = useMemo(
    () =>
      filterBySearch(filteredByChips, search, (entry) =>
        [
          entry.name,
          entry.type,
          entry.status,
          entry.beschreibung ?? "",
          entry.location.label ?? ""
        ].join(" ")
      ),
    [filteredByChips, search]
  );
  const searchActive = hasActiveSearch(search);
  const filterActive = typFilter !== "alle" || zustandFilter !== "alle";
  const resultLabel =
    searchActive || filterActive
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

      <ListFilterChips<TypFilter>
        eyebrow="Typ"
        ariaLabel="Einrichtungs-Typ filtern"
        value={typFilter}
        onChange={setTypFilter}
        options={[
          { key: "alle", label: "Alle" },
          { key: "hochstand", label: "Hochstand" },
          { key: "fuetterung", label: "Fütterung" },
          { key: "salzlecke", label: "Salzlecke" },
          { key: "kirrung", label: "Kirrung" },
          { key: "kamera", label: "Kamera" },
          { key: "wildacker", label: "Wildacker" }
        ]}
      />

      <ListFilterChips<ZustandFilter>
        eyebrow="Zustand"
        ariaLabel="Zustand filtern"
        value={zustandFilter}
        onChange={setZustandFilter}
        options={[
          { key: "alle", label: "Alle" },
          { key: "gut", label: "Gut" },
          { key: "wartung-faellig", label: "Wartung fällig" },
          { key: "gesperrt", label: "Gesperrt" }
        ]}
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
