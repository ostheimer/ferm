import { parsePublicRegistrationPayload } from "../../../../../server/auth/schemas";
import { createCookieHeaders } from "../../../../../server/auth/tokens";
import { jsonError } from "../../../../../server/http/responses";
import { registerPublicAccount } from "../../../../../server/modules/public-registration/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await readBody(request);
    const payload = parsePublicRegistrationPayload(body);
    const session = await registerPublicAccount(payload);

    if (isBrowserFormRequest(request)) {
      return redirectWithCookies("/app/setup", createCookieHeaders(session.tokens));
    }

    return jsonWithCookies(session, createCookieHeaders(session.tokens), 201);
  } catch (error) {
    return jsonError(error);
  }
}

async function readBody(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return await request.json();
    } catch {
      throw new Error("Der Request-Body muss gültiges JSON sein.");
    }
  }

  const formData = await request.formData();
  const body: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    body[key] = value;
  }

  return body;
}

function isBrowserFormRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  return contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data");
}

function redirectWithCookies(location: string, cookieHeaders: string[]) {
  const headers = new Headers({
    location
  });

  for (const value of cookieHeaders) {
    headers.append("set-cookie", value);
  }

  return new Response(null, {
    status: 303,
    headers
  });
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
