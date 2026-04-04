import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import type { AnsitzSession } from "@hege/domain";

import { ScreenShell } from "../../components/screen-shell";
import { formatDateTime } from "../../lib/format";
import { fetchLiveAnsitze, type CreateAnsitzRequest } from "../../lib/api";
import {
  syncOfflineQueue,
  submitAnsitzWithOfflineFallback,
  useOfflineQueueSnapshot
} from "../../lib/offline-queue";
import { colors } from "../../lib/theme";

const DEFAULT_LOCATION = {
  lat: 47.9161,
  lng: 13.5182,
  label: "Mobil gemeldet"
};

export default function AnsitzeScreen() {
  const queue = useOfflineQueueSnapshot();
  const [ansitze, setAnsitze] = useState<AnsitzSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadAnsitze();
  }, []);

  async function loadAnsitze(options?: { refreshing?: boolean }) {
    const refreshing = options?.refreshing ?? false;

    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      setAnsitze(await fetchLiveAnsitze());
    } catch (fetchError) {
      setAnsitze([]);
      setError(fetchError instanceof Error ? fetchError.message : "Unbekannter Fehler");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  async function handleQuickAnsitz() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const payload = buildQuickAnsitzPayload(ansitze);
      const result = await submitAnsitzWithOfflineFallback(payload);

      setMessage(
        result.mode === "sent"
          ? "Ansitz direkt an die API gesendet."
          : "Keine Verbindung: Ansitz wurde in die Offline-Queue gelegt."
      );

      await loadAnsitze({ refreshing: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Ansitz konnte nicht gemeldet werden.");
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
      await loadAnsitze({ refreshing: true });
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Queue konnte nicht synchronisiert werden.");
    }
  }

  const queueEntries = queue.entries.filter((entry) => entry.kind === "ansitz-create");

  return (
    <ScreenShell
      eyebrow="Ansitz"
      title="Ansitz mit einem Tap bekanntgeben."
      subtitle="Aktive Ansitze werden ueber den zentralen API-Client geladen und offline vorgemerkt, wenn das Netz weg ist."
      aside={
        <View style={styles.queueCard}>
          <Text style={styles.queueTitle}>Ansitz-Queue</Text>
          <Text style={styles.queueValue}>{queueEntries.length}</Text>
          <Text style={styles.queueCopy}>Pending und Failed Eintraege werden bei bestehender Verbindung erneut gesendet.</Text>
        </View>
      }
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ansitz schnell melden"
        style={[styles.primaryAction, isSubmitting ? styles.buttonDisabled : null]}
        onPress={() => void handleQuickAnsitz()}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff9ef" />
        ) : (
          <>
            <Text style={styles.primaryActionTitle}>Schnellansitz melden</Text>
            <Text style={styles.primaryActionCopy}>
              Legt sofort einen Ansitz an oder merkt ihn offline fuer die Synchronisierung vor.
            </Text>
          </>
        )}
      </Pressable>

      <View style={styles.toolbar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ansitze aktualisieren"
          style={[styles.refreshButton, isRefreshing ? styles.buttonDisabled : null]}
          onPress={() => void loadAnsitze({ refreshing: true })}
          disabled={isRefreshing}
        >
          {isRefreshing ? <ActivityIndicator color={colors.ink} /> : <Text style={styles.refreshButtonText}>Aktualisieren</Text>}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ansitz-Queue synchronisieren"
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
          <Text style={styles.stateTitle}>Ansitze werden geladen</Text>
          <Text style={styles.stateCopy}>Die aktuelle Liste wird von der API abgefragt.</Text>
        </View>
      ) : error ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Ansitz nicht verfuegbar</Text>
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

      <ScrollView
        nestedScrollEnabled
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => void loadAnsitze({ refreshing: true })} />
        }
        contentContainerStyle={styles.listContent}
        style={styles.listScroll}
      >
        {ansitze.length === 0 && !isLoading && !error ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Keine aktiven Ansitze</Text>
            <Text style={styles.stateCopy}>Sobald ein Jaeger einen Ansitz meldet, erscheint er hier.</Text>
          </View>
        ) : null}

        {ansitze.map((entry) => (
          <View key={entry.id} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.grow}>
                <Text style={styles.title}>{entry.standortName}</Text>
                <Text style={styles.copy}>{entry.location.label ?? "Ohne Standort"}</Text>
              </View>
              <View style={entry.conflict ? styles.dangerBadge : styles.okBadge}>
                <Text style={entry.conflict ? styles.dangerText : styles.okText}>{entry.conflict ? "Warnung" : "Aktiv"}</Text>
              </View>
            </View>

            <Text style={styles.copy}>Beginn: {formatDateTime(entry.startedAt)}</Text>
            {entry.plannedEndAt ? <Text style={styles.copy}>Geplant bis: {formatDateTime(entry.plannedEndAt)}</Text> : null}
            <Text style={styles.copy}>{entry.note ?? "Keine Notiz"}</Text>
          </View>
        ))}
      </ScrollView>
    </ScreenShell>
  );
}

function buildQuickAnsitzPayload(ansitze: AnsitzSession[]): CreateAnsitzRequest {
  const template = ansitze[0];

  return {
    standortName: template?.standortName ?? "Mobiler Ansitz",
    standortId: template?.standortId,
    location: template?.location ?? DEFAULT_LOCATION,
    startedAt: new Date().toISOString(),
    note: "Schnellmeldung aus der Mobile-App"
  };
}

const styles = StyleSheet.create({
  listScroll: {
    maxHeight: 520
  },
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 10
  },
  refreshButton: {
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
  listContent: {
    gap: 12,
    paddingBottom: 24
  },
  stateCard: {
    gap: 6,
    padding: 18,
    borderRadius: 22,
    backgroundColor: colors.card
  },
  infoCard: {
    gap: 6,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "#efe3d1"
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
  card: {
    gap: 10,
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
  okBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#dde7cf"
  },
  dangerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#f0d9d4"
  },
  okText: {
    color: colors.accent,
    fontWeight: "600"
  },
  dangerText: {
    color: colors.danger,
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
