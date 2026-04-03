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
    return toErrorResponse(error);
  }
}

async function readJsonBody(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return null;
  }

  try {
    return await request.json();
  } catch {
    throw withStatus("Der Request-Body muss gueltiges JSON sein.", 400);
  }
}

function toErrorResponse(error: unknown) {
  if (error instanceof Error) {
    return jsonError(error.message, getStatusCode(error));
  }

  return jsonError("Interner Serverfehler.", 500);
}

function getStatusCode(error: Error): number {
  if ("status" in error && typeof error.status === "number") {
    return error.status;
  }

  return 400;
}

function withStatus(message: string, status: number) {
  return Object.assign(new Error(message), { status });
}
