import type {
  AufgabePrioritaet,
  AufgabeStatus,
  GeoPoint,
  ReviermeldungKategorie,
  ReviermeldungStatus,
  RevierResourceType
} from "@hege/domain";

import { validationError } from "../../http/validation";

const REVIERMELDUNG_KATEGORIEN = [
  "fuetterung",
  "wasserung",
  "reviereinrichtung",
  "schaden",
  "gefahr",
  "sichtung",
  "sonstiges"
] as const;
const REVIERMELDUNG_STATUS = ["neu", "geprueft", "in_bearbeitung", "erledigt", "verworfen", "archiviert"] as const;
const AUFGABE_STATUS = ["offen", "angenommen", "in_arbeit", "blockiert", "erledigt", "abgelehnt", "archiviert"] as const;
const AUFGABE_PRIORITAETEN = ["niedrig", "normal", "hoch", "dringend"] as const;
const RESOURCE_TYPES = ["reviermeldung", "reviereinrichtung", "fallwild_vorgang", "sitzung", "beschluss"] as const;

export interface CreateReviermeldungInput {
  category: ReviermeldungKategorie;
  status?: ReviermeldungStatus;
  occurredAt?: string;
  title: string;
  description?: string;
  location?: GeoPoint;
  relatedType?: RevierResourceType;
  relatedId?: string;
}

export interface UpdateReviermeldungInput {
  status?: ReviermeldungStatus;
  title?: string;
  description?: string | null;
  location?: GeoPoint | null;
  relatedType?: RevierResourceType | null;
  relatedId?: string | null;
}

export interface CreateAufgabeInput {
  sourceType?: RevierResourceType;
  sourceId?: string;
  title: string;
  description?: string;
  status?: AufgabeStatus;
  priority?: AufgabePrioritaet;
  dueAt?: string;
  assigneeMembershipIds?: string[];
}

export interface UpdateAufgabeInput {
  title?: string;
  description?: string | null;
  status?: AufgabeStatus;
  priority?: AufgabePrioritaet;
  dueAt?: string | null;
  completionNote?: string | null;
  assigneeMembershipIds?: string[];
}

export function parseCreateReviermeldungInput(body: unknown): CreateReviermeldungInput {
  const data = ensureRecord(body, "Der Request-Body muss ein Objekt sein.");
  const relatedType = parseOptionalEnum(data.relatedType, "relatedType", RESOURCE_TYPES) as RevierResourceType | undefined;
  const relatedId = parseOptionalString(data.relatedId, "relatedId");

  assertRelatedFields(relatedType, relatedId);

  return {
    category: parseEnum(data.category, "category", REVIERMELDUNG_KATEGORIEN) as ReviermeldungKategorie,
    status: parseOptionalEnum(data.status, "status", REVIERMELDUNG_STATUS) as ReviermeldungStatus | undefined,
    occurredAt: parseOptionalIsoString(data.occurredAt, "occurredAt"),
    title: parseRequiredString(data.title, "title"),
    description: parseOptionalString(data.description, "description"),
    location: parseOptionalLocation(data.location, "location"),
    relatedType,
    relatedId
  };
}

export function parseUpdateReviermeldungInput(body: unknown): UpdateReviermeldungInput {
  const data = ensureRecord(body, "Der Request-Body muss ein Objekt sein.");
  const patch: UpdateReviermeldungInput = {};

  if ("status" in data) {
    patch.status = parseEnum(data.status, "status", REVIERMELDUNG_STATUS) as ReviermeldungStatus;
  }
  if ("title" in data) {
    patch.title = parseRequiredString(data.title, "title");
  }
  if ("description" in data) {
    patch.description = parseNullableString(data.description, "description");
  }
  if ("location" in data) {
    patch.location = data.location === null ? null : parseOptionalLocation(data.location, "location");
  }
  if ("relatedType" in data) {
    patch.relatedType =
      data.relatedType === null
        ? null
        : (parseOptionalEnum(data.relatedType, "relatedType", RESOURCE_TYPES) as RevierResourceType | undefined);
  }
  if ("relatedId" in data) {
    patch.relatedId = parseNullableString(data.relatedId, "relatedId");
  }

  assertNonEmptyPatch(patch);
  assertRelatedPatch(patch);
  return patch;
}

export function parseCreateAufgabeInput(body: unknown): CreateAufgabeInput {
  const data = ensureRecord(body, "Der Request-Body muss ein Objekt sein.");
  const sourceType = parseOptionalEnum(data.sourceType, "sourceType", RESOURCE_TYPES) as RevierResourceType | undefined;
  const sourceId = parseOptionalString(data.sourceId, "sourceId");

  assertRelatedFields(sourceType, sourceId, "sourceType", "sourceId");

  return {
    sourceType,
    sourceId,
    title: parseRequiredString(data.title, "title"),
    description: parseOptionalString(data.description, "description"),
    status: parseOptionalEnum(data.status, "status", AUFGABE_STATUS) as AufgabeStatus | undefined,
    priority: parseOptionalEnum(data.priority, "priority", AUFGABE_PRIORITAETEN) as AufgabePrioritaet | undefined,
    dueAt: parseOptionalIsoString(data.dueAt, "dueAt"),
    assigneeMembershipIds: parseOptionalStringArray(data.assigneeMembershipIds, "assigneeMembershipIds")
  };
}

export function parseUpdateAufgabeInput(body: unknown): UpdateAufgabeInput {
  const data = ensureRecord(body, "Der Request-Body muss ein Objekt sein.");
  const patch: UpdateAufgabeInput = {};

  if ("title" in data) {
    patch.title = parseRequiredString(data.title, "title");
  }
  if ("description" in data) {
    patch.description = parseNullableString(data.description, "description");
  }
  if ("status" in data) {
    patch.status = parseEnum(data.status, "status", AUFGABE_STATUS) as AufgabeStatus;
  }
  if ("priority" in data) {
    patch.priority = parseEnum(data.priority, "priority", AUFGABE_PRIORITAETEN) as AufgabePrioritaet;
  }
  if ("dueAt" in data) {
    patch.dueAt = parseNullableIsoString(data.dueAt, "dueAt");
  }
  if ("completionNote" in data) {
    patch.completionNote = parseNullableString(data.completionNote, "completionNote");
  }
  if ("assigneeMembershipIds" in data) {
    patch.assigneeMembershipIds = parseStringArray(data.assigneeMembershipIds, "assigneeMembershipIds");
  }

  assertNonEmptyPatch(patch);
  return patch;
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

function parseNullableString(value: unknown, field: string): string | null {
  if (value == null || value === "") {
    return null;
  }

  return parseRequiredString(value, field);
}

function parseNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw validationError(`${field} muss eine gültige Zahl sein.`);
  }

  return value;
}

function parseOptionalLocation(value: unknown, field: string): GeoPoint | undefined {
  if (value == null || value === "") {
    return undefined;
  }

  const data = ensureRecord(value, `${field} muss ein Objekt sein.`);

  return {
    lat: parseNumber(data.lat, `${field}.lat`),
    lng: parseNumber(data.lng, `${field}.lng`),
    label: parseOptionalString(data.label, `${field}.label`),
    accuracyMeters: parseOptionalPositiveNumber(data.accuracyMeters, `${field}.accuracyMeters`),
    source: data.source === "manual" || data.source === "device-gps" || data.source === "reverse-geocode" ? data.source : undefined,
    addressLabel: parseOptionalString(data.addressLabel, `${field}.addressLabel`),
    placeId: parseOptionalString(data.placeId, `${field}.placeId`)
  };
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

  return parseIsoString(value, field);
}

function parseNullableIsoString(value: unknown, field: string): string | null {
  if (value == null || value === "") {
    return null;
  }

  return parseIsoString(value, field);
}

function parseIsoString(value: unknown, field: string): string {
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
    throw validationError(`${field} ist ungültig.`);
  }

  return value;
}

function parseOptionalEnum(value: unknown, field: string, allowed: readonly string[]): string | undefined {
  if (value == null || value === "") {
    return undefined;
  }

  return parseEnum(value, field, allowed);
}

function parseOptionalStringArray(value: unknown, field: string): string[] | undefined {
  if (value == null) {
    return undefined;
  }

  return parseStringArray(value, field);
}

function parseStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value)) {
    throw validationError(`${field} muss eine Liste sein.`);
  }

  const values = value.map((entry, index) => parseRequiredString(entry, `${field}.${index}`));
  return [...new Set(values)];
}

function assertRelatedFields(
  type: RevierResourceType | undefined,
  id: string | undefined,
  typeField = "relatedType",
  idField = "relatedId"
) {
  if ((type && !id) || (!type && id)) {
    throw validationError(`${typeField} und ${idField} müssen gemeinsam gesetzt werden.`);
  }
}

function assertRelatedPatch(patch: UpdateReviermeldungInput) {
  if (patch.relatedType === null && patch.relatedId && patch.relatedId.length > 0) {
    throw validationError("relatedId kann nicht ohne relatedType gesetzt werden.");
  }
}

function assertNonEmptyPatch(patch: object) {
  if (Object.keys(patch).length === 0) {
    throw validationError("Mindestens ein Feld muss geändert werden.");
  }
}
