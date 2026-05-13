"use client";

import type {
  Reviermeldung,
  ReviermeldungKategorie,
  ReviermeldungStatus
} from "@hege/domain";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { ListFilterChips } from "../../../components/list-filter-chips";
import { ListSearchBar } from "../../../components/list-search-bar";
import { StateView } from "../../../components/state-view";
import { filterBySearch, hasActiveSearch } from "../../../lib/list-search";

/**
 * Reviermeldungen-Index fuer das Backoffice. Mobile zeigt nur die
 * letzten 6 als Aktivitaets-Snapshot — Schriftfuehrung will den
 * vollen Stream + Filter + CSV-Export fuer den Jahresbericht.
 *
 * Filter-Pattern wie Mitglieder/Fallwild: Kategorie + Status als
 * Chip-Reihen, Volltextsuche, Sortier-Chips. Filter-Inline-Logik
 * statt extra Helper-Datei, weil die Funktionen klein und
 * lokal benutzt sind (gleicher Konvention wie Aufgaben-Client #93).
 */

type KategorieFilter = "alle" | ReviermeldungKategorie;
type StatusFilter = "alle" | ReviermeldungStatus;
type SortKey = "neueste-zuerst" | "aelteste-zuerst" | "nach-kategorie";

function compareReviermeldungen(
  left: Reviermeldung,
  right: Reviermeldung,
  key: SortKey
): number {
  switch (key) {
    case "neueste-zuerst":
      return right.occurredAt.localeCompare(left.occurredAt);
    case "aelteste-zuerst":
      return left.occurredAt.localeCompare(right.occurredAt);
    case "nach-kategorie":
      return (
        left.category.localeCompare(right.category, "de-AT") ||
        right.occurredAt.localeCompare(left.occurredAt)
      );
    default:
      return 0;
  }
}

const KATEGORIE_LABELS: Record<ReviermeldungKategorie, string> = {
  schaden: "Schaden",
  gefahr: "Gefahr",
  sichtung: "Sichtung",
  reviereinrichtung: "Einrichtung",
  fuetterung: "Fütterung",
  wasserung: "Wässerung",
  sonstiges: "Sonstiges"
};

const STATUS_LABELS: Record<ReviermeldungStatus, string> = {
  neu: "Neu",
  geprueft: "Geprüft",
  in_bearbeitung: "In Bearbeitung",
  erledigt: "Erledigt",
  verworfen: "Verworfen",
  archiviert: "Archiviert"
};

interface ReviermeldungenClientProps {
  meldungen: Reviermeldung[];
}

export function ReviermeldungenClient({ meldungen }: ReviermeldungenClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [kategorieFilter, setKategorieFilter] = useState<KategorieFilter>("alle");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("alle");
  const [sortKey, setSortKey] = useState<SortKey>("neueste-zuerst");

  const filteredByChips = useMemo(
    () =>
      meldungen.filter((entry) => {
        if (kategorieFilter !== "alle" && entry.category !== kategorieFilter) return false;
        if (statusFilter !== "alle" && entry.status !== statusFilter) return false;
        return true;
      }),
    [meldungen, kategorieFilter, statusFilter]
  );

  const visibleMeldungen = useMemo(
    () =>
      [
        ...filterBySearch(filteredByChips, search, (entry) =>
          [entry.title, entry.description ?? "", entry.location?.label ?? ""].join(" ")
        )
      ].sort((left, right) => compareReviermeldungen(left, right, sortKey)),
    [filteredByChips, search, sortKey]
  );

  const searchActive = hasActiveSearch(search);
  const filterActive =
    kategorieFilter !== "alle" ||
    statusFilter !== "alle" ||
    sortKey !== "neueste-zuerst";
  const resultLabel =
    searchActive || filterActive
      ? `${visibleMeldungen.length} von ${meldungen.length}`
      : `${meldungen.length} Meldungen`;

  function resetAllFilters() {
    setSearch("");
    setKategorieFilter("alle");
    setStatusFilter("alle");
    setSortKey("neueste-zuerst");
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <header className="section-header">
          <div>
            <p className="eyebrow">Reviermeldungen</p>
            <h1>Schaden-, Gefahr- und Sichtungs-Stream</h1>
            <p className="hero-copy">
              Voller Jahres-Stream der Reviermeldungen mit Filter, Sortierung und CSV-Export.
              Mobile zeigt nur die letzten Einträge als Aktivitäts-Snapshot.
            </p>
          </div>
          <div className="section-actions">
            <a className="button-link" href="/api/v1/reviermeldungen/export.csv">
              CSV-Export
            </a>
            <button
              className="button-control button-control-secondary"
              disabled={isPending}
              onClick={() =>
                startTransition(() => {
                  router.refresh();
                })
              }
              type="button"
            >
              Aktualisieren
            </button>
          </div>
        </header>

        <ListSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Suche Titel, Beschreibung oder Standort"
          resultLabel={resultLabel}
        />

        <ListFilterChips<KategorieFilter>
          eyebrow="Kategorie"
          ariaLabel="Kategorie filtern"
          value={kategorieFilter}
          onChange={setKategorieFilter}
          options={[
            { key: "alle", label: "Alle" },
            { key: "schaden", label: "Schaden" },
            { key: "gefahr", label: "Gefahr" },
            { key: "sichtung", label: "Sichtung" },
            { key: "reviereinrichtung", label: "Einrichtung" },
            { key: "fuetterung", label: "Fütterung" },
            { key: "wasserung", label: "Wässerung" },
            { key: "sonstiges", label: "Sonstiges" }
          ]}
        />

        <ListFilterChips<StatusFilter>
          eyebrow="Status"
          ariaLabel="Status filtern"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { key: "alle", label: "Alle" },
            { key: "neu", label: "Neu" },
            { key: "geprueft", label: "Geprüft" },
            { key: "in_bearbeitung", label: "In Bearbeitung" },
            { key: "erledigt", label: "Erledigt" },
            { key: "verworfen", label: "Verworfen" },
            { key: "archiviert", label: "Archiviert" }
          ]}
        />

        <ListFilterChips<SortKey>
          eyebrow="Sortierung"
          ariaLabel="Meldungen sortieren"
          value={sortKey}
          onChange={setSortKey}
          options={[
            { key: "neueste-zuerst", label: "Neueste zuerst" },
            { key: "aelteste-zuerst", label: "Älteste zuerst" },
            { key: "nach-kategorie", label: "Nach Kategorie" }
          ]}
        />

        {meldungen.length === 0 ? (
          <StateView
            mode="empty"
            title="Noch keine Reviermeldungen"
            description="Sobald die erste Meldung aus der App ankommt, erscheint sie hier und im CSV-Export."
            bare
          />
        ) : visibleMeldungen.length === 0 ? (
          <StateView
            mode="empty"
            title="Keine Treffer"
            description={
              searchActive
                ? `Mit der aktuellen Suche („${search}") und den gesetzten Filtern findet sich keine Meldung.`
                : "Mit den aktuellen Filtern findet sich keine Meldung."
            }
            action={{ label: "Filter zurücksetzen", onClick: resetAllFilters }}
            bare
          />
        ) : (
          <div className="timeline">
            {visibleMeldungen.map((entry) => (
              <article key={entry.id} className="timeline-item">
                <span>
                  {KATEGORIE_LABELS[entry.category] ?? entry.category} ·{" "}
                  {STATUS_LABELS[entry.status] ?? entry.status}
                </span>
                <strong>{entry.title}</strong>
                {entry.description ? <p>{entry.description}</p> : null}
                {entry.location ? (
                  <p>
                    Standort: {entry.location.label ?? `${entry.location.lat}, ${entry.location.lng}`}
                  </p>
                ) : null}
                <time>{formatDateTime(entry.occurredAt)}</time>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("de-AT", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Vienna"
  }).format(new Date(value));
}
