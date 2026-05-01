import type {
  Beschluss,
  DocumentAsset,
  DocumentDownloadRef,
  ProtokollDetail,
  ProtokollListItem,
  ProtokollVersion,
  Sitzung,
  Teilnehmer
} from "@hege/domain";
import { and, desc, eq } from "drizzle-orm";

import { getRequestContext } from "../../auth/context";
import { getDb } from "../../db/client";
import {
  dokumente,
  protokollBeschluesse,
  protokollVersionen,
  sitzungTeilnehmer,
  sitzungen,
  type DokumentRecord,
  type ProtokollBeschlussRecord,
  type ProtokollVersionRecord,
  type SitzungRecord,
  type SitzungTeilnehmerRecord
} from "../../db/schema";
import { createDemoStore } from "../../demo-store";
import { getServerEnv } from "../../env";
import { normalizeDeAtVisibleText } from "../../text/de-at";

export async function listProtokolle(): Promise<ProtokollListItem[]> {
  if (getServerEnv().useDemoStore) {
    return listProtokolleFromDemoStore();
  }

  const db = getDb();
  const { revierId } = await getRequestContext();
  const rows = await db
    .select()
    .from(sitzungen)
    .where(and(eq(sitzungen.revierId, revierId), eq(sitzungen.status, "freigegeben")))
    .orderBy(desc(sitzungen.scheduledAt));

  return Promise.all(rows.map((row: SitzungRecord) => buildListItemFromRow(row)));
}

export async function getProtokollDetail(protokollId: string): Promise<ProtokollDetail | undefined> {
  if (getServerEnv().useDemoStore) {
    return getProtokollDetailFromDemoStore(protokollId);
  }

  const db = getDb();
  const { revierId } = await getRequestContext();
  const [row] = await db
    .select()
    .from(sitzungen)
    .where(and(eq(sitzungen.revierId, revierId), eq(sitzungen.id, protokollId), eq(sitzungen.status, "freigegeben")))
    .limit(1);

  if (!row) {
    return undefined;
  }

  return buildDetailFromRow(row);
}

async function buildListItemFromRow(row: SitzungRecord): Promise<ProtokollListItem> {
  const [latestVersion, publishedDocument] = await Promise.all([
    loadLatestVersion(row.id),
    loadPublishedDocument(row.id)
  ]);

  return {
    id: row.id,
    revierId: row.revierId,
    title: normalizeDeAtVisibleText(row.title),
    scheduledAt: row.scheduledAt,
    locationLabel: normalizeDeAtVisibleText(row.locationLabel),
    status: row.status,
    latestVersionCreatedAt: latestVersion?.createdAt,
    summaryPreview: latestVersion ? createSummaryPreview(latestVersion.summary) : undefined,
    beschlussCount: latestVersion?.beschluesse.length ?? 0,
    publishedDocument
  };
}

async function buildDetailFromRow(row: SitzungRecord): Promise<ProtokollDetail> {
  const [versions, participants, publishedDocument] = await Promise.all([
    loadVersions(row.id),
    loadParticipants(row.id),
    loadPublishedDocument(row.id)
  ]);

  const latestVersion = versions[0];

  return {
    id: row.id,
    revierId: row.revierId,
    title: normalizeDeAtVisibleText(row.title),
    scheduledAt: row.scheduledAt,
    locationLabel: normalizeDeAtVisibleText(row.locationLabel),
    status: row.status,
    latestVersionCreatedAt: latestVersion?.createdAt,
    summaryPreview: latestVersion ? createSummaryPreview(latestVersion.summary) : undefined,
    beschlussCount: latestVersion?.beschluesse.length ?? 0,
    publishedDocument,
    participants,
    versions
  };
}

async function loadLatestVersion(sitzungId: string) {
  const [version] = await loadVersions(sitzungId);
  return version;
}

async function loadPublishedDocument(sitzungId: string): Promise<DocumentDownloadRef | undefined> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(dokumente)
    .where(and(eq(dokumente.sitzungId, sitzungId), eq(dokumente.kind, "published-protocol")))
    .limit(1);

  return row ? toDocumentDownloadRef(row) : undefined;
}

async function loadVersions(sitzungId: string): Promise<ProtokollVersion[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(protokollVersionen)
    .where(eq(protokollVersionen.sitzungId, sitzungId))
    .orderBy(desc(protokollVersionen.createdAt));

  return Promise.all(rows.map((row) => toProtokollVersion(row)));
}

async function loadParticipants(sitzungId: string): Promise<Teilnehmer[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(sitzungTeilnehmer)
    .where(eq(sitzungTeilnehmer.sitzungId, sitzungId));

  return rows.map(toTeilnehmer);
}

async function toProtokollVersion(row: ProtokollVersionRecord): Promise<ProtokollVersion> {
  const [beschlussRows, attachmentRows] = await Promise.all([
    loadBeschluesse(row.id),
    loadAttachments(row.id)
  ]);

  return {
    id: row.id,
    createdAt: row.createdAt,
    createdByMembershipId: row.createdByMembershipId,
    summary: normalizeDeAtVisibleText(row.summary),
    agenda: parseAgenda(row.agendaText),
    beschluesse: beschlussRows,
    attachments: attachmentRows
  };
}

async function loadBeschluesse(versionId: string): Promise<Beschluss[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(protokollBeschluesse)
    .where(eq(protokollBeschluesse.versionId, versionId));

  return rows.map(toBeschluss);
}

async function loadAttachments(versionId: string): Promise<DocumentAsset[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(dokumente)
    .where(and(eq(dokumente.versionId, versionId), eq(dokumente.kind, "attachment")));

  return rows.map(toDocumentAsset);
}

function toBeschluss(row: ProtokollBeschlussRecord): Beschluss {
  return {
    id: row.id,
    title: normalizeDeAtVisibleText(row.title),
    decision: normalizeDeAtVisibleText(row.decision),
    owner: normalizeDeAtVisibleText(row.owner) ?? undefined,
    dueAt: row.dueAt ?? undefined
  };
}

function toDocumentAsset(row: DokumentRecord): DocumentAsset {
  const downloadUrl = `/api/v1/documents/${row.id}/download`;

  return {
    id: row.id,
    title: normalizeDeAtVisibleText(row.title),
    fileName: row.fileName,
    contentType: row.contentType,
    url: downloadUrl,
    createdAt: row.createdAt
  };
}

function toDocumentDownloadRef(row: DokumentRecord): DocumentDownloadRef {
  const asset = toDocumentAsset(row);

  return {
    ...asset,
    downloadUrl: asset.url
  };
}

function toTeilnehmer(row: SitzungTeilnehmerRecord): Teilnehmer {
  return {
    membershipId: row.membershipId,
    anwesend: row.anwesend
  };
}

function parseAgenda(agendaText: string): string[] {
  return normalizeDeAtVisibleText(agendaText)
    .split("\n")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function createSummaryPreview(summary: string): string {
  const trimmed = normalizeDeAtVisibleText(summary).trim();

  if (trimmed.length <= 120) {
    return trimmed;
  }

  return `${trimmed.slice(0, 117)}...`;
}

function listProtokolleFromDemoStore(): ProtokollListItem[] {
  const store = createDemoStore();

  return store.sitzungen
    .filter((entry) => entry.status === "freigegeben")
    .sort((left, right) => right.scheduledAt.localeCompare(left.scheduledAt))
    .map((entry) => {
      const latestVersion = entry.versions[0];

      return {
        id: entry.id,
        revierId: entry.revierId,
        title: normalizeDeAtVisibleText(entry.title),
        scheduledAt: entry.scheduledAt,
        locationLabel: normalizeDeAtVisibleText(entry.locationLabel),
        status: entry.status,
        latestVersionCreatedAt: latestVersion?.createdAt,
        summaryPreview: latestVersion ? createSummaryPreview(latestVersion.summary) : undefined,
        beschlussCount: latestVersion?.beschluesse.length ?? 0,
        publishedDocument: entry.publishedDocument
          ? {
              ...entry.publishedDocument,
              downloadUrl: entry.publishedDocument.url
            }
          : undefined
      };
    });
}

function getProtokollDetailFromDemoStore(protokollId: string): ProtokollDetail | undefined {
  const store = createDemoStore();
  const entry = store.sitzungen.find((candidate) => candidate.id === protokollId && candidate.status === "freigegeben");

  if (!entry) {
    return undefined;
  }

  const latestVersion = entry.versions[0];

  return {
    id: entry.id,
    revierId: entry.revierId,
    title: normalizeDeAtVisibleText(entry.title),
    scheduledAt: entry.scheduledAt,
    locationLabel: normalizeDeAtVisibleText(entry.locationLabel),
    status: entry.status,
    latestVersionCreatedAt: latestVersion?.createdAt,
    summaryPreview: latestVersion ? createSummaryPreview(latestVersion.summary) : undefined,
    beschlussCount: latestVersion?.beschluesse.length ?? 0,
    publishedDocument: entry.publishedDocument
      ? {
          ...entry.publishedDocument,
          downloadUrl: entry.publishedDocument.url
        }
      : undefined,
    participants: entry.participants,
    versions: entry.versions
  };
}
