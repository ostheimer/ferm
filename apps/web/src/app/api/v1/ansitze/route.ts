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
