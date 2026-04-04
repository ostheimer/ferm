import { getRefreshTokenFromRequest } from "../../../../../server/auth/context";
import { parseRefreshPayload } from "../../../../../server/auth/schemas";
import { refreshSession } from "../../../../../server/auth/service";
import { createCookieHeaders } from "../../../../../server/auth/tokens";
import { jsonError } from "../../../../../server/http/responses";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = parseRefreshPayload(await readOptionalJsonBody(request));
    const session = await refreshSession({
      ...payload,
      refreshToken: payload.refreshToken ?? (await getRefreshTokenFromRequest())
    });

    return jsonWithCookies(session, createCookieHeaders(session.tokens), 200);
  } catch (error) {
    return jsonError(error);
  }
}

async function readOptionalJsonBody(request: Request): Promise<unknown> {
  const contentLength = request.headers.get("content-length");

  if (contentLength === "0" || contentLength == null) {
    return undefined;
  }

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
