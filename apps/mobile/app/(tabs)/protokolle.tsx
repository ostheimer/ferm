import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { ProtokollDetail, ProtokollListItem } from "@hege/domain";

import { ScreenShell } from "../../components/screen-shell";
import { formatDateTime } from "../../lib/format";
import { fetchProtokollDetail, fetchProtokolleList } from "../../lib/api";
import { colors } from "../../lib/theme";

export default function ProtokolleScreen() {
  const [protokolle, setProtokolle] = useState<ProtokollListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ProtokollDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadProtokolle();
  }, []);

  async function loadProtokolle() {
    setIsLoading(true);
    setError(null);

    try {
      const entries = await fetchProtokolleList();
      setProtokolle(entries);

      if (entries.length > 0) {
        const nextSelected = selectedId ?? entries[0].id;
        setSelectedId(nextSelected);
        await loadDetail(nextSelected);
      } else {
        setSelectedId(null);
        setDetail(null);
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unbekannter Fehler");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadDetail(id: string) {
    setDetailLoading(true);

    try {
      setDetail(await fetchProtokollDetail(id));
    } catch (fetchError) {
      setDetail(null);
      setError(fetchError instanceof Error ? fetchError.message : "Unbekannter Fehler");
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <ScreenShell
      eyebrow="Protokolle"
      title="Beschlüsse und Sitzungsunterlagen immer dabei."
      subtitle="Freigegebene Protokolle bleiben mobil lesbar, Entwürfe sind fürs Backoffice reserviert."
    >
      {isLoading ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Protokolle werden geladen</Text>
          <Text style={styles.stateCopy}>Die freigegebenen Sitzungen werden über die API geladen.</Text>
        </View>
      ) : error ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>API nicht erreichbar</Text>
          <Text style={styles.stateCopy}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.list}>
        {protokolle.map((entry) => (
          <Pressable
            key={entry.id}
            style={[styles.card, selectedId === entry.id ? styles.cardActive : null]}
            onPress={async () => {
              setSelectedId(entry.id);
              await loadDetail(entry.id);
            }}
          >
            <View style={styles.row}>
              <View style={styles.grow}>
                <Text style={styles.title}>{entry.title}</Text>
                <Text style={styles.copy}>{entry.locationLabel}</Text>
              </View>
              <View style={entry.status === "freigegeben" ? styles.okBadge : styles.warnBadge}>
                <Text style={entry.status === "freigegeben" ? styles.okText : styles.warnText}>{entry.status}</Text>
              </View>
            </View>
            <Text style={styles.copy}>{formatDateTime(entry.scheduledAt)}</Text>
            {entry.summaryPreview ? <Text style={styles.copy}>{entry.summaryPreview}</Text> : null}
            <Text style={styles.copy}>{entry.beschlussCount} Beschlüsse</Text>
            {entry.publishedDocument ? <Text style={styles.copy}>Dokument: {entry.publishedDocument.title}</Text> : null}
          </Pressable>
        ))}
      </View>

      {detail ? (
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>{detail.title}</Text>
          <Text style={styles.copy}>{detail.locationLabel}</Text>
          <Text style={styles.copy}>{formatDateTime(detail.scheduledAt)}</Text>
          <Text style={styles.copy}>{detail.participants.filter((entry) => entry.anwesend).length} Teilnehmer anwesend</Text>
          <View style={styles.separator} />
          <ScrollView nestedScrollEnabled contentContainerStyle={styles.detailList}>
            {detail.versions.map((version) => (
              <View key={version.id} style={styles.version}>
                <Text style={styles.versionTitle}>{formatDateTime(version.createdAt)}</Text>
                <Text style={styles.copy}>{version.summary}</Text>
                {version.beschluesse.map((beschluss) => (
                  <View key={beschluss.id} style={styles.decision}>
                    <Text style={styles.decisionTitle}>{beschluss.title}</Text>
                    <Text style={styles.copy}>{beschluss.decision}</Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
          {detailLoading ? <Text style={styles.copy}>Detail wird aktualisiert ...</Text> : null}
        </View>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12
  },
  card: {
    gap: 8,
    padding: 18,
    borderRadius: 22,
    backgroundColor: colors.card
  },
  cardActive: {
    borderWidth: 1,
    borderColor: colors.accent
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
  separator: {
    height: 1,
    backgroundColor: "#e5dfd1",
    marginVertical: 4
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
  okBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#dde7cf"
  },
  warnBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#efe3d1"
  },
  okText: {
    color: colors.accent,
    fontWeight: "700"
  },
  warnText: {
    color: colors.warning,
    fontWeight: "700"
  },
  detailCard: {
    gap: 10,
    padding: 18,
    borderRadius: 22,
    backgroundColor: colors.card
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.ink
  },
  detailList: {
    gap: 12,
    paddingBottom: 8
  },
  version: {
    gap: 6
  },
  versionTitle: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: colors.muted
  },
  decision: {
    gap: 4
  },
  decisionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink
  }
});
