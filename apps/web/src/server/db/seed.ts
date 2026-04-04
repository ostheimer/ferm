import { demoData } from "@hege/domain";

import { createSeedPasswordHash } from "../auth/service";
import { loadCliEnv } from "../env/load-cli-env";
import { createDbFromPool, createPool } from "./client";
import {
  ansitzSessions,
  dokumente,
  fallwildVorgaenge,
  memberships,
  notifications,
  protokollBeschluesse,
  protokollVersionen,
  reviere,
  reviereinrichtungKontrollen,
  reviereinrichtungWartungen,
  reviereinrichtungen,
  sitzungen,
  sitzungTeilnehmer,
  users
} from "./schema";

loadCliEnv();

async function main() {
  const pool = createPool();
  const db = createDbFromPool(pool);
  const passwordHash = createSeedPasswordHash();

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
          email: entry.email,
          passwordHash
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            name: entry.name,
            phone: entry.phone,
            email: entry.email,
            passwordHash
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

    for (const entry of demoData.notifications) {
      await db
        .insert(notifications)
        .values({
          id: entry.id,
          revierId: entry.revierId,
          channel: entry.channel,
          title: entry.title,
          body: entry.body,
          createdAt: entry.createdAt
        })
        .onConflictDoUpdate({
          target: notifications.id,
          set: {
            revierId: entry.revierId,
            channel: entry.channel,
            title: entry.title,
            body: entry.body,
            createdAt: entry.createdAt
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

    for (const entry of demoData.fallwild) {
      await db
        .insert(fallwildVorgaenge)
        .values({
          id: entry.id,
          revierId: entry.revierId,
          reportedByMembershipId: entry.reportedByMembershipId,
          recordedAt: entry.recordedAt,
          locationLat: entry.location.lat,
          locationLng: entry.location.lng,
          locationLabel: entry.location.label,
          wildart: entry.wildart,
          geschlecht: entry.geschlecht,
          altersklasse: entry.altersklasse,
          bergungsStatus: entry.bergungsStatus,
          gemeinde: entry.gemeinde,
          strasse: entry.strasse,
          note: entry.note
        })
        .onConflictDoUpdate({
          target: fallwildVorgaenge.id,
          set: {
            revierId: entry.revierId,
            reportedByMembershipId: entry.reportedByMembershipId,
            recordedAt: entry.recordedAt,
            locationLat: entry.location.lat,
            locationLng: entry.location.lng,
            locationLabel: entry.location.label,
            wildart: entry.wildart,
            geschlecht: entry.geschlecht,
            altersklasse: entry.altersklasse,
            bergungsStatus: entry.bergungsStatus,
            gemeinde: entry.gemeinde,
            strasse: entry.strasse,
            note: entry.note
          }
        });
    }

    for (const entry of demoData.reviereinrichtungen) {
      await db
        .insert(reviereinrichtungen)
        .values({
          id: entry.id,
          revierId: entry.revierId,
          type: entry.type,
          name: entry.name,
          status: entry.status,
          locationLat: entry.location.lat,
          locationLng: entry.location.lng,
          locationLabel: entry.location.label,
          beschreibung: entry.beschreibung
        })
        .onConflictDoUpdate({
          target: reviereinrichtungen.id,
          set: {
            revierId: entry.revierId,
            type: entry.type,
            name: entry.name,
            status: entry.status,
            locationLat: entry.location.lat,
            locationLng: entry.location.lng,
            locationLabel: entry.location.label,
            beschreibung: entry.beschreibung
          }
        });

      for (const kontrolle of entry.kontrollen) {
        await db
          .insert(reviereinrichtungKontrollen)
          .values({
            id: kontrolle.id,
            einrichtungId: entry.id,
            createdAt: kontrolle.createdAt,
            createdByMembershipId: kontrolle.createdByMembershipId,
            zustand: kontrolle.zustand,
            note: kontrolle.note
          })
          .onConflictDoUpdate({
            target: reviereinrichtungKontrollen.id,
            set: {
              einrichtungId: entry.id,
              createdAt: kontrolle.createdAt,
              createdByMembershipId: kontrolle.createdByMembershipId,
              zustand: kontrolle.zustand,
              note: kontrolle.note
            }
          });
      }

      for (const wartung of entry.wartung) {
        await db
          .insert(reviereinrichtungWartungen)
          .values({
            id: wartung.id,
            einrichtungId: entry.id,
            dueAt: wartung.dueAt,
            status: wartung.status,
            title: wartung.title,
            note: wartung.note
          })
          .onConflictDoUpdate({
            target: reviereinrichtungWartungen.id,
            set: {
              einrichtungId: entry.id,
              dueAt: wartung.dueAt,
              status: wartung.status,
              title: wartung.title,
              note: wartung.note
            }
          });
      }
    }

    for (const entry of demoData.sitzungen) {
      await db
        .insert(sitzungen)
        .values({
          id: entry.id,
          revierId: entry.revierId,
          title: entry.title,
          scheduledAt: entry.scheduledAt,
          locationLabel: entry.locationLabel,
          status: entry.status
        })
        .onConflictDoUpdate({
          target: sitzungen.id,
          set: {
            revierId: entry.revierId,
            title: entry.title,
            scheduledAt: entry.scheduledAt,
            locationLabel: entry.locationLabel,
            status: entry.status
          }
        });

      for (const participant of entry.participants) {
        const participantId = `${entry.id}-${participant.membershipId}`;

        await db
          .insert(sitzungTeilnehmer)
          .values({
            id: participantId,
            sitzungId: entry.id,
            membershipId: participant.membershipId,
            anwesend: participant.anwesend
          })
          .onConflictDoUpdate({
            target: sitzungTeilnehmer.id,
            set: {
              sitzungId: entry.id,
              membershipId: participant.membershipId,
              anwesend: participant.anwesend
            }
          });
      }

      for (const version of entry.versions) {
        await db
          .insert(protokollVersionen)
          .values({
            id: version.id,
            sitzungId: entry.id,
            createdAt: version.createdAt,
            createdByMembershipId: version.createdByMembershipId,
            summary: version.summary,
            agendaText: version.agenda.join("\n")
          })
          .onConflictDoUpdate({
            target: protokollVersionen.id,
            set: {
              sitzungId: entry.id,
              createdAt: version.createdAt,
              createdByMembershipId: version.createdByMembershipId,
              summary: version.summary,
              agendaText: version.agenda.join("\n")
            }
          });

        for (const beschluss of version.beschluesse) {
          await db
            .insert(protokollBeschluesse)
            .values({
              id: beschluss.id,
              versionId: version.id,
              title: beschluss.title,
              decision: beschluss.decision,
              owner: beschluss.owner,
              dueAt: beschluss.dueAt
            })
            .onConflictDoUpdate({
              target: protokollBeschluesse.id,
              set: {
                versionId: version.id,
                title: beschluss.title,
                decision: beschluss.decision,
                owner: beschluss.owner,
                dueAt: beschluss.dueAt
              }
            });
        }

        for (const attachment of version.attachments) {
          await db
            .insert(dokumente)
            .values({
              id: attachment.id,
              sitzungId: entry.id,
              versionId: version.id,
              kind: "attachment",
              title: attachment.title,
              fileName: attachment.fileName,
              contentType: attachment.contentType,
              createdAt: attachment.createdAt
            })
            .onConflictDoUpdate({
              target: dokumente.id,
              set: {
                sitzungId: entry.id,
                versionId: version.id,
                kind: "attachment",
                title: attachment.title,
                fileName: attachment.fileName,
                contentType: attachment.contentType,
                createdAt: attachment.createdAt
              }
            });
        }
      }

      if (entry.publishedDocument) {
        await db
          .insert(dokumente)
          .values({
            id: entry.publishedDocument.id,
            sitzungId: entry.id,
            versionId: entry.versions[0]?.id ?? null,
            kind: "published-protocol",
            title: entry.publishedDocument.title,
            fileName: entry.publishedDocument.fileName,
            contentType: entry.publishedDocument.contentType,
            createdAt: entry.publishedDocument.createdAt
          })
          .onConflictDoUpdate({
            target: dokumente.id,
            set: {
              sitzungId: entry.id,
              versionId: entry.versions[0]?.id ?? null,
              kind: "published-protocol",
              title: entry.publishedDocument.title,
              fileName: entry.publishedDocument.fileName,
              contentType: entry.publishedDocument.contentType,
              createdAt: entry.publishedDocument.createdAt
            }
          });
      }
    }

    console.log(
      "Seed completed for users, reviere, memberships, ansitz sessions, fallwild, notifications, reviereinrichtungen and sitzungen."
    );
  } finally {
    await pool.end();
  }
}

void main();
