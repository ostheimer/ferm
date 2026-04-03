import { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../../components/screen-shell";
import { formatDateTime } from "../../lib/format";
import { toApiUrl } from "../../lib/api";
import { colors } from "../../lib/theme";

type AnsitzListItem = {
  id: string;
  standortName: string;
  location?: {
    label?: string;
  };
  startedAt?: string;
  note?: string | null;
  conflict?: boolean;
};

export default function AnsitzeScreen() {
  const [ansitze, setAnsitze] = useState<AnsitzListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const response = await fetch(toApiUrl("/v1/ansitze/live"));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = (await response.json()) as unknown;
      setAnsitze(normalizeAnsitze(payload));
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unbekannter Fehler");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  return (
    <ScreenShell
      eyebrow="Ansitz"
      title="Ansitz mit einem Tap bekanntgeben."
      subtitle="Aktive Ansitze werden beim Aktualisieren geladen."
    >
      <Pressable style={styles.primaryAction}>
        <Text style={styles.primaryActionTitle}>Neuen Ansitz melden</Text>
        <Text style={styles.primaryActionCopy}>GPS oder Hochstand wählen, Notiz ergänzen, fertig.</Text>
      </Pressable>

      <View style={styles.toolbar}>
        <Pressable style={styles.refreshButton} onPress={() => void loadAnsitze({ refreshing: true })}>
          <Text style={styles.refreshButtonText}>Aktualisieren</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Ansitze werden geladen</Text>
          <Text style={styles.stateCopy}>Die aktuelle Liste wird von der API abgefragt.</Text>
        </View>
      ) : error ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>API nicht erreichbar</Text>
          <Text style={styles.stateCopy}>
            {error}. Die Liste bleibt leer, bis du erneut aktualisierst.
          </Text>
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
            <Text style={styles.stateCopy}>Sobald ein Jäger einen Ansitz meldet, erscheint er hier.</Text>
          </View>
        ) : null}

        {ansitze.map((entry) => (
          <View key={entry.id} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.grow}>
                <Text style={styles.title}>{entry.standortName}</Text>
                <Text style={styles.copy}>{entry.location?.label ?? "Ohne Standort"}</Text>
              </View>
              <View style={entry.conflict ? styles.dangerBadge : styles.okBadge}>
                <Text style={entry.conflict ? styles.dangerText : styles.okText}>
                  {entry.conflict ? "Warnung" : "Aktiv"}
                </Text>
              </View>
            </View>

            <Text style={styles.copy}>
              Beginn: {entry.startedAt ? formatDateTime(entry.startedAt) : "Unbekannt"}
            </Text>
            <Text style={styles.copy}>{entry.note ?? "Keine Notiz"}</Text>
          </View>
        ))}
      </ScrollView>
    </ScreenShell>
  );
}

function normalizeAnsitze(payload: unknown): AnsitzListItem[] {
  if (Array.isArray(payload)) {
    return payload as AnsitzListItem[];
  }

  if (payload && typeof payload === "object") {
    const candidate = payload as {
      ansitze?: unknown;
      sessions?: unknown;
      data?: unknown;
    };

    if (Array.isArray(candidate.ansitze)) {
      return candidate.ansitze as AnsitzListItem[];
    }

    if (Array.isArray(candidate.sessions)) {
      return candidate.sessions as AnsitzListItem[];
    }

    if (Array.isArray(candidate.data)) {
      return candidate.data as AnsitzListItem[];
    }
  }

  return [];
}

const styles = StyleSheet.create({
  listScroll: {
    maxHeight: 520
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  refreshButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.card
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
  }
});
