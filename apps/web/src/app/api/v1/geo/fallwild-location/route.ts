import { getRequestContext } from "../../../../../server/auth/context";
import { assertRole } from "../../../../../server/auth/service";
import { jsonError, jsonOk } from "../../../../../server/http/responses";
import { validationError } from "../../../../../server/http/validation";
import { FALLWILD_ALLOWED_ROLES } from "../../../../../server/modules/fallwild/media";
import { resolveFallwildLocation } from "../../../../../server/modules/geo/fallwild-location";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { role } = await getRequestContext();
    assertRole(role, [...FALLWILD_ALLOWED_ROLES]);

    return jsonOk(await resolveFallwildLocation(parseLocationRequest(await readJsonBody(request))));
  } catch (error) {
    return jsonError(error);
  }
}

async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw validationError("Der Request-Body muss gültiges JSON sein.");
  }
}

function parseLocationRequest(body: unknown): { lat: number; lng: number; accuracyMeters?: number } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw validationError("Der Request-Body muss ein Objekt sein.");
  }

  const data = body as Record<string, unknown>;
  const accuracyMeters = parseOptionalAccuracy(data.accuracyMeters);

  return {
    lat: parseCoordinate(data.lat, "lat", -90, 90),
    lng: parseCoordinate(data.lng, "lng", -180, 180),
    ...(typeof accuracyMeters === "number" ? { accuracyMeters } : {})
  };
}

function parseCoordinate(value: unknown, field: string, min: number, max: number) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    throw validationError(`${field} muss eine gültige Koordinate sein.`);
  }

  return value;
}

function parseOptionalAccuracy(value: unknown) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 10_000) {
    throw validationError("accuracyMeters muss eine gültige Genauigkeit in Metern sein.");
  }

  return value;
}
