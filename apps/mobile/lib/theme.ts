import { useColorScheme } from "react-native";

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  ink: string;
  muted: string;
  accent: string;
  accentSoft: string;
  warning: string;
  danger: string;
}

export const lightColors: ThemeColors = {
  background: "#f3efe3",
  surface: "#fffaf0",
  card: "#fffcf7",
  ink: "#173328",
  muted: "#5f7167",
  accent: "#29503f",
  accentSoft: "#d6e1bf",
  warning: "#866323",
  danger: "#96483d"
};

export const darkColors: ThemeColors = {
  background: "#0e1c16",
  surface: "#152921",
  card: "#1c352b",
  ink: "#f5f1e7",
  muted: "#a3b5ab",
  accent: "#9db36f",
  accentSoft: "#3a5a47",
  warning: "#cdb069",
  danger: "#d68a7d"
};

/**
 * Default token-Set, mit dem die meisten Screens heute statisch arbeiten.
 * Bleibt bewusst auf Light, damit F-19 keinen flaechigen Refactor erzwingt.
 * Components, die auf das aktive Schema reagieren sollen, importieren stattdessen
 * `useThemeColors()`.
 */
export const colors = lightColors;

/**
 * Liefert das passende Token-Set fuer das aktuelle System-Color-Scheme.
 * Mit `userInterfaceStyle: "automatic"` in app.json folgt das System dem User-
 * Setting; Components koennen damit Stueck fuer Stueck auf die getrennten
 * Token-Sets migriert werden.
 */
export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkColors : lightColors;
}
