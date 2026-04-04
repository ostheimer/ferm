"use client";

import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { useState, useTransition } from "react";

import { readApiErrorMessage } from "../lib/api-error";

interface LoginFormValues {
  email: string;
  password: string;
}

const DEFAULT_FORM_VALUES: LoginFormValues = {
  email: "martin.mair@hege.app",
  password: "hege-demo-2026"
};

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState(DEFAULT_FORM_VALUES);

  function updateField<Key extends keyof LoginFormValues>(key: Key) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.currentTarget.value;
      setFormValues((current) => ({ ...current, [key]: value }));
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(formValues)
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(readApiErrorMessage(payload, "Anmeldung fehlgeschlagen."));
      return;
    }

    startTransition(() => {
      router.replace("/");
      router.refresh();
    });
  }

  return (
    <section className="login-card">
      <div className="login-copy">
        <p className="eyebrow">Anmeldung</p>
        <h1>Backoffice und App jetzt mit echter Session.</h1>
        <p>
          Melde dich mit einer Demo-Adresse an. Standardpasswort fuer lokale Seeds und Vorschau ist
          <strong> hege-demo-2026</strong>.
        </p>
      </div>

      <form className="login-form" onSubmit={(event) => void handleSubmit(event)}>
        <label className="field" htmlFor="login-email">
          <span>E-Mail</span>
          <input
            id="login-email"
            name="email"
            onChange={updateField("email")}
            placeholder="martin.mair@hege.app"
            required
            type="email"
            value={formValues.email}
          />
        </label>

        <label className="field" htmlFor="login-password">
          <span>Passwort</span>
          <input
            id="login-password"
            name="password"
            onChange={updateField("password")}
            required
            type="password"
            value={formValues.password}
          />
        </label>

        <div className="form-footer">
          <div aria-live="polite" className="form-messages">
            {error ? <p className="feedback feedback-error">{error}</p> : null}
          </div>
          <button className="button-control" disabled={isPending} type="submit">
            {isPending ? "Anmeldung..." : "Anmelden"}
          </button>
        </div>
      </form>

      <div className="login-helper">
        <strong>Demo-Konten</strong>
        <span>anna.steyrer@hege.app · Revier Admin</span>
        <span>martin.mair@hege.app · Schriftfuehrer</span>
        <span>lukas.huber@hege.app · Jaeger</span>
      </div>
    </section>
  );
}
