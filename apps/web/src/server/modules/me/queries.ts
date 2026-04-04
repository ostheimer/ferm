import type { AuthContextResponse } from "@hege/domain";

import { getCurrentAuthContext } from "../../auth/context";

export async function getCurrentUser(): Promise<AuthContextResponse> {
  return getCurrentAuthContext();
}
