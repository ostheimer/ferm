import { getRequestContext } from "../../../../../../server/auth/context";
import { jsonError, jsonOk } from "../../../../../../server/http/responses";
import { endAnsitzSession } from "../../../../../../server/modules/ansitze/service";
import { parseEndAnsitzInput } from "../../../../../../server/modules/ansitze/schemas";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const body = await readJsonBody(request);
    const payload = parseEndAnsitzInput(body);
    const { id } = await context.params;
    const { revierId } = await getRequestContext();

    return jsonOk(
      await endAnsitzSession({
        ansitzId: id,
        revierId,
        ...payload
      })
    );
  } catch (error) {
    return jsonError(error);
  }
}

async function readJsonBody(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return null;
  }

  try {
    return await request.json();
  } catch {
    throw Object.assign(new Error("Der Request-Body muss gültiges JSON sein."), {
      status: 400,
      code: "validation-error"
    });
  }
}
