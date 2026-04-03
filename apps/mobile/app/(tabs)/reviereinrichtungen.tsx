import { demoData } from "@ferm/domain";
import { StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../../components/screen-shell";
import { colors } from "../../lib/theme";

export default function ReviereinrichtungenScreen() {
  return (
    <ScreenShell
      eyebrow="Revier"
      title="Einrichtungen direkt im Gelände kontrollieren."
      subtitle="Zustand, Mängel und Wartungen werden von der Karte aus fortgeschrieben."
    >
      {demoData.reviereinrichtungen.map((entry) => (
        <View key={entry.id} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.grow}>
              <Text style={styles.type}>{entry.type}</Text>
              <Text style={styles.title}>{entry.name}</Text>
            </View>
            <Text style={entry.status === "gut" ? styles.okText : styles.warningText}>{entry.status}</Text>
          </View>
          <Text style={styles.copy}>{entry.beschreibung}</Text>
          <Text style={styles.copy}>Standort: {entry.location.label}</Text>
          <Text style={styles.copy}>Kontrollen: {entry.kontrollen.length}</Text>
        </View>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
    padding: 18,
    borderRadius: 22,
    backgroundColor: colors.card
  },
  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start"
  },
  grow: {
    flex: 1,
    gap: 4
  },
  type: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: colors.muted
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.ink
  },
  copy: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted
  },
  okText: {
    color: colors.accent,
    fontWeight: "700"
  },
  warningText: {
    color: colors.warning,
    fontWeight: "700"
  }
});
