import { cloneDemoData } from "./mock-data";
import type {
  AddKontrollePayload,
  AnsitzSession,
  CreateFallwildPayload,
  DashboardOverview,
  DemoData,
  EndAnsitzPayload,
  FallwildVorgang,
  NotificationItem,
  Reviereinrichtung,
  Sitzung,
  StartAnsitzPayload
} from "./types";

export const defaultRevierId = "revier-attersee";

export function buildDashboardOverview(data: DemoData, revierId: string): DashboardOverview {
  const revier = data.reviere.find((entry) => entry.id === revierId);

  if (!revier) {
    throw new Error(`Revier ${revierId} wurde nicht gefunden.`);
  }

  const todaysDate = "2026-04-03";
  const aktiveAnsitze = data.ansitze.filter((entry) => entry.revierId === revierId && entry.status === "active");
  const offeneWartungen = data.reviereinrichtungen
    .filter((entry) => entry.revierId === revierId)
    .flatMap((entry) => entry.wartung)
    .filter((entry) => entry.status === "offen").length;

  return {
    revier,
    aktiveAnsitze: aktiveAnsitze.length,
    ansitzeMitKonflikt: aktiveAnsitze.filter((entry) => entry.conflict).length,
    offeneWartungen,
    heutigeFallwildBergungen: data.fallwild.filter(
      (entry) => entry.revierId === revierId && entry.recordedAt.startsWith(todaysDate)
    ).length,
    unveroeffentlichteProtokolle: data.sitzungen.filter(
      (entry) => entry.revierId === revierId && entry.status === "entwurf"
    ).length,
    letzteBenachrichtigungen: data.notifications.filter((entry) => entry.revierId === revierId).slice(-3).reverse(),
    naechsteSitzung: data.sitzungen
      .filter((entry) => entry.revierId === revierId)
      .sort((left, right) => left.scheduledAt.localeCompare(right.scheduledAt))[0]
  };
}

export function calculateAnsitzConflict(
  payload: Pick<AnsitzSession, "standortId" | "location">,
  activeSessions: AnsitzSession[]
): boolean {
  if (payload.standortId) {
    return activeSessions.some((entry) => entry.standortId === payload.standortId);
  }

  return activeSessions.some((entry) => distanceInMeters(entry.location, payload.location) < 120);
}

export function startAnsitz(data: DemoData, payload: StartAnsitzPayload): AnsitzSession {
  const activeSessions = data.ansitze.filter(
    (entry) => entry.revierId === payload.revierId && entry.status === "active"
  );

  const nextSession: AnsitzSession = {
    id: `ansitz-${data.ansitze.length + 1}`,
    revierId: payload.revierId,
    membershipId: payload.membershipId,
    standortId: payload.standortId,
    standortName: payload.standortName,
    location: payload.location,
    startedAt: payload.startedAt,
    plannedEndAt: payload.plannedEndAt,
    note: payload.note,
    status: "active",
    conflict: calculateAnsitzConflict(payload, activeSessions)
  };

  data.ansitze.unshift(nextSession);
  data.notifications.unshift({
    id: `notification-${data.notifications.length + 1}`,
    revierId: payload.revierId,
    channel: "push",
    title: nextSession.conflict ? "Ansitz mit Warnung" : "Ansitz aktiv",
    body: `${payload.standortName} wurde als aktiver Ansitz gemeldet.`,
    createdAt: payload.startedAt
  });

  return nextSession;
}

export function endAnsitz(data: DemoData, ansitzId: string, payload: EndAnsitzPayload): AnsitzSession {
  const ansitz = data.ansitze.find((entry) => entry.id === ansitzId);

  if (!ansitz) {
    throw new Error(`Ansitz ${ansitzId} wurde nicht gefunden.`);
  }

  ansitz.endedAt = payload.endedAt;
  ansitz.status = "completed";

  data.notifications.unshift({
    id: `notification-${data.notifications.length + 1}`,
    revierId: ansitz.revierId,
    channel: "push",
    title: "Ansitz beendet",
    body: `${ansitz.standortName} wurde abgemeldet.`,
    createdAt: payload.endedAt
  });

  return ansitz;
}

export function addKontrolle(
  data: DemoData,
  einrichtungId: string,
  payload: AddKontrollePayload
): Reviereinrichtung {
  const einrichtung = data.reviereinrichtungen.find((entry) => entry.id === einrichtungId);

  if (!einrichtung) {
    throw new Error(`Reviereinrichtung ${einrichtungId} wurde nicht gefunden.`);
  }

  einrichtung.status = payload.zustand;
  einrichtung.kontrollen.unshift({
    id: `kontrolle-${einrichtung.kontrollen.length + 1}`,
    createdAt: payload.createdAt,
    createdByMembershipId: payload.createdByMembershipId,
    zustand: payload.zustand,
    note: payload.note
  });

  return einrichtung;
}

export function createFallwild(data: DemoData, payload: CreateFallwildPayload): FallwildVorgang {
  const nextFallwild: FallwildVorgang = {
    id: `fallwild-${data.fallwild.length + 1}`,
    revierId: payload.revierId,
    reportedByMembershipId: payload.reportedByMembershipId,
    recordedAt: payload.recordedAt,
    location: payload.location,
    wildart: payload.wildart,
    geschlecht: payload.geschlecht,
    altersklasse: payload.altersklasse,
    bergungsStatus: payload.bergungsStatus,
    gemeinde: payload.gemeinde,
    strasse: payload.strasse,
    roadReference: payload.roadReference,
    note: payload.note,
    photos: []
  };

  data.fallwild.unshift(nextFallwild);
  data.notifications.unshift({
    id: `notification-${data.notifications.length + 1}`,
    revierId: payload.revierId,
    channel: "push",
    title: "Fallwild erfasst",
    body: `${payload.wildart} in ${payload.gemeinde} wurde dokumentiert.`,
    createdAt: payload.recordedAt
  });

  return nextFallwild;
}

export function publishSitzung(data: DemoData, sitzungId: string, createdAt: string): Sitzung {
  const sitzung = data.sitzungen.find((entry) => entry.id === sitzungId);

  if (!sitzung) {
    throw new Error(`Sitzung ${sitzungId} wurde nicht gefunden.`);
  }

  sitzung.status = "freigegeben";
  sitzung.publishedDocument = {
    id: `document-${sitzung.id}`,
    title: `${sitzung.title} Protokoll`,
    fileName: `${sitzung.title.toLowerCase().replaceAll(" ", "-")}.pdf`,
    contentType: "application/pdf",
    url: `https://files.example.invalid/${sitzung.id}.pdf`,
    createdAt
  };

  return sitzung;
}

export function latestNotifications(data: DemoData, revierId: string): NotificationItem[] {
  return data.notifications.filter((entry) => entry.revierId === revierId).slice(0, 5);
}

export function createDemoSnapshot(): DemoData {
  return cloneDemoData();
}

function distanceInMeters(left: { lat: number; lng: number }, right: { lat: number; lng: number }): number {
  const latDistance = (left.lat - right.lat) * 111_000;
  const lngDistance = (left.lng - right.lng) * 74_000;

  return Math.sqrt(latDistance ** 2 + lngDistance ** 2);
}
