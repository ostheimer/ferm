import { StyleSheet, Text, View } from "react-native";

import { colors } from "../lib/theme";

interface MetricTileProps {
  label: string;
  value: string | number;
  detail: string;
}

export function MetricTile({ label, value, detail }: MetricTileProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    gap: 8,
    padding: 18,
    borderRadius: 22,
    backgroundColor: colors.card
  },
  label: {
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.muted
  },
  value: {
    fontSize: 28,
    color: colors.ink,
    fontWeight: "700"
  },
  detail: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20
  }
});
