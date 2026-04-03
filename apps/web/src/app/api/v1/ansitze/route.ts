import { listAnsitze } from "../../../../server/modules/ansitze/queries";
import { jsonOk } from "../../../../server/http/responses";

export const dynamic = "force-dynamic";

export async function GET() {
  return jsonOk(await listAnsitze());
}
