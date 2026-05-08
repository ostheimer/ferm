import type { AnsitzSession, FallwildVorgang, GeoPoint, Reviereinrichtung } from "@hege/domain";

import {
  AUSTRIA_DEFAULT_CENTER,
  buildInitialRegion,
  DEFAULT_REGION_DELTA,
  MIN_REGION_DELTA,
  type MapRegion,
  type RevierCenter
} from "./map-preview.helpers";

/**
 * Welche Layer sind aktuell auf der Karte sichtbar.
 * Drei Toggle-Chips kontrollieren das im UI.
 */
export interface MapLayers {
  ansitze: boolean;
  fallwild: boolean;
  einrichtungen: boolean;
}

export const DEFAULT_MAP_LAYERS: MapLayers = {
  ansitze: true,
  fallwild: true,
  einrichtungen: true
};

/**
 * Berechnet die initiale Map-Region so, dass alle aktiven Pins ueber alle
 * **eingeschalteten** Layer sichtbar sind. Faellt auf Revierzentrum oder
 * Oesterreich-Zentrum zurueck, wenn keine Pins da sind. Wir nutzen die
 * existierende `buildInitialRegion`-Logik aus `map-preview.helpers`, indem
 * wir alle Pin-Positionen als pseudo-Ansitze uebergeben — die Funktion
 * arbeitet rein geometrisch ueber `location`-Felder.
 */
export function buildMapStageRegion(
  center: RevierCenter | GeoPoint | undefined,
  layers: MapLayers,
  ansitze: ReadonlyArray<AnsitzSession>,
  fallwild: ReadonlyArray<FallwildVorgang>,
  einrichtungen: ReadonlyArray<Reviereinrichtung>
): MapRegion {
  const visiblePoints: Array<{ location: GeoPoint }> = [];

  if (layers.ansitze) {
    for (const entry of ansitze) {
      visiblePoints.push({ location: entry.location });
    }
  }

  if (layers.fallwild) {
    for (const entry of fallwild) {
      visiblePoints.push({ location: entry.location });
    }
  }

  if (layers.einrichtungen) {
    for (const entry of einrichtungen) {
      visiblePoints.push({ location: entry.location });
    }
  }

  // buildInitialRegion erwartet AnsitzSession-aehnliche Objekte mit `location`,
  // greift aber nur auf das `location`-Feld zu (siehe map-preview.helpers.ts).
  // Daher der `unknown`-Cast: strukturell passt es, aber der Compiler kennt
  // den engeren Vertrag der Funktion nicht.
  return buildInitialRegion(
    center,
    visiblePoints as unknown as ReadonlyArray<AnsitzSession>
  );
}

export {
  AUSTRIA_DEFAULT_CENTER,
  DEFAULT_REGION_DELTA,
  MIN_REGION_DELTA,
  type MapRegion,
  type RevierCenter
};

/**
 * Zaehler fuer die Bottom-Summary, ueber alle Layer (unabhaengig vom
 * Filter — der Banner zeigt immer die volle Wahrheit, die Karte filtert).
 */
export interface MapStageCounts {
  ansitze: number;
  fallwild: number;
  einrichtungen: number;
  queue: number;
}

export function computeMapStageCounts(
  ansitze: ReadonlyArray<AnsitzSession>,
  fallwild: ReadonlyArray<FallwildVorgang>,
  einrichtungen: ReadonlyArray<Reviereinrichtung>,
  queueCount: number
): MapStageCounts {
  return {
    ansitze: ansitze.length,
    fallwild: fallwild.length,
    einrichtungen: einrichtungen.length,
    queue: queueCount
  };
}
