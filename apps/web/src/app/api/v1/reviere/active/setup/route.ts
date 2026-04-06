import { getRequestContext } from "../../../../../../server/auth/context";
import { parseCompleteRevierSetupPayload } from "../../../../../../server/auth/schemas";
import { jsonError, jsonOk } from "../../../../../../server/http/responses";
import { completeActiveRevierSetup } from "../../../../../../server/modules/public-registration/service";
import { getCurrentAuthContext } from "../../../../../../server/auth/context";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  return handleSetup(request);
}

export async function POST(request: Request) {
  return handleSetup(request);
}

async function handleSetup(request: Request) {
  try {
    const payload = parseCompleteRevierSetupPayload(await readBody(request));
    const context = await getRequestContext();

    await completeActiveRevierSetup(context, payload);

    if (isBrowserFormRequest(request)) {
      return redirectWithCookies("/app");
    }

    return jsonOk(await getCurrentAuthContext());
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
      throw new Error("Der Request-Body muss gueltiges JSON sein.");
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

function redirectWithCookies(location: string) {
  return new Response(null, {
    status: 303,
    headers: {
      location
    }
  });
}
