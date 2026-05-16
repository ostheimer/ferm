"use client";

import type {
  AufgabePrioritaet,
  GeoPoint,
  Reviermeldung,
  ReviermeldungKategorie,
  ReviermeldungStatus
} from "@hege/domain";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { ListFilterChips } from "../../../components/list-filter-chips";
import { ListSearchBar } from "../../../components/list-search-bar";
import { StateView } from "../../../components/state-view";
import { TerritoryMap, type TerritoryMarker } from "../../../components/territory-map";
import { readApiErrorMessage } from "../../../lib/api-error";
import { filterBySearch, hasActiveSearch } from "../../../lib/list-search";

/**
 * Default-Prioritaet je Reviermeldung-Kategorie. Gefahr -> dringend,
 * Schaden -> hoch (akut handelnswert), Sichtung -> niedrig (dokumen-
 * tarisch). Wer's praeziser will, kann die erzeugte Aufgabe danach
 * direkt in /app/aufgaben anpassen — der Status-Wechsel-Button
 * existiert dort schon, eine vollwertige Detail-Edit-UI ist eine
 * spaetere Iteration.
 */
const KATEGORIE_TO_PRIORITAET: Record<ReviermeldungKategorie, AufgabePrioritaet> = {
  gefahr: "dringend",
  schaden: "hoch",
  reviereinrichtung: "normal",
  fuetterung: "normal",
  wasserung: "normal",
  sonstiges: "normal",
  sichtung: "niedrig"
};

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

/**
 * Auswahlbare Status-Werte in der Card-Drop-Down. Reihenfolge spiegelt
 * den natuerlichen Workflow: neu -> geprueft -> in_bearbeitung ->
 * erledigt / verworfen. 'archiviert' bleibt aus der Auswahl raus —
 * Archivierung ist eher eine Admin-Operation und sollte nicht
 * versehentlich per Drop-Down passieren.
 */
const STATUS_TRANSITION_OPTIONS: ReadonlyArray<ReviermeldungStatus> = [
  "neu",
  "geprueft",
  "in_bearbeitung",
  "erledigt",
  "verworfen"
];

interface ReviermeldungenClientProps {
  meldungen: Reviermeldung[];
  revierName: string;
  revierCenter: GeoPoint;
}

export function ReviermeldungenClient({ meldungen, revierCenter, revierName }: ReviermeldungenClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [kategorieFilter, setKategorieFilter] = useState<KategorieFilter>("alle");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("alle");
  const [sortKey, setSortKey] = useState<SortKey>("neueste-zuerst");
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const [conversionSuccess, setConversionSuccess] = useState<string | null>(null);
  // Status-Mutation getrennt vom Conversion-Flow, damit die Banner sich
  // gegenseitig nicht ueberschreiben (gleiche Lektion wie #96 mit
  // Aufgaben-Client).
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

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
  const mapMarkers = useMemo(
    () => meldungen.flatMap((entry) => toMapMarker(entry)),
    [meldungen]
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

  /**
   * Konvertiert eine Reviermeldung in eine Aufgabe. One-Click-MVP:
   * Title/Description werden uebernommen, sourceType + sourceId zeigen
   * auf die Original-Meldung, Prioritaet wird aus der Kategorie
   * abgeleitet. Der User kann die Aufgabe danach in /app/aufgaben
   * feiner adjustieren.
   */
  async function handleCreateAufgabe(meldung: Reviermeldung) {
    if (convertingId) return;

    setConvertingId(meldung.id);
    setConversionError(null);
    setConversionSuccess(null);

    const response = await fetch("/api/v1/aufgaben", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: meldung.title,
        description: meldung.description || undefined,
        priority: KATEGORIE_TO_PRIORITAET[meldung.category] ?? "normal",
        sourceType: "reviermeldung",
        sourceId: meldung.id
      })
    });

    setConvertingId(null);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setConversionError(
        readApiErrorMessage(body, "Aufgabe konnte nicht aus der Meldung angelegt werden.")
      );
      return;
    }

    setConversionSuccess(
      `Aufgabe wurde aus „${meldung.title}" angelegt. Detail in /app/aufgaben sichtbar.`
    );
    // Wir refresh-en hier nicht — die Aufgabe taucht NICHT in dieser
    // Liste auf (das ist die Meldungen-Liste), also waere ein Refresh
    // ohne sichtbaren Effekt. Wer die neue Aufgabe sehen will,
    // wechselt in /app/aufgaben.
  }

  /**
   * Aendert den Status einer Reviermeldung. Schliesst die Workflow-
   * Luecke: bisher konnte Schriftfuehrung den Status nur per API
   * setzen, hier jetzt via Card-Buttons.
   *
   * Nach Erfolg: router.refresh() — die Card zeigt den neuen Status,
   * und der Status-Filter-Chip re-greift (eine "erledigt"-Meldung
   * verschwindet z.B. unter "neu"-Filter).
   */
  async function updateMeldungStatus(meldungId: string, status: ReviermeldungStatus) {
    setStatusUpdatingId(meldungId);
    setStatusError(null);

    const response = await fetch(`/api/v1/reviermeldungen/${meldungId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status })
    });

    setStatusUpdatingId(null);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setStatusError(
        readApiErrorMessage(body, "Status konnte nicht geändert werden.")
      );
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="page-stack">
      <section className="map-panel">
        <header className="section-header">
          <div>
            <p className="eyebrow">Karte</p>
            <h2>Reviermeldungen mit Standort</h2>
          </div>
          <span className="badge">{mapMarkers.length} Marker</span>
        </header>

        <TerritoryMap markers={mapMarkers} revierCenter={revierCenter} revierName={revierName} />
      </section>

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

        <div aria-live="polite" className="form-messages">
          {conversionError ? (
            <p className="feedback feedback-error">{conversionError}</p>
          ) : null}
          {conversionSuccess ? (
            <p className="feedback feedback-success">{conversionSuccess}</p>
          ) : null}
          {statusError ? (
            <p className="feedback feedback-error">{statusError}</p>
          ) : null}
        </div>

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
                <div className="form-footer">
                  {entry.status !== "erledigt" && entry.status !== "archiviert" ? (
                    <select
                      aria-label={`Status für „${entry.title}" ändern`}
                      className="button-control button-control-secondary"
                      disabled={statusUpdatingId === entry.id}
                      onChange={(event) => {
                        const next = event.currentTarget.value as ReviermeldungStatus;
                        // Controlled-Value `value={entry.status}` sorgt
                        // beim Re-Render dafuer, dass das Select auf den
                        // aktuellen Status zurueckspringt — wir muessen
                        // hier kein `event.currentTarget.value` setzen.
                        if (next !== entry.status) {
                          void updateMeldungStatus(entry.id, next);
                        }
                      }}
                      value={entry.status}
                    >
                      {STATUS_TRANSITION_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status === entry.status
                            ? `Status: ${STATUS_LABELS[status]}`
                            : `→ ${STATUS_LABELS[status]}`}
                        </option>
                      ))}
                    </select>
                  ) : null}
                  <button
                    className="button-control button-control-secondary"
                    disabled={convertingId === entry.id}
                    onClick={() => void handleCreateAufgabe(entry)}
                    type="button"
                  >
                    {convertingId === entry.id ? "Wird angelegt …" : "Aufgabe daraus anlegen"}
                  </button>
                </div>
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

function toMapMarker(entry: Reviermeldung): TerritoryMarker[] {
  if (!entry.location) {
    return [];
  }

  return [
    {
      id: `reviermeldung-${entry.id}`,
      type: "Reviermeldung",
      title: entry.title,
      position: {
        lat: entry.location.lat,
        lng: entry.location.lng
      },
      description: entry.location.label ?? entry.description,
      meta: [
        { label: "Kategorie", value: KATEGORIE_LABELS[entry.category] ?? entry.category },
        { label: "Status", value: STATUS_LABELS[entry.status] ?? entry.status },
        { label: "Zeitpunkt", value: formatDateTime(entry.occurredAt) }
      ],
      href: "/app/reviermeldungen"
    }
  ];
}
