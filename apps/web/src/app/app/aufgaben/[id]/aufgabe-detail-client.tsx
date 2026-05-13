"use client";

import type {
  Aufgabe,
  AufgabePrioritaet,
  AufgabeStatus,
  Reviermeldung
} from "@hege/domain";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { readApiErrorMessage } from "../../../../lib/api-error";

interface MembershipOption {
  membershipId: string;
  userName: string;
  role: string;
  jagdzeichen: string;
}

interface AufgabeDetailClientProps {
  aufgabe: Aufgabe;
  memberships: MembershipOption[];
  /** Optional, nur gesetzt wenn aufgabe.sourceType === "reviermeldung". */
  sourceMeldung?: Reviermeldung;
}

const PRIORITY_LABEL: Record<AufgabePrioritaet, string> = {
  dringend: "Dringend",
  hoch: "Hoch",
  normal: "Normal",
  niedrig: "Niedrig"
};

const STATUS_LABEL: Record<AufgabeStatus, string> = {
  offen: "Offen",
  angenommen: "Angenommen",
  in_arbeit: "In Arbeit",
  blockiert: "Blockiert",
  erledigt: "Erledigt",
  abgelehnt: "Abgelehnt",
  archiviert: "Archiviert"
};

export function AufgabeDetailClient({
  aufgabe,
  memberships,
  sourceMeldung
}: AufgabeDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memberships sind eine flache Lookup-Tabelle membershipId -> Name.
  // Wir resolven die IDs aus aufgabe.assigneeMembershipIds zu Namen
  // (Fallback: raw-ID, wenn das Membership nicht mehr existiert —
  // z.B. weil der User das Revier verlassen hat).
  const assigneeNames = aufgabe.assigneeMembershipIds.map((membershipId) => {
    const entry = memberships.find((m) => m.membershipId === membershipId);
    return entry ? `${entry.userName} (${entry.role} · ${entry.jagdzeichen})` : membershipId;
  });

  async function updateStatus(status: AufgabeStatus) {
    setIsUpdating(true);
    setError(null);

    const response = await fetch(`/api/v1/aufgaben/${aufgabe.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status })
    });

    setIsUpdating(false);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(readApiErrorMessage(body, "Status konnte nicht geändert werden."));
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <header className="section-header">
          <div>
            <p className="eyebrow">
              <Link href="/app/aufgaben">← Aufgaben</Link>
            </p>
            <h1>{aufgabe.title}</h1>
            <p className="hero-copy">
              {PRIORITY_LABEL[aufgabe.priority]} · {STATUS_LABEL[aufgabe.status]} ·{" "}
              Angelegt {formatDateTime(aufgabe.createdAt)}
            </p>
          </div>
          <div className="section-actions">
            <span className={statusPillClass(aufgabe.status)}>
              {STATUS_LABEL[aufgabe.status]}
            </span>
          </div>
        </header>

        {error ? (
          <p aria-live="polite" className="feedback feedback-error">
            {error}
          </p>
        ) : null}

        <div className="simple-list">
          <div>
            <strong>Beschreibung</strong>
            <span>{aufgabe.description ?? "Keine Beschreibung hinterlegt."}</span>
          </div>
          <div>
            <strong>Fällig</strong>
            <span>{aufgabe.dueAt ? formatDateTime(aufgabe.dueAt) : "Kein Fälligkeitsdatum"}</span>
          </div>
          <div>
            <strong>Zugewiesen an</strong>
            <span>
              {assigneeNames.length > 0 ? assigneeNames.join(", ") : "Keine Zuweisung"}
            </span>
          </div>
          {aufgabe.completionNote ? (
            <div>
              <strong>Erledigungs-Notiz</strong>
              <span>{aufgabe.completionNote}</span>
            </div>
          ) : null}
          {aufgabe.completedAt ? (
            <div>
              <strong>Erledigt am</strong>
              <span>{formatDateTime(aufgabe.completedAt)}</span>
            </div>
          ) : null}
        </div>

        {aufgabe.sourceType ? (
          <div className="simple-list">
            <div>
              <strong>Bezug</strong>
              <span>
                {aufgabe.sourceType === "reviermeldung" && sourceMeldung ? (
                  <>
                    Reviermeldung „{sourceMeldung.title}" —{" "}
                    <Link href="/app/reviermeldungen">zur Übersicht</Link>
                  </>
                ) : (
                  // Fallback: sourceMeldung nicht resolved (z.B. geloescht
                  // oder nicht-reviermeldung-Typ). Zeigen wir raw, damit
                  // wenigstens die Spur sichtbar bleibt.
                  `${aufgabe.sourceType} · ${aufgabe.sourceId ?? "ohne Id"}`
                )}
              </span>
            </div>
          </div>
        ) : null}

        <div className="form-footer">
          {aufgabe.status !== "in_arbeit" && aufgabe.status !== "erledigt" ? (
            <button
              className="button-control button-control-secondary"
              disabled={isUpdating || isPending}
              onClick={() => void updateStatus("in_arbeit")}
              type="button"
            >
              In Arbeit setzen
            </button>
          ) : null}
          {aufgabe.status !== "erledigt" ? (
            <button
              className="button-control"
              disabled={isUpdating || isPending}
              onClick={() => void updateStatus("erledigt")}
              type="button"
            >
              Erledigen
            </button>
          ) : (
            <button
              className="button-control button-control-secondary"
              disabled={isUpdating || isPending}
              onClick={() => void updateStatus("offen")}
              type="button"
            >
              Wieder öffnen
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function statusPillClass(status: AufgabeStatus): string {
  if (status === "erledigt") return "status-pill status-ok";
  if (status === "blockiert" || status === "abgelehnt") return "status-pill status-warning";
  return "status-pill";
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("de-AT", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Vienna"
  }).format(new Date(value));
}
