"use client";

import type {
  CreateMemberInvitationPayload,
  CreateMemberInvitationResponse,
  MemberInvitation,
  Role
} from "@hege/domain";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { useState, useTransition } from "react";

import { readApiErrorMessage } from "../../../lib/api-error";
import { StateView } from "../../../components/state-view";

interface MitgliederClientProps {
  invitations: MemberInvitation[];
  mailEnabled: boolean;
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  jagdzeichen: string;
  sendEmail: boolean;
}

const DEFAULT_FORM: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "jaeger",
  jagdzeichen: "",
  sendEmail: false
};

const ROLE_OPTIONS: ReadonlyArray<{ value: Role; label: string }> = [
  { value: "jaeger", label: "Jäger" },
  { value: "schriftfuehrer", label: "Schriftführung" },
  { value: "ausgeher", label: "Ausgeher" },
  { value: "revier-admin", label: "Admin" }
];

export function MitgliederClient({ invitations, mailEnabled }: MitgliederClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);
  const [latest, setLatest] = useState<CreateMemberInvitationResponse | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  function update<Key extends keyof FormState>(key: Key) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const target = event.currentTarget;
      const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
      setForm((current) => ({ ...current, [key]: value as FormState[Key] }));
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const payload: CreateMemberInvitationPayload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      role: form.role,
      jagdzeichen: form.jagdzeichen,
      sendEmail: form.sendEmail && Boolean(form.email.trim()) && mailEnabled
    };

    const response = await fetch("/api/v1/memberships/invitations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(readApiErrorMessage(body, "Einladung konnte nicht angelegt werden."));
      return;
    }

    const result = (await response.json()) as CreateMemberInvitationResponse;
    setLatest(result);
    setForm(DEFAULT_FORM);

    startTransition(() => {
      router.refresh();
    });
  }

  async function handleRevoke(invitationId: string) {
    setRevokingId(invitationId);
    setError(null);

    const response = await fetch(`/api/v1/memberships/invitations/${invitationId}`, {
      method: "DELETE"
    });

    setRevokingId(null);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(readApiErrorMessage(body, "Einladung konnte nicht widerrufen werden."));
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Mitglieder</p>
          <h1>Personen einladen und Rollen vergeben.</h1>
          <p className="hero-copy">
            Trage Vorname, Nachname und Rolle ein. Du bekommst einen kopierbaren Code, den die Person bei
            der Anmeldung eingibt. E-Mail-Versand ist optional und {mailEnabled ? "aktiv" : "noch nicht konfiguriert"}.
          </p>
        </div>
        <div className="hero-highlight">
          <span>Offene Einladungen</span>
          <strong>{invitations.filter((entry) => entry.status === "pending").length}</strong>
          <p>insgesamt {invitations.length} im Verlauf</p>
        </div>
      </section>

      {latest ? (
        <section className="section-card">
          <header className="section-header">
            <div>
              <p className="eyebrow">Einladung erstellt</p>
              <h2>
                Code für {latest.invitation.firstName} {latest.invitation.lastName}
              </h2>
            </div>
            <button
              className="button-control button-control-secondary"
              onClick={() => setLatest(null)}
              type="button"
            >
              Schließen
            </button>
          </header>

          <div className="invitation-code-display">
            <code>{latest.code}</code>
            <button
              className="button-control button-control-secondary"
              onClick={() => void navigator.clipboard.writeText(latest.code)}
              type="button"
            >
              Code kopieren
            </button>
          </div>

          <p className="hero-copy">
            Gib der Person diesen Code persönlich, per WhatsApp oder Telefon. Sie ruft anschließend
            <strong> hege.app/registrieren </strong>
            auf, gibt den Code ein und setzt eine vierstellige PIN.
          </p>

          <p className="hero-copy">
            Alternativ ist auch der Magic-Link nutzbar:{" "}
            <code>https://hege.app/einladung/{latest.token}</code>
          </p>

          {latest.mailSent ? (
            <p className="feedback feedback-success">
              Eine Einladungsmail wurde an <strong>{latest.invitation.email}</strong> gesendet.
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="section-card">
        <header className="section-header">
          <div>
            <p className="eyebrow">Neue Einladung</p>
            <h2>Person eintragen</h2>
          </div>
        </header>

        <form className="ansitz-form" onSubmit={(event) => void handleSubmit(event)}>
          <label className="field" htmlFor="invite-first-name">
            <span>Vorname</span>
            <input
              id="invite-first-name"
              onChange={update("firstName")}
              required
              value={form.firstName}
            />
          </label>

          <label className="field" htmlFor="invite-last-name">
            <span>Nachname</span>
            <input
              id="invite-last-name"
              onChange={update("lastName")}
              required
              value={form.lastName}
            />
          </label>

          <label className="field" htmlFor="invite-role">
            <span>Rolle</span>
            <select id="invite-role" onChange={update("role")} value={form.role}>
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field" htmlFor="invite-jagdzeichen">
            <span>Jagdzeichen</span>
            <input
              id="invite-jagdzeichen"
              onChange={update("jagdzeichen")}
              required
              value={form.jagdzeichen}
            />
          </label>

          <label className="field" htmlFor="invite-email">
            <span>E-Mail (optional)</span>
            <input
              autoComplete="email"
              id="invite-email"
              onChange={update("email")}
              type="email"
              value={form.email}
            />
          </label>

          <label className="field" htmlFor="invite-phone">
            <span>Telefon (optional)</span>
            <input
              autoComplete="tel"
              id="invite-phone"
              onChange={update("phone")}
              type="tel"
              value={form.phone}
            />
          </label>

          <div className="field field-full">
            <label className="checkbox-card">
              <input
                checked={form.sendEmail}
                disabled={!mailEnabled || !form.email.trim()}
                onChange={update("sendEmail")}
                type="checkbox"
              />
              <div>
                <strong>Per E-Mail senden</strong>
                <span>
                  {mailEnabled
                    ? form.email.trim()
                      ? "Versendet eine Einladungsmail mit Code und Magic-Link."
                      : "E-Mail-Adresse erforderlich."
                    : "Mail-Provider noch nicht konfiguriert."}
                </span>
              </div>
            </label>
          </div>

          <div className="form-footer field-full">
            <div aria-live="polite" className="form-messages">
              {error ? <p className="feedback feedback-error">{error}</p> : null}
            </div>
            <button className="button-control" disabled={isPending} type="submit">
              Einladung erstellen
            </button>
          </div>
        </form>
      </section>

      <section className="section-card">
        <header className="section-header">
          <div>
            <p className="eyebrow">Verlauf</p>
            <h2>Bisherige Einladungen</h2>
          </div>
        </header>

        {invitations.length === 0 ? (
          <StateView
            mode="empty"
            title="Noch keine Einladungen versendet"
            description="Sobald du oben jemanden einträgst, taucht der Eintrag mit Code, Status und Ablaufdatum hier auf."
            bare
          />
        ) : (
          <div className="card-grid">
            {invitations.map((entry) => (
              <article key={entry.id} className="detail-card">
                <div className="detail-card-header">
                  <div>
                    <p className="eyebrow">{formatRoleLabel(entry.role)}</p>
                    <h2>
                      {entry.firstName} {entry.lastName}
                    </h2>
                  </div>
                  <span className={`status-pill ${statusClassName(entry.status)}`}>
                    {formatStatus(entry.status)}
                  </span>
                </div>

                <p>{entry.email ?? "Ohne E-Mail"}</p>
                <p>Jagdzeichen: {entry.jagdzeichen}</p>
                <p>Erstellt: {formatDateTime(entry.createdAt)}</p>
                <p>Gültig bis: {formatDateTime(entry.expiresAt)}</p>

                {entry.status === "pending" ? (
                  <button
                    className="button-control button-control-danger"
                    disabled={revokingId === entry.id}
                    onClick={() => void handleRevoke(entry.id)}
                    type="button"
                  >
                    {revokingId === entry.id ? "Widerrufe..." : "Einladung widerrufen"}
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function statusClassName(status: MemberInvitation["status"]): string {
  switch (status) {
    case "accepted":
      return "status-ok";
    case "expired":
    case "revoked":
      return "status-warning";
    default:
      return "status-warning";
  }
}

function formatStatus(status: MemberInvitation["status"]): string {
  switch (status) {
    case "pending":
      return "ausstehend";
    case "accepted":
      return "akzeptiert";
    case "expired":
      return "abgelaufen";
    case "revoked":
      return "widerrufen";
    default:
      return status;
  }
}

function formatRoleLabel(role: Role): string {
  switch (role) {
    case "revier-admin":
      return "Admin";
    case "schriftfuehrer":
      return "Schriftführung";
    case "jaeger":
      return "Jäger";
    case "ausgeher":
      return "Ausgeher";
    case "platform-admin":
      return "Plattform";
    default:
      return role;
  }
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("de-AT", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Vienna"
  }).format(new Date(value));
}
