import type { AuthContextResponse, Role } from "@hege/domain";
import { redirect } from "next/navigation";

import { getOptionalAuthContext } from "./context";

export async function requirePageAuth(): Promise<AuthContextResponse> {
  const context = await getOptionalAuthContext();

  if (!context) {
    redirect("/login");
  }

  return context;
}

export async function requirePageRoles(allowedRoles: Role[]): Promise<AuthContextResponse> {
  const context = await requirePageAuth();

  if (!allowedRoles.includes(context.membership.role)) {
    redirect("/");
  }

  return context;
}

export async function redirectAuthenticatedUser(target = "/") {
  const context = await getOptionalAuthContext();

  if (context) {
    redirect(target);
  }
}
