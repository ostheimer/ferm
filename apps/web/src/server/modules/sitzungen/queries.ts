import type { Sitzung } from "@hege/domain";
import { demoData } from "@hege/domain";
import { and, asc, desc, eq, inArray } from "drizzle-orm";

import { getRequestContext } from "../../auth/context";
import { buildCsv } from "../../csv/escape";
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
import { normalizeDeAtVisibleText } from "../../text/de-at";

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

/**
 * Exportiert alle Sitzungen des aktiven Reviers als CSV. Mehrwert fuer
 * Schriftfuehrung: kompakter Jahresueberblick ueber alle Termine plus
 * Status, Teilnehmer-Praesenz und Beschluss-Anzahl. Detail-Inhalte
 * (Agenda, Beschluss-Texte) sind ueber die Detail-Seite + PDF-Export
 * abrufbar — der CSV ist die Index-Sicht.
 *
 * Pattern wie `exportFallwildCsv` / `exportReviereinrichtungenCsv`:
 * Spaltennamen snake_case, leere Optionalwerte als Leer-Zelle, Counts
 * als nummerische Zellen (buildCsv stringifyiert sauber).
 */
export async function exportSitzungenCsv(): Promise<string> {
  const entries = await listSitzungen();

  return buildCsv(SITZUNGEN_CSV_HEADER, entries.map(toSitzungCsvRow));
}

export const SITZUNGEN_CSV_HEADER = [
  "id",
  "titel",
  "termin",
  "ort",
  "status",
  "teilnehmer_anwesend",
  "teilnehmer_gesamt",
  "anzahl_versionen",
  "anzahl_beschluesse",
  "letztes_update_am",
  "freigegebenes_dokument_am"
] as const;

/**
 * Spaltenfueller fuer eine Sitzung. Als eigene Funktion ausgelagert,
 * damit der Vertrags-Test (`csv.test.ts`) die Zellen-Logik ohne
 * DB-Roundtrip pruefen kann.
 */
export function toSitzungCsvRow(entry: Sitzung): ReadonlyArray<string | number> {
  const latestVersion = entry.versions[0];
  const totalBeschluesse = entry.versions.reduce(
    (sum, version) => sum + version.beschluesse.length,
    0
  );
  const anwesend = entry.participants.filter((participant) => participant.anwesend).length;

  return [
    entry.id,
    entry.title,
    entry.scheduledAt,
    entry.locationLabel,
    entry.status,
    anwesend,
    entry.participants.length,
    entry.versions.length,
    totalBeschluesse,
    latestVersion?.createdAt ?? "",
    entry.publishedDocument?.createdAt ?? ""
  ];
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
          summary: normalizeDeAtVisibleText(version.summary),
          agenda: splitAgenda(version.agendaText),
          beschluesse: beschlussRows
            .filter((beschluss) => beschluss.versionId === version.id)
            .map((beschluss) => ({
              id: beschluss.id,
              title: normalizeDeAtVisibleText(beschluss.title),
              decision: normalizeDeAtVisibleText(beschluss.decision),
              owner: normalizeDeAtVisibleText(beschluss.owner) ?? undefined,
              dueAt: beschluss.dueAt ?? undefined
            })),
          attachments: documentRows
            .filter((document) => document.versionId === version.id && document.kind === "attachment")
            .map((document) => ({
              id: document.id,
              title: normalizeDeAtVisibleText(document.title),
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
        title: normalizeDeAtVisibleText(entry.title),
        scheduledAt: entry.scheduledAt,
        locationLabel: normalizeDeAtVisibleText(entry.locationLabel),
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
              title: normalizeDeAtVisibleText(publishedDocument.title),
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
  return normalizeDeAtVisibleText(value)
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}
