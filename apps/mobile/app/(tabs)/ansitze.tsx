import { demoData } from "@ferm/domain";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../../components/screen-shell";
import { formatDateTime } from "../../lib/format";
import { colors } from "../../lib/theme";

export default function AnsitzeScreen() {
  const ansitze = demoData.ansitze.filter((entry) => entry.status === "active");

  return (
    <ScreenShell
      eyebrow="Ansitz"
      title="Ansitz mit einem Tap bekanntgeben."
      subtitle="Konflikte mit bereits aktiven Hochständen werden sofort angezeigt."
    >
      <Pressable style={styles.primaryAction}>
        <Text style={styles.primaryActionTitle}>Neuen Ansitz melden</Text>
        <Text style={styles.primaryActionCopy}>GPS oder Hochstand auswählen, Notiz ergänzen, fertig.</Text>
      </Pressable>

      {ansitze.map((entry) => (
        <View key={entry.id} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.grow}>
              <Text style={styles.title}>{entry.standortName}</Text>
              <Text style={styles.copy}>{entry.location.label}</Text>
            </View>
            <View style={entry.conflict ? styles.dangerBadge : styles.okBadge}>
              <Text style={entry.conflict ? styles.dangerText : styles.okText}>
                {entry.conflict ? "Warnung" : "Aktiv"}
              </Text>
            </View>
          </View>

          <Text style={styles.copy}>Beginn: {formatDateTime(entry.startedAt)}</Text>
          <Text style={styles.copy}>{entry.note ?? "Keine Notiz"}</Text>
        </View>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
