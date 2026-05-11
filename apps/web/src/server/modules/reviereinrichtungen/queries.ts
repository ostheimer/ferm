import { demoData, type ReviereinrichtungListItem } from "@hege/domain";

import { getRequestContext } from "../../auth/context";
import { buildCsv } from "../../csv/escape";
import { getServerEnv } from "../../env";
import { mapDemoReviereinrichtungToListItem } from "./mappers";
import { createReviereinrichtungenService } from "./service";

const defaultService = createReviereinrichtungenService();

export async function listReviereinrichtungen(): Promise<ReviereinrichtungListItem[]> {
  if (getServerEnv().useDemoStore) {
    return listReviereinrichtungenFromDemoStore();
  }

  const { revierId } = await getRequestContext();

  return defaultService.list(revierId);
}

function listReviereinrichtungenFromDemoStore(): ReviereinrichtungListItem[] {
  const revierId = process.env.DEV_REVIER_ID ?? "revier-attersee";

  return demoData.reviereinrichtungen
    .filter((entry) => entry.revierId === revierId)
    .map(mapDemoReviereinrichtungToListItem)
    .sort((left, right) => left.name.localeCompare(right.name));
}

/**
 * Exportiert alle Reviereinrichtungen des aktiven Reviers als CSV.
 * Konsistent zum Fallwild-/Ansitze-Pattern. Wartungs- und Kontroll-
 * Subdetails werden auf Counts gerundet — fuer eine Detail-Ansicht
 * koennen Web-User die Detail-Card oeffnen.
 */
export async function exportReviereinrichtungenCsv(): Promise<string> {
  const entries = await listReviereinrichtungen();

  return buildCsv(
    [
      "id",
      "name",
      "type",
      "status",
      "beschreibung",
      "location_label",
      "lat",
      "lng",
      "letzte_kontrolle_at",
      "kontrollen_count",
      "offene_wartungen"
    ],
    entries.map((entry) => [
      entry.id,
      entry.name,
      entry.type,
      entry.status,
      entry.beschreibung ?? "",
      entry.location.label ?? "",
      entry.location.lat,
      entry.location.lng,
      entry.letzteKontrolleAt ?? "",
      entry.kontrollen.length,
      entry.offeneWartungen
    ])
  );
}
