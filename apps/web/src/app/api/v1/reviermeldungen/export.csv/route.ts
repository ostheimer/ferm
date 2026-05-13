import { getRequestContext } from "../../../../../server/auth/context";
import { assertRole } from "../../../../../server/auth/service";
import { jsonError } from "../../../../../server/http/responses";
import { exportReviermeldungenCsv } from "../../../../../server/modules/revierarbeit/queries";
import { REVIERARBEIT_ALLOWED_ROLES } from "../../../../../server/modules/revierarbeit/service";

export const dynamic = "force-dynamic";

/**
 * CSV-Export der Reviermeldungen. Auth-Context noetig, weil die Liste
 * revier-spezifisch ist. Schriftfuehrung + Revier-Admin sollen Jahres-
 * uebersicht ziehen koennen.
 */
export async function GET() {
  try {
    const context = await getRequestContext();
    assertRole(context.role, [...REVIERARBEIT_ALLOWED_ROLES]);
    const csv = await exportReviermeldungenCsv(context);

    return new Response(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": "attachment; filename=reviermeldungen.csv"
      }
    });
  } catch (error) {
    return jsonError(error);
  }
}
