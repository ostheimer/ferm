import { getRequestContext } from "../../../../server/auth/context";
import { assertRole } from "../../../../server/auth/service";
import { jsonError, jsonOk } from "../../../../server/http/responses";
import { listReviermeldungenForRequest } from "../../../../server/modules/revierarbeit/queries";
import {
  REVIERARBEIT_ALLOWED_ROLES,
  createReviermeldung
} from "../../../../server/modules/revierarbeit/service";
import { parseCreateReviermeldungInput } from "../../../../server/modules/revierarbeit/schemas";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const context = await getRequestContext();
    assertRole(context.role, [...REVIERARBEIT_ALLOWED_ROLES]);

    return jsonOk(await listReviermeldungenForRequest(context));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await getRequestContext();
    assertRole(context.role, [...REVIERARBEIT_ALLOWED_ROLES]);

    const payload = parseCreateReviermeldungInput(await readJsonBody(request));

    return jsonOk(await createReviermeldung(context, payload), { status: 201 });
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
