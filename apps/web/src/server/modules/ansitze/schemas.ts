import { validationError } from "../../http/validation";

export interface CreateAnsitzInput {
  location: {
    label?: string;
    lat: number;
    lng: number;
  };
  note?: string;
  plannedEndAt?: string;
  standortId?: string;
  standortName: string;
  startedAt?: string;
}

export interface EndAnsitzInput {
  endedAt?: string;
}

export function parseCreateAnsitzInput(body: unknown): CreateAnsitzInput {
  const data = ensureRecord(body, "Der Request-Body muss ein Objekt sein.");

  return {
    standortId: parseOptionalString(data.standortId, "standortId"),
    standortName: parseRequiredString(data.standortName, "standortName"),
    location: parseLocation(data.location),
    startedAt: parseOptionalIsoString(data.startedAt, "startedAt"),
    plannedEndAt: parseOptionalIsoString(data.plannedEndAt, "plannedEndAt"),
    note: parseOptionalString(data.note, "note")
  };
}

export function parseEndAnsitzInput(body: unknown): EndAnsitzInput {
  if (body == null) {
    return {};
  }

  const data = ensureRecord(body, "Der Request-Body muss ein Objekt sein.");

  return {
    endedAt: parseOptionalIsoString(data.endedAt, "endedAt")
  };
}

function parseLocation(value: unknown): CreateAnsitzInput["location"] {
  const data = ensureRecord(value, "location muss ein Objekt sein.");

  return {
    lat: parseNumber(data.lat, "location.lat"),
    lng: parseNumber(data.lng, "location.lng"),
    label: parseOptionalString(data.label, "location.label")
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

function parseNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw validationError(`${field} muss eine gueltige Zahl sein.`);
  }

  return value;
}

function parseOptionalIsoString(value: unknown, field: string): string | undefined {
  if (value == null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw validationError(`${field} muss ein ISO-Datum als String sein.`);
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.valueOf())) {
    throw validationError(`${field} muss ein gueltiges Datum sein.`);
  }

  return parsed.toISOString();
}
