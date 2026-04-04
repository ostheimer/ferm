import { validationError } from "../../http/validation";

export interface SitzungParticipantInput {
  membershipId: string;
  anwesend: boolean;
}

export interface BeschlussInput {
  title: string;
  decision: string;
  owner?: string;
  dueAt?: string;
}

export interface CreateSitzungInput {
  title: string;
  scheduledAt: string;
  locationLabel: string;
  participants: SitzungParticipantInput[];
}

export interface UpdateSitzungInput extends CreateSitzungInput {}

export interface CreateSitzungVersionInput {
  summary: string;
  agenda: string[];
  beschluesse: BeschlussInput[];
}

export function parseCreateSitzungInput(body: unknown): CreateSitzungInput {
  const data = ensureRecord(body, "Der Request-Body muss ein Objekt sein.");

  return {
    title: parseRequiredString(data.title, "title"),
    scheduledAt: parseRequiredDateString(data.scheduledAt, "scheduledAt"),
    locationLabel: parseRequiredString(data.locationLabel, "locationLabel"),
    participants: parseParticipants(data.participants)
  };
}

export function parseUpdateSitzungInput(body: unknown): UpdateSitzungInput {
  return parseCreateSitzungInput(body);
}

export function parseCreateSitzungVersionInput(body: unknown): CreateSitzungVersionInput {
  const data = ensureRecord(body, "Der Request-Body muss ein Objekt sein.");

  return {
    summary: parseRequiredString(data.summary, "summary"),
    agenda: parseStringArray(data.agenda, "agenda"),
    beschluesse: parseBeschluesse(data.beschluesse)
  };
}

function parseParticipants(value: unknown): SitzungParticipantInput[] {
  if (!Array.isArray(value)) {
    throw validationError("participants muss ein Array sein.");
  }

  return value.map((entry, index) => {
    const data = ensureRecord(entry, `participants[${index}] muss ein Objekt sein.`);

    if (typeof data.anwesend !== "boolean") {
      throw validationError(`participants[${index}].anwesend muss boolean sein.`);
    }

    return {
      membershipId: parseRequiredString(data.membershipId, `participants[${index}].membershipId`),
      anwesend: data.anwesend
    };
  });
}

function parseBeschluesse(value: unknown): BeschlussInput[] {
  if (!Array.isArray(value)) {
    throw validationError("beschluesse muss ein Array sein.");
  }

  return value.map((entry, index) => {
    const data = ensureRecord(entry, `beschluesse[${index}] muss ein Objekt sein.`);

    return {
      title: parseRequiredString(data.title, `beschluesse[${index}].title`),
      decision: parseRequiredString(data.decision, `beschluesse[${index}].decision`),
      owner: parseOptionalString(data.owner, `beschluesse[${index}].owner`),
      dueAt: parseOptionalDateString(data.dueAt, `beschluesse[${index}].dueAt`)
    };
  });
}

function parseStringArray(value: unknown, field: string) {
  if (!Array.isArray(value)) {
    throw validationError(`${field} muss ein Array sein.`);
  }

  return value.map((entry, index) => parseRequiredString(entry, `${field}[${index}]`));
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

function parseRequiredDateString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw validationError(`${field} muss ein ISO-Datum als String sein.`);
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.valueOf())) {
    throw validationError(`${field} muss ein gueltiges Datum sein.`);
  }

  return parsed.toISOString();
}

function parseOptionalDateString(value: unknown, field: string): string | undefined {
  if (value == null || value === "") {
    return undefined;
  }

  return parseRequiredDateString(value, field);
}
