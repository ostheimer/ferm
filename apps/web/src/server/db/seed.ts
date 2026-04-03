import { demoData } from "@hege/domain";

import { createDbFromPool, createPool } from "./client";
import { ansitzSessions, memberships, reviere, users } from "./schema";

async function main() {
  const pool = createPool();
  const db = createDbFromPool(pool);

  try {
    for (const entry of demoData.reviere) {
      await db
        .insert(reviere)
        .values({
          id: entry.id,
          tenantKey: entry.tenantKey,
          name: entry.name,
          bundesland: entry.bundesland,
          bezirk: entry.bezirk,
          flaecheHektar: entry.flaecheHektar,
          zentrumLat: entry.zentrum.lat,
          zentrumLng: entry.zentrum.lng,
          zentrumLabel: entry.zentrum.label
        })
        .onConflictDoUpdate({
          target: reviere.id,
          set: {
            tenantKey: entry.tenantKey,
            name: entry.name,
            bundesland: entry.bundesland,
            bezirk: entry.bezirk,
            flaecheHektar: entry.flaecheHektar,
            zentrumLat: entry.zentrum.lat,
            zentrumLng: entry.zentrum.lng,
            zentrumLabel: entry.zentrum.label
          }
        });
    }

    for (const entry of demoData.users) {
      await db
        .insert(users)
        .values({
          id: entry.id,
          name: entry.name,
          phone: entry.phone,
          email: entry.email
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            name: entry.name,
            phone: entry.phone,
            email: entry.email
          }
        });
    }

    for (const entry of demoData.memberships) {
      await db
        .insert(memberships)
        .values({
          id: entry.id,
          userId: entry.userId,
          revierId: entry.revierId,
          role: entry.role,
          jagdzeichen: entry.jagdzeichen,
          pushEnabled: entry.pushEnabled
        })
        .onConflictDoUpdate({
          target: memberships.id,
          set: {
            userId: entry.userId,
            revierId: entry.revierId,
            role: entry.role,
            jagdzeichen: entry.jagdzeichen,
            pushEnabled: entry.pushEnabled
          }
        });
    }

    for (const entry of demoData.ansitze) {
      await db
        .insert(ansitzSessions)
        .values({
          id: entry.id,
          revierId: entry.revierId,
          membershipId: entry.membershipId,
          standortId: entry.standortId,
          standortName: entry.standortName,
          locationLat: entry.location.lat,
          locationLng: entry.location.lng,
          locationLabel: entry.location.label,
          startedAt: entry.startedAt,
          plannedEndAt: entry.plannedEndAt,
          endedAt: entry.endedAt,
          note: entry.note,
          status: entry.status,
          conflict: entry.conflict
        })
        .onConflictDoUpdate({
          target: ansitzSessions.id,
          set: {
            revierId: entry.revierId,
            membershipId: entry.membershipId,
            standortId: entry.standortId,
            standortName: entry.standortName,
            locationLat: entry.location.lat,
            locationLng: entry.location.lng,
            locationLabel: entry.location.label,
            startedAt: entry.startedAt,
            plannedEndAt: entry.plannedEndAt,
            endedAt: entry.endedAt,
            note: entry.note,
            status: entry.status,
            conflict: entry.conflict
          }
        });
    }

    console.log("Seed completed for users, reviere, memberships and ansitz sessions.");
  } finally {
    await pool.end();
  }
}

void main();
