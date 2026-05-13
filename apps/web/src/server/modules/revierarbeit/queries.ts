import type { Aufgabe, Reviermeldung } from "@hege/domain";

import { getRequestContext, type RequestContext } from "../../auth/context";
import { buildCsv } from "../../csv/escape";
import { createDemoStore } from "../../demo-store";
import { getServerEnv } from "../../env";
import {
  getAufgabe,
  getReviermeldung,
  listAufgaben,
  listReviermeldungen
} from "./service";

export async function listReviermeldungenForRequest(context?: RequestContext): Promise<Reviermeldung[]> {
  if (getServerEnv().useDemoStore) {
    return listReviermeldungenFromDemoStore();
  }

  return listReviermeldungen(context ?? (await getRequestContext()));
}

export async function getReviermeldungForRequest(
  reviermeldungId: string,
  context?: RequestContext
): Promise<Reviermeldung> {
  if (getServerEnv().useDemoStore) {
    const entry = listReviermeldungenFromDemoStore().find((item) => item.id === reviermeldungId);

    if (!entry) {
      throw Object.assign(new Error("Reviermeldung wurde nicht gefunden."), {
        status: 404,
        code: "not-found"
      });
    }

    return entry;
  }

  return getReviermeldung(context ?? (await getRequestContext()), reviermeldungId);
}

export async function listAufgabenForRequest(context?: RequestContext): Promise<Aufgabe[]> {
  if (getServerEnv().useDemoStore) {
    return listAufgabenFromDemoStore(context?.membershipId);
  }

  return listAufgaben(context ?? (await getRequestContext()));
}

export async function getAufgabeForRequest(aufgabeId: string, context?: RequestContext): Promise<Aufgabe> {
  if (getServerEnv().useDemoStore) {
    const entry = listAufgabenFromDemoStore(context?.membershipId).find((item) => item.id === aufgabeId);

    if (!entry) {
      throw Object.assign(new Error("Aufgabe wurde nicht gefunden."), {
        status: 404,
        code: "not-found"
      });
    }

    return entry;
  }

  return getAufgabe(context ?? (await getRequestContext()), aufgabeId);
}

/**
 * Exportiert alle Reviermeldungen des aktiven Reviers als CSV. Pendant
 * zu den anderen CSV-Exports (Mitglieder, Fallwild, Sitzungen, Revier-
 * einrichtungen). Schriftfuehrung kann sich damit den Jahres-Stream
 * abziehen, ohne durch die Web-Pagination zu klicken.
 *
 * Spalten bewusst flach: Photos werden als Anzahl exportiert, nicht
 * als Pfad-Liste — Detail liegt im Web-UI bzw. der Detail-API.
 */
export async function exportReviermeldungenCsv(context?: RequestContext): Promise<string> {
  const entries = await listReviermeldungenForRequest(context);

  return buildCsv(REVIERMELDUNGEN_CSV_HEADER, entries.map(toReviermeldungCsvRow));
}

export const REVIERMELDUNGEN_CSV_HEADER = [
  "id",
  "occurred_at",
  "kategorie",
  "status",
  "titel",
  "beschreibung",
  "location_label",
  "lat",
  "lng",
  "related_type",
  "related_id",
  "fotos_anzahl",
  "created_at",
  "updated_at"
] as const;

/**
 * Spaltenfueller als reine Funktion — laesst sich ohne DB im
 * Vertrags-Test pruefen (gleicher Stil wie `toSitzungCsvRow`).
 */
export function toReviermeldungCsvRow(
  entry: Reviermeldung
): ReadonlyArray<string | number> {
  return [
    entry.id,
    entry.occurredAt,
    entry.category,
    entry.status,
    entry.title,
    entry.description ?? "",
    entry.location?.label ?? "",
    entry.location?.lat ?? "",
    entry.location?.lng ?? "",
    entry.relatedType ?? "",
    entry.relatedId ?? "",
    entry.photos.length,
    entry.createdAt,
    entry.updatedAt
  ];
}

function listReviermeldungenFromDemoStore(): Reviermeldung[] {
  const store = createDemoStore();
  const revierId = process.env.DEV_REVIER_ID ?? "revier-attersee";

  return store.reviermeldungen
    .filter((entry) => entry.revierId === revierId)
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
}

function listAufgabenFromDemoStore(membershipId?: string): Aufgabe[] {
  const store = createDemoStore();
  const revierId = process.env.DEV_REVIER_ID ?? "revier-attersee";

  return store.aufgaben
    .filter((entry) => entry.revierId === revierId)
    .filter((entry) => !membershipId || entry.createdByMembershipId === membershipId || entry.assigneeMembershipIds.includes(membershipId))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}
