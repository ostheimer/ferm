import { getRequestContext } from "../../../../../../server/auth/context";
import { jsonError, jsonOk } from "../../../../../../server/http/responses";
import { parseCreateSitzungVersionInput } from "../../../../../../server/modules/sitzungen/schemas";
import { createSitzungVersion } from "../../../../../../server/modules/sitzungen/service";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = parseCreateSitzungVersionInput(await readJsonBody(request));
    const auth = await getRequestContext();

    return jsonOk(
      await createSitzungVersion({
        sitzungId: id,
        revierId: auth.revierId,
        membershipId: auth.membershipId,
        role: auth.role,
        input: payload
      }),
      { status: 201 }
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
