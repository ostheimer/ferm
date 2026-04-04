import type { LoginPayload, RefreshSessionPayload } from "@hege/domain";

import { validationError } from "../http/validation";

export function parseLoginPayload(body: unknown): LoginPayload {
  const data = ensureRecord(body, "Der Request-Body muss ein Objekt sein.");

  return {
    email: parseRequiredString(data.email, "email").toLowerCase(),
    password: parseRequiredString(data.password, "password"),
    membershipId: parseOptionalString(data.membershipId, "membershipId")
  };
}

export function parseRefreshPayload(body: unknown): RefreshSessionPayload {
  if (body == null) {
    return {};
  }

  const data = ensureRecord(body, "Der Request-Body muss ein Objekt sein.");

  return {
    refreshToken: parseOptionalString(data.refreshToken, "refreshToken"),
    membershipId: parseOptionalString(data.membershipId, "membershipId")
  };
}

function ensureRecord(value: unknown, message: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw validationError(message);
  }

  return value as Record<string, unknown>;
}

function parseRequiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw validationError(`${field} muss ein nicht-leerer String sein.`);
  }

  return value.trim();
}

function parseOptionalString(value: unknown, field: string): string | undefined {
  if (value == null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw validationError(`${field} muss ein String sein.`);
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
