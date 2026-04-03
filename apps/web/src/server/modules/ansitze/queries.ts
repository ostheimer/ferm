import type { AnsitzSession } from "@hege/domain";
import { desc, eq } from "drizzle-orm";

import { getRequestContext } from "../../auth/context";
import { getDb } from "../../db/client";
import { type AnsitzSessionRecord, ansitzSessions } from "../../db/schema";
import { createDemoStore } from "../../demo-store";
import { getServerEnv } from "../../env";

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

export function mapAnsitzRowToDomain(record: AnsitzSessionRecord): AnsitzSession {
  return {
    id: record.id,
    revierId: record.revierId,
    membershipId: record.membershipId,
    standortId: record.standortId ?? undefined,
    standortName: record.standortName,
    location: {
      lat: record.locationLat,
      lng: record.locationLng,
      label: record.locationLabel ?? undefined
    },
    startedAt: record.startedAt,
    plannedEndAt: record.plannedEndAt ?? undefined,
    endedAt: record.endedAt ?? undefined,
    note: record.note ?? undefined,
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
