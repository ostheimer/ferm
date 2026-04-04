import { getRequestContext } from "../../../../server/auth/context";
import { jsonError, jsonOk } from "../../../../server/http/responses";
import { listProtokolle } from "../../../../server/modules/protokolle/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await getRequestContext();
    return jsonOk(await listProtokolle());
  } catch (error) {
    return jsonError(error);
  }
}
