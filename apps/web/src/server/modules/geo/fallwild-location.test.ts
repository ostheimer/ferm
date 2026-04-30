import { describe, expect, it, vi } from "vitest";

describe("fallwild location resolver", () => {
  it("combines Google address data with a GIP road kilometer resolver", async () => {
    const { resolveFallwildLocation } = await loadModule({
      googleMapsServerApiKey: "google-key",
      googleMapsLanguage: "de",
      googleMapsRegion: "AT",
      gipRoadKilometerEndpoint: "https://gip.example.test/resolve"
    });
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          status: "OK",
          results: [
            {
              formatted_address: "L9, 2230 Gänserndorf",
              place_id: "google-place-1",
              address_components: [
                { long_name: "L9", types: ["route"] },
                { long_name: "Gänserndorf", types: ["locality"] }
              ]
            }
          ]
        })
      )
      .mockResolvedValueOnce(
        jsonResponse({
          roadName: "L9",
          roadKilometer: "12,4",
          segmentId: "gip-segment-1"
        })
      );

    await expect(
      resolveFallwildLocation({
        lat: 48.339,
        lng: 16.7201,
        fetchImpl: fetchImpl as unknown as typeof fetch
      })
    ).resolves.toMatchObject({
      location: {
        label: "L9",
        addressLabel: "L9, 2230 Gänserndorf",
        placeId: "google-place-1"
      },
      gemeinde: "Gänserndorf",
      strasse: "L9",
      roadReference: {
        roadName: "L9",
        roadKilometer: "12,4",
        source: "gip",
        placeId: "gip-segment-1"
      },
      warnings: []
    });
  });

  it("keeps GPS usable when Google and GIP are not configured", async () => {
    const { resolveFallwildLocation } = await loadModule({
      googleMapsLanguage: "de",
      googleMapsRegion: "AT"
    });

    await expect(
      resolveFallwildLocation({
        lat: 48.339,
        lng: 16.7201,
        fetchImpl: vi.fn() as unknown as typeof fetch
      })
    ).resolves.toMatchObject({
      location: {
        lat: 48.339,
        lng: 16.7201,
        source: "device-gps"
      },
      warnings: [
        "Google Reverse Geocoding ist nicht konfiguriert.",
        "GIP-Straßenkilometer ist noch nicht automatisiert; bitte manuell ergänzen."
      ]
    });
  });
});

async function loadModule(env: Record<string, unknown>) {
  vi.resetModules();
  vi.doMock("../../env", () => ({
    getServerEnv: () => ({
      useDemoStore: false,
      ...env
    })
  }));

  return import("./fallwild-location");
}

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    json: async () => payload
  };
}
