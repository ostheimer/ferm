import { getRequestContext } from "../../../../server/auth/context";
import { assertRole } from "../../../../server/auth/service";
import { jsonError, jsonOk } from "../../../../server/http/responses";
import {
  CONTACT_MANAGE_ALLOWED_ROLES,
  CONTACT_READ_ALLOWED_ROLES,
  createContactList,
  listContactDirectory
} from "../../../../server/modules/contacts/service";
import { parseCreateContactListInput } from "../../../../server/modules/contacts/schemas";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const context = await getRequestContext();
    assertRole(context.role, [...CONTACT_READ_ALLOWED_ROLES]);

    return jsonOk(await listContactDirectory(context));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await getRequestContext();
    assertRole(context.role, [...CONTACT_MANAGE_ALLOWED_ROLES]);

    const payload = parseCreateContactListInput(await readJsonBody(request));

    return jsonOk(await createContactList(context, payload), { status: 201 });
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
