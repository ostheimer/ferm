import type { GeoPoint } from "@hege/domain";

export function trimToUndefined(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function buildGeoPoint(
  latValue: string,
  lngValue: string,
  labelValue: string,
  fallbackLabel: string
): GeoPoint {
  const lat = parseCoordinate(latValue, "Breitengrad", -90, 90);
  const lng = parseCoordinate(lngValue, "Längengrad", -180, 180);

  return {
    lat,
    lng,
    label: trimToUndefined(labelValue) ?? fallbackLabel
  };
}

function parseCoordinate(value: string, label: string, min: number, max: number) {
  const normalized = value.replace(",", ".").trim();

  if (!normalized) {
    throw new Error(`${label} ist erforderlich.`);
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(`${label} muss zwischen ${min} und ${max} liegen.`);
  }

  return parsed;
}
