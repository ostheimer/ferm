import { getRequestContext } from "../../../../../../server/auth/context";
import { jsonError, jsonOk } from "../../../../../../server/http/responses";
import { freigebenSitzung } from "../../../../../../server/modules/sitzungen/service";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const auth = await getRequestContext();

    return jsonOk(
      await freigebenSitzung({
        sitzungId: id,
        revierId: auth.revierId,
        membershipId: auth.membershipId,
        role: auth.role
      })
    );
  } catch (error) {
    return jsonError(error);
  }
}
