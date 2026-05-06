import { getRequestContext } from "../../../../../server/auth/context";
import { assertRole } from "../../../../../server/auth/service";
import { jsonError, jsonOk } from "../../../../../server/http/responses";
import { getReviermeldungForRequest } from "../../../../../server/modules/revierarbeit/queries";
import {
  REVIERARBEIT_ALLOWED_ROLES,
  updateReviermeldung
} from "../../../../../server/modules/revierarbeit/service";
import { parseUpdateReviermeldungInput } from "../../../../../server/modules/revierarbeit/schemas";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const requestContext = await getRequestContext();
    assertRole(requestContext.role, [...REVIERARBEIT_ALLOWED_ROLES]);

    const { id } = await context.params;
    return jsonOk(await getReviermeldungForRequest(id, requestContext));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const requestContext = await getRequestContext();
    assertRole(requestContext.role, [...REVIERARBEIT_ALLOWED_ROLES]);

    const { id } = await context.params;
    const payload = parseUpdateReviermeldungInput(await readJsonBody(request));

    return jsonOk(await updateReviermeldung(requestContext, id, payload));
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
