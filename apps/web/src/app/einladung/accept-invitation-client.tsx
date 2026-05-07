"use client";

import type { AuthSessionResponse } from "@hege/domain";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { useState, useTransition } from "react";

import { readApiErrorMessage } from "../../lib/api-error";

interface AcceptInvitationClientProps {
  initialToken?: string;
  initialCode?: string;
}

export function AcceptInvitationClient({ initialToken, initialCode }: AcceptInvitationClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [code, setCode] = useState(initialCode ?? "");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const usingMagicLink = Boolean(initialToken);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/v1/memberships/invitations/accept", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(
        usingMagicLink
          ? { token: initialToken, pin }
          : { code: code.trim(), pin }
      )
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(readApiErrorMessage(body, "Einladung konnte nicht angenommen werden."));
      return;
    }

    startTransition(() => {
      router.replace("/app");
      router.refresh();
    });
  }

  return (
    <section className="login-card">
      <div className="login-copy">
        <img alt="" aria-hidden="true" className="auth-logo" src="/brand/hege-logo-mark.png" />
        <p className="eyebrow">Einladung annehmen</p>
        <h1>Willkommen im Revier.</h1>
        <p>
          {usingMagicLink
            ? "Setze eine vierstellige PIN, mit der du dich künftig anmeldest."
            : "Trage deinen Einladungs-Code ein und setze eine vierstellige PIN."}
        </p>
      </div>

      <form className="login-form" onSubmit={(event) => void handleSubmit(event)}>
        {!usingMagicLink ? (
          <label className="field" htmlFor="invite-code">
            <span>Einladungs-Code</span>
            <input
              autoCapitalize="characters"
              autoCorrect="off"
              id="invite-code"
              onChange={(event: ChangeEvent<HTMLInputElement>) => setCode(event.currentTarget.value)}
              placeholder="z. B. 4FX-9KQ-22"
              required
              spellCheck={false}
              value={code}
            />
          </label>
        ) : null}

        <label className="field" htmlFor="invite-pin">
          <span>PIN (4 Ziffern)</span>
          <input
            autoComplete="new-password"
            id="invite-pin"
            inputMode="numeric"
            maxLength={4}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setPin(event.currentTarget.value)}
            pattern="[0-9]{4}"
            placeholder="4-stellige PIN"
            required
            type="password"
            value={pin}
          />
        </label>

        <div className="form-footer">
          <div aria-live="polite" className="form-messages">
            {error ? <p className="feedback feedback-error">{error}</p> : null}
          </div>
          <button className="button-control" disabled={isPending} type="submit">
            {isPending ? "Wird verarbeitet..." : "Einladung annehmen"}
          </button>
        </div>
      </form>

      <p className="auth-switch">
        Schon ein Konto? <a href="/login">Anmelden</a>
      </p>
    </section>
  );
}
