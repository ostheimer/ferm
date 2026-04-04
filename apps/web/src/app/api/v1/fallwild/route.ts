import { getRequestContext } from "../../../../server/auth/context";
import { jsonError, jsonOk } from "../../../../server/http/responses";
import { listFallwild } from "../../../../server/modules/fallwild/queries";
import { parseCreateFallwildInput } from "../../../../server/modules/fallwild/schemas";
import { createFallwildVorgang } from "../../../../server/modules/fallwild/service";

export const dynamic = "force-dynamic";

export async function GET() {
  return jsonOk(await listFallwild());
}

export async function POST(request: Request) {
  try {
    const payload = parseCreateFallwildInput(await readJsonBody(request));
    const { membershipId, revierId } = await getRequestContext();

    return jsonOk(
      await createFallwildVorgang({
        reportedByMembershipId: membershipId,
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
