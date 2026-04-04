import { getRequestContext } from "../../../../../server/auth/context";
import { jsonError, jsonOk } from "../../../../../server/http/responses";
import { getSitzungById } from "../../../../../server/modules/sitzungen/queries";
import { parseUpdateSitzungInput } from "../../../../../server/modules/sitzungen/schemas";
import { updateSitzung } from "../../../../../server/modules/sitzungen/service";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const sitzung = await getSitzungById(id);

    if (!sitzung) {
      throw Object.assign(new Error("Sitzung wurde nicht gefunden."), {
        status: 404,
        code: "not-found"
      });
    }

    return jsonOk(sitzung);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = parseUpdateSitzungInput(await readJsonBody(request));
    const auth = await getRequestContext();

    return jsonOk(
      await updateSitzung({
        sitzungId: id,
        revierId: auth.revierId,
        membershipId: auth.membershipId,
        role: auth.role,
        input: payload
      })
    );
  } catch (error) {
    return jsonError(error);
  }
}

async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw Object.assign(new Error("Der Request-Body muss gueltiges JSON sein."), {
      status: 400,
      code: "validation-error"
    });
  }
}
