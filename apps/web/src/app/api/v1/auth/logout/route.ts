import { createExpiredCookieHeaders } from "../../../../../server/auth/tokens";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const redirectUrl = new URL("/login", request.url);
  const headers = new Headers({
    location: redirectUrl.toString()
  });

  for (const value of createExpiredCookieHeaders()) {
    headers.append("set-cookie", value);
  }

  return new Response(null, {
    status: 303,
    headers
  });
}
