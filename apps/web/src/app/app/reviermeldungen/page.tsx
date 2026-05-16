import { getRequestContext } from "../../../server/auth/context";
import { requirePageRoles } from "../../../server/auth/guards";
import { listReviermeldungenForRequest } from "../../../server/modules/revierarbeit/queries";
import { REVIERARBEIT_ALLOWED_ROLES } from "../../../server/modules/revierarbeit/service";

import { ReviermeldungenClient } from "./reviermeldungen-client";

export const dynamic = "force-dynamic";

/**
 * Web-Reviermeldungen-Index. Mobile zeigt "letzte 6" als Aktivitaets-
 * Snapshot, hier sieht Schriftfuehrung den vollen Jahres-Stream incl.
 * Filter, Sort und CSV-Export — die paperwork-orientierte Sicht.
 *
 * Sichtbar fuer dieselben Rollen wie die API.
 */
export default async function ReviermeldungenPage() {
  const auth = await requirePageRoles([...REVIERARBEIT_ALLOWED_ROLES], { next: "/app/reviermeldungen" });
  const context = await getRequestContext();
  const meldungen = await listReviermeldungenForRequest(context);

  return (
    <ReviermeldungenClient
      meldungen={meldungen}
      revierCenter={auth.revier.zentrum}
      revierName={auth.revier.name}
    />
  );
}
