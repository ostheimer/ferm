import { getRequestContext } from "../../../../../server/auth/context";
import { RouteError } from "../../../../../server/http/errors";
import { jsonError, jsonOk } from "../../../../../server/http/responses";
import { getProtokollDetail } from "../../../../../server/modules/protokolle/queries";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await getRequestContext();
    const { id } = await context.params;
    const detail = await getProtokollDetail(id);

    if (!detail) {
      throw new RouteError("Protokoll wurde nicht gefunden.", 404, "not-found");
    }

    return jsonOk(detail);
  } catch (error) {
    return jsonError(error);
  }
}
