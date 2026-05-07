import type { CreateMemberInvitationPayload } from "@hege/domain";

import { getRequestContext } from "../../../../../server/auth/context";
import { jsonCreated, jsonError, jsonOk } from "../../../../../server/http/responses";
import {
  createMemberInvitation,
  listMemberInvitations
} from "../../../../../server/modules/invitations/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const context = await getRequestContext();
    return jsonOk(await listMemberInvitations(context));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = parsePayload(await readJsonBody(request));
    const context = await getRequestContext();
    const result = await createMemberInvitation({ context, payload });
    return jsonCreated(result);
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

function parsePayload(input: unknown): CreateMemberInvitationPayload {
  if (!input || typeof input !== "object") {
    throw Object.assign(new Error("Einladung muss firstName, lastName, role und jagdzeichen enthalten."), {
      status: 400,
      code: "validation-error"
    });
  }

  const value = input as Record<string, unknown>;

  const firstName = typeof value.firstName === "string" ? value.firstName : "";
  const lastName = typeof value.lastName === "string" ? value.lastName : "";
  const role = typeof value.role === "string" ? value.role : "";
  const jagdzeichen = typeof value.jagdzeichen === "string" ? value.jagdzeichen : "";
  const email = typeof value.email === "string" ? value.email : undefined;
  const phone = typeof value.phone === "string" ? value.phone : undefined;
  const sendEmail = typeof value.sendEmail === "boolean" ? value.sendEmail : false;

  if (!firstName || !lastName || !jagdzeichen || !role) {
    throw Object.assign(new Error("Vorname, Nachname, Rolle und Jagdzeichen sind erforderlich."), {
      status: 400,
      code: "validation-error"
    });
  }

  return {
    firstName,
    lastName,
    email: email?.trim() || undefined,
    phone: phone?.trim() || undefined,
    role: role as CreateMemberInvitationPayload["role"],
    jagdzeichen,
    sendEmail
  };
}
