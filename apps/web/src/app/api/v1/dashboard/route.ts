import { jsonError, jsonOk } from "../../../../server/http/responses";
import { getDashboardSnapshot } from "../../../../server/modules/dashboard/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return jsonOk(await getDashboardSnapshot());
  } catch (error) {
    return jsonError(error);
  }
}
