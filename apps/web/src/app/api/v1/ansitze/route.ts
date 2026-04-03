import { getRequestContext } from "../../../../server/auth/context";
import { jsonError, jsonOk } from "../../../../server/http/responses";
import { listAnsitze } from "../../../../server/modules/ansitze/queries";
import { startAnsitzSession } from "../../../../server/modules/ansitze/service";
import { parseCreateAnsitzInput } from "../../../../server/modules/ansitze/schemas";

export const dynamic = "force-dynamic";

export async function GET() {
  return jsonOk(await listAnsitze());
}

export async function POST(request: Request) {
  try {
    const payload = parseCreateAnsitzInput(await readJsonBody(request));
    const { membershipId, revierId } = await getRequestContext();

    return jsonOk(
      await startAnsitzSession({
        membershipId,
        revierId,
        ...payload
      }),
      {
        status: 201
      }
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}

async function readJsonBody(request: Request): Promise<unknown> {
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
