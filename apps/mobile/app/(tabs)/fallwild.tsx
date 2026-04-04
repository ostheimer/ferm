import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../../components/screen-shell";
import { formatDateTime } from "../../lib/format";
import { fetchFallwildList, type CreateFallwildRequest, type FallwildListItem } from "../../lib/api";
import {
  syncOfflineQueue,
  submitFallwildWithOfflineFallback,
  useOfflineQueueSnapshot
} from "../../lib/offline-queue";
import { colors } from "../../lib/theme";

const DEFAULT_FALLWILD_PAYLOAD: CreateFallwildRequest = {
  recordedAt: new Date().toISOString(),
  location: {
    lat: 47.9184,
    lng: 13.5219,
    label: "Forststrasse"
  },
  wildart: "Fuchs",
  geschlecht: "weiblich",
  altersklasse: "Adult",
  bergungsStatus: "geborgen",
  gemeinde: "Steinbach am Attersee",
  note: "Schnellerfassung aus der Mobile-App"
};

export default function FallwildScreen() {
  const queue = useOfflineQueueSnapshot();
  const [fallwild, setFallwild] = useState<FallwildListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadFallwild();
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

  async function handleQuickFallwild() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const payload = buildQuickFallwildPayload();
      const result = await submitFallwildWithOfflineFallback(payload);

      setMessage(
        result.mode === "sent"
          ? "Fallwild direkt an die API gesendet."
          : "Keine Verbindung: Fallwild wurde in die Offline-Queue gelegt."
      );

      await loadFallwild({ refreshing: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Fallwild konnte nicht erfasst werden.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleQueueSync() {
    setMessage(null);
    setError(null);

    try {
      const remaining = await syncOfflineQueue();
      setMessage(
        remaining.length === 0
          ? "Offline-Queue synchronisiert."
          : `${remaining.length} Queue-Eintraege warten weiter auf Synchronisierung.`
      );
      await loadFallwild({ refreshing: true });
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Queue konnte nicht synchronisiert werden.");
    }
  }

  const queueEntries = queue.entries.filter((entry) => entry.kind === "fallwild-create");

  return (
    <ScreenShell
      eyebrow="Fallwild"
      title="Bergung auch ohne Netz sauber dokumentieren."
      subtitle="Zeitpunkt, GPS und Wildart werden ueber die API erfasst oder offline vorgemerkt."
      aside={
        <View style={styles.queueCard}>
          <Text style={styles.queueTitle}>Ausstehende Synchronisierung</Text>
          <Text style={styles.queueValue}>{queueEntries.length}</Text>
          <Text style={styles.queueCopy}>Erfasste Vorgaenge werden automatisch nachgereicht.</Text>
        </View>
      }
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fallwild schnell erfassen"
        style={[styles.primaryAction, isSubmitting ? styles.buttonDisabled : null]}
        onPress={() => void handleQuickFallwild()}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff9ef" />
        ) : (
          <>
            <Text style={styles.primaryActionTitle}>Schnellerfassung starten</Text>
            <Text style={styles.primaryActionCopy}>Legt einen Bergungsvorgang an oder merkt ihn fuer Offline-Sync vor.</Text>
          </>
        )}
      </Pressable>

      <View style={styles.toolbar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fallwild aktualisieren"
          style={[styles.refreshButton, isRefreshing ? styles.buttonDisabled : null]}
          onPress={() => void loadFallwild({ refreshing: true })}
          disabled={isRefreshing}
        >
          {isRefreshing ? <ActivityIndicator color={colors.ink} /> : <Text style={styles.refreshButtonText}>Aktualisieren</Text>}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fallwild-Queue synchronisieren"
          style={[styles.refreshButton, queue.isSyncing ? styles.buttonDisabled : null]}
          onPress={() => void handleQueueSync()}
          disabled={queue.isSyncing}
        >
          <Text style={styles.refreshButtonText}>{queue.isSyncing ? "Synchronisiert..." : "Queue sync"}</Text>
        </Pressable>
      </View>

      {message ? (
        <View style={styles.infoCard}>
          <Text style={styles.stateTitle}>Status</Text>
          <Text style={styles.stateCopy}>{message}</Text>
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Fallwild wird geladen</Text>
          <Text style={styles.stateCopy}>Die aktuelle Liste wird ueber die API abgefragt.</Text>
        </View>
      ) : error ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Fallwild nicht verfuegbar</Text>
          <Text style={styles.stateCopy}>{error}</Text>
        </View>
      ) : null}

      {queueEntries.length > 0 ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Offline-Vormerkungen</Text>
          {queueEntries.slice(0, 2).map((entry) => (
            <View key={entry.id} style={styles.queueRow}>
              <Text style={styles.queueRowTitle}>{entry.title}</Text>
              <Text style={styles.queueRowCopy}>
                {entry.status}
                {entry.lastError ? ` / ${entry.lastError}` : ""}
              </Text>
            </View>
          ))}
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

function buildQuickFallwildPayload(): CreateFallwildRequest {
  return {
    ...DEFAULT_FALLWILD_PAYLOAD,
    recordedAt: new Date().toISOString()
  };
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 10
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
  buttonDisabled: {
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
  primaryAction: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: colors.accent
  },
  primaryActionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff9ef"
  },
  primaryActionCopy: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "#f7f2e5"
  },
  infoCard: {
    gap: 6,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "#efe3d1"
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
  },
  queueRow: {
    gap: 2
  },
  queueRowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.ink
  },
  queueRowCopy: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted
  }
});
