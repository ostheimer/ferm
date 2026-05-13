import { getRequestContext } from "../../../server/auth/context";
import { requirePageRoles } from "../../../server/auth/guards";
import { listAufgabenForRequest } from "../../../server/modules/revierarbeit/queries";
import { REVIERARBEIT_ALLOWED_ROLES } from "../../../server/modules/revierarbeit/service";

import { AufgabenClient } from "./aufgaben-client";

export const dynamic = "force-dynamic";

/**
 * Web-Aufgaben-Liste. Die API gibt es seit Tag 1, aber die UI fehlte —
 * Mobile-User konnten Aufgaben sehen + bearbeiten, Web-User nicht.
 *
 * Sichtbar fuer dieselben Rollen, die die API/Mutationen erlaubt
 * (alle vier — jaeger, ausgeher, schriftfuehrer, revier-admin). Daten
 * werden von `listAufgabenForRequest` geliefert, das die revier-
 * spezifische Sicht kapselt (Demo-Store-Fallback inklusive).
 */
export default async function AufgabenPage() {
  await requirePageRoles([...REVIERARBEIT_ALLOWED_ROLES], { next: "/app/aufgaben" });
  const context = await getRequestContext();
  const aufgaben = await listAufgabenForRequest(context);

  return <AufgabenClient aufgaben={aufgaben} />;
}
