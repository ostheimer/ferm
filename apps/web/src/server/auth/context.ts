import { createDevContext } from "../demo-store";

export interface RequestContext {
  userId: string;
  membershipId: string;
  revierId: string;
}

export async function getRequestContext(): Promise<RequestContext> {
  return createDevContext();
}
