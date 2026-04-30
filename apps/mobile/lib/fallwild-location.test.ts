import { describe, expect, it } from "vitest";

import { applyFallwildLocationSuggestion, buildFallwildRoadReference } from "./fallwild-location";

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
});
