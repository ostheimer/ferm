"use client";

import type { Sitzung } from "@hege/domain";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { useState, useTransition } from "react";

import { readApiErrorMessage } from "../../lib/api-error";

interface MembershipOption {
  membershipId: string;
  userName: string;
  role: string;
  jagdzeichen: string;
}

interface SitzungenClientProps {
  entries: Sitzung[];
  memberships: MembershipOption[];
}

const DEFAULT_DATE = "2026-04-12T19:00";

export function SitzungenClient({ entries, memberships }: SitzungenClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [title, setTitle] = useState("Neue Revierbesprechung");
  const [scheduledAt, setScheduledAt] = useState(DEFAULT_DATE);
  const [locationLabel, setLocationLabel] = useState("Jagdhaus Gänserndorf");
  const [participants, setParticipants] = useState<Record<string, boolean>>(
    Object.fromEntries(memberships.map((entry) => [entry.membershipId, true]))
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const response = await fetch("/api/v1/sitzungen", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        title,
        scheduledAt: new Date(scheduledAt).toISOString(),
        locationLabel,
        participants: memberships.map((entry) => ({
          membershipId: entry.membershipId,
          anwesend: participants[entry.membershipId] ?? false
        }))
      })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(readApiErrorMessage(payload, "Sitzung konnte nicht angelegt werden."));
      return;
    }

    const sitzung = (await response.json()) as Sitzung;
    setSuccess("Sitzung wurde angelegt.");
    startTransition(() => {
      router.push(`/sitzungen/${sitzung.id}`);
      router.refresh();
    });
  }

  function toggleParticipant(membershipId: string) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const checked = event.currentTarget.checked;
      setParticipants((current) => ({
        ...current,
        [membershipId]: checked
      }));
    };
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <header className="section-header">
          <div>
            <p className="eyebrow">Sitzungen</p>
            <h1>Entwürfe, Protokollstände und Freigaben</h1>
          </div>
          <div className="section-actions">
            <span className="badge">{entries.length} Einträge</span>
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

        <div className="card-grid">
          {entries.length === 0 ? (
            <article className="detail-card">
              <p className="eyebrow">Noch keine Sitzungen</p>
              <h2>Lege den ersten Entwurf direkt hier an.</h2>
            </article>
          ) : (
            entries.map((entry) => (
              <article key={entry.id} className="detail-card">
                <div className="detail-card-header">
                  <div>
                    <p className="eyebrow">{entry.status === "freigegeben" ? "Freigegeben" : "Entwurf"}</p>
                    <h2>{entry.title}</h2>
                  </div>
                  <span className={entry.status === "freigegeben" ? "status-pill status-ok" : "status-pill status-warning"}>
                    {entry.status}
                  </span>
                </div>
                <p>{entry.locationLabel}</p>
                <p>{formatDateTime(entry.scheduledAt)}</p>
                <div className="simple-list">
                  <div>
                    <strong>{entry.versions.length} Version(en)</strong>
                    <span>{entry.participants.length} Teilnehmer im Entwurf</span>
                  </div>
                </div>
                <Link className="button-link" href={`/sitzungen/${entry.id}`}>
                  Detail öffnen
                </Link>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="section-card">
        <header className="section-header">
          <div>
            <p className="eyebrow">Neue Sitzung</p>
            <h2>Entwurf für Schriftführung anlegen</h2>
          </div>
          {isPending ? <span className="badge">Speichert...</span> : null}
        </header>

        <form className="ansitz-form" onSubmit={(event) => void handleSubmit(event)}>
          <label className="field" htmlFor="sitzung-title">
            <span>Titel</span>
            <input id="sitzung-title" onChange={(event) => setTitle(event.currentTarget.value)} required value={title} />
          </label>

          <label className="field" htmlFor="sitzung-scheduled-at">
            <span>Termin</span>
            <input
              id="sitzung-scheduled-at"
              onChange={(event) => setScheduledAt(event.currentTarget.value)}
              required
              type="datetime-local"
              value={scheduledAt}
            />
          </label>

          <label className="field field-full" htmlFor="sitzung-location">
            <span>Ort</span>
            <input
              id="sitzung-location"
              onChange={(event) => setLocationLabel(event.currentTarget.value)}
              required
              value={locationLabel}
            />
          </label>

          <div className="field field-full">
            <span>Teilnehmer</span>
            <div className="checkbox-grid">
              {memberships.map((entry) => (
                <label key={entry.membershipId} className="checkbox-card">
                  <input
                    checked={participants[entry.membershipId] ?? false}
                    onChange={toggleParticipant(entry.membershipId)}
                    type="checkbox"
                  />
                  <div>
                    <strong>{entry.userName}</strong>
                    <span>{`${entry.role} · ${entry.jagdzeichen}`}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="form-footer field-full">
            <div aria-live="polite" className="form-messages">
              {error ? <p className="feedback feedback-error">{error}</p> : null}
              {success ? <p className="feedback feedback-success">{success}</p> : null}
            </div>
            <button className="button-control" disabled={isPending} type="submit">
              Sitzung anlegen
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("de-AT", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Vienna"
  }).format(new Date(value));
}
