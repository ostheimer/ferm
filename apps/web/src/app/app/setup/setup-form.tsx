"use client";

import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { useState, useTransition } from "react";

import { readApiErrorMessage } from "../../../lib/api-error";

interface SetupFormValues {
  revierName: string;
  bundesland: string;
  bezirk: string;
  flaecheHektar: string;
}

interface SetupFormProps {
  defaultValues: {
    revierName: string;
    bundesland: string;
    bezirk: string;
    flaecheHektar: number;
  };
  viewerName: string;
}

export function SetupForm({ defaultValues, viewerName }: SetupFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<SetupFormValues>({
    revierName: defaultValues.revierName,
    bundesland: defaultValues.bundesland,
    bezirk: defaultValues.bezirk,
    flaecheHektar: String(defaultValues.flaecheHektar)
  });

  function updateField<Key extends keyof SetupFormValues>(key: Key) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((current) => ({
        ...current,
        [key]: event.currentTarget.value
      }));
    };
  }

  async function submitForm() {
    setError(null);

    const response = await fetch("/api/v1/reviere/active/setup", {
      method: "PATCH",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        revierName: formValues.revierName,
        bundesland: formValues.bundesland,
        bezirk: formValues.bezirk,
        flaecheHektar: Number(formValues.flaecheHektar)
      })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(readApiErrorMessage(payload, "Setup konnte nicht gespeichert werden."));
      return;
    }

    startTransition(() => {
      router.replace("/app");
      router.refresh();
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitForm();
  }

  return (
    <form action="/api/v1/reviere/active/setup" className="login-form" method="post" onSubmit={(event) => void handleSubmit(event)}>
      <div className="simple-list">
        <div>
          <strong>Benutzer</strong>
          <span>{viewerName}</span>
        </div>
        <div>
          <strong>Ziel</strong>
          <span>Revierdaten vervollstaendigen und danach direkt ins Backoffice wechseln.</span>
        </div>
      </div>

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
            name="revierName"
            onChange={updateField("revierName")}
            required
            type="text"
            value={formValues.revierName}
          />
        </label>

        <label className="field" htmlFor="setup-bundesland">
          <span>Bundesland</span>
          <input
            id="setup-bundesland"
            name="bundesland"
            onChange={updateField("bundesland")}
            required
            type="text"
            value={formValues.bundesland}
          />
        </label>

        <label className="field" htmlFor="setup-bezirk">
          <span>Bezirk</span>
          <input
            id="setup-bezirk"
            name="bezirk"
            onChange={updateField("bezirk")}
            required
            type="text"
            value={formValues.bezirk}
          />
        </label>

        <label className="field" htmlFor="setup-flaeche">
          <span>Flaeche in ha</span>
          <input
            id="setup-flaeche"
            inputMode="numeric"
            min="0"
            name="flaecheHektar"
            onChange={updateField("flaecheHektar")}
            required
            type="number"
            value={formValues.flaecheHektar}
          />
        </label>
      </div>

      <div className="form-footer">
        <div aria-live="polite" className="form-messages">
          {error ? <p className="feedback feedback-error">{error}</p> : null}
        </div>
        <button className="button-control" disabled={isPending} type="submit">
          {isPending ? "Speichern..." : "Setup abschliessen"}
        </button>
      </div>
    </form>
  );
}
