import { cloneDemoData, defaultRevierId } from "@hege/domain";

export const defaultMembershipId = "member-ausgeher";
export const defaultUserId = "user-steyrer";

export interface DevContext {
  userId: string;
  membershipId: string;
  revierId: string;
}

export function createDemoStore() {
  return cloneDemoData();
}

export function createDevContext(): DevContext {
  return {
    userId: process.env.DEV_USER_ID ?? defaultUserId,
    membershipId: process.env.DEV_MEMBERSHIP_ID ?? defaultMembershipId,
    revierId: process.env.DEV_REVIER_ID ?? defaultRevierId
  };
}
