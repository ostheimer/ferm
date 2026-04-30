import { describe, expect, it } from "vitest";

import {
  applyFallwildLocationSuggestion,
  buildFallwildRoadReference,
  summarizeFallwildLocationSuggestion
} from "./fallwild-location";

const baseForm = {
  lat: "",
  lng: "",
  locationLabel: "",
  addressLabel: "",
  gemeinde: "",
  strasse: "",
  roadName: "",
  roadKilometer: "",
  roadKilometerSource: "manual" as const
};

describe("fallwild location helpers", () => {
  it("applies reverse-geocoded address and GIP road kilometer suggestions", () => {
    expect(
      applyFallwildLocationSuggestion(baseForm, {
        location: {
          lat: 48.339,
          lng: 16.7201,
          label: "L9",
          addressLabel: "L9, 2230 Gänserndorf"
        },
        gemeinde: "Gänserndorf",
        strasse: "L9",
        roadReference: {
          roadName: "L9",
          roadKilometer: "12,4",
          source: "gip"
        },
        warnings: []
      })
    ).toMatchObject({
      lat: "48.339000",
      lng: "16.720100",
      locationLabel: "L9",
      addressLabel: "L9, 2230 Gänserndorf",
      gemeinde: "Gänserndorf",
      strasse: "L9",
      roadName: "L9",
      roadKilometer: "12,4",
      roadKilometerSource: "gip"
    });
  });

  it("builds a manual road reference when the kilometer is edited by the user", () => {
    expect(
      buildFallwildRoadReference({
        roadName: "L9",
        roadKilometer: " 12,4 ",
        roadKilometerSource: "manual"
      })
    ).toEqual({
      roadName: "L9",
      roadKilometer: "12,4",
      source: "manual"
    });
  });

  it("summarizes automatic location suggestions with visible follow-up hints", () => {
    expect(
      summarizeFallwildLocationSuggestion({
        location: {
          lat: 48.339,
          lng: 16.7201,
          source: "device-gps"
        },
        warnings: [
          "Google Reverse Geocoding ist nicht konfiguriert.",
          "GIP-Straßenkilometer ist noch nicht automatisiert; bitte manuell ergänzen."
        ]
      })
    ).toBe(
      "GPS übernommen. Adresse und Straßenkilometer bitte manuell ergänzen. Hinweis: Google Reverse Geocoding ist nicht konfiguriert. GIP-Straßenkilometer ist noch nicht automatisiert; bitte manuell ergänzen."
    );
  });
});
