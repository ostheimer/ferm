import type { AnsitzSession } from "@hege/domain";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../lib/theme";

interface MapPreviewProps {
  revierName: string;
  ansitze: AnsitzSession[];
}

const markerOffsets = [
  { top: 42, left: 28 },
  { top: 126, right: 26 },
  { bottom: 34, left: 52 }
] as const;

export function MapPreview({ revierName, ansitze }: MapPreviewProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.heading}>Revierkarte</Text>
        <Text style={styles.caption}>{revierName}</Text>
      </View>
      <View style={styles.mapSurface}>
        <View style={styles.mapGlow} />
        {ansitze.slice(0, markerOffsets.length).map((entry, index) => (
          <View key={entry.id} style={[styles.marker, markerOffsets[index]]}>
            <Text style={styles.markerType}>Ansitz</Text>
            <Text style={styles.markerLabel}>{entry.standortName}</Text>
            <Text style={styles.markerCopy}>{entry.location.label ?? "Aktiver Stand"}</Text>
          </View>
        ))}
        {ansitze.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Keine aktiven Ansitze</Text>
            <Text style={styles.emptyCopy}>Die Karte wird aktualisiert, sobald jemand im Revier ansitzt.</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.footer}>
        {ansitze.length > 0
          ? `${ansitze.length} aktive Ansitze auf der Karte`
          : "Aktuell keine Ansitze im Revier"}
      </Text>
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
  header: {
    gap: 4
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.ink
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted
  },
  mapSurface: {
    position: "relative",
    height: 250,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: colors.accent
  },
  mapGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 250, 240, 0.08)"
  },
  marker: {
    position: "absolute",
    padding: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255, 250, 240, 0.94)",
    maxWidth: 160,
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
  },
  markerCopy: {
    fontSize: 12,
    color: colors.muted
  },
  emptyState: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
    gap: 4
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff9ef",
    textAlign: "center"
  },
  emptyCopy: {
    fontSize: 13,
    lineHeight: 18,
    color: "#f7f2e5",
    textAlign: "center"
  },
  footer: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted
  }
});
