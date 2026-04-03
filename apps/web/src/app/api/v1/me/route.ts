import { getCurrentUser } from "../../../../server/modules/me/queries";
import { jsonOk } from "../../../../server/http/responses";

export const dynamic = "force-dynamic";

export async function GET() {
  return jsonOk(await getCurrentUser());
}
