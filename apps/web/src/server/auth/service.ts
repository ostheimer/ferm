import type {
  AuthContextResponse,
  AuthSessionResponse,
  LoginPayload,
  Membership,
  MembershipSummary,
  RefreshSessionPayload,
  Revier,
  Role,
  User
} from "@hege/domain";
import { demoData } from "@hege/domain";
import { eq, or, sql } from "drizzle-orm";

import { getDb } from "../db/client";
import { isMissingColumnError } from "../db/compat";
import { memberships, reviere, type RevierRecord, users } from "../db/schema";
import { getServerEnv } from "../env";
import { RouteError } from "../http/errors";
import { hashPassword, verifyPassword } from "./passwords";
import { issueSessionTokens, type SessionTokenContext, verifyRefreshToken } from "./tokens";

interface AuthenticatedMembership extends Membership {
  revier: Revier;
}

interface DemoUserRecord extends User {
  passwordHash: string;
}

export async function login(payload: LoginPayload): Promise<AuthSessionResponse> {
  if (getServerEnv().useDemoStore) {
    return loginAgainstDemoStore(payload);
  }

  const normalizedIdentifier = normalizeIdentifier(payload.identifier);
  const user = await loadDbUserByIdentifier(normalizedIdentifier);

  if (!user || !verifyPassword(payload.pin, user.passwordHash)) {
    throw new RouteError("E-Mail, Benutzername oder PIN ist ungueltig.", 401, "unauthenticated");
  }

  const membershipsForUser = await loadMembershipsForUser(user.id);
  const activeMembership = resolveActiveMembership(membershipsForUser, payload.membershipId);

  return buildAuthenticatedSession({
    user,
    activeMembership,
    allMemberships: membershipsForUser
  });
}

export async function refreshSession(payload: RefreshSessionPayload): Promise<AuthSessionResponse> {
  const token = payload.refreshToken;

  if (!token) {
    throw new RouteError("Refresh-Token fehlt.", 401, "unauthenticated");
  }

  const tokenContext = verifyRefreshToken(token);

  if (getServerEnv().useDemoStore) {
    const user = loadDemoUser(tokenContext.userId);
    const membershipsForUser = loadDemoMembershipsForUser(user.id);
    const activeMembership = resolveActiveMembership(membershipsForUser, payload.membershipId ?? tokenContext.membershipId);

    return buildAuthenticatedSession({
      user,
      activeMembership,
      allMemberships: membershipsForUser
    });
  }

  const user = await loadDbUserById(tokenContext.userId);

  if (!user) {
    throw new RouteError("Benutzer wurde nicht gefunden.", 401, "unauthenticated");
  }

  const membershipsForUser = await loadMembershipsForUser(user.id);
  const activeMembership = resolveActiveMembership(membershipsForUser, payload.membershipId ?? tokenContext.membershipId);

  return buildAuthenticatedSession({
    user,
    activeMembership,
    allMemberships: membershipsForUser
  });
}

export async function resolveAuthContext(context: SessionTokenContext): Promise<AuthContextResponse> {
  if (getServerEnv().useDemoStore) {
    const user = loadDemoUser(context.userId);
    const membershipsForUser = loadDemoMembershipsForUser(user.id);
    const activeMembership = resolveActiveMembership(membershipsForUser, context.membershipId);

    return toAuthContextResponse(user, activeMembership, membershipsForUser);
  }

  const user = await loadDbUserById(context.userId);

  if (!user) {
    throw new RouteError("Benutzer wurde nicht gefunden.", 401, "unauthenticated");
  }

  const membershipsForUser = await loadMembershipsForUser(user.id);
  const activeMembership = resolveActiveMembership(membershipsForUser, context.membershipId);

  return toAuthContextResponse(user, activeMembership, membershipsForUser);
}

export function assertRole(role: Role, allowedRoles: Role[]) {
  if (!allowedRoles.includes(role)) {
    throw new RouteError("Diese Aktion ist fuer die aktuelle Rolle nicht erlaubt.", 403, "forbidden");
  }
}

export function getDefaultSeedPassword() {
  return getServerEnv().demoPassword;
}

export function createSeedPasswordHash() {
  return hashPassword(getDefaultSeedPassword());
}

async function loginAgainstDemoStore(payload: LoginPayload): Promise<AuthSessionResponse> {
  const normalizedIdentifier = normalizeIdentifier(payload.identifier);
  const user = loadDemoUserByIdentifier(normalizedIdentifier);

  if (!user || !verifyPassword(payload.pin, user.passwordHash)) {
    throw new RouteError("E-Mail, Benutzername oder PIN ist ungueltig.", 401, "unauthenticated");
  }

  const membershipsForUser = loadDemoMembershipsForUser(user.id);
  const activeMembership = resolveActiveMembership(membershipsForUser, payload.membershipId);

  return buildAuthenticatedSession({
    user,
    activeMembership,
    allMemberships: membershipsForUser
  });
}

async function loadMembershipsForUser(userId: string): Promise<AuthenticatedMembership[]> {
  const db = getDb();
  const rows = await db.select().from(memberships).where(eq(memberships.userId, userId));

  return Promise.all(
    rows.map(async (entry) => {
      const [revier] = await db.select().from(reviere).where(eq(reviere.id, entry.revierId)).limit(1);

      if (!revier) {
        throw new RouteError("Revier wurde nicht gefunden.", 401, "unauthenticated");
      }

      return {
        ...entry,
        revier: mapRevierRecordToDomain(revier)
      };
    })
  );
}

function loadDemoMembershipsForUser(userId: string): AuthenticatedMembership[] {
  return demoData.memberships
    .filter((entry) => entry.userId === userId)
    .map((entry) => {
      const revier = demoData.reviere.find((candidate) => candidate.id === entry.revierId);

      if (!revier) {
        throw new RouteError("Revier wurde nicht gefunden.", 401, "unauthenticated");
      }

      return {
        ...entry,
        revier
      };
    });
}

function resolveActiveMembership(
  membershipsForUser: AuthenticatedMembership[],
  membershipId?: string
): AuthenticatedMembership {
  if (membershipsForUser.length === 0) {
    throw new RouteError("Fuer diesen Benutzer existiert keine aktive Mitgliedschaft.", 403, "forbidden");
  }

  if (membershipId) {
    const match = membershipsForUser.find((entry) => entry.id === membershipId);

    if (!match) {
      throw new RouteError("Die angeforderte Mitgliedschaft gehoert nicht zum Benutzer.", 403, "forbidden");
    }

    return match;
  }

  const [firstMembership] = membershipsForUser;

  if (!firstMembership) {
    throw new RouteError("Fuer diesen Benutzer existiert keine aktive Mitgliedschaft.", 403, "forbidden");
  }

  return firstMembership;
}

function buildAuthenticatedSession({
  user,
  activeMembership,
  allMemberships
}: {
  user: User;
  activeMembership: AuthenticatedMembership;
  allMemberships: AuthenticatedMembership[];
}): AuthSessionResponse {
  const tokens = issueSessionTokens({
    userId: user.id,
    membershipId: activeMembership.id,
    revierId: activeMembership.revierId,
    role: activeMembership.role
  });

  return {
    ...toAuthContextResponse(user, activeMembership, allMemberships),
    tokens
  };
}

function toAuthContextResponse(
  user: User,
  activeMembership: AuthenticatedMembership,
  allMemberships: AuthenticatedMembership[]
): AuthContextResponse {
  return {
    user,
    membership: stripAuthenticatedMembership(activeMembership),
    revier: activeMembership.revier,
    activeRevierId: activeMembership.revierId,
    availableMemberships: allMemberships.map(toMembershipSummary)
  };
}

function stripAuthenticatedMembership(value: AuthenticatedMembership): Membership {
  return {
    id: value.id,
    userId: value.userId,
    revierId: value.revierId,
    role: value.role,
    jagdzeichen: value.jagdzeichen,
    pushEnabled: value.pushEnabled
  };
}

function toMembershipSummary(value: AuthenticatedMembership): MembershipSummary {
  return {
    id: value.id,
    revierId: value.revierId,
    role: value.role,
    jagdzeichen: value.jagdzeichen,
    revierName: value.revier.name
  };
}

function loadDemoUserByIdentifier(identifier: string): DemoUserRecord | undefined {
  return demoUsers.find(
    (entry) => entry.email === identifier || normalizeIdentifier(entry.username ?? "") === identifier
  );
}

function loadDemoUser(userId: string): DemoUserRecord {
  const user = demoUsers.find((entry) => entry.id === userId);

  if (!user) {
    throw new RouteError("Benutzer wurde nicht gefunden.", 401, "unauthenticated");
  }

  return user;
}

function normalizeIdentifier(value: string) {
  return value.trim().toLowerCase();
}

async function loadDbUserByIdentifier(identifier: string): Promise<DbUserRecord | undefined> {
  const db = getDb();

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, identifier), eq(users.username, identifier)))
      .limit(1);

    return user;
  } catch (error) {
    if (!isMissingColumnError(error, "users", "username")) {
      throw error;
    }

    return loadLegacyDbUserByIdentifier(identifier);
  }
}

async function loadDbUserById(userId: string): Promise<DbUserRecord | undefined> {
  const db = getDb();

  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    return user;
  } catch (error) {
    if (!isMissingColumnError(error, "users", "username")) {
      throw error;
    }

    return loadLegacyDbUserById(userId);
  }
}

async function loadLegacyDbUserByIdentifier(identifier: string): Promise<DbUserRecord | undefined> {
  const db = getDb();
  const result = await db.execute(sql<LegacyDbUserRow>`
    select
      id,
      name,
      phone,
      email,
      lower(split_part(email, '@', 1)) as username,
      password_hash as "passwordHash"
    from users
    where lower(email) = ${identifier}
      or lower(split_part(email, '@', 1)) = ${identifier}
    limit 1
  `);
  const row = result.rows[0] as LegacyDbUserRow | undefined;

  return row ? mapLegacyDbUserRow(row) : undefined;
}

async function loadLegacyDbUserById(userId: string): Promise<DbUserRecord | undefined> {
  const db = getDb();
  const result = await db.execute(sql<LegacyDbUserRow>`
    select
      id,
      name,
      phone,
      email,
      lower(split_part(email, '@', 1)) as username,
      password_hash as "passwordHash"
    from users
    where id = ${userId}
    limit 1
  `);
  const row = result.rows[0] as LegacyDbUserRow | undefined;

  return row ? mapLegacyDbUserRow(row) : undefined;
}

function mapLegacyDbUserRow(row: LegacyDbUserRow): DbUserRecord {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    username: normalizeIdentifier(row.username),
    passwordHash: row.passwordHash
  };
}

function mapRevierRecordToDomain(record: RevierRecord): Revier {
  return {
    id: record.id,
    tenantKey: record.tenantKey,
    name: record.name,
    bundesland: record.bundesland,
    bezirk: record.bezirk,
    flaecheHektar: record.flaecheHektar,
    zentrum: {
      lat: record.zentrumLat,
      lng: record.zentrumLng,
      label: record.zentrumLabel ?? undefined
    }
  };
}

const demoUsers: DemoUserRecord[] = demoData.users.map((entry) => ({
  ...entry,
  passwordHash: hashPassword(getDefaultSeedPassword())
}));

type DbUserRecord = typeof users.$inferSelect;

interface LegacyDbUserRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  username: string;
  passwordHash: string;
}
