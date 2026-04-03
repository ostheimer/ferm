import { buildDashboardOverview, defaultRevierId, demoData } from "@ferm/domain";
import { StyleSheet, Text, View } from "react-native";

import { MapPreview } from "../../components/map-preview";
import { MetricTile } from "../../components/metric-tile";
import { ScreenShell } from "../../components/screen-shell";
import { readOfflineQueue } from "../../lib/offline-queue";
import { colors } from "../../lib/theme";
import { useEffect, useState } from "react";

export default function DashboardScreen() {
  const overview = buildDashboardOverview(demoData, defaultRevierId);
  const [queueCount, setQueueCount] = useState<number>(0);

  useEffect(() => {
    void readOfflineQueue().then((queue) => setQueueCount(queue.length));
  }, []);

  return (
    <ScreenShell
      eyebrow="Revier heute"
      title="Alles Wichtige für den Einsatz draußen."
      subtitle="Ansitze, Fallwild und Protokolle bleiben auch bei schwachem Empfang sichtbar."
      aside={
        <View style={styles.aside}>
          <Text style={styles.asideLabel}>Offline-Warteschlange</Text>
          <Text style={styles.asideValue}>{queueCount}</Text>
          <Text style={styles.asideCopy}>Erfassungen warten auf Synchronisierung.</Text>
        </View>
      }
    >
      <View style={styles.metricGrid}>
        <MetricTile label="Ansitze" value={overview.aktiveAnsitze} detail="Aktuell im Revier gemeldet." />
        <MetricTile label="Fallwild" value={overview.heutigeFallwildBergungen} detail="Heute dokumentiert." />
      </View>
      <MapPreview
        ansitze={demoData.ansitze.filter((entry) => entry.status === "active")}
        einrichtungen={demoData.reviereinrichtungen}
        fallwild={demoData.fallwild}
      />
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nächste Sitzung</Text>
        <Text style={styles.cardValue}>{overview.naechsteSitzung?.title}</Text>
        <Text style={styles.cardCopy}>{overview.naechsteSitzung?.locationLabel}</Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  aside: {
    gap: 6
  },
  asideLabel: {
    color: "#dfe9c7",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.3
  },
  asideValue: {
    color: "#fff9ef",
    fontSize: 34,
    fontWeight: "700"
  },
  asideCopy: {
    color: "#f7f2e5",
    fontSize: 14,
    lineHeight: 20
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  card: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: colors.card,
    gap: 6
  },
  cardTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: colors.muted
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.ink
  },
  cardCopy: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted
  }
});
