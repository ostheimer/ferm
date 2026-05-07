import type { AcceptInvitationPayload } from "@hege/domain";

import { jsonError } from "../../../../../../server/http/responses";
import { acceptMemberInvitation } from "../../../../../../server/modules/invitations/service";
import { createCookieHeaders } from "../../../../../../server/auth/tokens";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = parsePayload(await readJsonBody(request));
    const session = await acceptMemberInvitation(payload);

    const headers = new Headers({ "content-type": "application/json" });
    for (const cookie of createCookieHeaders(session.tokens)) {
      headers.append("set-cookie", cookie);
    }

    return new Response(JSON.stringify(session), { status: 201, headers });
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

function parsePayload(input: unknown): AcceptInvitationPayload {
  if (!input || typeof input !== "object") {
    throw Object.assign(new Error("Akzeptanz erwartet code oder token plus PIN."), {
      status: 400,
      code: "validation-error"
    });
  }

  const value = input as Record<string, unknown>;
  const code = typeof value.code === "string" ? value.code.trim() : undefined;
  const token = typeof value.token === "string" ? value.token.trim() : undefined;
  const pin = typeof value.pin === "string" ? value.pin.trim() : "";
  const username = typeof value.username === "string" ? value.username.trim() : undefined;
  const phone = typeof value.phone === "string" ? value.phone.trim() : undefined;

  return {
    code: code || undefined,
    token: token || undefined,
    pin,
    username: username || undefined,
    phone: phone || undefined
  };
}
