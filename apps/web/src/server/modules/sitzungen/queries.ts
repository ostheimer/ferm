import type { Sitzung } from "@hege/domain";
import { demoData } from "@hege/domain";
import { and, asc, desc, eq, inArray } from "drizzle-orm";

import { getRequestContext } from "../../auth/context";
import { getDb } from "../../db/client";
import {
  dokumente,
  memberships,
  protokollBeschluesse,
  protokollVersionen,
  sitzungen,
  sitzungTeilnehmer,
  users
} from "../../db/schema";
import { getServerEnv } from "../../env";

export interface RevierMembershipOption {
  membershipId: string;
  userId: string;
  userName: string;
  role: string;
  jagdzeichen: string;
}

export async function listSitzungen(): Promise<Sitzung[]> {
  if (getServerEnv().useDemoStore) {
    return listDemoSitzungen();
  }

  const { revierId } = await getRequestContext();
  const rows = await getDb()
    .select()
    .from(sitzungen)
    .where(eq(sitzungen.revierId, revierId))
    .orderBy(desc(sitzungen.scheduledAt));

  return assembleSitzungen(rows.map((entry) => entry.id), revierId);
}

export async function getSitzungById(sitzungId: string): Promise<Sitzung | undefined> {
  if (getServerEnv().useDemoStore) {
    const { revierId } = await getRequestContext();
    return demoData.sitzungen.find((entry) => entry.revierId === revierId && entry.id === sitzungId);
  }

  const { revierId } = await getRequestContext();
  const [row] = await getDb()
    .select()
    .from(sitzungen)
    .where(and(eq(sitzungen.revierId, revierId), eq(sitzungen.id, sitzungId)))
    .limit(1);

  if (!row) {
    return undefined;
  }

  const [result] = await assembleSitzungen([row.id], revierId);
  return result;
}

export async function listRevierMemberships(): Promise<RevierMembershipOption[]> {
  if (getServerEnv().useDemoStore) {
    const { revierId } = await getRequestContext();

    return demoData.memberships
      .filter((entry) => entry.revierId === revierId)
      .map((entry) => {
        const user = demoData.users.find((candidate) => candidate.id === entry.userId);

        return {
          membershipId: entry.id,
          userId: entry.userId,
          userName: user?.name ?? entry.userId,
          role: entry.role,
          jagdzeichen: entry.jagdzeichen
        };
      });
  }

  const { revierId } = await getRequestContext();
  const rows = await getDb()
    .select({
      membershipId: memberships.id,
      userId: memberships.userId,
      role: memberships.role,
      jagdzeichen: memberships.jagdzeichen,
      userName: users.name
    })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(eq(memberships.revierId, revierId))
    .orderBy(asc(users.name));

  return rows.map((entry) => ({
    membershipId: entry.membershipId,
    userId: entry.userId,
    userName: entry.userName,
    role: entry.role,
    jagdzeichen: entry.jagdzeichen
  }));
}

export async function getDocumentDownloadRef(documentId: string) {
  const sitzungList = await listSitzungen();

  for (const sitzung of sitzungList) {
    if (sitzung.publishedDocument?.id === documentId) {
      return {
        sitzungId: sitzung.id,
        document: sitzung.publishedDocument
      };
    }

    for (const version of sitzung.versions) {
      const attachment = version.attachments.find((entry) => entry.id === documentId);

      if (attachment) {
        return {
          sitzungId: sitzung.id,
          document: attachment
        };
      }
    }
  }

  return undefined;
}

async function assembleSitzungen(sitzungIds: string[], revierId: string): Promise<Sitzung[]> {
  if (sitzungIds.length === 0) {
    return [];
  }

  const db = getDb();
  const [sessionRows, participantRows, versionRows, documentRows] = await Promise.all([
    db.select().from(sitzungen).where(inArray(sitzungen.id, sitzungIds)).orderBy(desc(sitzungen.scheduledAt)),
    db.select().from(sitzungTeilnehmer).where(inArray(sitzungTeilnehmer.sitzungId, sitzungIds)),
    db.select().from(protokollVersionen).where(inArray(protokollVersionen.sitzungId, sitzungIds)).orderBy(desc(protokollVersionen.createdAt)),
    db.select().from(dokumente).where(inArray(dokumente.sitzungId, sitzungIds))
  ]);
  const versionIds = versionRows.map((entry) => entry.id);
  const beschlussRows =
    versionIds.length > 0
      ? await db.select().from(protokollBeschluesse).where(inArray(protokollBeschluesse.versionId, versionIds))
      : [];

  return sessionRows
    .filter((entry) => entry.revierId === revierId)
    .map((entry) => {
      const versions = versionRows
        .filter((version) => version.sitzungId === entry.id)
        .map((version) => ({
          id: version.id,
          createdAt: version.createdAt,
          createdByMembershipId: version.createdByMembershipId,
          summary: version.summary,
          agenda: splitAgenda(version.agendaText),
          beschluesse: beschlussRows
            .filter((beschluss) => beschluss.versionId === version.id)
            .map((beschluss) => ({
              id: beschluss.id,
              title: beschluss.title,
              decision: beschluss.decision,
              owner: beschluss.owner ?? undefined,
              dueAt: beschluss.dueAt ?? undefined
            })),
          attachments: documentRows
            .filter((document) => document.versionId === version.id && document.kind === "attachment")
            .map((document) => ({
              id: document.id,
              title: document.title,
              fileName: document.fileName,
              contentType: document.contentType,
              createdAt: document.createdAt,
              url: `/api/v1/documents/${document.id}/download`
            }))
        }));

      const publishedDocument = documentRows.find(
        (document) => document.sitzungId === entry.id && document.kind === "published-protocol"
      );

      return {
        id: entry.id,
        revierId: entry.revierId,
        title: entry.title,
        scheduledAt: entry.scheduledAt,
        locationLabel: entry.locationLabel,
        status: entry.status,
        participants: participantRows
          .filter((participant) => participant.sitzungId === entry.id)
          .map((participant) => ({
            membershipId: participant.membershipId,
            anwesend: participant.anwesend
          })),
        versions,
        publishedDocument: publishedDocument
          ? {
              id: publishedDocument.id,
              title: publishedDocument.title,
              fileName: publishedDocument.fileName,
              contentType: publishedDocument.contentType,
              createdAt: publishedDocument.createdAt,
              url: `/api/v1/documents/${publishedDocument.id}/download`
            }
          : undefined
      } satisfies Sitzung;
    });
}

function listDemoSitzungen(): Promise<Sitzung[]> {
  return getRequestContext().then(({ revierId }) =>
    demoData.sitzungen
      .filter((entry) => entry.revierId === revierId)
      .sort((left, right) => right.scheduledAt.localeCompare(left.scheduledAt))
  );
}

function splitAgenda(value: string) {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}
