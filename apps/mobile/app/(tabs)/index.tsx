import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { DashboardResponse, Reviereinrichtung } from "@hege/domain";

import { MapStage } from "../../components/map-stage";
import { fetchDashboardSnapshot, fetchReviereinrichtungenList } from "../../lib/api";
import { useOfflineQueueSnapshot } from "../../lib/offline-queue";
import { useThemeColors, type ThemeColors } from "../../lib/theme";
import { useThemedStyles } from "../../lib/use-themed-styles";

/**
 * Heute-Tab als full-bleed Karte (P2.1, PR A).
 *
 * Wir laden zwei Endpunkte parallel: den Dashboard-Snapshot (Ansitze,
 * Fallwild, Revier-Zentrum) und die Reviereinrichtungen-Liste (eigene
 * Route, weil das Dashboard-Schema sie noch nicht enthaelt). Sobald beide
 * da sind, rendern wir `<MapStage>` mit allen drei Pin-Layern.
 *
 * Detail-Funktionen, die vorher hier waren (Queue-Management, Sitzungs-/
 * Notification-Cards, Pull-to-Refresh) leben jetzt unter `/tagesuebersicht`
 * und werden vom Bottom-Banner der MapStage angesteuert.
 */
export default function HeuteScreen() {
  const router = useRouter();
  const queue = useOfflineQueueSnapshot();
  const styles = useThemedStyles(createStyles);
  const theme = useThemeColors();

  const [snapshot, setSnapshot] = useState<DashboardResponse | null>(null);
  const [einrichtungen, setEinrichtungen] = useState<ReadonlyArray<Reviereinrichtung>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const [snapshotData, einrichtungenData] = await Promise.all([
          fetchDashboardSnapshot(),
          fetchReviereinrichtungenList()
        ]);

        if (!isMounted) {
          return;
        }

        setSnapshot(snapshotData);
        setEinrichtungen(einrichtungenData);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setSnapshot(null);
        setEinrichtungen([]);
        setError(loadError instanceof Error ? loadError.message : "Unbekannter Fehler");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.fullscreenCenter}>
        <ActivityIndicator color={theme.accent} size="large" />
        <Text style={styles.loadingText}>Revier wird geladen...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.fullscreenCenter}>
        <Text style={styles.errorTitle}>Karte nicht verfuegbar</Text>
        <Text style={styles.errorCopy}>{error}</Text>
        <Text style={styles.errorHint}>
          Tagesuebersicht oeffnet trotzdem — sie hat eigene Refresh-Logik.
        </Text>
      </View>
    );
  }

  if (!snapshot) {
    return null;
  }

  return (
    <MapStage
      revierName={snapshot.revier.name}
      revierCenter={snapshot.revier.zentrum}
      ansitze={snapshot.activeAnsitze}
      fallwild={snapshot.recentFallwild}
      einrichtungen={einrichtungen}
      queueCount={queue.entries.length}
      onOpenTagesuebersicht={() => router.push("/tagesuebersicht")}
    />
  );
}

const createStyles = (theme: ThemeColors) =>
  ({
    fullscreenCenter: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      padding: 24,
      backgroundColor: theme.surface
    },
    loadingText: {
      fontSize: 14,
      color: theme.muted
    },
    errorTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.danger,
      textAlign: "center"
    },
    errorCopy: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.muted,
      textAlign: "center"
    },
    errorHint: {
      fontSize: 12,
      color: theme.muted,
      textAlign: "center",
      marginTop: StyleSheet.hairlineWidth
    }
  }) as const;
