"use client";

import type { FallwildVorgang } from "@hege/domain";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState, useTransition } from "react";

import { ListFilterChips } from "../../components/list-filter-chips";
import { ListSearchBar } from "../../components/list-search-bar";
import { StateView } from "../../components/state-view";
import { readApiErrorMessage } from "../../lib/api-error";
import { filterBySearch, hasActiveSearch } from "../../lib/list-search";

type BergungsFilter = "alle" | "erfasst" | "geborgen" | "entsorgt" | "an-behoerde-gemeldet";
type ZeitraumFilter = "alle" | "heute" | "woche" | "monat";
type FallwildSortKey = "neueste-zuerst" | "aelteste-zuerst" | "nach-wildart" | "nach-gemeinde";

function compareFallwild(
  left: FallwildClientEntry,
  right: FallwildClientEntry,
  key: FallwildSortKey
): number {
  switch (key) {
    case "neueste-zuerst":
      return right.recordedAt.localeCompare(left.recordedAt);
    case "aelteste-zuerst":
      return left.recordedAt.localeCompare(right.recordedAt);
    case "nach-wildart":
      return (
        left.wildart.localeCompare(right.wildart, "de-AT") ||
        right.recordedAt.localeCompare(left.recordedAt)
      );
    case "nach-gemeinde":
      return (
        left.gemeinde.localeCompare(right.gemeinde, "de-AT") ||
        right.recordedAt.localeCompare(left.recordedAt)
      );
    default:
      return 0;
  }
}

function isWithinZeitraum(recordedAt: string, filter: ZeitraumFilter, now: Date): boolean {
  if (filter === "alle") return true;
  const date = new Date(recordedAt);
  const start = new Date(now);
  if (filter === "heute") {
    start.setHours(0, 0, 0, 0);
  } else if (filter === "woche") {
    start.setDate(start.getDate() - 7);
  } else {
    start.setDate(start.getDate() - 30);
  }
  return date.getTime() >= start.getTime();
}

export type FallwildClientEntry = FallwildVorgang & {
  addressLabel: string;
  locationLabel: string;
  roadKilometerLabel: string;
  recordedAtLabel: string;
  streetLabel: string;
};

interface FallwildClientProps {
  entries: FallwildClientEntry[];
}

const DEFAULT_FORM_VALUES = {
  gemeinde: "",
  strasse: "",
  addressLabel: "",
  locationLabel: "",
  lat: "",
  lng: "",
  roadKilometer: "",
  wildart: "Reh",
  geschlecht: "weiblich",
  altersklasse: "Adult",
  bergungsStatus: "geborgen",
  note: ""
};

export function FallwildClient({ entries }: FallwildClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formValues, setFormValues] = useState(DEFAULT_FORM_VALUES);
  const [search, setSearch] = useState("");
  const [bergungsFilter, setBergungsFilter] = useState<BergungsFilter>("alle");
  const [zeitraumFilter, setZeitraumFilter] = useState<ZeitraumFilter>("alle");
  const [sortKey, setSortKey] = useState<FallwildSortKey>("neueste-zuerst");

  // Pipeline: Zeitraum -> Bergungsstatus -> Volltextsuche.
  // Reduktionen kommen zuerst, Volltext-Match zuletzt.
  const filteredByChips = useMemo(() => {
    const now = new Date();
    return entries.filter((entry) => {
      if (!isWithinZeitraum(entry.recordedAt, zeitraumFilter, now)) return false;
      if (bergungsFilter !== "alle" && entry.bergungsStatus !== bergungsFilter) return false;
      return true;
    });
  }, [entries, bergungsFilter, zeitraumFilter]);

  const visibleEntries = useMemo(
    () =>
      [
        ...filterBySearch(filteredByChips, search, (entry) =>
          [
            entry.wildart,
            entry.gemeinde,
            entry.streetLabel,
            entry.note ?? "",
            entry.locationLabel,
            entry.addressLabel,
            entry.bergungsStatus
          ].join(" ")
        )
      ].sort((left, right) => compareFallwild(left, right, sortKey)),
    [filteredByChips, search, sortKey]
  );
  const searchActive = hasActiveSearch(search);
  const filterActive =
    bergungsFilter !== "alle" || zeitraumFilter !== "alle" || sortKey !== "neueste-zuerst";
  const resultLabel =
    searchActive || filterActive
      ? `${visibleEntries.length} von ${entries.length}`
      : `${entries.length} Eintraege`;

  function resetAllFilters() {
    setSearch("");
    setBergungsFilter("alle");
    setZeitraumFilter("alle");
    setSortKey("neueste-zuerst");
  }

  function updateInput<Key extends keyof typeof DEFAULT_FORM_VALUES>(key: Key) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.currentTarget.value;
      setFormValues((current) => ({ ...current, [key]: value }));
    };
  }

  function updateTextarea(key: "note") {
    return (event: ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.currentTarget.value;
      setFormValues((current) => ({ ...current, [key]: value }));
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const response = await fetch("/api/v1/fallwild", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        location: {
          lat: Number(formValues.lat),
          lng: Number(formValues.lng),
          label: emptyToUndefined(formValues.locationLabel),
          source: "manual",
          addressLabel: emptyToUndefined(formValues.addressLabel)
        },
        wildart: formValues.wildart,
        geschlecht: formValues.geschlecht,
        altersklasse: formValues.altersklasse,
        bergungsStatus: formValues.bergungsStatus,
        gemeinde: formValues.gemeinde,
        strasse: emptyToUndefined(formValues.strasse),
        roadReference: buildRoadReference(formValues.strasse, formValues.roadKilometer),
        note: emptyToUndefined(formValues.note)
      })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(readApiErrorMessage(payload, "Fallwild konnte nicht gespeichert werden."));
      return;
    }

    setFormValues(DEFAULT_FORM_VALUES);
    setSuccess("Fallwild wurde erfasst.");
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <header className="section-header">
          <div>
            <p className="eyebrow">Fallwild</p>
            <h1>Bergungen, Dokumentation und Export</h1>
            <p className="hero-copy">
              Erfassung läuft über die hege-App. Hier nur Lese-, Filter- und Export-Sicht für Schriftführung und Revierleitung.
            </p>
          </div>
          <div className="section-actions">
            <a className="button-link" href="/api/v1/fallwild/export.csv">
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
          placeholder="Suche Wildart, Gemeinde, Notiz oder Adresse"
          resultLabel={resultLabel}
        />

        <ListFilterChips<BergungsFilter>
          eyebrow="Bergung"
          ariaLabel="Bergungsstatus filtern"
          value={bergungsFilter}
          onChange={setBergungsFilter}
          options={[
            { key: "alle", label: "Alle" },
            { key: "erfasst", label: "Erfasst" },
            { key: "geborgen", label: "Geborgen" },
            { key: "entsorgt", label: "Entsorgt" },
            { key: "an-behoerde-gemeldet", label: "Behörde" }
          ]}
        />

        <ListFilterChips<ZeitraumFilter>
          eyebrow="Zeitraum"
          ariaLabel="Zeitraum filtern"
          value={zeitraumFilter}
          onChange={setZeitraumFilter}
          options={[
            { key: "alle", label: "Alle" },
            { key: "heute", label: "Heute" },
            { key: "woche", label: "7 Tage" },
            { key: "monat", label: "30 Tage" }
          ]}
        />

        <ListFilterChips<FallwildSortKey>
          eyebrow="Sortierung"
          ariaLabel="Fallwild sortieren"
          value={sortKey}
          onChange={setSortKey}
          options={[
            { key: "neueste-zuerst", label: "Neueste zuerst" },
            { key: "aelteste-zuerst", label: "Älteste zuerst" },
            { key: "nach-wildart", label: "Nach Wildart" },
            { key: "nach-gemeinde", label: "Nach Gemeinde" }
          ]}
        />

        <div className="timeline">
          {entries.length === 0 ? (
            <StateView
              mode="empty"
              title="Keine dokumentierten Vorgänge"
              description="Sobald der erste Fallwild-Vorgang erfasst wird, erscheint er hier und im CSV-Export."
              bare
            />
          ) : visibleEntries.length === 0 ? (
            <StateView
              mode="empty"
              title="Keine Treffer"
              description={
                searchActive
                  ? `Mit der aktuellen Suche („${search}") und den gesetzten Filtern findet sich kein Vorgang.`
                  : "Mit den aktuellen Filtern findet sich kein Vorgang."
              }
              action={{ label: "Filter zurücksetzen", onClick: resetAllFilters }}
              bare
            />
          ) : (
            visibleEntries.map((entry) => (
              <article key={entry.id} className="timeline-item">
                <span>{entry.wildart}</span>
                <strong>
                  {entry.gemeinde} / {entry.streetLabel}
                </strong>
                <p>
                  {entry.geschlecht}, {entry.altersklasse} / Status {entry.bergungsStatus}
                </p>
                <p>{entry.locationLabel}</p>
                {entry.addressLabel ? <p>{entry.addressLabel}</p> : null}
                {entry.roadKilometerLabel ? <p>{entry.roadKilometerLabel}</p> : null}
                <time>{entry.recordedAtLabel}</time>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="section-card">
        <header className="section-header">
          <div>
            <p className="eyebrow">Neuer Vorgang</p>
            <h2>Fallwild für das Revier erfassen</h2>
          </div>
          {isPending ? <span className="badge">Synchronisiert...</span> : null}
        </header>

        <form className="ansitz-form" onSubmit={(event) => void handleSubmit(event)}>
          <label className="field" htmlFor="fallwild-gemeinde">
            <span>Gemeinde</span>
            <input
              id="fallwild-gemeinde"
              name="gemeinde"
              onChange={updateInput("gemeinde")}
              placeholder="Gänserndorf"
              required
              value={formValues.gemeinde}
            />
          </label>

          <label className="field" htmlFor="fallwild-strasse">
            <span>Straße</span>
            <input
              id="fallwild-strasse"
              name="strasse"
              onChange={updateInput("strasse")}
              placeholder="L9"
              value={formValues.strasse}
            />
          </label>

          <label className="field" htmlFor="fallwild-road-kilometer">
            <span>Straßenkilometer</span>
            <input
              id="fallwild-road-kilometer"
              name="roadKilometer"
              onChange={updateInput("roadKilometer")}
              placeholder="z. B. km 12,4"
              value={formValues.roadKilometer}
            />
          </label>

          <label className="field" htmlFor="fallwild-address-label">
            <span>Adresse</span>
            <input
              id="fallwild-address-label"
              name="addressLabel"
              onChange={updateInput("addressLabel")}
              placeholder="Adresse oder Straßenabschnitt"
              value={formValues.addressLabel}
            />
          </label>

          <label className="field" htmlFor="fallwild-location-label">
            <span>Lagebezeichnung</span>
            <input
              id="fallwild-location-label"
              name="locationLabel"
              onChange={updateInput("locationLabel")}
              placeholder="Unfallstelle, Straßenseite oder markanter Punkt"
              value={formValues.locationLabel}
            />
          </label>

          <label className="field" htmlFor="fallwild-lat">
            <span>Breitengrad</span>
            <input
              id="fallwild-lat"
              inputMode="decimal"
              name="lat"
              onChange={updateInput("lat")}
              required
              value={formValues.lat}
            />
          </label>

          <label className="field" htmlFor="fallwild-lng">
            <span>Längengrad</span>
            <input
              id="fallwild-lng"
              inputMode="decimal"
              name="lng"
              onChange={updateInput("lng")}
              required
              value={formValues.lng}
            />
          </label>

          <label className="field" htmlFor="fallwild-wildart">
            <span>Wildart</span>
            <select id="fallwild-wildart" name="wildart" onChange={updateInput("wildart")} value={formValues.wildart}>
              <option value="Reh">Reh</option>
              <option value="Rotwild">Rotwild</option>
              <option value="Schwarzwild">Schwarzwild</option>
              <option value="Fuchs">Fuchs</option>
              <option value="Dachs">Dachs</option>
              <option value="Hase">Hase</option>
              <option value="Muffelwild">Muffelwild</option>
            </select>
          </label>

          <label className="field" htmlFor="fallwild-geschlecht">
            <span>Geschlecht</span>
            <select
              id="fallwild-geschlecht"
              name="geschlecht"
              onChange={updateInput("geschlecht")}
              value={formValues.geschlecht}
            >
              <option value="maennlich">männlich</option>
              <option value="weiblich">weiblich</option>
              <option value="unbekannt">unbekannt</option>
            </select>
          </label>

          <label className="field" htmlFor="fallwild-altersklasse">
            <span>Altersklasse</span>
            <select
              id="fallwild-altersklasse"
              name="altersklasse"
              onChange={updateInput("altersklasse")}
              value={formValues.altersklasse}
            >
              <option value="Kitz">Kitz</option>
              <option value="Jaehrling">Jährling</option>
              <option value="Adult">Adult</option>
              <option value="unbekannt">unbekannt</option>
            </select>
          </label>

          <label className="field" htmlFor="fallwild-status">
            <span>Bergungsstatus</span>
            <select
              id="fallwild-status"
              name="bergungsStatus"
              onChange={updateInput("bergungsStatus")}
              value={formValues.bergungsStatus}
            >
              <option value="erfasst">erfasst</option>
              <option value="geborgen">geborgen</option>
              <option value="entsorgt">entsorgt</option>
              <option value="an-behoerde-gemeldet">an Behörde gemeldet</option>
            </select>
          </label>

          <label className="field field-full" htmlFor="fallwild-note">
            <span>Notiz</span>
            <textarea
              id="fallwild-note"
              name="note"
              onChange={updateTextarea("note")}
              placeholder="Kurzbeschreibung für den Vorgang"
              rows={4}
              value={formValues.note}
            />
          </label>

          <div className="form-footer field-full">
            <div aria-live="polite" className="form-messages">
              {error ? <p className="feedback feedback-error">{error}</p> : null}
              {success ? <p className="feedback feedback-success">{success}</p> : null}
            </div>
            <button className="button-control" disabled={isPending} type="submit">
              Fallwild erfassen
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function emptyToUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildRoadReference(strasse: string, roadKilometer: string) {
  const roadName = emptyToUndefined(strasse);
  const kilometer = emptyToUndefined(roadKilometer);

  if (!roadName && !kilometer) {
    return undefined;
  }

  return {
    roadName,
    roadKilometer: kilometer,
    source: kilometer ? "manual" : "unavailable"
  };
}
