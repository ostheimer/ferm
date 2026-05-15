import { getRequestContext } from "../../../../../../server/auth/context";
import { assertRole } from "../../../../../../server/auth/service";
import { jsonError, jsonOk } from "../../../../../../server/http/responses";
import {
  CONTACT_MANAGE_ALLOWED_ROLES,
  createContactEntry
} from "../../../../../../server/modules/contacts/service";
import { parseCreateContactEntryInput } from "../../../../../../server/modules/contacts/schemas";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ listId: string }>;
}

export async function POST(request: Request, ctx: RouteContext) {
  try {
    const context = await getRequestContext();
    assertRole(context.role, [...CONTACT_MANAGE_ALLOWED_ROLES]);

    const { listId } = await ctx.params;
    const payload = parseCreateContactEntryInput(await readJsonBody(request));

    return jsonOk(await createContactEntry(context, listId, payload), { status: 201 });
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
