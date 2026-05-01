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

  it("uses local Gänserndorf fixtures in mock provider mode without external requests", async () => {
    const { resolveFallwildLocation } = await loadModule({
      geoProviderMode: "mock",
      googleMapsLanguage: "de",
      googleMapsRegion: "AT"
    });
    const fetchImpl = vi.fn();

    await expect(
      resolveFallwildLocation({
        lat: 48.339,
        lng: 16.7201,
        fetchImpl: fetchImpl as unknown as typeof fetch
      })
    ).resolves.toMatchObject({
      location: {
        addressLabel: "Landesstraße 9, 2230 Gänserndorf, Österreich",
        placeId: "mock-google-gaenserndorf-l9"
      },
      gemeinde: "Gänserndorf",
      strasse: "L9",
      roadReference: {
        roadName: "L9",
        roadKilometer: "12,4",
        source: "gip",
        placeId: "mock-gip-gaenserndorf-l9-km-12-4"
      },
      warnings: [
        "Mock-Geocoder aktiv; Adresse stammt aus lokalen Testdaten.",
        "Mock-GIP aktiv; Straßenkilometer stammt aus lokalen Testdaten."
      ]
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("surfaces ambiguous Google reverse geocoding results as a warning", async () => {
    const { resolveFallwildLocation } = await loadModule({
      googleMapsServerApiKey: "google-key",
      googleMapsLanguage: "de",
      googleMapsRegion: "AT"
    });
    const fetchImpl = vi.fn().mockResolvedValueOnce(
      jsonResponse({
        status: "OK",
        results: [
          {
            formatted_address: "Erster Treffer",
            place_id: "first-place",
            address_components: [{ long_name: "Gänserndorf", types: ["locality"] }]
          },
          {
            formatted_address: "Zweiter Treffer",
            place_id: "second-place",
            address_components: [{ long_name: "Gänserndorf", types: ["locality"] }]
          }
        ]
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
        addressLabel: "Erster Treffer",
        placeId: "first-place"
      },
      warnings: expect.arrayContaining([
        "Google Reverse Geocoding hat mehrere Treffer geliefert; erster Treffer wurde übernommen.",
        "GIP-Straßenkilometer ist noch nicht automatisiert; bitte manuell ergänzen."
      ])
    });
  });

  it("returns provider errors as recoverable warnings", async () => {
    const { resolveFallwildLocation } = await loadModule({});

    await expect(
      resolveFallwildLocation({
        lat: 48.339,
        lng: 16.7201,
        fetchImpl: vi.fn() as unknown as typeof fetch,
        providers: {
          reverseGeocoder: {
            async reverseGeocode() {
              throw new Error("Adresse temporär nicht verfügbar.");
            }
          },
          roadKilometerResolver: {
            async resolveRoadKilometer() {
              throw new Error("GIP temporär nicht verfügbar.");
            }
          }
        }
      })
    ).resolves.toMatchObject({
      location: {
        lat: 48.339,
        lng: 16.7201,
        source: "device-gps"
      },
      warnings: ["Adresse temporär nicht verfügbar.", "GIP temporär nicht verfügbar."]
    });
  });
});

async function loadModule(env: Record<string, unknown>) {
  vi.resetModules();
  vi.doMock("../../env", () => ({
    getServerEnv: () => ({
      useDemoStore: false,
      geoProviderMode: "live",
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
