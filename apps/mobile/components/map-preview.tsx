import { StyleSheet, Text, View } from "react-native";
import type { AnsitzSession, FallwildVorgang, Reviereinrichtung } from "@ferm/domain";

import { colors } from "../lib/theme";

interface MapPreviewProps {
  ansitze: AnsitzSession[];
  einrichtungen: Reviereinrichtung[];
  fallwild: FallwildVorgang[];
}

export function MapPreview({ ansitze, einrichtungen, fallwild }: MapPreviewProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Revierkarte</Text>
      <View style={styles.mapSurface}>
        <View style={[styles.marker, { top: 44, left: 28 }]}>
          <Text style={styles.markerType}>Ansitz</Text>
          <Text style={styles.markerLabel}>{ansitze[0]?.standortName ?? "Aktiver Stand"}</Text>
        </View>
        <View style={[styles.marker, { top: 118, right: 24 }]}>
          <Text style={styles.markerType}>Einrichtung</Text>
          <Text style={styles.markerLabel}>{einrichtungen[0]?.name ?? "Hochstand"}</Text>
        </View>
        <View style={[styles.marker, { bottom: 30, left: 48 }]}>
          <Text style={styles.markerType}>Fallwild</Text>
          <Text style={styles.markerLabel}>{fallwild[0]?.gemeinde ?? "Unfallstelle"}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: colors.card,
    gap: 12
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.ink
  },
  mapSurface: {
    height: 250,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: colors.accent
  },
  marker: {
    position: "absolute",
    padding: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255, 250, 240, 0.94)",
    maxWidth: 150,
    gap: 2
  },
  markerType: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: colors.muted
  },
  markerLabel: {
    fontSize: 13,
    color: colors.ink,
    fontWeight: "600"
  }
});
