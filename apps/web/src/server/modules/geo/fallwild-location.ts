import type { FallwildRoadReference, GeoPoint } from "@hege/domain";

import { getServerEnv, type ServerEnv } from "../../env";
import bundledGipRoadKilometerIndex from "./data/gip-road-kilometer-gaenserndorf.json";
import {
  createGipRoadKilometerIndexResolver,
  createGipRoadKilometerStaticIndexResolver,
  readGipRoadKilometerIndexEntries
} from "./gip-road-kilometer-index";

export interface FallwildLocationSuggestion {
  location: GeoPoint;
  gemeinde?: string;
  strasse?: string;
  roadReference?: FallwildRoadReference;
  warnings: string[];
}

interface ResolveFallwildLocationInput {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  fetchImpl?: typeof fetch;
  providers?: FallwildLocationProviders;
}

export interface FallwildLocationProviders {
  reverseGeocoder?: ReverseGeocoder;
  roadKilometerResolver?: RoadKilometerResolver;
}

export interface ReverseGeocoder {
  reverseGeocode(input: GeoProviderInput): Promise<GoogleAddressSuggestion | undefined>;
}

export interface RoadKilometerResolver {
  resolveRoadKilometer(input: GeoProviderInput & { roadNameHint?: string }): Promise<GipRoadKilometerSuggestion | undefined>;
}

interface GeoProviderInput {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  fetchImpl: typeof fetch;
}

interface GoogleAddressSuggestion {
  addressLabel?: string;
  placeId?: string;
  gemeinde?: string;
  route?: string;
  warnings?: string[];
}

interface GipRoadKilometerSuggestion {
  roadName?: string;
  roadKilometer?: string;
  placeId?: string;
  warnings?: string[];
}

interface LocationFixture {
  lat: number;
  lng: number;
  radiusMeters: number;
  addressLabel: string;
  googlePlaceId: string;
  gemeinde: string;
  route: string;
  roadName: string;
  roadKilometer: string;
  gipPlaceId: string;
}

const LOCATION_FIXTURES: LocationFixture[] = [
  {
    lat: 48.339,
    lng: 16.7201,
    radiusMeters: 25_000,
    addressLabel: "Landesstraße 9, 2230 Gänserndorf, Österreich",
    googlePlaceId: "mock-google-gaenserndorf-l9",
    gemeinde: "Gänserndorf",
    route: "L9",
    roadName: "L9",
    roadKilometer: "12,4",
    gipPlaceId: "mock-gip-gaenserndorf-l9-km-12-4"
  }
];

const GIP_ROAD_NAME_KEYS = [
  "roadName",
  "road_name",
  "ROAD_NAME",
  "road",
  "ROAD",
  "route",
  "routeName",
  "route_name",
  "ROUTE_NAME",
  "streetName",
  "street_name",
  "strasse",
  "straße",
  "Strasse",
  "Straße",
  "STRASSE",
  "STRNAME",
  "STRASSENNAME",
  "BEZEICHNUNG",
  "BESCHREIBUNG",
  "FEATURENAME",
  "STREETNAME",
  "NAME",
  "ROUTENAME"
] as const;

const GIP_ROAD_KILOMETER_KEYS = [
  "roadKilometer",
  "road_kilometer",
  "kilometer",
  "km",
  "KM",
  "KILOMETER",
  "KILOMETERWERT",
  "KM_VALUE",
  "kmValue",
  "km_value",
  "KM_VON",
  "kmVon",
  "km_von",
  "VONKM",
  "vonKm",
  "FROMKM",
  "fromkm",
  "fromKm",
  "KM_BIS",
  "kmBis",
  "km_bis",
  "BISKM",
  "bisKm",
  "TOKM",
  "tokm",
  "toKm",
  "STATION",
  "station",
  "STATIONIERUNG",
  "stationierung",
  "Stationierung"
] as const;

const GIP_PLACE_ID_KEYS = [
  "id",
  "ID",
  "placeId",
  "place_id",
  "segmentId",
  "segment_id",
  "SEGMENTID",
  "OBJECTID",
  "objectid",
  "ObjectId",
  "EDGE_OBJECTID",
  "edge_objectid",
  "EDGEID",
  "edgeId",
  "LINKID",
  "linkId",
  "GIP_ID",
  "gipId",
  "GIPID",
  "ROUTEID",
  "routeid"
] as const;

const GIP_DISTANCE_KEYS = [
  "distanceMeters",
  "distance_meters",
  "DISTANCE_METERS",
  "distance",
  "DISTANCE",
  "distanz",
  "DISTANZ"
] as const;

export async function resolveFallwildLocation({
  lat,
  lng,
  accuracyMeters,
  fetchImpl = fetch,
  providers
}: ResolveFallwildLocationInput): Promise<FallwildLocationSuggestion> {
  const env = getServerEnv();
  const warnings: string[] = [];
  const reverseGeocoder = providers?.reverseGeocoder ?? createReverseGeocoder(env);
  const roadKilometerResolver = providers?.roadKilometerResolver ?? createRoadKilometerResolver(env);
  let googleAddress: GoogleAddressSuggestion | undefined;
  let gipRoadKilometer: GipRoadKilometerSuggestion | undefined;

  if (typeof accuracyMeters === "number" && accuracyMeters > 100) {
    warnings.push("GPS-Genauigkeit ist größer als 100 m; Standort bitte vor dem Speichern prüfen.");
  }

  if (reverseGeocoder) {
    try {
      googleAddress = await reverseGeocoder.reverseGeocode({ accuracyMeters, fetchImpl, lat, lng });
      warnings.push(...(googleAddress?.warnings ?? []));

      if (!googleAddress) {
        warnings.push("Für diese Koordinate wurde keine Adresse gefunden; bitte manuell ergänzen.");
      }
    } catch (error) {
      warnings.push(readErrorMessage(error) ?? "Adresse konnte nicht automatisch ermittelt werden.");
    }
  } else {
    warnings.push("Google Reverse Geocoding ist nicht konfiguriert.");
  }

  if (roadKilometerResolver) {
    try {
      gipRoadKilometer = await roadKilometerResolver.resolveRoadKilometer({
        accuracyMeters,
        fetchImpl,
        lat,
        lng,
        roadNameHint: googleAddress?.route
      });
      warnings.push(...(gipRoadKilometer?.warnings ?? []));

      if (!gipRoadKilometer?.roadKilometer) {
        warnings.push("Für diese Koordinate wurde kein GIP-Straßenkilometer gefunden; bitte manuell ergänzen.");
      }
    } catch (error) {
      warnings.push(readErrorMessage(error) ?? "GIP-Straßenkilometer konnte nicht automatisch ermittelt werden.");
    }
  } else {
    warnings.push("GIP-Straßenkilometer ist noch nicht automatisiert; bitte manuell ergänzen.");
  }

  const roadName = gipRoadKilometer?.roadName ?? googleAddress?.route;
  const roadKilometer = gipRoadKilometer?.roadKilometer;
  const roadReference: FallwildRoadReference | undefined =
    roadName || roadKilometer || gipRoadKilometer?.placeId
      ? {
          roadName,
          roadKilometer,
          source: roadKilometer ? "gip" : "unavailable",
          placeId: gipRoadKilometer?.placeId
        }
      : undefined;

  return {
    location: {
      lat,
      lng,
      accuracyMeters,
      label: googleAddress?.route ?? googleAddress?.addressLabel,
      source: "device-gps",
      addressLabel: googleAddress?.addressLabel,
      placeId: googleAddress?.placeId
    },
    gemeinde: googleAddress?.gemeinde,
    strasse: googleAddress?.route ?? roadName,
    roadReference,
    warnings
  };
}

function createReverseGeocoder(env: ServerEnv): ReverseGeocoder | undefined {
  if (env.geoProviderMode === "disabled") {
    return undefined;
  }

  if (env.geoProviderMode === "mock") {
    return createFixtureReverseGeocoder();
  }

  if (env.googleMapsServerApiKey) {
    return createGoogleReverseGeocoder({
      apiKey: env.googleMapsServerApiKey,
      language: env.googleMapsLanguage,
      region: env.googleMapsRegion
    });
  }

  return undefined;
}

function createRoadKilometerResolver(env: ServerEnv): RoadKilometerResolver | undefined {
  if (env.geoProviderMode === "disabled") {
    return undefined;
  }

  if (env.geoProviderMode === "mock") {
    return createFixtureRoadKilometerResolver();
  }

  if (env.gipRoadKilometerEndpoint) {
    return createGipEndpointRoadKilometerResolver(env.gipRoadKilometerEndpoint);
  }

  if (env.gipRoadKilometerIndexPath) {
    return createGipRoadKilometerIndexResolver({
      indexPath: env.gipRoadKilometerIndexPath,
      maxDistanceMeters: env.gipRoadKilometerMaxDistanceMeters
    });
  }

  return createGipRoadKilometerStaticIndexResolver({
    entries: readGipRoadKilometerIndexEntries(bundledGipRoadKilometerIndex),
    maxDistanceMeters: env.gipRoadKilometerMaxDistanceMeters
  });
}

function createGoogleReverseGeocoder({
  apiKey,
  language,
  region
}: {
  apiKey: string;
  language: string;
  region: string;
}): ReverseGeocoder {
  return {
    reverseGeocode: ({ fetchImpl, lat, lng }) =>
      reverseGeocodeWithGoogle({
        apiKey,
        fetchImpl,
        language,
        lat,
        lng,
        region
      })
  };
}

function createGipEndpointRoadKilometerResolver(endpoint: string): RoadKilometerResolver {
  return {
    resolveRoadKilometer: ({ accuracyMeters, fetchImpl, lat, lng, roadNameHint }) =>
      resolveGipRoadKilometer({
        accuracyMeters,
        endpoint,
        fetchImpl,
        lat,
        lng,
        roadNameHint
      })
  };
}

function createFixtureReverseGeocoder(): ReverseGeocoder {
  return {
    async reverseGeocode({ lat, lng }) {
      const fixture = findNearestFixture(lat, lng);

      if (!fixture) {
        return undefined;
      }

      return {
        addressLabel: fixture.addressLabel,
        placeId: fixture.googlePlaceId,
        gemeinde: fixture.gemeinde,
        route: fixture.route,
        warnings: ["Mock-Geocoder aktiv; Adresse stammt aus lokalen Testdaten."]
      };
    }
  };
}

function createFixtureRoadKilometerResolver(): RoadKilometerResolver {
  return {
    async resolveRoadKilometer({ lat, lng, roadNameHint }) {
      const fixture = findNearestFixture(lat, lng);

      if (!fixture) {
        return undefined;
      }

      if (roadNameHint && canonicalizeRoadName(roadNameHint) !== canonicalizeRoadName(fixture.roadName)) {
        return {
          roadName: roadNameHint,
          warnings: ["Mock-GIP hat keinen passenden Straßenkilometer zur ermittelten Straße gefunden."]
        };
      }

      return {
        roadName: fixture.roadName,
        roadKilometer: fixture.roadKilometer,
        placeId: fixture.gipPlaceId,
        warnings: ["Mock-GIP aktiv; Straßenkilometer stammt aus lokalen Testdaten."]
      };
    }
  };
}

async function reverseGeocodeWithGoogle({
  apiKey,
  fetchImpl,
  language,
  lat,
  lng,
  region
}: {
  apiKey: string;
  fetchImpl: typeof fetch;
  language: string;
  lat: number;
  lng: number;
  region: string;
}): Promise<GoogleAddressSuggestion | undefined> {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("latlng", `${lat},${lng}`);
  url.searchParams.set("language", language);
  url.searchParams.set("region", region);
  url.searchParams.set("key", apiKey);

  const response = await fetchImpl(url, {
    headers: {
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Google Reverse Geocoding ist fehlgeschlagen (${response.status}).`);
  }

  const payload = (await response.json()) as GoogleGeocodeResponse;

  if (payload.status !== "OK" || payload.results.length === 0) {
    if (payload.status === "ZERO_RESULTS") {
      return undefined;
    }

    throw new Error(readGoogleStatusError(payload));
  }

  const result = payload.results[0];
  const warnings = payload.results.length > 1 ? ["Google Reverse Geocoding hat mehrere Treffer geliefert; erster Treffer wurde übernommen."] : [];

  return {
    addressLabel: result?.formatted_address,
    placeId: result?.place_id,
    gemeinde:
      findAddressComponent(result, "locality") ??
      findAddressComponent(result, "postal_town") ??
      findAddressComponent(result, "administrative_area_level_3") ??
      findAddressComponent(result, "administrative_area_level_2"),
    route: findAddressComponent(result, "route"),
    warnings
  };
}

async function resolveGipRoadKilometer({
  accuracyMeters,
  endpoint,
  fetchImpl,
  lat,
  lng,
  roadNameHint
}: {
  accuracyMeters?: number;
  endpoint: string;
  fetchImpl: typeof fetch;
  lat: number;
  lng: number;
  roadNameHint?: string;
}): Promise<GipRoadKilometerSuggestion | undefined> {
  const url = new URL(endpoint);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lng", String(lng));
  if (roadNameHint) {
    url.searchParams.set("roadName", roadNameHint);
  }
  if (typeof accuracyMeters === "number" && Number.isFinite(accuracyMeters)) {
    url.searchParams.set("accuracyMeters", String(Math.round(accuracyMeters)));
  }

  const response = await fetchImpl(url, {
    headers: {
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`GIP-Straßenkilometer-Resolver ist fehlgeschlagen (${response.status}).`);
  }

  const payload = (await response.json().catch(() => null)) as unknown;

  if (!payload) {
    return undefined;
  }

  return readGipRoadKilometerSuggestion(payload, roadNameHint);
}

function readGipRoadKilometerSuggestion(payload: unknown, roadNameHint?: string): GipRoadKilometerSuggestion | undefined {
  const candidate = findBestGipCandidate(payload);

  if (!candidate) {
    return undefined;
  }

  const rawRoadName = readFirstString(candidate, GIP_ROAD_NAME_KEYS);
  const parsedReference = rawRoadName ? parseRoadReferenceText(rawRoadName) : {};
  const roadName = parsedReference.roadName ?? rawRoadName;
  const roadKilometer = readFirstRoadKilometer(candidate, GIP_ROAD_KILOMETER_KEYS) ?? parsedReference.roadKilometer;
  const warnings: string[] = [];

  if (roadName && roadNameHint && canonicalizeRoadName(roadName) !== canonicalizeRoadName(roadNameHint)) {
    warnings.push("GIP-Straßenname weicht von Google-Straßenname ab; bitte vor dem Speichern prüfen.");
  }

  return {
    roadName,
    roadKilometer,
    placeId: readFirstStringOrNumber(candidate, GIP_PLACE_ID_KEYS),
    warnings
  };
}

function findBestGipCandidate(payload: unknown): Record<string, unknown> | undefined {
  const candidates = collectGipCandidates(payload).filter(hasGipCandidateSignal);

  if (candidates.length === 0) {
    return undefined;
  }

  return [...candidates].sort((left, right) => readCandidateDistance(left) - readCandidateDistance(right))[0];
}

function collectGipCandidates(payload: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(payload)) {
    return payload.flatMap(collectGipCandidates);
  }

  const record = readRecord(payload);

  if (!record) {
    return [];
  }

  if (Array.isArray(record.features)) {
    return record.features.flatMap((feature) => {
      const featureRecord = readRecord(feature);
      const properties = readRecord(featureRecord?.properties);
      const attributes = readRecord(featureRecord?.attributes);
      const nestedData = readRecord(featureRecord?.data);

      if (!featureRecord && !properties && !attributes && !nestedData) {
        return [];
      }

      return [
        {
          ...(featureRecord ?? {}),
          ...(properties ?? {}),
          ...(attributes ?? {}),
          ...(nestedData ?? {})
        }
      ];
    });
  }

  if (Array.isArray(record.results)) {
    return record.results.flatMap(collectGipCandidates);
  }

  if (Array.isArray(record.items)) {
    return record.items.flatMap(collectGipCandidates);
  }

  return [record];
}

function hasGipCandidateSignal(candidate: Record<string, unknown>) {
  return Boolean(
    readFirstString(candidate, GIP_ROAD_NAME_KEYS) ?? readFirstRoadKilometer(candidate, GIP_ROAD_KILOMETER_KEYS)
  );
}

function readCandidateDistance(candidate: Record<string, unknown>) {
  return readFirstNumber(candidate, GIP_DISTANCE_KEYS) ?? Number.POSITIVE_INFINITY;
}

function findNearestFixture(lat: number, lng: number): LocationFixture | undefined {
  return LOCATION_FIXTURES.find((fixture) => distanceInMeters({ lat, lng }, fixture) <= fixture.radiusMeters);
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

function normalizeRoadName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function canonicalizeRoadName(value: string) {
  const normalized = normalizeRoadName(value)
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

function findAddressComponent(result: GoogleGeocodeResult | undefined, type: string): string | undefined {
  return result?.address_components.find((component) => component.types.includes(type))?.long_name;
}

function readGoogleStatusError(payload: GoogleGeocodeResponse) {
  if (payload.error_message) {
    return payload.error_message;
  }

  switch (payload.status) {
    case "OVER_QUERY_LIMIT":
      return "Google Reverse Geocoding ist wegen Quota oder Limit nicht verfügbar.";
    case "REQUEST_DENIED":
      return "Google Reverse Geocoding wurde abgelehnt; bitte API-Key und Einschränkungen prüfen.";
    case "INVALID_REQUEST":
      return "Google Reverse Geocoding hat eine ungültige Anfrage erhalten.";
    case "UNKNOWN_ERROR":
      return "Google Reverse Geocoding ist vorübergehend nicht verfügbar.";
    default:
      return `Google Reverse Geocoding Status: ${payload.status}`;
  }
}

function readErrorMessage(error: unknown) {
  return error instanceof Error && error.message.length > 0 ? error.message : undefined;
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
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
    return String(value);
  }

  return readString(value);
}

function readFirstNumber(record: Record<string, unknown>, keys: readonly string[]) {
  return readNumber(readField(record, keys));
}

function readFirstRoadKilometer(record: Record<string, unknown>, keys: readonly string[]) {
  return formatRoadKilometer(readField(record, keys));
}

function formatRoadKilometer(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return formatRoadKilometerNumber(value);
  }

  const stringValue = readString(value);

  if (!stringValue) {
    return undefined;
  }

  const parsedReference = parseRoadReferenceText(stringValue);

  if (parsedReference.roadKilometer) {
    return parsedReference.roadKilometer;
  }

  const numberValue = readNumber(stringValue);

  return typeof numberValue === "number" ? formatRoadKilometerNumber(numberValue) : stringValue;
}

function parseRoadReferenceText(value: string): { roadName?: string; roadKilometer?: string } {
  const match = value.match(/^(?<road>.*?)\s*(?:km|kilometer)\s*(?<kilometer>\d+(?:[,.]\d+)?)/i);

  if (!match?.groups) {
    return {};
  }

  const roadName = readString((match.groups.road ?? "").replace(/[,:;|\-–—]+$/u, ""));
  const kilometer = readNumber(match.groups.kilometer);

  return {
    roadName,
    roadKilometer: typeof kilometer === "number" ? formatRoadKilometerNumber(kilometer) : undefined
  };
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

function formatRoadKilometerNumber(value: number) {
  return new Intl.NumberFormat("de-AT", {
    maximumFractionDigits: 3,
    useGrouping: false
  }).format(value);
}

interface GoogleGeocodeResponse {
  status: string;
  error_message?: string;
  results: GoogleGeocodeResult[];
}

interface GoogleGeocodeResult {
  formatted_address?: string;
  place_id?: string;
  address_components: Array<{
    long_name: string;
    short_name?: string;
    types: string[];
  }>;
}
