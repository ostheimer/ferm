import type { FallwildVorgang, PhotoAsset } from "@hege/domain";
import { and, desc, eq, inArray } from "drizzle-orm";

import { getRequestContext } from "../../auth/context";
import { getDb } from "../../db/client";
import { isMissingTableError } from "../../db/compat";
import { type FallwildVorgangRecord, fallwildVorgaenge, mediaAssets } from "../../db/schema";
import { createDemoStore } from "../../demo-store";
import { getServerEnv } from "../../env";
import { buildStoragePublicUrl } from "../../storage/s3";

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

  return attachPhotosToFallwildEntries(rows);
}

export async function getFallwildById(fallwildId: string): Promise<FallwildVorgang | undefined> {
  if (getServerEnv().useDemoStore) {
    return getFallwildFromDemoStore(fallwildId);
  }

  const db = getDb();
  const { revierId } = await getRequestContext();
  const [row] = await db
    .select()
    .from(fallwildVorgaenge)
    .where(and(eq(fallwildVorgaenge.revierId, revierId), eq(fallwildVorgaenge.id, fallwildId)))
    .limit(1);

  if (!row) {
    return undefined;
  }

  const [entry] = await attachPhotosToFallwildEntries([row]);
  return entry;
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

export function mapMediaAssetRowToPhotoAsset(record: MediaAssetRecord): PhotoAsset {
  return {
    id: record.id,
    title: record.title,
    url: buildStoragePublicUrl(record.objectKey),
    createdAt: record.createdAt
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

function getFallwildFromDemoStore(fallwildId: string): FallwildVorgang | undefined {
  const store = createDemoStore();
  const revierId = process.env.DEV_REVIER_ID ?? "revier-attersee";

  return store.fallwild.find((entry) => entry.revierId === revierId && entry.id === fallwildId);
}

async function attachPhotosToFallwildEntries(rows: FallwildVorgangRecord[]): Promise<FallwildVorgang[]> {
  if (rows.length === 0) {
    return [];
  }

  const db = getDb();
  const entryIds = rows.map((row) => row.id);
  let photoRows: MediaAssetRecord[] = [];

  try {
    photoRows = await db
      .select()
      .from(mediaAssets)
      .where(and(eq(mediaAssets.entityType, "fallwild"), inArray(mediaAssets.entityId, entryIds)))
      .orderBy(desc(mediaAssets.createdAt));
  } catch (error) {
    if (!isMissingTableError(error, "media_assets")) {
      throw error;
    }
  }

  const photosByEntryId = new Map<string, PhotoAsset[]>();

  for (const photoRow of photoRows) {
    const photos = photosByEntryId.get(photoRow.entityId) ?? [];
    photos.push(mapMediaAssetRowToPhotoAsset(photoRow));
    photosByEntryId.set(photoRow.entityId, photos);
  }

  return rows.map((row) => {
    const base = mapFallwildRowToDomain(row);

    return {
      ...base,
      photos: photosByEntryId.get(row.id) ?? []
    };
  });
}

function escapeCsvCell(value: string): string {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replaceAll("\"", "\"\"")}"`;
  }

  return value;
}

type MediaAssetRecord = typeof mediaAssets.$inferSelect;
