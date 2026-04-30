import type {
  Altersklasse,
  BergungsStatus,
  FallwildRoadReference,
  GeoPoint,
  Geschlecht,
  LocationSource,
  RoadKilometerSource,
  Wildart
} from "@hege/domain";

import { validationError } from "../../http/validation";

const WILDART_VALUES = ["Reh", "Rotwild", "Schwarzwild", "Fuchs", "Dachs", "Hase", "Muffelwild"] as const;
const GESCHLECHT_VALUES = ["maennlich", "weiblich", "unbekannt"] as const;
const ALTERSKLASSE_VALUES = ["Kitz", "Jaehrling", "Adult", "unbekannt"] as const;
const BERGUNGSSTATUS_VALUES = ["erfasst", "geborgen", "entsorgt", "an-behoerde-gemeldet"] as const;

export interface CreateFallwildInput {
  recordedAt?: string;
  location: GeoPoint;
  wildart: Wildart;
  geschlecht: Geschlecht;
  altersklasse: Altersklasse;
  bergungsStatus: BergungsStatus;
  gemeinde: string;
  strasse?: string;
  roadReference?: FallwildRoadReference;
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
    roadReference: parseRoadReference(data.roadReference),
    note: parseOptionalString(data.note, "note")
  };
}

function parseLocation(value: unknown): CreateFallwildInput["location"] {
  const data = ensureRecord(value, "location muss ein Objekt sein.");

  return {
    lat: parseNumber(data.lat, "location.lat"),
    lng: parseNumber(data.lng, "location.lng"),
    label: parseOptionalString(data.label, "location.label"),
    accuracyMeters: parseOptionalPositiveNumber(data.accuracyMeters, "location.accuracyMeters"),
    source: parseOptionalLocationSource(data.source, "location.source"),
    addressLabel: parseOptionalString(data.addressLabel, "location.addressLabel"),
    placeId: parseOptionalString(data.placeId, "location.placeId")
  };
}

function parseRoadReference(value: unknown): FallwildRoadReference | undefined {
  if (value == null || value === "") {
    return undefined;
  }

  const data = ensureRecord(value, "roadReference muss ein Objekt sein.");
  const roadReference: FallwildRoadReference = {
    roadName: parseOptionalString(data.roadName, "roadReference.roadName"),
    roadKilometer: parseOptionalString(data.roadKilometer, "roadReference.roadKilometer"),
    source: parseOptionalRoadKilometerSource(data.source, "roadReference.source"),
    placeId: parseOptionalString(data.placeId, "roadReference.placeId")
  };

  return roadReference.roadName || roadReference.roadKilometer || roadReference.source || roadReference.placeId
    ? roadReference
    : undefined;
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
    throw validationError(`${field} muss eine gültige Zahl sein.`);
  }

  return value;
}

function parseOptionalPositiveNumber(value: unknown, field: string): number | undefined {
  if (value == null || value === "") {
    return undefined;
  }

  const parsed = parseNumber(value, field);

  if (parsed < 0) {
    throw validationError(`${field} muss positiv sein.`);
  }

  return parsed;
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
    throw validationError(`${field} muss ein gültiges Datum sein.`);
  }

  return parsed.toISOString();
}

function parseEnum(value: unknown, field: string, allowed: readonly string[]): string {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw validationError(`${field} ist ungueltig.`);
  }

  return value;
}

function parseOptionalLocationSource(value: unknown, field: string): LocationSource | undefined {
  if (value == null || value === "") {
    return undefined;
  }

  return parseEnum(value, field, ["manual", "device-gps", "reverse-geocode"]) as LocationSource;
}

function parseOptionalRoadKilometerSource(value: unknown, field: string): RoadKilometerSource | undefined {
  if (value == null || value === "") {
    return undefined;
  }

  return parseEnum(value, field, ["manual", "gip", "unavailable"]) as RoadKilometerSource;
}
