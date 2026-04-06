"use client";

import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { useState, useTransition } from "react";

import { readApiErrorMessage } from "../../lib/api-error";

type PlanKey = "starter" | "revier";

interface RegistrationFormValues {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone: string;
  pin: string;
  jagdzeichen: string;
  revierName: string;
  bundesland: string;
  bezirk: string;
  planKey: PlanKey;
}

const DEFAULT_FORM_VALUES: RegistrationFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  username: "",
  phone: "",
  pin: "",
  jagdzeichen: "",
  revierName: "",
  bundesland: "",
  bezirk: "",
  planKey: "starter"
};

export function RegistrationForm({ defaultPlanKey }: { defaultPlanKey: PlanKey }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<RegistrationFormValues>({
    ...DEFAULT_FORM_VALUES,
    planKey: defaultPlanKey
  });

  function updateField<Key extends keyof RegistrationFormValues>(key: Key) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.currentTarget.value;
      setFormValues((current) => ({
        ...current,
        [key]: key === "planKey" ? (value === "revier" ? "revier" : "starter") : value
      }));
    };
  }

  async function submitForm() {
    setError(null);

    const response = await fetch("/api/v1/public/register", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(formValues)
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(readApiErrorMessage(payload, "Registrierung fehlgeschlagen."));
      return;
    }

    const session = (await response.json().catch(() => null)) as { setupRequired?: boolean } | null;

    startTransition(() => {
      router.replace(session?.setupRequired ? "/app/setup" : "/app");
      router.refresh();
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitForm();
  }

  return (
    <section className="login-card">
      <div className="login-copy">
        <p className="eyebrow">Registrierung</p>
        <h1>Neues Revier und Erstkonto anlegen.</h1>
        <p>
          Das erste Konto wird als Revier-Admin erstellt. Das Revier startet mit 0 ha und einem
          Austria-Center-Platzhalter, danach geht es direkt ins Setup.
        </p>
      </div>

      <div className="login-helper">
        <strong>Plan-Vorbelegung</strong>
        <p>{formValues.planKey === "starter" ? "Starter" : "Revier"} ist vorausgewaehlt.</p>
        <p>Die Registrierung legt Benutzer, Revier und Mitgliedschaft in einem Schritt an.</p>
      </div>

      <form action="/api/v1/public/register" className="login-form" method="post" onSubmit={(event) => void handleSubmit(event)}>
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
          }}
        >
          <label className="field" htmlFor="register-first-name">
            <span>Vorname</span>
            <input
              id="register-first-name"
              name="firstName"
              onChange={updateField("firstName")}
              placeholder="Maria"
              required
              type="text"
              value={formValues.firstName}
            />
          </label>

          <label className="field" htmlFor="register-last-name">
            <span>Nachname</span>
            <input
              id="register-last-name"
              name="lastName"
              onChange={updateField("lastName")}
              placeholder="Muster"
              required
              type="text"
              value={formValues.lastName}
            />
          </label>

          <label className="field" htmlFor="register-email">
            <span>E-Mail</span>
            <input
              autoCapitalize="none"
              autoComplete="email"
              id="register-email"
              name="email"
              onChange={updateField("email")}
              placeholder="maria@example.at"
              required
              spellCheck={false}
              type="email"
              value={formValues.email}
            />
          </label>

          <label className="field" htmlFor="register-phone">
            <span>Telefon</span>
            <input
              autoComplete="tel"
              id="register-phone"
              name="phone"
              onChange={updateField("phone")}
              placeholder="+43 660 1234567"
              required
              type="tel"
              value={formValues.phone}
            />
          </label>

          <label className="field" htmlFor="register-username">
            <span>Benutzername</span>
            <input
              autoCapitalize="none"
              autoComplete="username"
              id="register-username"
              name="username"
              onChange={updateField("username")}
              placeholder="muster"
              required
              spellCheck={false}
              type="text"
              value={formValues.username}
            />
          </label>

          <label className="field" htmlFor="register-pin">
            <span>PIN</span>
            <input
              autoComplete="new-password"
              id="register-pin"
              inputMode="numeric"
              maxLength={4}
              name="pin"
              onChange={updateField("pin")}
              pattern="[0-9]{4}"
              placeholder="4-stellige PIN"
              required
              type="password"
              value={formValues.pin}
            />
          </label>

          <label className="field" htmlFor="register-jagdzeichen">
            <span>Jagdzeichen</span>
            <input
              id="register-jagdzeichen"
              name="jagdzeichen"
              onChange={updateField("jagdzeichen")}
              placeholder="MM-01"
              required
              type="text"
              value={formValues.jagdzeichen}
            />
          </label>

          <label className="field" htmlFor="register-plan-key">
            <span>Plan</span>
            <select
              id="register-plan-key"
              name="planKey"
              onChange={updateField("planKey")}
              value={formValues.planKey}
            >
              <option value="starter">Starter</option>
              <option value="revier">Revier</option>
            </select>
          </label>

          <label className="field field-full" htmlFor="register-revier-name">
            <span>Reviername</span>
            <input
              id="register-revier-name"
              name="revierName"
              onChange={updateField("revierName")}
              placeholder="Jagdgesellschaft Beispielwald"
              required
              type="text"
              value={formValues.revierName}
            />
          </label>

          <label className="field" htmlFor="register-bundesland">
            <span>Bundesland</span>
            <input
              id="register-bundesland"
              name="bundesland"
              onChange={updateField("bundesland")}
              placeholder="Oberoesterreich"
              required
              type="text"
              value={formValues.bundesland}
            />
          </label>

          <label className="field" htmlFor="register-bezirk">
            <span>Bezirk</span>
            <input
              id="register-bezirk"
              name="bezirk"
              onChange={updateField("bezirk")}
              placeholder="Voecklabruck"
              required
              type="text"
              value={formValues.bezirk}
            />
          </label>
        </div>

        <div className="form-footer">
          <div aria-live="polite" className="form-messages">
            {error ? <p className="feedback feedback-error">{error}</p> : null}
          </div>
          <button className="button-control" disabled={isPending} type="submit">
            {isPending ? "Registrierung..." : "Revier anlegen"}
          </button>
        </div>
      </form>
    </section>
  );
}
