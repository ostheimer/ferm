import type { AnsitzSession } from "@hege/domain";
import { desc, eq } from "drizzle-orm";

import { getRequestContext } from "../../auth/context";
import { buildCsv } from "../../csv/escape";
import { getDb } from "../../db/client";
import { type AnsitzSessionRecord, ansitzSessions } from "../../db/schema";
import { createDemoStore } from "../../demo-store";
import { getServerEnv } from "../../env";
import { normalizeDeAtVisibleText } from "../../text/de-at";

export async function listAnsitze(): Promise<AnsitzSession[]> {
  if (getServerEnv().useDemoStore) {
    return listAnsitzeFromDemoStore();
  }

  const db = getDb();
  const { revierId } = await getRequestContext();
  const rows = await db
    .select()
    .from(ansitzSessions)
    .where(eq(ansitzSessions.revierId, revierId))
    .orderBy(desc(ansitzSessions.startedAt));

  return rows.map(mapAnsitzRowToDomain);
}

export async function listLiveAnsitze(): Promise<AnsitzSession[]> {
  return (await listAnsitze()).filter((entry) => entry.status === "active");
}

/**
 * Exportiert alle Ansitze des aktiven Reviers als CSV-String. Format
 * spiegelt das Fallwild-CSV-Pattern: pro Spalte ein Domain-Feld,
 * UTF-8, RFC 4180-konformes Escaping via `buildCsv`.
 */
export async function exportAnsitzeCsv(): Promise<string> {
  const entries = await listAnsitze();

  return buildCsv(
    [
      "id",
      "started_at",
      "planned_end_at",
      "ended_at",
      "status",
      "conflict",
      "standort_id",
      "standort_name",
      "location_label",
      "lat",
      "lng",
      "membership_id",
      "note"
    ],
    entries.map((entry) => [
      entry.id,
      entry.startedAt,
      entry.plannedEndAt ?? "",
      entry.endedAt ?? "",
      entry.status,
      entry.conflict ? "ja" : "nein",
      entry.standortId ?? "",
      entry.standortName,
      entry.location.label ?? "",
      entry.location.lat,
      entry.location.lng,
      entry.membershipId,
      entry.note ?? ""
    ])
  );
}

export function mapAnsitzRowToDomain(record: AnsitzSessionRecord): AnsitzSession {
  return {
    id: record.id,
    revierId: record.revierId,
    membershipId: record.membershipId,
    standortId: record.standortId ?? undefined,
    standortName: normalizeDeAtVisibleText(record.standortName),
    location: {
      lat: record.locationLat,
      lng: record.locationLng,
      label: normalizeDeAtVisibleText(record.locationLabel) ?? undefined
    },
    startedAt: record.startedAt,
    plannedEndAt: record.plannedEndAt ?? undefined,
    endedAt: record.endedAt ?? undefined,
    note: normalizeDeAtVisibleText(record.note) ?? undefined,
    status: record.status,
    conflict: record.conflict
  };
}

function listAnsitzeFromDemoStore(): AnsitzSession[] {
  const store = createDemoStore();
  const { revierId } = {
    revierId: process.env.DEV_REVIER_ID ?? "revier-attersee"
  };

  return store.ansitze
    .filter((entry) => entry.revierId === revierId)
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt));
}
