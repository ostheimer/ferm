import { listLiveAnsitze } from "../../server/modules/ansitze/queries";
import { requirePageAuth } from "../../server/auth/guards";
import { AnsitzeClient, type AnsitzeClientEntry } from "./ansitze-client";

export const dynamic = "force-dynamic";

export default async function AnsitzePage() {
  await requirePageAuth();
  const activeAnsitze = (await listLiveAnsitze()).map((entry) => toAnsitzeClientEntry(entry));

  return <AnsitzeClient activeAnsitze={activeAnsitze} />;
}

function toAnsitzeClientEntry(entry: Awaited<ReturnType<typeof listLiveAnsitze>>[number]): AnsitzeClientEntry {
  return {
    ...entry,
    startedAtLabel: formatDateTime(entry.startedAt),
    plannedEndAtLabel: entry.plannedEndAt ? formatDateTime(entry.plannedEndAt) : "Offen"
  };
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("de-AT", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "Europe/Vienna"
  }).format(new Date(value));
}
