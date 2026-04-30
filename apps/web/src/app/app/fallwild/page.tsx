import { requirePageAuth } from "../../../server/auth/guards";
import { listFallwild } from "../../../server/modules/fallwild/queries";
import { FallwildClient, type FallwildClientEntry } from "../../fallwild/fallwild-client";

export const dynamic = "force-dynamic";

export default async function FallwildPage() {
  await requirePageAuth({ next: "/app/fallwild" });
  const entries = (await listFallwild()).map((entry) => toFallwildClientEntry(entry));

  return <FallwildClient entries={entries} />;
}

function toFallwildClientEntry(entry: Awaited<ReturnType<typeof listFallwild>>[number]): FallwildClientEntry {
  return {
    ...entry,
    addressLabel: entry.location.addressLabel ?? "",
    locationLabel: entry.location.label ?? "ohne Lagebezeichnung",
    roadKilometerLabel: entry.roadReference?.roadKilometer
      ? `Straßenkilometer ${entry.roadReference.roadKilometer}`
      : "",
    recordedAtLabel: formatDateTime(entry.recordedAt),
    streetLabel: entry.strasse ?? "ohne Straße"
  };
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("de-AT", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "Europe/Vienna"
  }).format(new Date(value));
}
