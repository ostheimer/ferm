import type {
  AuthContextResponse,
  AnsitzSession,
  DashboardResponse,
  FallwildVorgang,
  NotificationItem,
  Sitzung
} from "@hege/domain";
import { asc, desc, eq } from "drizzle-orm";

import { getCurrentAuthContext } from "../../auth/context";
import { createDemoStore } from "../../demo-store";
import { getDb } from "../../db/client";
import {
  ansitzSessions,
  fallwildVorgaenge,
  notifications,
  reviereinrichtungWartungen,
  reviereinrichtungen,
  sitzungen,
  type AnsitzSessionRecord,
  type FallwildVorgangRecord,
  type NotificationRecord,
  type SitzungRecord
} from "../../db/schema";
import { getServerEnv } from "../../env";

const TIME_ZONE = "Europe/Vienna";
const MAX_RECENT_ITEMS = 5;

export interface DashboardQueryOptions {
  context?: AuthContextResponse;
  now?: Date;
}

export async function getDashboardSnapshot(
  options: DashboardQueryOptions = {}
): Promise<DashboardResponse> {
  const context = options.context ?? (await getCurrentAuthContext());
  const now = options.now ?? new Date();

  if (getServerEnv().useDemoStore) {
    return buildDashboardFromDemoStore(context, now);
  }

  const db = getDb();
  const revierId = context.activeRevierId;

  const [
    activeAnsitzRows,
    fallwildRows,
    notificationRows,
    sitzungenRows,
    wartungsRows
  ] = await Promise.all([
    db
      .select()
      .from(ansitzSessions)
      .where(eq(ansitzSessions.revierId, revierId))
      .orderBy(desc(ansitzSessions.startedAt)),
    db
      .select()
      .from(fallwildVorgaenge)
      .where(eq(fallwildVorgaenge.revierId, revierId))
      .orderBy(desc(fallwildVorgaenge.recordedAt)),
    db
      .select()
      .from(notifications)
      .where(eq(notifications.revierId, revierId))
      .orderBy(desc(notifications.createdAt))
      .limit(MAX_RECENT_ITEMS),
    db
      .select()
      .from(sitzungen)
      .where(eq(sitzungen.revierId, revierId))
      .orderBy(asc(sitzungen.scheduledAt)),
    db
      .select({
        status: reviereinrichtungWartungen.status
      })
      .from(reviereinrichtungWartungen)
      .innerJoin(reviereinrichtungen, eq(reviereinrichtungWartungen.einrichtungId, reviereinrichtungen.id))
      .where(eq(reviereinrichtungen.revierId, revierId))
  ]);

  const activeAnsitze = activeAnsitzRows
    .filter((row) => row.status === "active")
    .map(mapAnsitzRowToDomain);
  const recentFallwild = fallwildRows.map(mapFallwildRowToDomain).slice(0, MAX_RECENT_ITEMS);
  const notificationsList = notificationRows.map(mapNotificationRowToDomain);
  const overview = buildOverview({
    now,
    revier: context.revier,
    activeAnsitze,
    fallwild: fallwildRows.map(mapFallwildRowToDomain),
    notifications: notificationsList,
    sitzungen: sitzungenRows.map(mapSitzungRowToDomain),
    openMaintenanceCount: wartungsRows.filter((row) => row.status === "offen").length
  });

  return {
    ...context,
    overview,
    activeAnsitze,
    recentFallwild
  };
}

function buildDashboardFromDemoStore(
  context: AuthContextResponse,
  now: Date
): DashboardResponse {
  const store = createDemoStore();
  const revierId = context.activeRevierId;
  const activeAnsitze = store.ansitze
    .filter((entry) => entry.revierId === revierId && entry.status === "active")
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt));
  const fallwild = store.fallwild
    .filter((entry) => entry.revierId === revierId)
    .sort((left, right) => right.recordedAt.localeCompare(left.recordedAt));
  const notificationsList = store.notifications
    .filter((entry) => entry.revierId === revierId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, MAX_RECENT_ITEMS);

  return {
    ...context,
    overview: buildOverview({
      now,
      revier: context.revier,
      activeAnsitze,
      fallwild,
      notifications: notificationsList,
      sitzungen: store.sitzungen.filter((entry) => entry.revierId === revierId),
      openMaintenanceCount: store.reviereinrichtungen
        .filter((entry) => entry.revierId === revierId)
        .flatMap((entry) => entry.wartung)
        .filter((entry) => entry.status === "offen").length
    }),
    activeAnsitze,
    recentFallwild: fallwild.slice(0, MAX_RECENT_ITEMS)
  };
}

function buildOverview({
  now,
  revier,
  activeAnsitze,
  fallwild,
  notifications,
  sitzungen,
  openMaintenanceCount
}: {
  now: Date;
  revier: AuthContextResponse["revier"];
  activeAnsitze: AnsitzSession[];
  fallwild: FallwildVorgang[];
  notifications: NotificationItem[];
  sitzungen: Sitzung[];
  openMaintenanceCount: number;
}) {
  return {
    revier,
    aktiveAnsitze: activeAnsitze.length,
    ansitzeMitKonflikt: activeAnsitze.filter((entry) => entry.conflict).length,
    offeneWartungen: openMaintenanceCount,
    heutigeFallwildBergungen: fallwild.filter((entry) => toLocalDateKey(entry.recordedAt) === toLocalDateKey(now)).length,
    unveroeffentlichteProtokolle: sitzungen.filter((entry) => entry.status === "entwurf").length,
    letzteBenachrichtigungen: notifications.slice(0, MAX_RECENT_ITEMS),
    naechsteSitzung: selectNextSitzung(sitzungen, now)
  };
}

function selectNextSitzung(sitzungenList: Sitzung[], now: Date): Sitzung | undefined {
  const nowValue = now.valueOf();
  const futureSessions = sitzungenList.filter((entry) => new Date(entry.scheduledAt).valueOf() >= nowValue);
  const candidates = futureSessions.length > 0 ? futureSessions : sitzungenList;
  const next = candidates.slice().sort((left, right) => left.scheduledAt.localeCompare(right.scheduledAt))[0];

  if (!next) {
    return undefined;
  }

  return {
    ...next,
    participants: next.participants ?? [],
    versions: next.versions ?? []
  };
}

function mapAnsitzRowToDomain(record: AnsitzSessionRecord) {
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
  } satisfies AnsitzSession;
}

function mapFallwildRowToDomain(record: FallwildVorgangRecord) {
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
  } satisfies FallwildVorgang;
}

function mapNotificationRowToDomain(record: NotificationRecord): NotificationItem {
  return {
    id: record.id,
    revierId: record.revierId,
    channel: record.channel,
    title: record.title,
    body: record.body,
    createdAt: record.createdAt
  };
}

function mapSitzungRowToDomain(record: SitzungRecord): Sitzung {
  return {
    id: record.id,
    revierId: record.revierId,
    title: record.title,
    scheduledAt: record.scheduledAt,
    locationLabel: record.locationLabel,
    status: record.status,
    participants: [],
    versions: []
  } satisfies Sitzung;
}

function toLocalDateKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
}
