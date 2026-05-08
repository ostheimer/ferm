import type {
  AnsitzSession,
  FallwildVorgang,
  Reviereinrichtung
} from "@hege/domain";
import { describe, expect, it } from "vitest";

import {
  AUSTRIA_DEFAULT_CENTER,
  buildMapStageRegion,
  computeMapStageCounts,
  DEFAULT_MAP_LAYERS,
  DEFAULT_REGION_DELTA
} from "../components/map-stage.helpers";

/**
 * Wir geben hier nur die Felder, die buildMapStageRegion liest. Das
 * vermeidet, dass wir bei Schema-Erweiterungen Test-Stubs anpassen
 * muessen — die Helper greift ausschliesslich auf `location.lat/lng` zu.
 */
function ansitzAt(id: string, lat: number, lng: number): AnsitzSession {
  return { id, location: { lat, lng } } as unknown as AnsitzSession;
}

function fallwildAt(id: string, lat: number, lng: number): FallwildVorgang {
  return { id, location: { lat, lng } } as unknown as FallwildVorgang;
}

function einrichtungAt(id: string, lat: number, lng: number): Reviereinrichtung {
  return { id, location: { lat, lng } } as unknown as Reviereinrichtung;
}

describe("buildMapStageRegion", () => {
  it("liefert Oesterreich-Default, wenn weder Center noch Pins vorhanden sind", () => {
    const region = buildMapStageRegion(undefined, DEFAULT_MAP_LAYERS, [], [], []);

    expect(region.latitude).toBeCloseTo(AUSTRIA_DEFAULT_CENTER.lat, 6);
    expect(region.longitude).toBeCloseTo(AUSTRIA_DEFAULT_CENTER.lng, 6);
    expect(region.latitudeDelta).toBe(DEFAULT_REGION_DELTA);
    expect(region.longitudeDelta).toBe(DEFAULT_REGION_DELTA);
  });

  it("ignoriert ausgeschaltete Layer beim Berechnen der Bounding-Box", () => {
    const center = { lat: 48.0, lng: 16.0 };
    const region = buildMapStageRegion(
      center,
      { ansitze: false, fallwild: true, einrichtungen: false },
      [ansitzAt("weit-weg", 47.0, 15.0)],
      [fallwildAt("nah", 48.001, 16.001)],
      [einrichtungAt("auch-weit-weg", 49.0, 17.0)]
    );

    // Wenn nur Fallwild gezaehlt wird, muss das Centroid zwischen Center
    // und dem einen Fallwild-Pin liegen — nicht in der Naehe von 47° oder 49°.
    expect(region.latitude).toBeGreaterThan(47.9);
    expect(region.latitude).toBeLessThan(48.1);
  });

  it("vereint alle drei Layer-Typen, wenn alle eingeschaltet sind", () => {
    const center = { lat: 48.0, lng: 16.0 };
    const region = buildMapStageRegion(
      center,
      DEFAULT_MAP_LAYERS,
      [ansitzAt("a", 48.1, 16.1)],
      [fallwildAt("f", 47.9, 15.9)],
      [einrichtungAt("e", 48.05, 16.05)]
    );

    // Centroid zwischen 47.9 und 48.1
    expect(region.latitude).toBeGreaterThan(47.9);
    expect(region.latitude).toBeLessThan(48.1);
    // Bounding-Box muss mindestens den Spread (47.9..48.1) abdecken
    expect(region.latitudeDelta).toBeGreaterThan(0.18);
  });

  it("faellt auf Center-Default zurueck, wenn alle Layer ausgeschaltet sind", () => {
    const center = { lat: 48.0, lng: 16.0 };
    const region = buildMapStageRegion(
      center,
      { ansitze: false, fallwild: false, einrichtungen: false },
      [ansitzAt("a", 48.1, 16.1)],
      [fallwildAt("f", 47.9, 15.9)],
      [einrichtungAt("e", 48.05, 16.05)]
    );

    expect(region.latitude).toBe(48.0);
    expect(region.longitude).toBe(16.0);
    expect(region.latitudeDelta).toBe(DEFAULT_REGION_DELTA);
  });
});

describe("computeMapStageCounts", () => {
  it("zaehlt jede Liste unabhaengig vom Filter-Status", () => {
    const counts = computeMapStageCounts(
      [ansitzAt("a1", 0, 0), ansitzAt("a2", 0, 0)],
      [fallwildAt("f1", 0, 0), fallwildAt("f2", 0, 0), fallwildAt("f3", 0, 0)],
      [einrichtungAt("e1", 0, 0)],
      5
    );

    expect(counts).toEqual({ ansitze: 2, fallwild: 3, einrichtungen: 1, queue: 5 });
  });
});
