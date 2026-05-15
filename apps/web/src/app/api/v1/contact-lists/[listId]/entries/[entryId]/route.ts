import { getRequestContext } from "../../../../../../../server/auth/context";
import { assertRole } from "../../../../../../../server/auth/service";
import { jsonError, jsonOk } from "../../../../../../../server/http/responses";
import {
  CONTACT_MANAGE_ALLOWED_ROLES,
  deleteContactEntry,
  updateContactEntry
} from "../../../../../../../server/modules/contacts/service";
import { parseUpdateContactEntryInput } from "../../../../../../../server/modules/contacts/schemas";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    listId: string;
    entryId: string;
  }>;
}

export async function PATCH(request: Request, ctx: RouteContext) {
  try {
    const context = await getRequestContext();
    assertRole(context.role, [...CONTACT_MANAGE_ALLOWED_ROLES]);

    const { listId, entryId } = await ctx.params;
    const payload = parseUpdateContactEntryInput(await readJsonBody(request));

    return jsonOk(await updateContactEntry(context, listId, entryId, payload));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, ctx: RouteContext) {
  try {
    const context = await getRequestContext();
    assertRole(context.role, [...CONTACT_MANAGE_ALLOWED_ROLES]);

    const { listId, entryId } = await ctx.params;

    return jsonOk(await deleteContactEntry(context, listId, entryId));
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
