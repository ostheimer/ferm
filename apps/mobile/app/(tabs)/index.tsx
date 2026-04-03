import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { MapPreview } from "../../components/map-preview";
import { MetricTile } from "../../components/metric-tile";
import { ScreenShell } from "../../components/screen-shell";
import { fetchDashboardSnapshot, type DashboardSnapshot } from "../../lib/api";
import { readOfflineQueue } from "../../lib/offline-queue";
import { colors } from "../../lib/theme";

export default function DashboardScreen() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [queueCount, setQueueCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadDashboard();
    void readOfflineQueue().then((queue) => setQueueCount(queue.length));
  }, []);

  async function loadDashboard(options?: { refreshing?: boolean }) {
    const refreshing = options?.refreshing ?? false;

    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const data = await fetchDashboardSnapshot();
      setSnapshot(data);
    } catch (fetchError) {
      setSnapshot(null);
      setError(fetchError instanceof Error ? fetchError.message : "Unbekannter Fehler");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  const activeAnsitze = snapshot?.ansitze ?? [];

  return (
    <ScreenShell
      eyebrow="Revier heute"
      title={snapshot?.revier.name ?? "Alles Wichtige fuer den Einsatz draussen."}
      subtitle={
        snapshot
          ? `${snapshot.user.name} / ${snapshot.membership.jagdzeichen} / ${snapshot.revier.bezirk}`
          : "Ansitze, Revierdaten und Offline-Queue bleiben auch bei schwachem Empfang sichtbar."
      }
      aside={
        <View style={styles.aside}>
          <Text style={styles.asideLabel}>Offline-Warteschlange</Text>
          <Text style={styles.asideValue}>{queueCount}</Text>
          <Text style={styles.asideCopy}>Erfassungen warten auf Synchronisierung.</Text>
          {snapshot ? <Text style={styles.asideMeta}>{`${snapshot.user.name} / ${snapshot.membership.role}`}</Text> : null}
        </View>
      }
    >
      <View style={styles.toolbar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dashboard aktualisieren"
          style={[styles.refreshButton, isRefreshing ? styles.refreshButtonDisabled : null]}
          onPress={() => void loadDashboard({ refreshing: true })}
          disabled={isRefreshing}
        >
          {isRefreshing ? <ActivityIndicator color={colors.ink} /> : <Text style={styles.refreshButtonText}>Aktualisieren</Text>}
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Dashboard wird geladen</Text>
          <Text style={styles.stateCopy}>Revierdaten und aktive Ansitze werden von der API abgefragt.</Text>
        </View>
      ) : error ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>API nicht erreichbar</Text>
          <Text style={styles.stateCopy}>{`${error}. Tippe auf "Aktualisieren", sobald die Verbindung wieder steht.`}</Text>
        </View>
      ) : null}

      <View style={styles.metricGrid}>
        <MetricTile label="Ansitze" value={snapshot?.ansitze.length ?? "-"} detail="Aktuell im Revier gemeldet." />
        <MetricTile label="Bezirk" value={snapshot?.revier.bezirk ?? "-"} detail={snapshot?.revier.name ?? "Noch keine Daten"} />
        <MetricTile label="Queue" value={queueCount} detail="Offene Offline-Eingaben." />
      </View>

      {snapshot ? (
        <>
          <MapPreview revierName={snapshot.revier.name} ansitze={activeAnsitze} />
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Eingeloggt</Text>
            <Text style={styles.cardValue}>{snapshot.user.name}</Text>
            <Text style={styles.cardCopy}>{`${snapshot.membership.role} / ${snapshot.membership.jagdzeichen}`}</Text>
          </View>
        </>
      ) : null}

      {!isLoading && !error && snapshot && activeAnsitze.length === 0 ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Keine aktiven Ansitze</Text>
          <Text style={styles.stateCopy}>Sobald jemand im Revier ansitzt, erscheint der Eintrag hier und auf der Karte.</Text>
        </View>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  refreshButton: {
    minWidth: 132,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.card
  },
  refreshButtonDisabled: {
    opacity: 0.7
  },
  refreshButtonText: {
    color: colors.ink,
    fontWeight: "600"
  },
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
  asideMeta: {
    color: "#e5efd9",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.1
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  stateCard: {
    gap: 6,
    padding: 18,
    borderRadius: 22,
    backgroundColor: colors.card
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink
  },
  stateCopy: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted
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
