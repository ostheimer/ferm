import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../../components/screen-shell";
import { formatDateTime } from "../../lib/format";
import { fetchFallwildList, type FallwildListItem } from "../../lib/api";
import { readOfflineQueue } from "../../lib/offline-queue";
import { colors } from "../../lib/theme";

export default function FallwildScreen() {
  const [fallwild, setFallwild] = useState<FallwildListItem[]>([]);
  const [pendingQueue, setPendingQueue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadFallwild();
    void readOfflineQueue().then((entries) => setPendingQueue(entries.length));
  }, []);

  async function loadFallwild(options?: { refreshing?: boolean }) {
    const refreshing = options?.refreshing ?? false;

    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const entries = await fetchFallwildList();
      setFallwild(entries);
    } catch (fetchError) {
      setFallwild([]);
      setError(fetchError instanceof Error ? fetchError.message : "Unbekannter Fehler");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  return (
    <ScreenShell
      eyebrow="Fallwild"
      title="Bergung auch ohne Netz sauber dokumentieren."
      subtitle="Zeitpunkt, GPS, Fotos und Wildart werden ueber die API geladen und bleiben lokal synchronisierbar."
      aside={
        <View style={styles.queueCard}>
          <Text style={styles.queueTitle}>Ausstehende Synchronisierung</Text>
          <Text style={styles.queueValue}>{pendingQueue}</Text>
          <Text style={styles.queueCopy}>Erfasste Vorgaenge und Fotos werden automatisch nachgereicht.</Text>
        </View>
      }
    >
      <View style={styles.toolbar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fallwild aktualisieren"
          style={[styles.refreshButton, isRefreshing ? styles.refreshButtonDisabled : null]}
          onPress={() => void loadFallwild({ refreshing: true })}
          disabled={isRefreshing}
        >
          {isRefreshing ? <ActivityIndicator color={colors.ink} /> : <Text style={styles.refreshButtonText}>Aktualisieren</Text>}
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Fallwild wird geladen</Text>
          <Text style={styles.stateCopy}>Die aktuelle Liste wird ueber die API abgefragt.</Text>
        </View>
      ) : error ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>API nicht erreichbar</Text>
          <Text style={styles.stateCopy}>{`${error}. Tippe auf "Aktualisieren", sobald die Verbindung wieder steht.`}</Text>
        </View>
      ) : null}

      {!isLoading && !error && fallwild.length === 0 ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Kein Fallwild gemeldet</Text>
          <Text style={styles.stateCopy}>Sobald ein Vorgang erfasst ist, erscheint er hier.</Text>
        </View>
      ) : null}

      {fallwild.map((entry) => (
        <View key={entry.id} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.grow}>
              <Text style={styles.title}>
                {entry.wildart} / {entry.gemeinde}
              </Text>
              <Text style={styles.copy}>
                {entry.geschlecht}, {entry.altersklasse}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{entry.bergungsStatus}</Text>
            </View>
          </View>

          <Text style={styles.copy}>{entry.location.label ?? "Ohne Standort"}</Text>
          <Text style={styles.copy}>{formatDateTime(entry.recordedAt)}</Text>
          {entry.note ? <Text style={styles.copy}>{entry.note}</Text> : null}
          {entry.photos.length > 0 ? <Text style={styles.copy}>{entry.photos.length} Foto(s)</Text> : null}
        </View>
      ))}
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
  queueCard: {
    gap: 8
  },
  queueTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "#f7f2e5"
  },
  queueValue: {
    fontSize: 34,
    fontWeight: "700",
    color: "#fff9ef"
  },
  queueCopy: {
    fontSize: 14,
    lineHeight: 20,
    color: "#f7f2e5"
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
    gap: 6,
    padding: 18,
    borderRadius: 22,
    backgroundColor: colors.card
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start"
  },
  grow: {
    flex: 1,
    gap: 4
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
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#efe3d1"
  },
  badgeText: {
    color: colors.warning,
    fontWeight: "600"
  }
});
