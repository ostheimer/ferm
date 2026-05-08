import { useMemo } from "react";
import {
  StyleSheet,
  type ImageStyle,
  type StyleProp,
  type TextStyle,
  type ViewStyle
} from "react-native";

import { useThemeColors, type ThemeColors } from "./theme";

type Style = StyleProp<ViewStyle | TextStyle | ImageStyle>;
type StyleFactory<T extends Record<string, Style>> = (theme: ThemeColors) => T;

/**
 * Erstellt aus einer themen-abhaengigen Style-Factory ein memoisiertes
 * `StyleSheet`-Objekt. Wechselt das System-Color-Scheme zwischen `light` und
 * `dark`, wird die Factory neu evaluiert und ein frisches Styles-Objekt
 * zurueckgegeben (P1.8 / UX-Roadmap-v2).
 *
 * Damit die Memoisierung greift, sollte die Factory eine Modul-Konstante
 * sein (z. B. `const createStyles = (theme: ThemeColors) => ({ ... })`).
 *
 * Konsumenten geben ein Plain-Objekt mit Styles zurueck; das `StyleSheet.create`-
 * Wrapping erledigt der Hook.
 */
export function useThemedStyles<T extends Record<string, Style>>(factory: StyleFactory<T>): T {
  const theme = useThemeColors();

  return useMemo(
    () =>
      StyleSheet.create(factory(theme) as Record<string, ViewStyle | TextStyle | ImageStyle>) as T,
    [theme, factory]
  );
}
