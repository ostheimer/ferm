"use client";

import type { AnsitzSession } from "@hege/domain";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { useState, useTransition } from "react";

import { readApiErrorMessage } from "../../lib/api-error";

interface AnsitzeClientProps {
  activeAnsitze: AnsitzeClientEntry[];
}

export type AnsitzeClientEntry = AnsitzSession & {
  plannedEndAtLabel: string;
  startedAtLabel: string;
};

const DEFAULT_COORDINATES = {
  lat: "47.9134",
  lng: "13.5251"
};

const DEFAULT_FORM_VALUES = {
  standortId: "",
  standortName: "",
  locationLabel: "",
  lat: DEFAULT_COORDINATES.lat,
  lng: DEFAULT_COORDINATES.lng,
  plannedEndAt: "",
  note: ""
};

export function AnsitzeClient({ activeAnsitze }: AnsitzeClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formValues, setFormValues] = useState(DEFAULT_FORM_VALUES);

  function updateInput<Key extends keyof Omit<typeof DEFAULT_FORM_VALUES, "note">>(key: Key) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.currentTarget.value;
      setFormValues((current) => ({ ...current, [key]: value }));
    };
  }

  function updateTextarea<Key extends "note">(key: Key) {
    return (event: ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.currentTarget.value;
      setFormValues((current) => ({ ...current, [key]: value }));
    };
  }

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const response = await fetch("/api/v1/ansitze", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        standortId: emptyToUndefined(formValues.standortId),
        standortName: formValues.standortName,
        location: {
          lat: Number(formValues.lat),
          lng: Number(formValues.lng),
          label: emptyToUndefined(formValues.locationLabel)
        },
        plannedEndAt: formValues.plannedEndAt ? new Date(formValues.plannedEndAt).toISOString() : undefined,
        note: emptyToUndefined(formValues.note)
      })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(readApiErrorMessage(payload, "Ansitz konnte nicht gestartet werden."));
      return;
    }

    setFormValues(DEFAULT_FORM_VALUES);
    setSuccess("Ansitz wurde gestartet.");
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleEndAnsitz(ansitzId: string) {
    setError(null);
    setSuccess(null);

    const response = await fetch(`/api/v1/ansitze/${ansitzId}/beenden`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        endedAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(readApiErrorMessage(payload, "Ansitz konnte nicht beendet werden."));
      return;
    }

    setSuccess("Ansitz wurde beendet.");
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <header className="section-header">
          <div>
            <p className="eyebrow">Ansitzmanagement</p>
            <h1>Aktive Ansitze und Konfliktlage</h1>
          </div>
          <div className="section-actions">
            <span className="badge">{activeAnsitze.length} aktiv</span>
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

        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Standort</th>
                <th>Beginn</th>
                <th>Geplantes Ende</th>
                <th>Status</th>
                <th>Notiz</th>
                <th>Aktion</th>
              </tr>
            </thead>
            <tbody>
              {activeAnsitze.length === 0 ? (
                <tr>
                  <td colSpan={6}>Keine aktiven Ansitze vorhanden.</td>
                </tr>
              ) : (
                activeAnsitze.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <strong>{entry.standortName}</strong>
                      <span>{entry.location.label}</span>
                    </td>
                    <td>{entry.startedAtLabel}</td>
                    <td>{entry.plannedEndAtLabel}</td>
                    <td>
                      <span className={entry.conflict ? "status-pill status-danger" : "status-pill status-ok"}>
                        {entry.conflict ? "Warnung" : "Aktiv"}
                      </span>
                    </td>
                    <td>{entry.note ?? "Keine Notiz"}</td>
                    <td>
                      <button
                        className="button-control button-control-danger"
                        disabled={isPending}
                        onClick={() => void handleEndAnsitz(entry.id)}
                        type="button"
                      >
                        Beenden
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-card">
        <header className="section-header">
          <div>
            <p className="eyebrow">Neuer Ansitz</p>
            <h2>Ansitz fuer das Revier melden</h2>
          </div>
          {isPending ? <span className="badge">Synchronisiert...</span> : null}
        </header>

        <form className="ansitz-form" onSubmit={(event) => void handleCreateSubmit(event)}>
          <label className="field">
            <span>Standortname</span>
            <input
              id="ansitz-standort-name"
              name="standortName"
              onChange={updateInput("standortName")}
              placeholder="Hochstand Buchenhang"
              required
              value={formValues.standortName}
            />
          </label>

          <label className="field" htmlFor="ansitz-standort-id">
            <span>Standort-ID</span>
            <input
              id="ansitz-standort-id"
              name="standortId"
              onChange={updateInput("standortId")}
              placeholder="einrichtung-1"
              value={formValues.standortId}
            />
          </label>

          <label className="field" htmlFor="ansitz-location-label">
            <span>Lagebezeichnung</span>
            <input
              id="ansitz-location-label"
              name="locationLabel"
              onChange={updateInput("locationLabel")}
              placeholder="Wiesenrand"
              value={formValues.locationLabel}
            />
          </label>

          <label className="field" htmlFor="ansitz-lat">
            <span>Breitengrad</span>
            <input
              id="ansitz-lat"
              inputMode="decimal"
              name="lat"
              onChange={updateInput("lat")}
              required
              value={formValues.lat}
            />
          </label>

          <label className="field" htmlFor="ansitz-lng">
            <span>Laengengrad</span>
            <input
              id="ansitz-lng"
              inputMode="decimal"
              name="lng"
              onChange={updateInput("lng")}
              required
              value={formValues.lng}
            />
          </label>

          <label className="field" htmlFor="ansitz-planned-end">
            <span>Geplantes Ende</span>
            <input
              id="ansitz-planned-end"
              name="plannedEndAt"
              onChange={updateInput("plannedEndAt")}
              type="datetime-local"
              value={formValues.plannedEndAt}
            />
          </label>

          <label className="field field-full" htmlFor="ansitz-note">
            <span>Notiz</span>
            <textarea
              id="ansitz-note"
              name="note"
              onChange={updateTextarea("note")}
              placeholder="Kurzbeschreibung fuer den Ansitz"
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
              Ansitz starten
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
