import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { DashboardResponse } from "@hege/domain";

import { MapPreview } from "../../components/map-preview";
import { MetricTile } from "../../components/metric-tile";
import { ScreenShell } from "../../components/screen-shell";
import { fetchDashboardSnapshot, logout } from "../../lib/api";
import {
  discardOfflineQueueEntry,
  retryOfflineQueueEntry,
  syncOfflineQueue,
  useOfflineQueueSnapshot
} from "../../lib/offline-queue";
import {
  getOfflineQueueEntryAttachmentHint,
  getOfflineQueueEntryRetryHint,
  getOfflineQueueEntryStatusLine,
  getOfflineQueueStatusLabel
} from "../../lib/offline-queue-status";
import { colors } from "../../lib/theme";

export default function DashboardScreen() {
  const router = useRouter();
  const queue = useOfflineQueueSnapshot();
  const [snapshot, setSnapshot] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queueMessage, setQueueMessage] = useState<string | null>(null);
  const [discardingEntryId, setDiscardingEntryId] = useState<string | null>(null);
  const [retryingEntryId, setRetryingEntryId] = useState<string | null>(null);

  useEffect(() => {
    void loadDashboard();
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

  async function handleQueueSync() {
    setQueueMessage(null);

    try {
      const remaining = await syncOfflineQueue();
      setQueueMessage(
        remaining.length === 0
          ? "Offline-Queue ist leer."
          : `${remaining.length} Einträge warten weiter auf Synchronisierung.`
      );
      await loadDashboard({ refreshing: true });
    } catch (syncError) {
      setQueueMessage(syncError instanceof Error ? syncError.message : "Queue konnte nicht synchronisiert werden.");
    }
  }

  async function handleDiscardEntry(entryId: string) {
    setDiscardingEntryId(entryId);
    setQueueMessage(null);

    try {
      await discardOfflineQueueEntry(entryId);
      setQueueMessage("Queue-Eintrag verworfen.");
    } catch (discardError) {
      setQueueMessage(discardError instanceof Error ? discardError.message : "Queue-Eintrag konnte nicht verworfen werden.");
    } finally {
      setDiscardingEntryId(null);
    }
  }

  async function handleRetryEntry(entryId: string) {
    setRetryingEntryId(entryId);
    setQueueMessage(null);

    try {
      await retryOfflineQueueEntry(entryId);
      const remaining = await syncOfflineQueue();
      setQueueMessage(
        remaining.length === 0
          ? "Queue-Eintrag erfolgreich synchronisiert."
          : `${remaining.length} Queue-Einträge warten weiter auf Synchronisierung.`
      );
      await loadDashboard({ refreshing: true });
    } catch (retryError) {
      setQueueMessage(retryError instanceof Error ? retryError.message : "Queue-Eintrag konnte nicht erneut versucht werden.");
    } finally {
      setRetryingEntryId(null);
    }
  }

  const queueEntries = queue.entries;
  const queueCount = queueEntries.length;
  const failedQueueCount = queueEntries.filter((entry) => entry.status === "failed").length;
  const activeAnsitze = snapshot?.activeAnsitze ?? [];
  const latestNotification = snapshot?.overview.letzteBenachrichtigungen[0];

  return (
    <ScreenShell
      eyebrow="Revier heute"
      title={snapshot?.revier.name ?? "Alles Wichtige für den Einsatz draußen."}
      subtitle={
        snapshot
          ? `${snapshot.user.name} / ${snapshot.membership.jagdzeichen} / ${snapshot.revier.bezirk}`
          : "Ansitze, Revierdaten und Offline-Queue bleiben auch bei schwachem Empfang sichtbar."
      }
      aside={
        <View style={styles.aside}>
          <Text style={styles.asideLabel}>Offline-Warteschlange</Text>
          <Text style={styles.asideValue}>{queueCount}</Text>
          <Text style={styles.asideCopy}>
            {failedQueueCount > 0
              ? `${failedQueueCount} Einträge brauchen einen erneuten Sync.`
              : "Erfassungen warten auf Synchronisierung."}
          </Text>
          {snapshot ? <Text style={styles.asideMeta}>{`${snapshot.user.name} / ${formatRoleLabel(snapshot.membership.role)}`}</Text> : null}
        </View>
      }
    >
      <View style={styles.toolbar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dashboard aktualisieren"
          style={[styles.refreshButton, isRefreshing ? styles.buttonDisabled : null]}
          onPress={() => void loadDashboard({ refreshing: true })}
          disabled={isRefreshing}
        >
          {isRefreshing ? <ActivityIndicator color={colors.ink} /> : <Text style={styles.refreshButtonText}>Aktualisieren</Text>}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Offline-Queue synchronisieren"
          style={[styles.secondaryButton, queue.isSyncing ? styles.buttonDisabled : null]}
          onPress={() => void handleQueueSync()}
          disabled={queue.isSyncing}
        >
          <Text style={styles.secondaryButtonText}>{queue.isSyncing ? "Synchronisiert..." : "Queue synchronisieren"}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abmelden"
          style={styles.secondaryButton}
          onPress={async () => {
            await logout();
            router.replace("/login");
          }}
        >
          <Text style={styles.secondaryButtonText}>Abmelden</Text>
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

      {queueMessage ? (
        <View style={styles.queueStateCard}>
          <Text style={styles.queueStateTitle}>Queue-Status</Text>
          <Text style={styles.queueStateCopy}>{queueMessage}</Text>
        </View>
      ) : null}

      <View style={styles.metricGrid}>
        <MetricTile label="Ansitze" value={snapshot?.activeAnsitze.length ?? "-"} detail="Aktuell im Revier gemeldet." />
        <MetricTile label="Wartungen" value={snapshot?.overview.offeneWartungen ?? "-"} detail="Offene Punkte an Einrichtungen." />
        <MetricTile label="Aufgaben" value={snapshot?.overview.offeneAufgaben ?? "-"} detail="Offene Arbeiten im Revier." />
        <MetricTile label="Fallwild" value={snapshot?.overview.heutigeFallwildBergungen ?? "-"} detail="Heute erfasste Bergungen." />
        <MetricTile label="Protokolle" value={snapshot?.overview.unveroeffentlichteProtokolle ?? "-"} detail="Noch nicht freigegeben." />
        <MetricTile label="Queue" value={queueCount} detail="Offene Offline-Eingaben." />
      </View>

      {snapshot ? (
        <>
          <MapPreview revierName={snapshot.revier.name} ansitze={activeAnsitze} />
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Eingeloggt</Text>
            <Text style={styles.cardValue}>{snapshot.user.name}</Text>
            <Text style={styles.cardCopy}>{`${formatRoleLabel(snapshot.membership.role)} / ${snapshot.membership.jagdzeichen}`}</Text>
          </View>
          {snapshot.overview.naechsteSitzung ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Nächste Sitzung</Text>
              <Text style={styles.cardValue}>{snapshot.overview.naechsteSitzung.title}</Text>
              <Text style={styles.cardCopy}>{snapshot.overview.naechsteSitzung.locationLabel}</Text>
            </View>
          ) : null}
          {latestNotification ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Letzte Benachrichtigung</Text>
              <Text style={styles.cardValue}>{latestNotification.title}</Text>
              <Text style={styles.cardCopy}>{latestNotification.body}</Text>
            </View>
          ) : null}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Offline-Queue</Text>
          {queueEntries.length === 0 ? (
            <Text style={styles.cardCopy}>Keine offenen Offline-Aktionen.</Text>
          ) : (
            queueEntries.slice(0, 3).map((entry) => (
              <View key={entry.id} style={styles.queueRow}>
                <View style={styles.queueRowCopy}>
                  <Text style={styles.queueRowTitle}>{entry.title}</Text>
                  <Text style={styles.queueRowMeta}>
                    {getOfflineQueueEntryStatusLine(entry)}
                  </Text>
                  <Text style={styles.queueRowMeta}>{getOfflineQueueEntryAttachmentHint(entry)}</Text>
                  {getOfflineQueueEntryRetryHint(entry) ? (
                    <Text style={styles.queueRowMeta}>{getOfflineQueueEntryRetryHint(entry)}</Text>
                  ) : null}
                  {entry.lastError ? <Text style={styles.queueRowMeta}>{entry.lastError}</Text> : null}
                </View>
                <View style={styles.queueRowActions}>
                  <View
                    style={[
                      styles.queueBadge,
                      entry.status === "failed"
                        ? styles.queueBadgeFailed
                        : entry.status === "conflict"
                          ? styles.queueBadgeConflict
                          : entry.status === "uploading"
                            ? styles.queueBadgeUploading
                            : styles.queueBadgePending
                    ]}
                  >
                    <Text style={styles.queueBadgeText}>{getOfflineQueueStatusLabel(entry.status)}</Text>
                  </View>
                  {entry.status === "failed" || entry.status === "conflict" ? (
                    <>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Queue-Eintrag ${entry.title} erneut versuchen`}
                        style={[styles.retryButton, retryingEntryId === entry.id ? styles.buttonDisabled : null]}
                        onPress={() => void handleRetryEntry(entry.id)}
                        disabled={retryingEntryId === entry.id}
                      >
                        <Text style={styles.retryButtonText}>
                          {retryingEntryId === entry.id ? "..." : "Erneut versuchen"}
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Queue-Eintrag ${entry.title} verwerfen`}
                        style={[styles.discardButton, discardingEntryId === entry.id ? styles.buttonDisabled : null]}
                        onPress={() => void handleDiscardEntry(entry.id)}
                        disabled={discardingEntryId === entry.id}
                      >
                        <Text style={styles.discardButtonText}>
                          {discardingEntryId === entry.id ? "..." : "Verwerfen"}
                        </Text>
                      </Pressable>
                    </>
                  ) : null}
                </View>
              </View>
            ))
          )}
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
  secondaryButton: {
    minWidth: 110,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#e3dccd"
  },
  secondaryButtonText: {
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
  queueStateCard: {
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
  queueStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.warning
  },
  stateCopy: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted
  },
  queueStateCopy: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.warning
  },
  card: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: colors.card,
    gap: 10
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
  },
  queueRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start"
  },
  queueRowCopy: {
    flex: 1,
    gap: 4
  },
  queueRowTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink
  },
  queueRowMeta: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted
  },
  queueRowActions: {
    gap: 8,
    alignItems: "flex-end"
  },
  queueBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999
  },
  queueBadgePending: {
    backgroundColor: "#dde7cf"
  },
  queueBadgeFailed: {
    backgroundColor: "#f0d9d4"
  },
  queueBadgeConflict: {
    backgroundColor: "#f4d9bf"
  },
  queueBadgeUploading: {
    backgroundColor: "#d8e4ee"
  },
  queueBadgeText: {
    fontWeight: "600",
    color: colors.ink
  },
  discardButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.card
  },
  discardButtonText: {
    fontWeight: "600",
    color: colors.muted
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.accent
  },
  retryButtonText: {
    fontWeight: "700",
    color: colors.surface
  }
});

function formatRoleLabel(role: DashboardResponse["membership"]["role"]) {
  switch (role) {
    case "revier-admin":
      return "Admin";
    case "schriftfuehrer":
      return "Schriftführung";
    case "jaeger":
      return "Jäger";
    case "ausgeher":
      return "Ausgeher";
    case "platform-admin":
      return "Plattform";
    default:
      return role;
  }
}
