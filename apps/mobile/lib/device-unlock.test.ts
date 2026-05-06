import { beforeEach, describe, expect, it, vi } from "vitest";

describe("device unlock", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("prefers Face ID when facial recognition is supported", async () => {
    const { module, LocalAuthentication } = await loadDeviceUnlockModule();

    expect(
      module.getDeviceUnlockLabel([
        LocalAuthentication.AuthenticationType.FINGERPRINT,
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
      ])
    ).toBe("Face ID");
  });

  it("enables local unlock by default when biometrics are available and enrolled", async () => {
    const { module } = await loadDeviceUnlockModule();

    await expect(module.getDeviceUnlockState()).resolves.toMatchObject({
      available: true,
      enabled: true,
      label: "Face ID"
    });
  });

  it("reports a successful biometric unlock", async () => {
    const { module, LocalAuthentication } = await loadDeviceUnlockModule({
      authenticateAsync: vi.fn(async () => ({ success: true }))
    });

    await expect(module.authenticateDeviceUnlock()).resolves.toEqual({
      success: true,
      label: "Face ID"
    });
    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        promptMessage: "hege entsperren",
        fallbackLabel: "Gerätecode verwenden"
      })
    );
  });

  it("does not offer local unlock when the user disabled it", async () => {
    const { module, AsyncStorage } = await loadDeviceUnlockModule();

    await AsyncStorage.setItem("hege.mobile.deviceUnlock", "disabled");

    await expect(module.getDeviceUnlockState()).resolves.toMatchObject({
      available: true,
      enabled: false
    });
    await expect(module.authenticateDeviceUnlock()).resolves.toMatchObject({
      success: false,
      reason: "Entsperren per Geräteprüfung ist nicht aktiv."
    });
  });
});

async function loadDeviceUnlockModule({
  hasHardwareAsync = vi.fn(async () => true),
  isEnrolledAsync = vi.fn(async () => true),
  supportedAuthenticationTypesAsync = vi.fn(async () => [2]),
  authenticateAsync = vi.fn(async () => ({ success: true }))
}: {
  hasHardwareAsync?: ReturnType<typeof vi.fn>;
  isEnrolledAsync?: ReturnType<typeof vi.fn>;
  supportedAuthenticationTypesAsync?: ReturnType<typeof vi.fn>;
  authenticateAsync?: ReturnType<typeof vi.fn>;
} = {}) {
  const storage = new Map<string, string>();
  const AsyncStorage = {
    getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      storage.set(key, value);
    })
  };
  const LocalAuthentication = {
    AuthenticationType: {
      FINGERPRINT: 1,
      FACIAL_RECOGNITION: 2,
      IRIS: 3
    },
    hasHardwareAsync,
    isEnrolledAsync,
    supportedAuthenticationTypesAsync,
    authenticateAsync
  };

  vi.doMock("@react-native-async-storage/async-storage", () => ({
    default: AsyncStorage
  }));
  vi.doMock("expo-local-authentication", () => LocalAuthentication);

  return {
    module: await import("./device-unlock"),
    AsyncStorage,
    LocalAuthentication
  };
}
