import { demoData } from "@ferm/domain";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../../components/screen-shell";
import { formatDateTime } from "../../lib/format";
import { readOfflineQueue } from "../../lib/offline-queue";
import { colors } from "../../lib/theme";

export default function FallwildScreen() {
  const [pendingQueue, setPendingQueue] = useState(0);

  useEffect(() => {
    void readOfflineQueue().then((entries) => setPendingQueue(entries.length));
  }, []);

  return (
    <ScreenShell
      eyebrow="Fallwild"
      title="Bergung auch ohne Netz sauber dokumentieren."
      subtitle="Zeitpunkt, GPS, Fotos und Wildart bleiben lokal erhalten und synchronisieren später."
    >
      <View style={styles.queueCard}>
        <Text style={styles.queueTitle}>Ausstehende Synchronisierung</Text>
        <Text style={styles.queueValue}>{pendingQueue}</Text>
        <Text style={styles.queueCopy}>Erfasste Vorgänge und Fotos werden automatisch nachgereicht.</Text>
      </View>

      {demoData.fallwild.map((entry) => (
        <View key={entry.id} style={styles.card}>
          <Text style={styles.title}>
            {entry.wildart} · {entry.gemeinde}
          </Text>
          <Text style={styles.copy}>{entry.geschlecht}, {entry.altersklasse}</Text>
          <Text style={styles.copy}>Status: {entry.bergungsStatus}</Text>
          <Text style={styles.copy}>{formatDateTime(entry.recordedAt)}</Text>
        </View>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  queueCard: {
    gap: 8,
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#efe3d1"
  },
  queueTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: colors.warning
  },
  queueValue: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.ink
  },
  queueCopy: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted
  },
  card: {
    gap: 6,
    padding: 18,
    borderRadius: 22,
    backgroundColor: colors.card
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.ink
  },
  copy: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted
  }
});
