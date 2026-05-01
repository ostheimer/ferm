"use client";

import type { Sitzung } from "@hege/domain";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { useState, useTransition } from "react";

import { readApiErrorMessage } from "../../../lib/api-error";

interface MembershipOption {
  membershipId: string;
  userName: string;
  role: string;
  jagdzeichen: string;
}

interface SitzungDetailClientProps {
  sitzung: Sitzung;
  memberships: MembershipOption[];
  canApprove: boolean;
}

interface BeschlussDraft {
  title: string;
  decision: string;
  owner: string;
  dueAt: string;
}

export function SitzungDetailClient({ sitzung, memberships, canApprove }: SitzungDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const latestVersion = sitzung.versions[0];
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [title, setTitle] = useState(sitzung.title);
  const [scheduledAt, setScheduledAt] = useState(toDateTimeLocalValue(sitzung.scheduledAt));
  const [locationLabel, setLocationLabel] = useState(sitzung.locationLabel);
  const [participants, setParticipants] = useState<Record<string, boolean>>(
    Object.fromEntries(
      memberships.map((entry) => [
        entry.membershipId,
        sitzung.participants.some((participant) => participant.membershipId === entry.membershipId && participant.anwesend)
      ])
    )
  );
  const [summary, setSummary] = useState(latestVersion?.summary ?? "");
  const [agendaText, setAgendaText] = useState((latestVersion?.agenda ?? []).join("\n"));
  const [beschluesse, setBeschluesse] = useState<BeschlussDraft[]>(
    latestVersion?.beschluesse.map((entry) => ({
      title: entry.title,
      decision: entry.decision,
      owner: entry.owner ?? "",
      dueAt: entry.dueAt ? toDateTimeLocalValue(entry.dueAt) : ""
    })) ?? [{ title: "", decision: "", owner: "", dueAt: "" }]
  );

  async function handleSaveMeta(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const response = await fetch(`/api/v1/sitzungen/${sitzung.id}`, {
      method: "PATCH",
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

    await handleResponse(response, "Sitzung gespeichert.");
  }

  async function handleSaveVersion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const response = await fetch(`/api/v1/sitzungen/${sitzung.id}/versionen`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        summary,
        agenda: agendaText
          .split("\n")
          .map((entry) => entry.trim())
          .filter(Boolean),
        beschluesse: beschluesse
          .filter((entry) => entry.title.trim().length > 0 && entry.decision.trim().length > 0)
          .map((entry) => ({
            title: entry.title,
            decision: entry.decision,
            owner: entry.owner.trim() || undefined,
            dueAt: entry.dueAt ? new Date(entry.dueAt).toISOString() : undefined
          }))
      })
    });

    await handleResponse(response, "Neue Protokollversion gespeichert.");
  }

  async function handleFreigeben() {
    setError(null);
    setSuccess(null);

    const response = await fetch(`/api/v1/sitzungen/${sitzung.id}/freigeben`, {
      method: "PATCH"
    });

    await handleResponse(response, "Sitzung wurde freigegeben.");
  }

  async function handleResponse(response: Response, successMessage: string) {
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(readApiErrorMessage(payload, "Aktion fehlgeschlagen."));
      return;
    }

    setSuccess(successMessage);
    startTransition(() => {
      router.refresh();
    });
  }

  function updateParticipant(membershipId: string) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const checked = event.currentTarget.checked;
      setParticipants((current) => ({
        ...current,
        [membershipId]: checked
      }));
    };
  }

  function updateBeschluss(index: number, key: keyof BeschlussDraft) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.currentTarget.value;
      setBeschluesse((current) =>
        current.map((entry, currentIndex) =>
          currentIndex === index
            ? {
                ...entry,
                [key]: value
              }
            : entry
        )
      );
    };
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <header className="section-header">
          <div>
            <p className="eyebrow">Sitzungsdetail</p>
            <h1>{sitzung.title}</h1>
          </div>
          <div className="section-actions">
            <Link className="button-link" href="/sitzungen">
              Zur Liste
            </Link>
            {sitzung.publishedDocument ? (
              <a className="button-link" href={sitzung.publishedDocument.url}>
                PDF laden
              </a>
            ) : null}
            {canApprove && sitzung.status !== "freigegeben" ? (
              <button className="button-control" disabled={isPending} onClick={() => void handleFreigeben()} type="button">
                Freigeben
              </button>
            ) : null}
          </div>
        </header>

        <div className="split-panel">
          <article className="panel-card">
            <p className="eyebrow">Status</p>
            <strong>{sitzung.status}</strong>
            <span>{formatDateTime(sitzung.scheduledAt)}</span>
            <span>{sitzung.locationLabel}</span>
          </article>

          <article className="panel-card">
            <p className="eyebrow">Versionen</p>
            <strong>{sitzung.versions.length}</strong>
            <span>Teilnehmer: {sitzung.participants.length}</span>
            <span>{sitzung.publishedDocument ? "PDF veröffentlicht" : "Noch kein PDF"}</span>
          </article>
        </div>
      </section>

      <section className="section-card">
        <header className="section-header">
          <div>
            <p className="eyebrow">Stammdaten</p>
            <h2>Titel, Termin, Ort und Teilnehmer</h2>
          </div>
        </header>

        <form className="ansitz-form" onSubmit={(event) => void handleSaveMeta(event)}>
          <label className="field" htmlFor="detail-title">
            <span>Titel</span>
            <input id="detail-title" onChange={(event) => setTitle(event.currentTarget.value)} required value={title} />
          </label>

          <label className="field" htmlFor="detail-date">
            <span>Termin</span>
            <input
              id="detail-date"
              onChange={(event) => setScheduledAt(event.currentTarget.value)}
              required
              type="datetime-local"
              value={scheduledAt}
            />
          </label>

          <label className="field field-full" htmlFor="detail-location">
            <span>Ort</span>
            <input
              id="detail-location"
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
                    onChange={updateParticipant(entry.membershipId)}
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
              Stammdaten speichern
            </button>
          </div>
        </form>
      </section>

      <section className="section-card">
        <header className="section-header">
          <div>
            <p className="eyebrow">Protokollversion</p>
            <h2>Zusammenfassung, Agenda und Beschlüsse</h2>
          </div>
        </header>

        <form className="page-stack" onSubmit={(event) => void handleSaveVersion(event)}>
          <label className="field" htmlFor="version-summary">
            <span>Zusammenfassung</span>
            <textarea
              id="version-summary"
              onChange={(event) => setSummary(event.currentTarget.value)}
              rows={6}
              value={summary}
            />
          </label>

          <label className="field" htmlFor="version-agenda">
            <span>Agenda, eine Zeile pro Punkt</span>
            <textarea
              id="version-agenda"
              onChange={(event) => setAgendaText(event.currentTarget.value)}
              rows={6}
              value={agendaText}
            />
          </label>

          <div className="page-stack">
            {beschluesse.map((entry, index) => (
              <article key={`${index}-${entry.title}`} className="detail-card">
                <label className="field">
                  <span>Beschlusstitel</span>
                  <input onChange={updateBeschluss(index, "title")} value={entry.title} />
                </label>
                <label className="field">
                  <span>Beschluss</span>
                  <textarea onChange={updateBeschluss(index, "decision")} rows={4} value={entry.decision} />
                </label>
                <label className="field">
                  <span>Verantwortlich</span>
                  <input onChange={updateBeschluss(index, "owner")} value={entry.owner} />
                </label>
                <label className="field">
                  <span>Fälligkeit</span>
                  <input onChange={updateBeschluss(index, "dueAt")} type="datetime-local" value={entry.dueAt} />
                </label>
              </article>
            ))}
            <button
              className="button-control button-control-secondary"
              onClick={() =>
                setBeschluesse((current) => [...current, { title: "", decision: "", owner: "", dueAt: "" }])
              }
              type="button"
            >
              Weiteren Beschluss hinzufügen
            </button>
          </div>

          <div className="form-footer">
            <div aria-live="polite" className="form-messages">
              {error ? <p className="feedback feedback-error">{error}</p> : null}
              {success ? <p className="feedback feedback-success">{success}</p> : null}
            </div>
            <button className="button-control" disabled={isPending} type="submit">
              Neue Version speichern
            </button>
          </div>
        </form>
      </section>

      <section className="section-card">
        <header className="section-header">
          <div>
            <p className="eyebrow">Historie</p>
            <h2>Bisherige Protokollstände</h2>
          </div>
        </header>
        <div className="card-grid">
          {sitzung.versions.map((entry) => (
            <article key={entry.id} className="detail-card">
              <div className="detail-card-header">
                <div>
                  <p className="eyebrow">{entry.id}</p>
                  <h2>{formatDateTime(entry.createdAt)}</h2>
                </div>
                <span className="status-pill status-ok">{entry.beschluesse.length} Beschlüsse</span>
              </div>
              <p>{entry.summary}</p>
              <div className="simple-list">
                {entry.beschluesse.length > 0 ? (
                  entry.beschluesse.map((beschluss) => (
                    <div key={beschluss.id}>
                      <strong>{beschluss.title}</strong>
                      <span>{beschluss.decision}</span>
                    </div>
                  ))
                ) : (
                  <div>
                    <strong>Keine Beschlüsse</strong>
                    <span>Diese Version enthält noch keine Beschlüsse.</span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
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

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
