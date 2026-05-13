"use client";

import type { Aufgabe, AufgabePrioritaet, AufgabeStatus } from "@hege/domain";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { ListFilterChips } from "../../../components/list-filter-chips";
import { ListSearchBar } from "../../../components/list-search-bar";
import { StateView } from "../../../components/state-view";
import { readApiErrorMessage } from "../../../lib/api-error";
import { filterBySearch, hasActiveSearch } from "../../../lib/list-search";

/**
 * Web-Pendant zur Mobile-Aufgaben-Sicht in `revierarbeit.tsx`. Spiegelt
 * Filter-Buckets + Sort-Optionen, damit User mit beiden Oberflaechen
 * nichts neu lernen.
 *
 * Status-Bucket statt feinkoernige AufgabeStatus-Liste — der primaere
 * Use-Case ist "abarbeiten", nicht "browsen". Default `offen` versteckt
 * Erledigtes; ein Klick auf "Alle" oeffnet die volle Sicht.
 */

type StatusFilter = "alle" | "offen" | "erledigt";
type PrioritaetFilter = "alle" | AufgabePrioritaet;
type SortKey = "faellig-zuerst" | "prioritaet-hoch" | "neueste-zuerst" | "alphabetisch";

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

function matchesStatusBucket(status: AufgabeStatus, filter: StatusFilter): boolean {
  if (filter === "alle") return true;
  if (filter === "erledigt") return status === "erledigt";
  return OFFEN_STATUSES.includes(status);
}

function compareAufgaben(left: Aufgabe, right: Aufgabe, key: SortKey): number {
  switch (key) {
    case "faellig-zuerst": {
      const leftHasDue = Boolean(left.dueAt);
      const rightHasDue = Boolean(right.dueAt);
      if (leftHasDue && !rightHasDue) return -1;
      if (!leftHasDue && rightHasDue) return 1;
      if (leftHasDue && rightHasDue) {
        const cmp = left.dueAt!.localeCompare(right.dueAt!);
        if (cmp !== 0) return cmp;
      }
      return PRIORITAET_RANK[left.priority] - PRIORITAET_RANK[right.priority];
    }
    case "prioritaet-hoch": {
      const cmp = PRIORITAET_RANK[left.priority] - PRIORITAET_RANK[right.priority];
      if (cmp !== 0) return cmp;
      return right.createdAt.localeCompare(left.createdAt);
    }
    case "neueste-zuerst":
      return right.createdAt.localeCompare(left.createdAt);
    case "alphabetisch":
      return left.title.localeCompare(right.title, "de-AT");
    default:
      return 0;
  }
}

interface AufgabenClientProps {
  aufgaben: Aufgabe[];
}

export function AufgabenClient({ aufgaben }: AufgabenClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("offen");
  const [prioritaetFilter, setPrioritaetFilter] = useState<PrioritaetFilter>("alle");
  const [sortKey, setSortKey] = useState<SortKey>("faellig-zuerst");

  const filteredByChips = useMemo(
    () =>
      aufgaben.filter((entry) => {
        if (!matchesStatusBucket(entry.status, statusFilter)) return false;
        if (prioritaetFilter !== "alle" && entry.priority !== prioritaetFilter) return false;
        return true;
      }),
    [aufgaben, statusFilter, prioritaetFilter]
  );

  const visibleAufgaben = useMemo(
    () =>
      [
        ...filterBySearch(filteredByChips, search, (entry) =>
          [entry.title, entry.description ?? "", entry.completionNote ?? ""].join(" ")
        )
      ].sort((left, right) => compareAufgaben(left, right, sortKey)),
    [filteredByChips, search, sortKey]
  );

  const searchActive = hasActiveSearch(search);
  const filterActive =
    statusFilter !== "offen" ||
    prioritaetFilter !== "alle" ||
    sortKey !== "faellig-zuerst";
  const resultLabel =
    searchActive || filterActive
      ? `${visibleAufgaben.length} von ${aufgaben.length}`
      : `${aufgaben.length} Aufgaben`;

  function resetAllFilters() {
    setSearch("");
    setStatusFilter("offen");
    setPrioritaetFilter("alle");
    setSortKey("faellig-zuerst");
  }

  async function updateStatus(aufgabeId: string, status: AufgabeStatus) {
    setUpdatingId(aufgabeId);
    setError(null);

    const response = await fetch(`/api/v1/aufgaben/${aufgabeId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status })
    });

    setUpdatingId(null);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(readApiErrorMessage(body, "Aufgabe konnte nicht aktualisiert werden."));
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <header className="section-header">
          <div>
            <p className="eyebrow">Aufgaben</p>
            <h1>Revierarbeit, geordnet nach Fälligkeit</h1>
            <p className="hero-copy">
              Aufgaben aus Sichtungen, Wartungen und manuellen Einträgen — direkt aus dem Backoffice
              bearbeitbar. Mobil bleibt die Liste in „Revierarbeit" gespiegelt.
            </p>
          </div>
          <div className="section-actions">
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
          placeholder="Suche Titel, Beschreibung oder Notiz"
          resultLabel={resultLabel}
        />

        <ListFilterChips<StatusFilter>
          eyebrow="Status"
          ariaLabel="Aufgaben-Status filtern"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { key: "offen", label: "Offen" },
            { key: "erledigt", label: "Erledigt" },
            { key: "alle", label: "Alle" }
          ]}
        />

        <ListFilterChips<PrioritaetFilter>
          eyebrow="Priorität"
          ariaLabel="Priorität filtern"
          value={prioritaetFilter}
          onChange={setPrioritaetFilter}
          options={[
            { key: "alle", label: "Alle" },
            { key: "dringend", label: "Dringend" },
            { key: "hoch", label: "Hoch" },
            { key: "normal", label: "Normal" },
            { key: "niedrig", label: "Niedrig" }
          ]}
        />

        <ListFilterChips<SortKey>
          eyebrow="Sortierung"
          ariaLabel="Aufgaben sortieren"
          value={sortKey}
          onChange={setSortKey}
          options={[
            { key: "faellig-zuerst", label: "Fällig zuerst" },
            { key: "prioritaet-hoch", label: "Wichtig zuerst" },
            { key: "neueste-zuerst", label: "Neueste zuerst" },
            { key: "alphabetisch", label: "A–Z" }
          ]}
        />

        {error ? (
          <p aria-live="polite" className="feedback feedback-error">
            {error}
          </p>
        ) : null}

        {aufgaben.length === 0 ? (
          <StateView
            mode="empty"
            title="Noch keine Aufgaben"
            description="Sobald jemand eine Aufgabe anlegt oder eine Reviermeldung in eine Aufgabe ueberfuehrt wird, taucht sie hier auf."
            bare
          />
        ) : visibleAufgaben.length === 0 ? (
          <StateView
            mode="empty"
            title="Keine Treffer"
            description={
              searchActive
                ? `Mit der aktuellen Suche („${search}") und den gesetzten Filtern findet sich keine Aufgabe.`
                : "Mit den aktuellen Filtern findet sich keine Aufgabe."
            }
            action={{ label: "Filter zurücksetzen", onClick: resetAllFilters }}
            bare
          />
        ) : (
          <div className="card-grid">
            {visibleAufgaben.map((entry) => (
              <article key={entry.id} className="detail-card">
                <div className="detail-card-header">
                  <div>
                    <p className="eyebrow">
                      {formatPriorityLabel(entry.priority)} · {formatStatusLabel(entry.status)}
                    </p>
                    <h2>{entry.title}</h2>
                  </div>
                  <span className={statusPillClass(entry.status)}>
                    {formatStatusLabel(entry.status)}
                  </span>
                </div>

                {entry.description ? <p>{entry.description}</p> : null}
                {entry.dueAt ? <p>Fällig: {formatDateTime(entry.dueAt)}</p> : null}
                {entry.completionNote ? <p>Notiz: {entry.completionNote}</p> : null}

                <div className="form-footer">
                  {entry.status !== "in_arbeit" && entry.status !== "erledigt" ? (
                    <button
                      className="button-control button-control-secondary"
                      disabled={updatingId === entry.id}
                      onClick={() => void updateStatus(entry.id, "in_arbeit")}
                      type="button"
                    >
                      In Arbeit
                    </button>
                  ) : null}
                  {entry.status !== "erledigt" ? (
                    <button
                      className="button-control"
                      disabled={updatingId === entry.id}
                      onClick={() => void updateStatus(entry.id, "erledigt")}
                      type="button"
                    >
                      Erledigen
                    </button>
                  ) : (
                    <button
                      className="button-control button-control-secondary"
                      disabled={updatingId === entry.id}
                      onClick={() => void updateStatus(entry.id, "offen")}
                      type="button"
                    >
                      Wieder öffnen
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function formatPriorityLabel(priority: AufgabePrioritaet): string {
  switch (priority) {
    case "dringend":
      return "Dringend";
    case "hoch":
      return "Hoch";
    case "normal":
      return "Normal";
    case "niedrig":
      return "Niedrig";
    default:
      return priority;
  }
}

function formatStatusLabel(status: AufgabeStatus): string {
  switch (status) {
    case "offen":
      return "Offen";
    case "angenommen":
      return "Angenommen";
    case "in_arbeit":
      return "In Arbeit";
    case "blockiert":
      return "Blockiert";
    case "erledigt":
      return "Erledigt";
    case "abgelehnt":
      return "Abgelehnt";
    case "archiviert":
      return "Archiviert";
    default:
      return status;
  }
}

function statusPillClass(status: AufgabeStatus): string {
  if (status === "erledigt") return "status-pill status-ok";
  if (status === "blockiert" || status === "abgelehnt") return "status-pill status-warning";
  return "status-pill";
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("de-AT", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Vienna"
  }).format(new Date(value));
}
