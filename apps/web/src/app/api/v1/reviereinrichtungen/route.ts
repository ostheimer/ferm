import { jsonError, jsonOk } from "../../../../server/http/responses";
import { listReviereinrichtungen } from "../../../../server/modules/reviereinrichtungen/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return jsonOk(await listReviereinrichtungen());
  } catch (error) {
    return jsonError(error);
  }
}
