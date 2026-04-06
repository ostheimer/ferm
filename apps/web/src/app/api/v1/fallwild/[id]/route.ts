import { getRequestContext } from "../../../../../server/auth/context";
import { assertRole } from "../../../../../server/auth/service";
import { RouteError } from "../../../../../server/http/errors";
import { jsonError, jsonOk } from "../../../../../server/http/responses";
import { FALLWILD_ALLOWED_ROLES } from "../../../../../server/modules/fallwild/media";
import { getFallwildById } from "../../../../../server/modules/fallwild/queries";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { role } = await getRequestContext();
    assertRole(role, [...FALLWILD_ALLOWED_ROLES]);

    const { id } = await context.params;
    const entry = await getFallwildById(id);

    if (!entry) {
      throw new RouteError("Fallwild-Vorgang wurde nicht gefunden.", 404, "not-found");
    }

    return jsonOk(entry);
  } catch (error) {
    return jsonError(error);
  }
}
