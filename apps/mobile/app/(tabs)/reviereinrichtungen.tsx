import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { ReviereinrichtungListItem } from "@hege/domain";

import { EntityMap, type EntityPin } from "../../components/entity-map";
import { PinDetailSheet, type SelectedPin } from "../../components/pin-detail-sheet";
import { ScreenShell } from "../../components/screen-shell";
import { ViewToggle } from "../../components/view-toggle";
import { fetchReviereinrichtungenList } from "../../lib/api";
import { formatDateTime } from "../../lib/format";
import type { ThemeColors } from "../../lib/theme";
import { useThemeColors } from "../../lib/theme";
import { useThemedStyles } from "../../lib/use-themed-styles";

type ViewMode = "liste" | "karte";

const MAP_HEIGHT = 380;

export default function ReviereinrichtungenScreen() {
  const styles = useThemedStyles(createStyles);
  const theme = useThemeColors();
  const [reviereinrichtungen, setReviereinrichtungen] = useState<ReviereinrichtungListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>("liste");
  const [selectedPin, setSelectedPin] = useState<SelectedPin | null>(null);

  useEffect(() => {
    void loadReviereinrichtungen();
  }, []);

  async function loadReviereinrichtungen() {
    setIsLoading(true);
    setError(null);

    try {
      setReviereinrichtungen(await fetchReviereinrichtungenList());
    } catch (fetchError) {
      setReviereinrichtungen([]);
      setError(fetchError instanceof Error ? fetchError.message : "Unbekannter Fehler");
    } finally {
      setIsLoading(false);
    }
  }

  // Map des Listen-Items auf das schlanke EntityPin-Shape, das die
  // generische `<EntityMap>` versteht. `id`/`location` reichen — title
  // + subtitle nur fuer die optionale native Callout (haben wir hier
  // deaktiviert, weil wir das eigene PinDetailSheet nutzen).
  const pins: ReadonlyArray<EntityPin> = useMemo(
    () =>
      reviereinrichtungen.map((entry) => ({
        id: entry.id,
        location: entry.location,
        title: entry.name,
        subtitle: `${entry.type} · ${entry.status}`
      })),
    [reviereinrichtungen]
  );

  return (
    <ScreenShell
      eyebrow="Revier"
      title="Einrichtungen direkt im Gelände kontrollieren."
      subtitle="Zustand, Mängel und Wartungen werden aus dem zentralen Client gelesen."
    >
      <View style={styles.toolbar}>
        <ViewToggle<ViewMode>
          value={mode}
          onChange={setMode}
          accessibilityLabel="Anzeige umschalten"
          options={[
            { key: "liste", label: "Liste", icon: "list" },
            { key: "karte", label: "Karte", icon: "map" }
          ]}
        />
        <Pressable style={styles.refreshButton} onPress={() => void loadReviereinrichtungen()}>
          <Text style={styles.refreshButtonText}>Aktualisieren</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Einrichtungen werden geladen</Text>
          <Text style={styles.stateCopy}>Die Revierdaten werden über die API geladen.</Text>
        </View>
      ) : error ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>API nicht erreichbar</Text>
          <Text style={styles.stateCopy}>{error}</Text>
        </View>
      ) : null}

      {!isLoading && !error && reviereinrichtungen.length === 0 ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Noch keine Einrichtungen</Text>
          <Text style={styles.stateCopy}>
            Sobald die ersten Hochstände, Fütterungen oder Salzlecken erfasst sind, tauchen sie hier auf.
          </Text>
        </View>
      ) : null}

      {mode === "karte" && reviereinrichtungen.length > 0 ? (
        <EntityMap
          pins={pins}
          pinColor={theme.ink}
          height={MAP_HEIGHT}
          onPinPress={(pin) => {
            const target = reviereinrichtungen.find((entry) => entry.id === pin.id);
            if (target) {
              setSelectedPin({ type: "einrichtung", data: target });
            }
          }}
        />
      ) : null}

      {mode === "liste" ? (
        <ScrollView contentContainerStyle={styles.list} nestedScrollEnabled>
          {reviereinrichtungen.map((entry) => (
            <View key={entry.id} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.grow}>
                  <Text style={styles.type}>{entry.type}</Text>
                  <Text style={styles.title}>{entry.name}</Text>
                </View>
                <Text style={entry.status === "gut" ? styles.okText : styles.warningText}>
                  {entry.status}
                </Text>
              </View>
              <Text style={styles.copy}>{entry.beschreibung ?? "Keine Beschreibung"}</Text>
              <Text style={styles.copy}>Standort: {entry.location.label ?? "Ohne Standort"}</Text>
              <Text style={styles.copy}>Kontrollen: {entry.kontrollen.length}</Text>
              <Text style={styles.copy}>Offene Wartungen: {entry.offeneWartungen}</Text>
              {entry.letzteKontrolleAt ? (
                <Text style={styles.copy}>
                  Letzte Kontrolle: {formatDateTime(entry.letzteKontrolleAt)}
                </Text>
              ) : null}
              {entry.wartung[0] ? (
                <Text style={styles.copy}>Nächste Wartung: {formatDateTime(entry.wartung[0].dueAt)}</Text>
              ) : null}
            </View>
          ))}
        </ScrollView>
      ) : null}

      <PinDetailSheet
        pin={selectedPin}
        onClose={() => setSelectedPin(null)}
        // Detail-Tap soll auf die Listen-Ansicht zurueckholen, falls der
        // Nutzer aus der Karte heraus mehr Detail will. Wir wechseln den
        // Mode zurueck auf "liste" und schliessen das Sheet.
        onOpenDetails={() => {
          setSelectedPin(null);
          setMode("liste");
        }}
      />
    </ScreenShell>
  );
}

const createStyles = (theme: ThemeColors) =>
  ({
    toolbar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10
    },
    refreshButton: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: theme.card
    },
    refreshButtonText: {
      color: theme.ink,
      fontWeight: "600"
    },
    list: {
      gap: 12
    },
    stateCard: {
      gap: 6,
      padding: 18,
      borderRadius: 22,
      backgroundColor: theme.card
    },
    stateTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.ink
    },
    stateCopy: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.muted
    },
    card: {
      gap: 8,
      padding: 18,
      borderRadius: 22,
      backgroundColor: theme.card
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
      color: theme.muted
    },
    title: {
      fontSize: 19,
      fontWeight: "700",
      color: theme.ink
    },
    copy: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.muted
    },
    okText: {
      color: theme.accent,
      fontWeight: "700"
    },
    warningText: {
      color: theme.warning,
      fontWeight: "700"
    }
  }) as const;
