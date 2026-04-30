import type { FallwildRoadReference, GeoPoint } from "@hege/domain";

import { getServerEnv } from "../../env";

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
}

interface GoogleAddressSuggestion {
  addressLabel?: string;
  placeId?: string;
  gemeinde?: string;
  route?: string;
}

interface GipRoadKilometerSuggestion {
  roadName?: string;
  roadKilometer?: string;
  placeId?: string;
}

export async function resolveFallwildLocation({
  lat,
  lng,
  fetchImpl = fetch
}: ResolveFallwildLocationInput): Promise<FallwildLocationSuggestion> {
  const env = getServerEnv();
  const warnings: string[] = [];
  let googleAddress: GoogleAddressSuggestion | undefined;
  let gipRoadKilometer: GipRoadKilometerSuggestion | undefined;

  if (env.googleMapsServerApiKey) {
    try {
      googleAddress = await reverseGeocodeWithGoogle({
        apiKey: env.googleMapsServerApiKey,
        fetchImpl,
        language: env.googleMapsLanguage,
        lat,
        lng,
        region: env.googleMapsRegion
      });
    } catch (error) {
      warnings.push(readErrorMessage(error) ?? "Adresse konnte nicht automatisch ermittelt werden.");
    }
  } else {
    warnings.push("Google Reverse Geocoding ist nicht konfiguriert.");
  }

  if (env.gipRoadKilometerEndpoint) {
    try {
      gipRoadKilometer = await resolveGipRoadKilometer({
        endpoint: env.gipRoadKilometerEndpoint,
        fetchImpl,
        lat,
        lng
      });
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

    throw new Error(payload.error_message ?? `Google Reverse Geocoding Status: ${payload.status}`);
  }

  const result = payload.results[0];

  return {
    addressLabel: result?.formatted_address,
    placeId: result?.place_id,
    gemeinde:
      findAddressComponent(result, "locality") ??
      findAddressComponent(result, "postal_town") ??
      findAddressComponent(result, "administrative_area_level_3") ??
      findAddressComponent(result, "administrative_area_level_2"),
    route: findAddressComponent(result, "route")
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

function findAddressComponent(result: GoogleGeocodeResult | undefined, type: string): string | undefined {
  return result?.address_components.find((component) => component.types.includes(type))?.long_name;
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
