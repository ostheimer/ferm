import type { AnsitzSession, GeoPoint } from "@hege/domain";

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface RevierCenter {
  lat: number;
  lng: number;
  label?: string;
}

/**
 * Default-Center fuer Oesterreich, falls weder Revier-Zentrum noch Ansitze
 * verfuegbar sind. Ungefaehrer geographischer Mittelpunkt von OEsterreich.
 */
export const AUSTRIA_DEFAULT_CENTER: RevierCenter = {
  lat: 47.5,
  lng: 13.5
};

/**
 * Standard-Zoom auf das Revier (latitudeDelta ~ 0.05).
 */
export const DEFAULT_REGION_DELTA = 0.05;

/**
 * Minimale Region, falls nur ein einzelner Punkt vorhanden ist.
 */
export const MIN_REGION_DELTA = 0.01;

/**
 * Padding-Faktor um Marker-BoundingBox, damit Marker nicht am Rand der
 * Karte kleben.
 */
const BOUNDING_BOX_PADDING = 1.4;

/**
 * Erzeugt das Map-Region-Objekt fuer `react-native-maps` aus dem Revier-
 * Zentrum und den aktiven Ansitzen.
 *
 * - Wenn `center` fehlt und keine `ansitze` vorhanden sind: Default
 *   Oesterreich-Zentrum mit Standard-Delta.
 * - Wenn `center` gesetzt und keine `ansitze`: zentriere auf `center` mit
 *   Standard-Delta.
 * - Wenn `ansitze` vorhanden: berechne Bounding-Box, die Center und alle
 *   Ansitze umschliesst, mit etwas Padding.
 */
export function buildInitialRegion(
  center: RevierCenter | GeoPoint | undefined,
  ansitze: ReadonlyArray<Pick<AnsitzSession, "location">>
): MapRegion {
  const points: Array<{ lat: number; lng: number }> = [];

  const resolvedCenter = center
    ? { lat: center.lat, lng: center.lng }
    : AUSTRIA_DEFAULT_CENTER;
  points.push(resolvedCenter);

  for (const entry of ansitze) {
    if (
      entry?.location &&
      typeof entry.location.lat === "number" &&
      typeof entry.location.lng === "number"
    ) {
      points.push({ lat: entry.location.lat, lng: entry.location.lng });
    }
  }

  // Nur Center vorhanden -> Standard-Delta um Center
  if (points.length === 1) {
    return {
      latitude: resolvedCenter.lat,
      longitude: resolvedCenter.lng,
      latitudeDelta: DEFAULT_REGION_DELTA,
      longitudeDelta: DEFAULT_REGION_DELTA
    };
  }

  let minLat = Number.POSITIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;
  let minLng = Number.POSITIVE_INFINITY;
  let maxLng = Number.NEGATIVE_INFINITY;

  for (const point of points) {
    if (point.lat < minLat) minLat = point.lat;
    if (point.lat > maxLat) maxLat = point.lat;
    if (point.lng < minLng) minLng = point.lng;
    if (point.lng > maxLng) maxLng = point.lng;
  }

  const latitude = (minLat + maxLat) / 2;
  const longitude = (minLng + maxLng) / 2;
  const latitudeDelta = Math.max(
    (maxLat - minLat) * BOUNDING_BOX_PADDING,
    MIN_REGION_DELTA
  );
  const longitudeDelta = Math.max(
    (maxLng - minLng) * BOUNDING_BOX_PADDING,
    MIN_REGION_DELTA
  );

  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta
  };
}
