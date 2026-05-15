import { validationError } from "../../http/validation";

export interface CreateContactListInput {
  title: string;
}

export interface UpdateContactListInput {
  title?: string;
}

export interface CreateContactEntryInput {
  membershipId?: string;
  name?: string;
  phone?: string;
  revier?: string;
  funktion?: string;
  note?: string;
}

export interface UpdateContactEntryInput {
  membershipId?: string | null;
  name?: string;
  phone?: string;
  revier?: string | null;
  funktion?: string | null;
  note?: string | null;
}

export function parseCreateContactListInput(body: unknown): CreateContactListInput {
  const data = ensureRecord(body);

  return {
    title: parseRequiredString(data.title, "title")
  };
}

export function parseUpdateContactListInput(body: unknown): UpdateContactListInput {
  const data = ensureRecord(body);

  return {
    title: parseOptionalString(data.title, "title")
  };
}

export function parseCreateContactEntryInput(body: unknown): CreateContactEntryInput {
  const data = ensureRecord(body);

  return {
    membershipId: parseOptionalString(data.membershipId, "membershipId"),
    name: parseOptionalString(data.name, "name"),
    phone: parseOptionalString(data.phone, "phone"),
    revier: parseOptionalString(data.revier, "revier"),
    funktion: parseOptionalString(data.funktion, "funktion"),
    note: parseOptionalString(data.note, "note")
  };
}

export function parseUpdateContactEntryInput(body: unknown): UpdateContactEntryInput {
  const data = ensureRecord(body);

  return {
    membershipId: parseOptionalNullableString(data.membershipId, "membershipId"),
    name: parseOptionalString(data.name, "name"),
    phone: parseOptionalString(data.phone, "phone"),
    revier: parseOptionalNullableString(data.revier, "revier"),
    funktion: parseOptionalNullableString(data.funktion, "funktion"),
    note: parseOptionalNullableString(data.note, "note")
  };
}

function ensureRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw validationError("Der Request-Body muss ein Objekt sein.");
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
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw validationError(`${field} muss ein String sein.`);
  }

  const trimmed = value.trim();
  return trimmed || undefined;
}

function parseOptionalNullableString(value: unknown, field: string): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw validationError(`${field} muss ein String sein.`);
  }

  const trimmed = value.trim();
  return trimmed || null;
}
