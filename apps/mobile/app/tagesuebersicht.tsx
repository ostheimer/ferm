import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { DashboardResponse } from "@hege/domain";

import { MapPreview } from "../components/map-preview";
import { MetricTile } from "../components/metric-tile";
import { ScreenShell } from "../components/screen-shell";
import { StateView } from "../components/state-view";
import { fetchDashboardSnapshot } from "../lib/api";
import {
  discardOfflineQueueEntry,
  retryOfflineQueueEntry,
  syncOfflineQueue,
  useOfflineQueueSnapshot
} from "../lib/offline-queue";
import {
  getOfflineQueueEntryAttachmentHint,
  getOfflineQueueEntryRetryHint,
  getOfflineQueueEntryStatusLine,
  getOfflineQueueStatusLabel
} from "../lib/offline-queue-status";
import type { ThemeColors } from "../lib/theme";
import { useThemedStyles } from "../lib/use-themed-styles";

/**
 * Tagesuebersicht — die ehemalige Heute-Tab-Seite, jetzt als Stack-Route
 * unter `/tagesuebersicht` erreichbar. Enthaelt Queue-Management,
 * Sitzungs-/Notification-Cards und die kompakte Karten-Vorschau.
 *
 * Hintergrund: Mit P2.1 wurde der Heute-Tab zur full-bleed Karte. Die
 * vorhandenen Detail-Funktionen (besonders Queue-Sync) sollten dabei
 * nicht verschwinden, weshalb sie hier weiter erreichbar bleiben — vom
 * Map-Tab aus per Tap auf den Bottom-Summary-Banner und zusaetzlich
 * ueber den "Mehr"-Tab.
 */
export default function TagesuebersichtScreen() {
  const queue = useOfflineQueueSnapshot();
  const styles = useThemedStyles(createStyles);
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
          ? "Warteschlange ist leer."
          : `${remaining.length} Einträge warten weiter auf Synchronisierung.`
      );
      await loadDashboard({ refreshing: true });
    } catch (syncError) {
      setQueueMessage(syncError instanceof Error ? syncError.message : "Warteschlange konnte nicht synchronisiert werden.");
    }
  }

  async function handleDiscardEntry(entryId: string) {
    setDiscardingEntryId(entryId);
    setQueueMessage(null);

    try {
      await discardOfflineQueueEntry(entryId);
      setQueueMessage("Eintrag verworfen.");
    } catch (discardError) {
      setQueueMessage(discardError instanceof Error ? discardError.message : "Eintrag konnte nicht verworfen werden.");
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
          ? "Eintrag erfolgreich synchronisiert."
          : `${remaining.length} Queue-Einträge warten weiter auf Synchronisierung.`
      );
      await loadDashboard({ refreshing: true });
    } catch (retryError) {
      setQueueMessage(retryError instanceof Error ? retryError.message : "Eintrag konnte nicht erneut versucht werden.");
    } finally {
      setRetryingEntryId(null);
    }
  }

  const queueEntries = queue.entries;
  const queueCount = queueEntries.length;
  const failedQueueCount = queueEntries.filter((entry) => entry.status === "failed").length;
  const activeAnsitze = snapshot?.activeAnsitze ?? [];
  const latestNotification = snapshot?.overview.letzteBenachrichtigungen[0];

  const queueIsEmpty = queueCount === 0;
  // Detail-Page-Touch: Eyebrow ist das aktuelle Datum statt "Revier heute".
  // Das gibt der Tagesübersicht ihren eigenen Charakter — sie ist nicht mehr
  // der primäre Tab, sondern eine vom Map-Tab aus geöffnete Detail-Seite.
  const todayLabel = formatTodayLabel();

  return (
    <ScreenShell
      eyebrow={todayLabel}
      title={snapshot?.revier.name ?? "Tagesübersicht"}
      subtitle={
        snapshot
          ? `${snapshot.user.name} · ${formatRoleLabel(snapshot.membership.role)} · ${snapshot.membership.jagdzeichen}`
          : "Ansitze, Revierdaten und Warteschlange bleiben auch bei schwachem Empfang sichtbar."
      }
      refresh={{
        refreshing: isRefreshing,
        onRefresh: () => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          void loadDashboard({ refreshing: true });
        }
      }}
      aside={
        queueIsEmpty ? (
          <View style={[styles.aside, styles.asideCompact]}>
            <Text style={styles.asideCompactCheck}>✓</Text>
            <View style={styles.asideCompactCopy}>
              <Text style={styles.asideLabel}>Warteschlange</Text>
              <Text style={styles.asideCopy}>Alles synchronisiert.</Text>
            </View>
          </View>
        ) : (
          <View style={styles.aside}>
            <Text style={styles.asideLabel}>Offline-Warteschlange</Text>
            <Text style={styles.asideValue}>{queueCount}</Text>
            <Text style={styles.asideCopy}>
              {failedQueueCount > 0
                ? `${failedQueueCount} Einträge brauchen einen erneuten Sync.`
                : "Erfassungen warten auf Synchronisierung."}
            </Text>
          </View>
        )
      }
    >
      {!queueIsEmpty ? (
        <View style={styles.toolbar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Warteschlange senden"
            style={[styles.secondaryButton, queue.isSyncing ? styles.buttonDisabled : null]}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              void handleQueueSync();
            }}
            disabled={queue.isSyncing}
          >
            <Text style={styles.secondaryButtonText}>
              {queue.isSyncing ? "Wird gesendet..." : "Warteschlange senden"}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {isLoading ? (
        <StateView
          mode="loading"
          title="Dashboard wird geladen"
          description="Revierdaten und aktive Ansitze werden von der API abgefragt."
        />
      ) : error ? (
        <StateView
          mode="error"
          title="API nicht erreichbar"
          description={`${error} Tippe auf "Aktualisieren", sobald die Verbindung wieder steht.`}
          action={{ label: "Aktualisieren", onPress: () => void loadDashboard({ refreshing: true }) }}
        />
      ) : null}

      {queueMessage ? (
        <View style={styles.queueStateCard}>
          <Text style={styles.queueStateTitle}>Queue-Status</Text>
          <Text style={styles.queueStateCopy}>{queueMessage}</Text>
        </View>
      ) : null}

      <View style={styles.metricGrid}>
        <MetricTile label="Ansitze" value={snapshot?.activeAnsitze.length ?? "-"} detail="Aktuell im Revier gemeldet." />
        <MetricTile label="Fallwild" value={snapshot?.overview.heutigeFallwildBergungen ?? "-"} detail="Heute erfasste Bergungen." />
        <MetricTile label="Aufgaben" value={snapshot?.overview.offeneAufgaben ?? "-"} detail="Offene Arbeiten im Revier." />
        <MetricTile label="Warteschlange" value={queueCount} detail="Offene Offline-Eingaben." />
      </View>

      {snapshot ? (
        <>
          <MapPreview
            revierName={snapshot.revier.name}
            ansitze={activeAnsitze}
            revierCenter={snapshot.revier.zentrum}
          />
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
            <Text style={styles.cardTitle}>Warteschlange</Text>
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
                        accessibilityLabel={`Eintrag ${entry.title} erneut versuchen`}
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
                        accessibilityLabel={`Eintrag ${entry.title} verwerfen`}
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
        <StateView
          mode="empty"
          title="Keine aktiven Ansitze"
          description="Sobald jemand im Revier ansitzt, erscheint der Eintrag hier und auf der Karte."
          icon="trail-sign-outline"
        />
      ) : null}
    </ScreenShell>
  );
}

const createStyles = (theme: ThemeColors) =>
  ({
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
      backgroundColor: theme.card
    },
    buttonDisabled: {
      opacity: 0.7
    },
    refreshButtonText: {
      color: theme.ink,
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
      color: theme.ink,
      fontWeight: "600"
    },
    aside: {
      gap: 6
    },
    asideCompact: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14
    },
    // Heller Schrift-/Akzent-Hintergrund: Werte sind Lesbarkeit auf accent-
    // Surface (Hero-Aside). Bleiben hartcodiert, weil sie semantisch
    // "Schrift auf accentStrong" sind, was im Token-Set keinen Pendant hat.
    asideCompactCheck: {
      fontSize: 28,
      lineHeight: 30,
      color: "#fff9ef",
      fontWeight: "700"
    },
    asideCompactCopy: {
      flex: 1,
      gap: 2
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
      backgroundColor: theme.card
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
      color: theme.ink
    },
    queueStateTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.warning
    },
    stateCopy: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.muted
    },
    queueStateCopy: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.warning
    },
    card: {
      padding: 18,
      borderRadius: 22,
      backgroundColor: theme.card,
      gap: 10
    },
    cardTitle: {
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: 1.2,
      color: theme.muted
    },
    cardValue: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.ink
    },
    cardCopy: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.muted
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
      color: theme.ink
    },
    queueRowMeta: {
      fontSize: 13,
      lineHeight: 18,
      color: theme.muted
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
      color: theme.ink
    },
    discardButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: theme.card
    },
    discardButtonText: {
      fontWeight: "600",
      color: theme.muted
    },
    retryButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: theme.accent
    },
    retryButtonText: {
      fontWeight: "700",
      color: theme.surface
    }
  }) as const;

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

/**
 * Formatiert das heutige Datum als deutsches Eyebrow-Label, z.B.
 * "Donnerstag, 8. Mai 2026". Fällt auf eine ASCII-Variante zurück, wenn
 * `Intl.DateTimeFormat("de-AT")` auf der Plattform fehlt — auf iOS und
 * neueren Android-Versionen ist das aber Standard.
 */
function formatTodayLabel(now: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("de-AT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(now);
  } catch {
    return "Heute";
  }
}
