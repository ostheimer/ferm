import { getRequestContext } from "../../../../server/auth/context";
import { jsonCreated, jsonError, jsonOk } from "../../../../server/http/responses";
import { listSitzungen } from "../../../../server/modules/sitzungen/queries";
import { parseCreateSitzungInput } from "../../../../server/modules/sitzungen/schemas";
import { createSitzung } from "../../../../server/modules/sitzungen/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return jsonOk(await listSitzungen());
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = parseCreateSitzungInput(await readJsonBody(request));
    const context = await getRequestContext();
    const sitzung = await createSitzung({
      revierId: context.revierId,
      membershipId: context.membershipId,
      role: context.role,
      input: payload
    });

    return jsonCreated(sitzung);
  } catch (error) {
    return jsonError(error);
  }
}

async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw Object.assign(new Error("Der Request-Body muss gültiges JSON sein."), {
      status: 400,
      code: "validation-error"
    });
  }
}
