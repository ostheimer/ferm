import { getRequestContext } from "../../../../server/auth/context";
import { assertRole } from "../../../../server/auth/service";
import { jsonError, jsonOk } from "../../../../server/http/responses";
import { FALLWILD_ALLOWED_ROLES } from "../../../../server/modules/fallwild/media";
import { listFallwild } from "../../../../server/modules/fallwild/queries";
import { parseCreateFallwildInput } from "../../../../server/modules/fallwild/schemas";
import { createFallwildVorgang } from "../../../../server/modules/fallwild/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const { role } = await getRequestContext();
  assertRole(role, [...FALLWILD_ALLOWED_ROLES]);

  return jsonOk(await listFallwild());
}

export async function POST(request: Request) {
  try {
    const { role, membershipId, revierId } = await getRequestContext();
    assertRole(role, [...FALLWILD_ALLOWED_ROLES]);

    const payload = parseCreateFallwildInput(await readJsonBody(request));

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
    throw Object.assign(new Error("Der Request-Body muss gültiges JSON sein."), {
      status: 400,
      code: "validation-error"
    });
  }
}
