import { demoData, type ReviereinrichtungListItem } from "@hege/domain";

import { getRequestContext } from "../../auth/context";
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
