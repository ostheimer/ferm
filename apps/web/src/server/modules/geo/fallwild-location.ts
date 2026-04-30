import type { FallwildRoadReference, GeoPoint } from "@hege/domain";

import { getServerEnv, type ServerEnv } from "../../env";

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

export async function resolveFallwildLocation({
  lat,
  lng,
  fetchImpl = fetch,
  providers
}: ResolveFallwildLocationInput): Promise<FallwildLocationSuggestion> {
  const env = getServerEnv();
  const warnings: string[] = [];
  const reverseGeocoder = providers?.reverseGeocoder ?? createReverseGeocoder(env);
  const roadKilometerResolver = providers?.roadKilometerResolver ?? createRoadKilometerResolver(env);
  let googleAddress: GoogleAddressSuggestion | undefined;
  let gipRoadKilometer: GipRoadKilometerSuggestion | undefined;

  if (reverseGeocoder) {
    try {
      googleAddress = await reverseGeocoder.reverseGeocode({ fetchImpl, lat, lng });
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

  return undefined;
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
    resolveRoadKilometer: ({ fetchImpl, lat, lng }) =>
      resolveGipRoadKilometer({
        endpoint,
        fetchImpl,
        lat,
        lng
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

      if (roadNameHint && normalizeRoadName(roadNameHint) !== normalizeRoadName(fixture.roadName)) {
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
  endpoint,
  fetchImpl,
  lat,
  lng
}: {
  endpoint: string;
  fetchImpl: typeof fetch;
  lat: number;
  lng: number;
}): Promise<GipRoadKilometerSuggestion | undefined> {
  const url = new URL(endpoint);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lng", String(lng));

  const response = await fetchImpl(url, {
    headers: {
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`GIP-Straßenkilometer-Resolver ist fehlgeschlagen (${response.status}).`);
  }

  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;

  if (!payload) {
    return undefined;
  }

  return {
    roadName: readString(payload.roadName) ?? readString(payload.road_name) ?? readString(payload.route),
    roadKilometer:
      readString(payload.roadKilometer) ??
      readString(payload.road_kilometer) ??
      readString(payload.kilometer) ??
      readString(payload.km),
    placeId: readString(payload.placeId) ?? readString(payload.place_id) ?? readString(payload.segmentId)
  };
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
