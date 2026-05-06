import { describe, expect, it } from "vitest";

import { readGipRoadKilometerIndexEntries, resolveRoadKilometerFromIndex } from "./gip-road-kilometer-index";

describe("GIP road kilometer index", () => {
  it("normalisiert BEPU-ähnliche GIP-OGD-Einträge", () => {
    expect(
      readGipRoadKilometerIndexEntries({
        entries: [
          {
            lat: 48.3414,
            lng: 16.7556,
            FEATURENAME: "33,0 km, B8 - Angerner Straße Hauptfahrbahn (kilometriert)",
            FROMKM: 32.965,
            OBJECTID: 32888451
          }
        ]
      })
    ).toEqual([
      {
        lat: 48.3414,
        lng: 16.7556,
        roadName: "B8 - Angerner Straße",
        roadKilometer: "32,965",
        placeId: "32888451",
        roadCode: "B8"
      }
    ]);
  });

  it("liest GeoJSON-Punkte als kompakten Index", () => {
    expect(
      readGipRoadKilometerIndexEntries({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [16.7556, 48.3414]
            },
            properties: {
              roadName: "L9",
              roadKilometer: "12,4",
              placeId: "gip-l9-12-4"
            }
          }
        ]
      })
    ).toEqual([
      {
        lat: 48.3414,
        lng: 16.7556,
        roadName: "L9",
        roadKilometer: "12,4",
        placeId: "gip-l9-12-4",
        roadCode: "L9"
      }
    ]);
  });

  it("bevorzugt einen passenden Straßencode vor dem absolut nächsten Punkt", () => {
    const suggestion = resolveRoadKilometerFromIndex(
      {
        lat: 48.339,
        lng: 16.7201,
        roadNameHint: "Bundesstraße 8"
      },
      [
        {
          lat: 48.339,
          lng: 16.72011,
          roadName: "L9",
          roadKilometer: "12,4",
          roadCode: "L9"
        },
        {
          lat: 48.33915,
          lng: 16.7201,
          roadName: "B8 - Angerner Straße",
          roadKilometer: "33,0",
          roadCode: "B8",
          placeId: "b8-330"
        }
      ],
      150
    );

    expect(suggestion).toEqual({
      roadName: "B8 - Angerner Straße",
      roadKilometer: "33,0",
      placeId: "b8-330",
      warnings: []
    });
  });

  it("liefert keinen Treffer außerhalb der maximalen Entfernung", () => {
    expect(
      resolveRoadKilometerFromIndex(
        {
          lat: 48.339,
          lng: 16.7201
        },
        [
          {
            lat: 48.349,
            lng: 16.7201,
            roadName: "B8 - Angerner Straße",
            roadKilometer: "33,0"
          }
        ],
        150
      )
    ).toBeUndefined();
  });
});
