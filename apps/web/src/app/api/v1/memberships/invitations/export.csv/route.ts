import { getRequestContext } from "../../../../../../server/auth/context";
import { jsonError } from "../../../../../../server/http/responses";
import { exportMemberInvitationsCsv } from "../../../../../../server/modules/invitations/service";

export const dynamic = "force-dynamic";

/**
 * CSV-Export der Mitglieds-Einladungen. Brauchen Auth-Context, weil die
 * Liste revier-spezifisch ist und die Inviter-Rolle die Sicht steuert.
 */
export async function GET() {
  try {
    const context = await getRequestContext();
    const csv = await exportMemberInvitationsCsv(context);

    return new Response(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": "attachment; filename=mitglieder.csv"
      }
    });
  } catch (error) {
    return jsonError(error);
  }
}
