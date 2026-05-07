import { getRequestContext } from "../../../../../../server/auth/context";
import { jsonError, jsonOk } from "../../../../../../server/http/responses";
import { revokeMemberInvitation } from "../../../../../../server/modules/invitations/service";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const context = await getRequestContext();
    return jsonOk(await revokeMemberInvitation(context, id));
  } catch (error) {
    return jsonError(error);
  }
}
