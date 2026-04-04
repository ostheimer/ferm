import type {
  EinrichtungZustand,
  Reviereinrichtung,
  ReviereinrichtungKontrolle,
  ReviereinrichtungListItem,
  WartungsEintrag
} from "@hege/domain";
import type {
  ReviereinrichtungKontrolleRecord,
  ReviereinrichtungRecord,
  ReviereinrichtungWartungRecord
} from "../../db/schema";

export function mapDemoReviereinrichtungToListItem(
  entry: Reviereinrichtung
): ReviereinrichtungListItem {
  const kontrollen = [...entry.kontrollen].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  const wartung = [...entry.wartung].sort((left, right) => left.dueAt.localeCompare(right.dueAt));

  return {
    ...entry,
    kontrollen,
    wartung,
    letzteKontrolleAt: kontrollen[0]?.createdAt,
    offeneWartungen: wartung.filter((item) => item.status === "offen").length
  };
}

export function mapDbReviereinrichtungToListItem(
  entry: ReviereinrichtungRecord,
  kontrollen: ReviereinrichtungKontrolleRecord[],
  wartungen: ReviereinrichtungWartungRecord[]
): ReviereinrichtungListItem {
  const mappedKontrollen = kontrollen.map(mapKontrolleRecordToDomain);
  const mappedWartungen = wartungen.map(mapWartungRecordToDomain);
  const sortedKontrollen = [...mappedKontrollen].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  const sortedWartungen = [...mappedWartungen].sort((left, right) => left.dueAt.localeCompare(right.dueAt));

  return {
    id: entry.id,
    revierId: entry.revierId,
    type: entry.type,
    name: entry.name,
    status: entry.status,
    location: {
      lat: entry.locationLat,
      lng: entry.locationLng,
      label: entry.locationLabel ?? undefined
    },
    beschreibung: entry.beschreibung ?? undefined,
    photos: [],
    kontrollen: sortedKontrollen,
    wartung: sortedWartungen,
    letzteKontrolleAt: sortedKontrollen[0]?.createdAt,
    offeneWartungen: sortedWartungen.filter((item) => item.status === "offen").length
  };
}

function mapKontrolleRecordToDomain(record: ReviereinrichtungKontrolleRecord): ReviereinrichtungKontrolle {
  return {
    id: record.id,
    createdAt: record.createdAt,
    createdByMembershipId: record.createdByMembershipId,
    zustand: record.zustand as EinrichtungZustand,
    note: record.note ?? undefined
  };
}

function mapWartungRecordToDomain(record: ReviereinrichtungWartungRecord): WartungsEintrag {
  return {
    id: record.id,
    dueAt: record.dueAt,
    status: record.status,
    title: record.title,
    note: record.note ?? undefined
  };
}
