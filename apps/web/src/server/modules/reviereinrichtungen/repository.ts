import type { ReviereinrichtungListItem } from "@hege/domain";
import { desc, eq, inArray } from "drizzle-orm";

import { getDb } from "../../db/client";
import {
  reviereinrichtungKontrollen,
  reviereinrichtungWartungen,
  reviereinrichtungen
} from "../../db/schema";
import { mapDbReviereinrichtungToListItem } from "./mappers";

export interface ReviereinrichtungenRepository {
  listByRevier(revierId: string): Promise<ReviereinrichtungListItem[]>;
}

export function createDbReviereinrichtungenRepository(): ReviereinrichtungenRepository {
  const db = getDb();

  return {
    async listByRevier(revierId) {
      const entries = await db
        .select()
        .from(reviereinrichtungen)
        .where(eq(reviereinrichtungen.revierId, revierId))
        .orderBy(reviereinrichtungen.name);

      if (entries.length === 0) {
        return [];
      }

      const einrichtungIds = entries.map((entry) => entry.id);
      const [kontrollen, wartungen] = await Promise.all([
        db
          .select()
          .from(reviereinrichtungKontrollen)
          .where(inArray(reviereinrichtungKontrollen.einrichtungId, einrichtungIds))
          .orderBy(desc(reviereinrichtungKontrollen.createdAt)),
        db
          .select()
          .from(reviereinrichtungWartungen)
          .where(inArray(reviereinrichtungWartungen.einrichtungId, einrichtungIds))
          .orderBy(reviereinrichtungWartungen.dueAt)
      ]);

      return entries.map((entry) =>
        mapDbReviereinrichtungToListItem(
          entry,
          kontrollen.filter((record) => record.einrichtungId === entry.id),
          wartungen.filter((record) => record.einrichtungId === entry.id)
        )
      );
    }
  };
}
