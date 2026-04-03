import type { Altersklasse, BergungsStatus, Geschlecht, Wildart } from "@hege/domain";

const WILDART_VALUES = ["Reh", "Rotwild", "Schwarzwild", "Fuchs", "Dachs", "Hase", "Muffelwild"] as const;
const GESCHLECHT_VALUES = ["maennlich", "weiblich", "unbekannt"] as const;
const ALTERSKLASSE_VALUES = ["Kitz", "Jaehrling", "Adult", "unbekannt"] as const;
const BERGUNGSSTATUS_VALUES = ["erfasst", "geborgen", "entsorgt", "an-behoerde-gemeldet"] as const;

export interface CreateFallwildInput {
  recordedAt?: string;
  location: {
    label?: string;
    lat: number;
    lng: number;
  };
  wildart: Wildart;
  geschlecht: Geschlecht;
  altersklasse: Altersklasse;
  bergungsStatus: BergungsStatus;
  gemeinde: string;
  strasse?: string;
  note?: string;
}

export function parseCreateFallwildInput(body: unknown): CreateFallwildInput {
  const data = ensureRecord(body, "Der Request-Body muss ein Objekt sein.");

  return {
    recordedAt: parseOptionalIsoString(data.recordedAt, "recordedAt"),
    location: parseLocation(data.location),
    wildart: parseEnum(data.wildart, "wildart", WILDART_VALUES) as Wildart,
    geschlecht: parseEnum(data.geschlecht, "geschlecht", GESCHLECHT_VALUES) as Geschlecht,
    altersklasse: parseEnum(data.altersklasse, "altersklasse", ALTERSKLASSE_VALUES) as Altersklasse,
    bergungsStatus: parseEnum(data.bergungsStatus, "bergungsStatus", BERGUNGSSTATUS_VALUES) as BergungsStatus,
    gemeinde: parseRequiredString(data.gemeinde, "gemeinde"),
    strasse: parseOptionalString(data.strasse, "strasse"),
    note: parseOptionalString(data.note, "note")
  };
}

function parseLocation(value: unknown): CreateFallwildInput["location"] {
  const data = ensureRecord(value, "location muss ein Objekt sein.");

  return {
    lat: parseNumber(data.lat, "location.lat"),
    lng: parseNumber(data.lng, "location.lng"),
    label: parseOptionalString(data.label, "location.label")
  };
}

function ensureRecord(value: unknown, message: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(message);
  }

  return value as Record<string, unknown>;
}

function parseRequiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} muss ein nicht-leerer String sein.`);
  }

  return value.trim();
}

function parseOptionalString(value: unknown, field: string): string | undefined {
  if (value == null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`${field} muss ein String sein.`);
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${field} muss eine gueltige Zahl sein.`);
  }

  return value;
}

function parseOptionalIsoString(value: unknown, field: string): string | undefined {
  if (value == null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`${field} muss ein ISO-Datum als String sein.`);
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.valueOf())) {
    throw new Error(`${field} muss ein gueltiges Datum sein.`);
  }

  return parsed.toISOString();
}

function parseEnum(value: unknown, field: string, allowed: readonly string[]): string {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new Error(`${field} ist ungueltig.`);
  }

  return value;
}
