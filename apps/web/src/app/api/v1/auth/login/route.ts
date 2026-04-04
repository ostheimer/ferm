import { login } from "../../../../../server/auth/service";
import { parseLoginPayload } from "../../../../../server/auth/schemas";
import { createCookieHeaders } from "../../../../../server/auth/tokens";
import { jsonError } from "../../../../../server/http/responses";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = parseLoginPayload(await readJsonBody(request));
    const session = await login(payload);

    return jsonWithCookies(session, createCookieHeaders(session.tokens), 200);
  } catch (error) {
    return jsonError(error);
  }
}

async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new Error("Der Request-Body muss gueltiges JSON sein.");
  }
}

function jsonWithCookies(data: unknown, cookieHeaders: string[], status: number) {
  const headers = new Headers({
    "content-type": "application/json"
  });

  for (const value of cookieHeaders) {
    headers.append("set-cookie", value);
  }

  return new Response(JSON.stringify(data), {
    status,
    headers
  });
}
