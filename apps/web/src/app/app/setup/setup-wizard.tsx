"use client";

import type { CreateMemberInvitationPayload, Role } from "@hege/domain";
import { ArrowLeft, ArrowRight, Check, ChevronRight, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState, useTransition } from "react";

import { readApiErrorMessage } from "../../../lib/api-error";
import {
  computeProgress,
  isFinalStep,
  isFirstStep,
  nextStep,
  previousStep,
  validateRevierForm,
  WIZARD_STEPS,
  WIZARD_STEP_META,
  type RevierFormValues,
  type WizardStepKey
} from "../../../lib/setup-wizard.helpers";

interface SetupWizardProps {
  defaultValues: {
    revierName: string;
    bundesland: string;
    bezirk: string;
    flaecheHektar: number;
  };
  viewerName: string;
}

interface InvitationFormValues {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  jagdzeichen: string;
}

const DEFAULT_INVITATION: InvitationFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  role: "jaeger",
  jagdzeichen: ""
};

const ROLE_OPTIONS: ReadonlyArray<{ value: Role; label: string }> = [
  { value: "jaeger", label: "Jäger" },
  { value: "schriftfuehrer", label: "Schriftführung" },
  { value: "ausgeher", label: "Ausgeher" },
  { value: "revier-admin", label: "Admin" }
];

/**
 * `<SetupWizard>` — vierschrittiger Onboarding-Flow (P2.5).
 *
 * Step 1 (revier): Pflicht. PATCH /reviere/active/setup. Markiert das
 *   Revier als eingerichtet (Server-State). Ab hier kann der User
 *   den Wizard jederzeit abbrechen und kommt direkt ins Dashboard.
 * Step 2 (einrichtung): Informational. Reviereinrichtungen werden
 *   primaer ueber die App erfasst — wir verlinken die Listen-Seite
 *   und bieten Skip.
 * Step 3 (einladung): Optional. Inline-Form mit POST
 *   /memberships/invitations. Skip moeglich.
 * Step 4 (fertig): Erfolgs-Seite mit Quick-Links und CTA "Los geht's".
 */
export function SetupWizard({ defaultValues, viewerName }: SetupWizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<WizardStepKey>("revier");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [revierValues, setRevierValues] = useState<RevierFormValues>({
    revierName: defaultValues.revierName,
    bundesland: defaultValues.bundesland,
    bezirk: defaultValues.bezirk,
    flaecheHektar: String(defaultValues.flaecheHektar)
  });
  const [revierSaved, setRevierSaved] = useState(false);
  const [invitation, setInvitation] = useState<InvitationFormValues>(DEFAULT_INVITATION);
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const progress = useMemo(() => computeProgress(step), [step]);

  function updateRevierField<Key extends keyof RevierFormValues>(key: Key) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setRevierValues((current) => ({ ...current, [key]: event.currentTarget.value }));
    };
  }

  function updateInvitationField<Key extends keyof InvitationFormValues>(key: Key) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setInvitation((current) => ({
        ...current,
        [key]: event.currentTarget.value as InvitationFormValues[Key]
      }));
    };
  }

  async function submitRevierStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validationMessage = validateRevierForm(revierValues);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/v1/reviere/active/setup", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          revierName: revierValues.revierName,
          bundesland: revierValues.bundesland,
          bezirk: revierValues.bezirk,
          flaecheHektar: Number(revierValues.flaecheHektar)
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(readApiErrorMessage(payload, "Revier-Daten konnten nicht gespeichert werden."));
        return;
      }

      setRevierSaved(true);
      setStep(nextStep("revier"));
    } finally {
      setSaving(false);
    }
  }

  async function submitInvitationStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (invitation.firstName.trim().length === 0 || invitation.lastName.trim().length === 0) {
      setError("Vor- und Nachname sind Pflicht.");
      return;
    }
    if (invitation.jagdzeichen.trim().length === 0) {
      setError("Jagdzeichen darf nicht leer sein.");
      return;
    }

    setSaving(true);
    try {
      const payload: CreateMemberInvitationPayload = {
        firstName: invitation.firstName,
        lastName: invitation.lastName,
        email: invitation.email.trim() || undefined,
        role: invitation.role,
        jagdzeichen: invitation.jagdzeichen,
        sendEmail: false
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

      const result = await response.json();
      if (typeof result?.code === "string") {
        setInvitationCode(result.code);
      }
      setStep(nextStep("einladung"));
    } finally {
      setSaving(false);
    }
  }

  function skipStep() {
    setError(null);
    setStep(nextStep(step));
  }

  function goBack() {
    setError(null);
    setStep(previousStep(step));
  }

  function finishWizard() {
    startTransition(() => {
      router.replace("/app");
      router.refresh();
    });
  }

  return (
    <div className="page-stack">
      <section className="hero-card setup-wizard-hero">
        <div>
          <p className="eyebrow">Onboarding</p>
          <h1>Willkommen, {viewerName}.</h1>
          <p className="hero-copy">
            In vier Schritten ist dein Revier startklar. Du kannst optionale Schritte überspringen und
            später nachholen — die App leitet dich danach direkt ins Dashboard.
          </p>
        </div>

        <ol className="setup-wizard-steps">
          {WIZARD_STEPS.map((entry, index) => {
            const meta = WIZARD_STEP_META[entry];
            const isCurrent = entry === step;
            const isDone = WIZARD_STEPS.indexOf(step) > index;
            return (
              <li
                key={entry}
                aria-current={isCurrent ? "step" : undefined}
                className={
                  isCurrent
                    ? "setup-wizard-step setup-wizard-step-current"
                    : isDone
                      ? "setup-wizard-step setup-wizard-step-done"
                      : "setup-wizard-step"
                }
              >
                <span className="setup-wizard-step-index">
                  {isDone ? <Check aria-hidden="true" size={14} /> : index + 1}
                </span>
                <span className="setup-wizard-step-label">{meta.label}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="setup-wizard-progress" aria-hidden="true">
        <span className="setup-wizard-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {step === "revier" ? (
        <section className="section-card">
          <header className="section-header">
            <div>
              <p className="eyebrow">Schritt 1 von 4 · Pflicht</p>
              <h2>Revierdaten vervollständigen</h2>
              <p className="hero-copy">
                Name, Bundesland, Bezirk und Fläche. Diese Felder werden im Dashboard und in
                Protokollen verwendet.
              </p>
            </div>
          </header>

          <form
            className="login-form"
            onSubmit={(event) => void submitRevierStep(event)}
          >
            <div
              style={{
                display: "grid",
                gap: 16,
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
              }}
            >
              <label className="field" htmlFor="setup-revier-name">
                <span>Reviername</span>
                <input
                  id="setup-revier-name"
                  onChange={updateRevierField("revierName")}
                  required
                  type="text"
                  value={revierValues.revierName}
                />
              </label>
              <label className="field" htmlFor="setup-bundesland">
                <span>Bundesland</span>
                <input
                  id="setup-bundesland"
                  onChange={updateRevierField("bundesland")}
                  required
                  type="text"
                  value={revierValues.bundesland}
                />
              </label>
              <label className="field" htmlFor="setup-bezirk">
                <span>Bezirk</span>
                <input
                  id="setup-bezirk"
                  onChange={updateRevierField("bezirk")}
                  required
                  type="text"
                  value={revierValues.bezirk}
                />
              </label>
              <label className="field" htmlFor="setup-flaeche">
                <span>Fläche in Hektar</span>
                <input
                  id="setup-flaeche"
                  inputMode="numeric"
                  min="0"
                  onChange={updateRevierField("flaecheHektar")}
                  required
                  type="number"
                  value={revierValues.flaecheHektar}
                />
              </label>
            </div>

            <div className="form-footer">
              <div aria-live="polite" className="form-messages">
                {error ? <p className="feedback feedback-error">{error}</p> : null}
              </div>
              <button className="button-control" disabled={saving} type="submit">
                {saving ? "Speichern..." : "Weiter"}
                <ArrowRight aria-hidden="true" size={16} />
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {step === "einrichtung" ? (
        <section className="section-card">
          <header className="section-header">
            <div>
              <p className="eyebrow">Schritt 2 von 4 · Optional</p>
              <h2>Reviereinrichtungen erfassen</h2>
              <p className="hero-copy">
                Hochstände, Fütterungen, Salzlecken und Wartungen werden primär über die hege-App
                aufgenommen — direkt im Gelände inklusive GPS. Im Web siehst du die Bestandsliste.
              </p>
            </div>
          </header>

          <div className="card-grid">
            <Link
              className="detail-card setup-wizard-info-card"
              href="/app/reviereinrichtungen"
            >
              <span className="setup-wizard-info-icon">
                <MapPin aria-hidden="true" size={18} />
              </span>
              <strong>Listen-Übersicht öffnen</strong>
              <p>Bestand mit Typ, Zustand, letzter Kontrolle und offenen Wartungen.</p>
              <span className="setup-wizard-info-cta">
                Zur Liste <ChevronRight aria-hidden="true" size={14} />
              </span>
            </Link>
          </div>

          <div className="form-footer setup-wizard-footer">
            <button className="button-control button-control-secondary" onClick={goBack} type="button">
              <ArrowLeft aria-hidden="true" size={16} /> Zurück
            </button>
            <button className="button-control" onClick={skipStep} type="button">
              Später erfassen
              <ArrowRight aria-hidden="true" size={16} />
            </button>
          </div>
        </section>
      ) : null}

      {step === "einladung" ? (
        <section className="section-card">
          <header className="section-header">
            <div>
              <p className="eyebrow">Schritt 3 von 4 · Optional</p>
              <h2>Erstes Mitglied einladen</h2>
              <p className="hero-copy">
                Trag Vor-, Nachname und Rolle ein. Du bekommst einen Code, den die Person bei der
                Anmeldung benutzt.
              </p>
            </div>
          </header>

          {invitationCode ? (
            <div className="invitation-code-display">
              <code>{invitationCode}</code>
              <button
                className="button-control button-control-secondary"
                onClick={() => void navigator.clipboard.writeText(invitationCode)}
                type="button"
              >
                Code kopieren
              </button>
            </div>
          ) : null}

          <form
            className="login-form"
            onSubmit={(event) => void submitInvitationStep(event)}
          >
            <div
              style={{
                display: "grid",
                gap: 16,
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
              }}
            >
              <label className="field" htmlFor="setup-invite-first">
                <span>Vorname</span>
                <input
                  id="setup-invite-first"
                  onChange={updateInvitationField("firstName")}
                  required
                  type="text"
                  value={invitation.firstName}
                />
              </label>
              <label className="field" htmlFor="setup-invite-last">
                <span>Nachname</span>
                <input
                  id="setup-invite-last"
                  onChange={updateInvitationField("lastName")}
                  required
                  type="text"
                  value={invitation.lastName}
                />
              </label>
              <label className="field" htmlFor="setup-invite-jagdzeichen">
                <span>Jagdzeichen</span>
                <input
                  id="setup-invite-jagdzeichen"
                  onChange={updateInvitationField("jagdzeichen")}
                  required
                  type="text"
                  value={invitation.jagdzeichen}
                />
              </label>
              <label className="field" htmlFor="setup-invite-role">
                <span>Rolle</span>
                <select
                  id="setup-invite-role"
                  onChange={updateInvitationField("role")}
                  value={invitation.role}
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field" htmlFor="setup-invite-email">
                <span>E-Mail (optional)</span>
                <input
                  id="setup-invite-email"
                  onChange={updateInvitationField("email")}
                  type="email"
                  value={invitation.email}
                />
              </label>
            </div>

            <div className="form-footer setup-wizard-footer">
              <div aria-live="polite" className="form-messages">
                {error ? <p className="feedback feedback-error">{error}</p> : null}
              </div>
              <div className="setup-wizard-step-actions">
                <button
                  className="button-control button-control-secondary"
                  onClick={goBack}
                  type="button"
                >
                  <ArrowLeft aria-hidden="true" size={16} /> Zurück
                </button>
                <button
                  className="button-control button-control-secondary"
                  onClick={skipStep}
                  type="button"
                >
                  Überspringen
                </button>
                <button className="button-control" disabled={saving} type="submit">
                  {saving ? "Erstelle..." : "Einladung erstellen"}
                  <ArrowRight aria-hidden="true" size={16} />
                </button>
              </div>
            </div>
          </form>
        </section>
      ) : null}

      {step === "fertig" ? (
        <section className="section-card">
          <header className="section-header">
            <div>
              <p className="eyebrow">Schritt 4 von 4</p>
              <h2>Revier ist startklar.</h2>
              <p className="hero-copy">
                Du kannst jederzeit zu den optionalen Schritten zurückkehren — die App wartet nicht auf
                dich.
              </p>
            </div>
          </header>

          <div className="card-grid">
            <Link className="detail-card setup-wizard-info-card" href="/app">
              <span className="setup-wizard-info-icon">
                <ArrowRight aria-hidden="true" size={18} />
              </span>
              <strong>Direkt ins Dashboard</strong>
              <p>Aktivitäts-Feed, aktuelle Ansitze, nächste Sitzung, anstehende Aufgaben.</p>
            </Link>
            <Link className="detail-card setup-wizard-info-card" href="/app/mitglieder">
              <span className="setup-wizard-info-icon">
                <Users aria-hidden="true" size={18} />
              </span>
              <strong>Weitere Einladungen</strong>
              <p>Schriftführung, Jäger, Admin und Ausgeher in einem Flow.</p>
            </Link>
            <Link
              className="detail-card setup-wizard-info-card"
              href="/app/reviereinrichtungen"
            >
              <span className="setup-wizard-info-icon">
                <MapPin aria-hidden="true" size={18} />
              </span>
              <strong>Einrichtungen anlegen</strong>
              <p>Hochstände und Fütterungen erfasst ihr in der hege-App, sichtbar hier.</p>
            </Link>
          </div>

          <div className="form-footer setup-wizard-footer">
            <button className="button-control" disabled={isPending} onClick={finishWizard} type="button">
              {isPending ? "Wechsle ..." : "Los geht's"}
              <ArrowRight aria-hidden="true" size={16} />
            </button>
          </div>
        </section>
      ) : null}

      {/* `revierSaved` ist nur fuer den eigenen Recovery-Pfad: wer die Seite */}
      {/* neu laedt, kommt durch die Setup-Gate-Logik automatisch in den App-Bereich. */}
      {revierSaved && !isFinalStep(step) && !isFirstStep(step) ? (
        <p className="form-messages">
          Revier ist gespeichert — Schritt {WIZARD_STEPS.indexOf(step) + 1} von 4. Du kannst die
          Seite jederzeit verlassen.
        </p>
      ) : null}
    </div>
  );
}
