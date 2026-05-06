import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";

const STORAGE_KEY = "hege.mobile.deviceUnlock";

export interface DeviceUnlockState {
  available: boolean;
  enabled: boolean;
  label: string;
  reason?: string;
}

export interface DeviceUnlockResult {
  success: boolean;
  label: string;
  reason?: string;
}

export function getDeviceUnlockLabel(types: LocalAuthentication.AuthenticationType[]) {
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return "Face ID";
  }

  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return "Touch ID";
  }

  return "Geräteprüfung";
}

export async function getDeviceUnlockState(): Promise<DeviceUnlockState> {
  const storedPreference = await AsyncStorage.getItem(STORAGE_KEY);
  const enabled = storedPreference !== "disabled";

  try {
    const [hasHardware, types] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync()
    ]);
    const label = getDeviceUnlockLabel(types);

    if (!hasHardware) {
      return {
        available: false,
        enabled: false,
        label,
        reason: "Dieses Gerät unterstützt keine biometrische Entsperrung."
      };
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!isEnrolled) {
      return {
        available: false,
        enabled: false,
        label,
        reason: `${label} ist auf diesem Gerät noch nicht eingerichtet.`
      };
    }

    return {
      available: true,
      enabled,
      label
    };
  } catch {
    return {
      available: false,
      enabled: false,
      label: "Geräteprüfung",
      reason: "Die lokale Geräteprüfung ist derzeit nicht verfügbar."
    };
  }
}

export async function isDeviceUnlockEnabled() {
  const state = await getDeviceUnlockState();

  return state.available && state.enabled;
}

export async function enableDeviceUnlock() {
  await AsyncStorage.setItem(STORAGE_KEY, "enabled");
  return getDeviceUnlockState();
}

export async function disableDeviceUnlock() {
  await AsyncStorage.setItem(STORAGE_KEY, "disabled");
  return getDeviceUnlockState();
}

export async function authenticateDeviceUnlock(): Promise<DeviceUnlockResult> {
  const state = await getDeviceUnlockState();

  if (!state.available || !state.enabled) {
    return {
      success: false,
      label: state.label,
      reason: state.reason ?? "Entsperren per Geräteprüfung ist nicht aktiv."
    };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "hege entsperren",
    cancelLabel: "Abbrechen",
    fallbackLabel: "Gerätecode verwenden",
    disableDeviceFallback: false,
    biometricsSecurityLevel: "strong"
  });

  if (result.success) {
    return {
      success: true,
      label: state.label
    };
  }

  return {
    success: false,
    label: state.label,
    reason: getAuthenticationErrorMessage(result.error, state.label)
  };
}

function getAuthenticationErrorMessage(error: LocalAuthentication.LocalAuthenticationError, label: string) {
  if (error === "user_cancel" || error === "app_cancel" || error === "system_cancel") {
    return "Entsperren abgebrochen.";
  }

  if (error === "user_fallback") {
    return "Bitte melde dich mit Benutzername und PIN an.";
  }

  if (error === "lockout") {
    return `${label} ist vorübergehend gesperrt. Bitte verwende den Gerätecode oder melde dich mit PIN an.`;
  }

  if (error === "not_enrolled") {
    return `${label} ist auf diesem Gerät noch nicht eingerichtet.`;
  }

  if (error === "not_available" || error === "passcode_not_set") {
    return "Die lokale Geräteprüfung ist derzeit nicht verfügbar.";
  }

  return "Entsperren fehlgeschlagen. Bitte versuche es erneut oder melde dich mit PIN an.";
}
