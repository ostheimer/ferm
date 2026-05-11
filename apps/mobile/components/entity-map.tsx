import * as Haptics from "expo-haptics";
import { useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import type { GeoPoint } from "@hege/domain";

import type { ThemeColors } from "../lib/theme";
import { useThemeColors } from "../lib/theme";
import { useThemedStyles } from "../lib/use-themed-styles";
import {
  AUSTRIA_DEFAULT_CENTER,
  buildInitialRegion,
  type RevierCenter
} from "./map-preview.helpers";

const ANDROID_GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_BROWSER_API_KEY;
const ANDROID_HAS_GOOGLE_KEY = Platform.OS === "android" && !!ANDROID_GOOGLE_KEY;
const MAP_PROVIDER =
  Platform.OS === "android" ? (ANDROID_HAS_GOOGLE_KEY ? PROVIDER_GOOGLE : undefined) : undefined;
const SHOULD_RENDER_NATIVE_MAP = Platform.OS === "ios" || ANDROID_HAS_GOOGLE_KEY;

export interface EntityPin {
  id: string;
  location: GeoPoint;
  title: string;
  subtitle?: string;
}

interface EntityMapProps {
  pins: ReadonlyArray<EntityPin>;
  revierCenter?: RevierCenter;
  /** Pin-Farbe — Domain-Tab-spezifisch. Default theme.accent (Ansitz). */
  pinColor?: string;
  /**
   * Tap auf einen Pin. Aufrufer kann z.B. ein Detail-Sheet oeffnen
   * oder zur Detail-Route navigieren.
   */
  onPinPress?: (pin: EntityPin) => void;
  /**
   * Fixe Hoehe in px. Default `null` = `flex: 1`, fuellt den Eltern-
   * Container. Praktisch zum Einbetten in ScrollView-Tabs, wo man
   * eine begrenzte Hoehe braucht.
   */
  height?: number | null;
}

/**
 * `<EntityMap>` — schlanke Single-Layer-Karte fuer Locations-Tabs
 * (Ansitze / Fallwild / Reviereinrichtungen).
 *
 * Anders als `<MapStage>` (das Multi-Layer fuer das Heute-Dashboard
 * war): keine Filter-Chips, kein Bottom-Banner, kein
 * Tagesuebersicht-Hook. Eine Liste Pins, eine Pin-Farbe, optional
 * ein `onPinPress`-Callback. Die Region wird beim ersten Render auf
 * die Bounding-Box der Pins gerechnet; `react-native-maps` ignoriert
 * spaetere `initialRegion`-Updates ohnehin.
 *
 * Auf Android ohne Google-Key faellt die Komponente auf einen
 * Hinweis-Fallback zurueck — der Verhaltenspatch matched
 * `<MapPreview>` und `<MapStage>`, damit sich alle drei Karten
 * gleich verhalten.
 */
export function EntityMap({
  pins,
  revierCenter,
  pinColor,
  onPinPress,
  height = null
}: EntityMapProps) {
  const styles = useThemedStyles(createStyles);
  const theme = useThemeColors();

  const initialRegion = useMemo(() => {
    const center = revierCenter ?? AUSTRIA_DEFAULT_CENTER;
    return buildInitialRegion(center, pins);
    // Pins-Identitaet wechselt selten genug, dass wir bewusst nicht
    // bei jedem Update neu rechnen — die Map ignoriert `initialRegion`
    // nach dem ersten Render ohnehin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerStyle =
    height === null ? styles.containerFlex : [styles.containerFixed, { height }];

  if (!SHOULD_RENDER_NATIVE_MAP) {
    return (
      <View style={[containerStyle, styles.fallback]}>
        <Text style={styles.fallbackTitle}>Karte nicht aktiv</Text>
        <Text style={styles.fallbackCopy}>
          Karte wird mit Google-Maps-Key aktiviert. Liste bleibt unter dem Toggle erreichbar.
        </Text>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <MapView
        provider={MAP_PROVIDER}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            coordinate={{ latitude: pin.location.lat, longitude: pin.location.lng }}
            pinColor={pinColor ?? theme.accent}
            onPress={() => {
              if (!onPinPress) {
                return;
              }
              void Haptics.selectionAsync();
              onPinPress(pin);
            }}
            // Wir behalten die native Callout absichtlich bei: wer keinen
            // Pin-Press-Handler liefert, sieht trotzdem Title/Subtitle,
            // sonst koennen wir vom Aufrufer aus ein eigenes Sheet rendern.
            title={onPinPress ? undefined : pin.title}
            description={onPinPress ? undefined : pin.subtitle}
          />
        ))}
      </MapView>
    </View>
  );
}

const createStyles = (theme: ThemeColors) =>
  ({
    containerFlex: {
      flex: 1,
      borderRadius: 22,
      overflow: "hidden",
      backgroundColor: theme.card
    },
    containerFixed: {
      width: "100%",
      borderRadius: 22,
      overflow: "hidden",
      backgroundColor: theme.card
    },
    fallback: {
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      gap: 8,
      backgroundColor: theme.accent,
      minHeight: 200
    },
    fallbackTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#fff9ef",
      textAlign: "center"
    },
    fallbackCopy: {
      fontSize: 13,
      lineHeight: 18,
      color: "#f7f2e5",
      textAlign: "center"
    }
  }) as const;
