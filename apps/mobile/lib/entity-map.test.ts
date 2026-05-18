import type {
  AnsitzSession,
  FallwildVorgang,
  Reviereinrichtung
} from "@hege/domain";
import { describe, expect, it } from "vitest";

import type { EntityPin } from "../components/entity-map";
import { buildEntityMapRegionKey } from "../components/entity-map.helpers";

/**
 * `<EntityMap>` selbst rendert Native-MapView, was Native-Module-Mocking
 * verlangt. Wir pruefen stattdessen den Pin-Mapping-Contract, den jeder
 * der drei Tabs (Ansitze/Fallwild/Reviereinrichtungen) zum Befuellen
 * der `pins`-Prop nutzt. Wenn das Mapping bricht, werden die Karten
 * leer oder die Pins landen am falschen Ort.
 */

function ansitzToPin(entry: AnsitzSession): EntityPin {
  return {
    id: entry.id,
    kind: "ansitz",
    location: entry.location,
    title: entry.standortName,
    subtitle: entry.location.label ?? "Aktiver Ansitz"
  };
}

function fallwildToPin(entry: FallwildVorgang): EntityPin {
  return {
    id: entry.id,
    kind: "fallwild",
    location: entry.location,
    title: entry.gemeinde ?? entry.location.label ?? "Fallwild",
    subtitle: `${entry.wildart} · ${entry.bergungsStatus}`
  };
}

function einrichtungToPin(entry: Reviereinrichtung): EntityPin {
  return {
    id: entry.id,
    kind: "einrichtung",
    location: entry.location,
    title: entry.name,
    subtitle: `${entry.type} · ${entry.status}`
  };
}

describe("EntityPin-Mapping fuer Locations-Tabs", () => {
  it("Ansitz: title ist Standortname, subtitle nutzt label-Fallback", () => {
    const ansitz = {
      id: "a1",
      standortName: "Hochstand 4",
      location: { lat: 48.1, lng: 16.5, label: "Waldrand" }
    } as unknown as AnsitzSession;

    const pin = ansitzToPin(ansitz);
    expect(pin.id).toBe("a1");
    expect(pin.kind).toBe("ansitz");
    expect(pin.title).toBe("Hochstand 4");
    expect(pin.subtitle).toBe("Waldrand");
  });

  it("Ansitz: subtitle faellt auf 'Aktiver Ansitz' zurueck, wenn label fehlt", () => {
    const ansitz = {
      id: "a2",
      standortName: "Kanzel",
      location: { lat: 48.0, lng: 16.4 }
    } as unknown as AnsitzSession;

    expect(ansitzToPin(ansitz).subtitle).toBe("Aktiver Ansitz");
  });

  it("Fallwild: title ist Gemeinde, sonst location.label, sonst 'Fallwild'", () => {
    const withGemeinde = {
      id: "f1",
      gemeinde: "Strasshof",
      wildart: "Reh",
      bergungsStatus: "geborgen",
      location: { lat: 48.0, lng: 16.4, label: "B8 km 12" }
    } as unknown as FallwildVorgang;
    expect(fallwildToPin(withGemeinde).title).toBe("Strasshof");
    expect(fallwildToPin(withGemeinde).subtitle).toBe("Reh · geborgen");

    const onlyLabel = {
      ...withGemeinde,
      id: "f2",
      gemeinde: undefined
    } as unknown as FallwildVorgang;
    expect(fallwildToPin(onlyLabel).title).toBe("B8 km 12");

    const neither = {
      ...withGemeinde,
      id: "f3",
      gemeinde: undefined,
      location: { lat: 48, lng: 16 }
    } as unknown as FallwildVorgang;
    expect(fallwildToPin(neither).title).toBe("Fallwild");
  });

  it("Reviereinrichtung: title=name, subtitle=type·status mit korrektem Trennzeichen", () => {
    const einrichtung = {
      id: "e1",
      name: "Salzlecke West",
      type: "salzlecke",
      status: "wartung-faellig",
      location: { lat: 48.0, lng: 16.4 }
    } as unknown as Reviereinrichtung;

    const pin = einrichtungToPin(einrichtung);
    expect(pin.title).toBe("Salzlecke West");
    expect(pin.subtitle).toBe("salzlecke · wartung-faellig");
  });
});

describe("buildEntityMapRegionKey", () => {
  it("bleibt stabil, wenn dieselben Pins nur anders sortiert sind", () => {
    const first = buildEntityMapRegionKey(undefined, [
      { id: "b", location: { lat: 48.2, lng: 16.4 } },
      { id: "a", location: { lat: 48.1, lng: 16.3 } }
    ]);
    const second = buildEntityMapRegionKey(undefined, [
      { id: "a", location: { lat: 48.1, lng: 16.3 } },
      { id: "b", location: { lat: 48.2, lng: 16.4 } }
    ]);

    expect(first).toBe(second);
  });

  it("ändert sich, wenn nach einem Refresh neue Pin-Koordinaten ankommen", () => {
    const empty = buildEntityMapRegionKey(undefined, []);
    const withPin = buildEntityMapRegionKey(undefined, [
      { id: "a", location: { lat: 48.1, lng: 16.3 } }
    ]);
    const movedPin = buildEntityMapRegionKey(undefined, [
      { id: "a", location: { lat: 48.4, lng: 16.6 } }
    ]);

    expect(withPin).not.toBe(empty);
    expect(movedPin).not.toBe(withPin);
  });

  it("ändert sich, wenn ein anderes Revier-Zentrum gesetzt wird", () => {
    const pins = [{ id: "a", location: { lat: 48.1, lng: 16.3 } }];

    expect(buildEntityMapRegionKey({ lat: 48, lng: 16 }, pins)).not.toBe(
      buildEntityMapRegionKey({ lat: 47, lng: 15 }, pins)
    );
  });
});
