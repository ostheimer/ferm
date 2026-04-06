"use client";

import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { useState, useTransition } from "react";

import { readApiErrorMessage } from "../lib/api-error";

interface LoginFormValues {
  identifier: string;
  pin: string;
}

const DEFAULT_FORM_VALUES: LoginFormValues = {
  identifier: "",
  pin: ""
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
        <p>Melde dich mit E-Mail oder Benutzername und deiner vierstelligen PIN an.</p>
      </div>

      <form className="login-form" onSubmit={(event) => void handleSubmit(event)}>
        <label className="field" htmlFor="login-identifier">
          <span>E-Mail oder Benutzername</span>
          <input
            autoCapitalize="none"
            autoComplete="username"
            id="login-identifier"
            name="identifier"
            onChange={updateField("identifier")}
            placeholder="E-Mail oder Benutzername eingeben"
            required
            spellCheck={false}
            type="text"
            value={formValues.identifier}
          />
        </label>

        <label className="field" htmlFor="login-pin">
          <span>PIN</span>
          <input
            autoComplete="current-password"
            id="login-pin"
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

        <div className="form-footer">
          <div aria-live="polite" className="form-messages">
            {error ? <p className="feedback feedback-error">{error}</p> : null}
          </div>
          <button className="button-control" disabled={isPending} type="submit">
            {isPending ? "Anmeldung..." : "Anmelden"}
          </button>
        </div>
      </form>
    </section>
  );
}
