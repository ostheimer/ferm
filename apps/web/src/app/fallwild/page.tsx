import { listFallwild } from "../../server/modules/fallwild/queries";
import { FallwildClient, type FallwildClientEntry } from "./fallwild-client";

export const dynamic = "force-dynamic";

export default async function FallwildPage() {
  const entries = (await listFallwild()).map((entry) => toFallwildClientEntry(entry));

  return <FallwildClient entries={entries} />;
}

function toFallwildClientEntry(entry: Awaited<ReturnType<typeof listFallwild>>[number]): FallwildClientEntry {
  return {
    ...entry,
    locationLabel: entry.location.label ?? "ohne Lagebezeichnung",
    recordedAtLabel: formatDateTime(entry.recordedAt),
    streetLabel: entry.strasse ?? "ohne Strasse"
  };
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("de-AT", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "Europe/Vienna"
  }).format(new Date(value));
}
