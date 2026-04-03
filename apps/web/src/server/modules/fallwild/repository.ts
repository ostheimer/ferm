import type { FallwildVorgang } from "@hege/domain";

import { getDb } from "../../db/client";
import { fallwildVorgaenge } from "../../db/schema";
import { mapFallwildRowToDomain } from "./queries";

export interface FallwildRepository {
  insert(entry: FallwildVorgang): Promise<FallwildVorgang>;
}

export function createDbFallwildRepository(): FallwildRepository {
  const db = getDb();

  return {
    async insert(entry) {
      const [row] = await db
        .insert(fallwildVorgaenge)
        .values({
          id: entry.id,
          revierId: entry.revierId,
          reportedByMembershipId: entry.reportedByMembershipId,
          recordedAt: entry.recordedAt,
          locationLat: entry.location.lat,
          locationLng: entry.location.lng,
          locationLabel: entry.location.label ?? null,
          wildart: entry.wildart,
          geschlecht: entry.geschlecht,
          altersklasse: entry.altersklasse,
          bergungsStatus: entry.bergungsStatus,
          gemeinde: entry.gemeinde,
          strasse: entry.strasse ?? null,
          note: entry.note ?? null
        })
        .returning();

      if (!row) {
        throw new Error("Fallwild konnte nicht gespeichert werden.");
      }

      return mapFallwildRowToDomain(row);
    }
  };
}
