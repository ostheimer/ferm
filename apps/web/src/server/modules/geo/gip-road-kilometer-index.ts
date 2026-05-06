import { readFile } from "node:fs/promises";

export interface GipRoadKilometerIndexEntry {
  lat: number;
  lng: number;
  roadName: string;
  roadKilometer: string;
  placeId?: string;
  roadCode?: string;
}

export interface GipRoadKilometerIndexSuggestion {
  roadName?: string;
  roadKilometer?: string;
  placeId?: string;
  warnings?: string[];
}

interface ResolveRoadKilometerInput {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  roadNameHint?: string;
}

interface CreateGipRoadKilometerIndexResolverOptions {
  indexPath: string;
  maxDistanceMeters: number;
  readFileImpl?: (path: string, encoding: BufferEncoding) => Promise<string>;
}

interface CreateGipRoadKilometerStaticIndexResolverOptions {
  entries: GipRoadKilometerIndexEntry[];
  maxDistanceMeters: number;
}

const ROAD_NAME_KEYS = [
  "roadName",
  "road_name",
  "FEATURENAME",
  "featureName",
  "strasse",
  "straße",
  "STRASSE",
  "NAME"
] as const;

const ROAD_KILOMETER_KEYS = ["roadKilometer", "road_kilometer", "FROMKM", "fromKm", "km", "KM"] as const;
const PLACE_ID_KEYS = ["placeId", "place_id", "OBJECTID", "objectId", "EDGE_OBJECTID", "edgeObjectId"] as const;

export function createGipRoadKilometerIndexResolver({
  indexPath,
  maxDistanceMeters,
  readFileImpl = readFile
}: CreateGipRoadKilometerIndexResolverOptions) {
  let entriesPromise: Promise<GipRoadKilometerIndexEntry[]> | undefined;

  return {
    async resolveRoadKilometer(input: ResolveRoadKilometerInput): Promise<GipRoadKilometerIndexSuggestion | undefined> {
      entriesPromise ??= loadGipRoadKilometerIndex(indexPath, readFileImpl);
      const entries = await entriesPromise;

      return resolveRoadKilometerFromIndex(input, entries, maxDistanceMeters);
    }
  };
}

export function createGipRoadKilometerStaticIndexResolver({
  entries,
  maxDistanceMeters
}: CreateGipRoadKilometerStaticIndexResolverOptions) {
  return {
    async resolveRoadKilometer(input: ResolveRoadKilometerInput): Promise<GipRoadKilometerIndexSuggestion | undefined> {
      return resolveRoadKilometerFromIndex(input, entries, maxDistanceMeters);
    }
  };
}

export async function loadGipRoadKilometerIndex(
  indexPath: string,
  readFileImpl: (path: string, encoding: BufferEncoding) => Promise<string> = readFile
) {
  const payload = JSON.parse(await readFileImpl(indexPath, "utf8")) as unknown;
  return readGipRoadKilometerIndexEntries(payload);
}

export function readGipRoadKilometerIndexEntries(payload: unknown): GipRoadKilometerIndexEntry[] {
  return collectRawEntries(payload).flatMap((entry) => {
    const normalizedEntry = normalizeIndexEntry(entry);
    return normalizedEntry ? [normalizedEntry] : [];
  });
}

export function resolveRoadKilometerFromIndex(
  input: ResolveRoadKilometerInput,
  entries: GipRoadKilometerIndexEntry[],
  maxDistanceMeters: number
): GipRoadKilometerIndexSuggestion | undefined {
  const effectiveMaxDistanceMeters = Math.max(
    maxDistanceMeters,
    typeof input.accuracyMeters === "number" && Number.isFinite(input.accuracyMeters) ? input.accuracyMeters + 50 : 0
  );
  const candidates = entries
    .map((entry) => ({
      entry,
      distanceMeters: distanceInMeters(input, entry)
    }))
    .filter((candidate) => candidate.distanceMeters <= effectiveMaxDistanceMeters)
    .sort((left, right) => left.distanceMeters - right.distanceMeters);

  if (candidates.length === 0) {
    return undefined;
  }

  const roadNameHint = readString(input.roadNameHint);
  const matchingCandidates = roadNameHint
    ? candidates.filter(({ entry }) => roadNamesMatch(entry, roadNameHint))
    : candidates;
  const bestCandidate = matchingCandidates[0] ?? candidates[0];
  const warnings: string[] = [];

  if (roadNameHint && matchingCandidates.length === 0) {
    warnings.push("GIP-Straßenname weicht von Google-Straßenname ab; bitte vor dem Speichern prüfen.");
  }

  return {
    roadName: bestCandidate?.entry.roadName,
    roadKilometer: bestCandidate?.entry.roadKilometer,
    placeId: bestCandidate?.entry.placeId,
    warnings
  };
}

function collectRawEntries(payload: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(payload)) {
    return payload.flatMap(collectRawEntries);
  }

  const record = readRecord(payload);

  if (!record) {
    return [];
  }

  if (Array.isArray(record.entries)) {
    return collectRawEntries(record.entries);
  }

  if (Array.isArray(record.features)) {
    return record.features.flatMap((feature) => {
      const featureRecord = readRecord(feature);
      const properties = readRecord(featureRecord?.properties);
      const geometry = readRecord(featureRecord?.geometry);
      const point = readPointGeometry(geometry);

      if (!featureRecord && !properties) {
        return [];
      }

      return [
        {
          ...(featureRecord ?? {}),
          ...(properties ?? {}),
          ...(point ?? {})
        }
      ];
    });
  }

  return [record];
}

function normalizeIndexEntry(record: Record<string, unknown>): GipRoadKilometerIndexEntry | undefined {
  const lat = readNumber(readField(record, ["lat", "latitude", "LAT", "Latitude"]));
  const lng = readNumber(readField(record, ["lng", "lon", "longitude", "LNG", "Longitude"]));
  const rawRoadName = readFirstString(record, ROAD_NAME_KEYS);
  const parsedFeatureName = rawRoadName ? parseFeatureName(rawRoadName) : {};
  const roadName = parsedFeatureName.roadName ?? rawRoadName;
  const roadKilometer = readFirstRoadKilometer(record, ROAD_KILOMETER_KEYS) ?? parsedFeatureName.roadKilometer;

  if (typeof lat !== "number" || typeof lng !== "number" || !roadName || !roadKilometer) {
    return undefined;
  }

  return {
    lat,
    lng,
    roadName,
    roadKilometer,
    placeId: readFirstStringOrNumber(record, PLACE_ID_KEYS),
    roadCode: normalizeRoadCode(readString(record.roadCode) ?? extractRoadCode(roadName))
  };
}

function readPointGeometry(geometry: Record<string, unknown> | undefined) {
  if (geometry?.type !== "Point" || !Array.isArray(geometry.coordinates)) {
    return undefined;
  }

  const [lng, lat] = geometry.coordinates;

  return {
    lat,
    lng
  };
}

function parseFeatureName(value: string): { roadName?: string; roadKilometer?: string } {
  const match = value.match(/^(?<kilometer>\d+(?:[,.]\d+)?)\s*km,\s*(?<roadName>.+)$/iu);

  if (!match?.groups) {
    return {};
  }

  const roadName = cleanupGipRoadName(match.groups.roadName ?? "");
  const kilometer = readNumber(match.groups.kilometer);

  return {
    roadName,
    roadKilometer: typeof kilometer === "number" ? formatRoadKilometerNumber(kilometer) : undefined
  };
}

function cleanupGipRoadName(value: string) {
  return readString(value.replace(/\s+(?:Hauptfahrbahn|Baulos|Kreisverkehr)\b.*$/iu, ""));
}

function roadNamesMatch(entry: GipRoadKilometerIndexEntry, roadNameHint: string) {
  const hintedRoadCode = normalizeRoadCode(extractRoadCode(roadNameHint));
  const canonicalHint = canonicalizeRoadName(roadNameHint).toUpperCase();

  if ((hintedRoadCode && entry.roadCode === hintedRoadCode) || (entry.roadCode && entry.roadCode === canonicalHint)) {
    return true;
  }

  return canonicalizeRoadName(entry.roadName) === canonicalizeRoadName(roadNameHint);
}

function extractRoadCode(value: string | undefined) {
  return value?.match(/\b[ABLS]\s*[-.]?\s*\d+[A-Z]?\b/iu)?.[0];
}

function normalizeRoadCode(value: string | undefined) {
  return value?.replace(/\s+/g, "").replace(/[.-]/g, "").toUpperCase();
}

function distanceInMeters(left: { lat: number; lng: number }, right: { lat: number; lng: number }) {
  const radius = 6_371_000;
  const latDelta = toRadians(right.lat - left.lat);
  const lngDelta = toRadians(right.lng - left.lng);
  const leftLat = toRadians(left.lat);
  const rightLat = toRadians(right.lat);
  const haversine =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(leftLat) * Math.cos(rightLat) * Math.sin(lngDelta / 2) ** 2;

  return 2 * radius * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function canonicalizeRoadName(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/^landesstra(?:ß|ss)e/, "l")
    .replace(/^bundesstra(?:ß|ss)e/, "b")
    .replace(/^schnellstra(?:ß|ss)e/, "s")
    .replace(/^autobahn/, "a")
    .replace(/^straße/, "")
    .replace(/^strasse/, "");

  const roadClassMatch = normalized.match(/^(?<prefix>[abls])[-.]?(?<number>\d+[a-z]?)$/u);

  if (roadClassMatch?.groups) {
    return `${roadClassMatch.groups.prefix}${roadClassMatch.groups.number}`;
  }

  return normalized;
}

function readRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
}

function readField(record: Record<string, unknown>, keys: readonly string[]) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      return record[key];
    }

    const matchingKey = Object.keys(record).find((candidate) => candidate.toLowerCase() === key.toLowerCase());
    if (matchingKey) {
      return record[matchingKey];
    }
  }

  return undefined;
}

function readFirstString(record: Record<string, unknown>, keys: readonly string[]) {
  return readString(readField(record, keys));
}

function readFirstStringOrNumber(record: Record<string, unknown>, keys: readonly string[]) {
  const value = readField(record, keys);

  if (typeof value === "number" && Number.isFinite(value)) {
    return Number.isInteger(value) ? String(value) : String(value);
  }

  return normalizeIdentifier(readString(value));
}

function readFirstRoadKilometer(record: Record<string, unknown>, keys: readonly string[]) {
  return formatRoadKilometer(readField(record, keys));
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function normalizeIdentifier(value: string | undefined) {
  return value?.replace(/\.0$/u, "");
}

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().replace(",", ".");

  if (!/^-?\d+(?:\.\d+)?$/.test(normalized)) {
    return undefined;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formatRoadKilometer(value: unknown) {
  const stringValue = readString(value);

  if (stringValue?.includes(",")) {
    return stringValue;
  }

  const numberValue = readNumber(value);

  if (typeof numberValue === "number") {
    return formatRoadKilometerNumber(numberValue);
  }

  return stringValue;
}

function formatRoadKilometerNumber(value: number) {
  return new Intl.NumberFormat("de-AT", {
    maximumFractionDigits: 3,
    useGrouping: false
  }).format(value);
}
