import type { FallwildVorgang } from "@hege/domain";
import { desc, eq } from "drizzle-orm";

import { getRequestContext } from "../../auth/context";
import { getDb } from "../../db/client";
import { type FallwildVorgangRecord, fallwildVorgaenge } from "../../db/schema";
import { createDemoStore } from "../../demo-store";
import { getServerEnv } from "../../env";

export async function listFallwild(): Promise<FallwildVorgang[]> {
  if (getServerEnv().useDemoStore) {
    return listFallwildFromDemoStore();
  }

  const db = getDb();
  const { revierId } = await getRequestContext();
  const rows = await db
    .select()
    .from(fallwildVorgaenge)
    .where(eq(fallwildVorgaenge.revierId, revierId))
    .orderBy(desc(fallwildVorgaenge.recordedAt));

  return rows.map(mapFallwildRowToDomain);
}

export function mapFallwildRowToDomain(record: FallwildVorgangRecord): FallwildVorgang {
  return {
    id: record.id,
    revierId: record.revierId,
    reportedByMembershipId: record.reportedByMembershipId,
    recordedAt: record.recordedAt,
    location: {
      lat: record.locationLat,
      lng: record.locationLng,
      label: record.locationLabel ?? undefined
    },
    wildart: record.wildart,
    geschlecht: record.geschlecht,
    altersklasse: record.altersklasse,
    bergungsStatus: record.bergungsStatus,
    gemeinde: record.gemeinde,
    strasse: record.strasse ?? undefined,
    note: record.note ?? undefined,
    photos: []
  };
}

export async function exportFallwildCsv(): Promise<string> {
  const entries = await listFallwild();
  const rows = [
    [
      "id",
      "recorded_at",
      "wildart",
      "geschlecht",
      "altersklasse",
      "bergungs_status",
      "gemeinde",
      "strasse",
      "location_label",
      "lat",
      "lng",
      "note"
    ],
    ...entries.map((entry) => [
      entry.id,
      entry.recordedAt,
      entry.wildart,
      entry.geschlecht,
      entry.altersklasse,
      entry.bergungsStatus,
      entry.gemeinde,
      entry.strasse ?? "",
      entry.location.label ?? "",
      String(entry.location.lat),
      String(entry.location.lng),
      entry.note ?? ""
    ])
  ];

  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

function listFallwildFromDemoStore(): FallwildVorgang[] {
  const store = createDemoStore();
  const revierId = process.env.DEV_REVIER_ID ?? "revier-attersee";

  return store.fallwild
    .filter((entry) => entry.revierId === revierId)
    .sort((left, right) => right.recordedAt.localeCompare(left.recordedAt));
}

function escapeCsvCell(value: string): string {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replaceAll("\"", "\"\"")}"`;
  }

  return value;
}
