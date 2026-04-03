import { demoData } from "@ferm/domain";
import { StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../../components/screen-shell";
import { formatDateTime } from "../../lib/format";
import { colors } from "../../lib/theme";

export default function ProtokolleScreen() {
  return (
    <ScreenShell
      eyebrow="Protokolle"
      title="Beschlüsse und Sitzungsunterlagen immer dabei."
      subtitle="Freigegebene Protokolle bleiben mobil lesbar, Entwürfe sind fürs Backoffice reserviert."
    >
      {demoData.sitzungen.map((entry) => (
        <View key={entry.id} style={styles.card}>
          <Text style={styles.title}>{entry.title}</Text>
          <Text style={styles.copy}>{entry.locationLabel}</Text>
          <Text style={styles.copy}>{formatDateTime(entry.scheduledAt)}</Text>
          <View style={styles.separator} />
          {entry.versions[0]?.beschluesse.map((beschluss) => (
            <View key={beschluss.id} style={styles.decision}>
              <Text style={styles.decisionTitle}>{beschluss.title}</Text>
              <Text style={styles.copy}>{beschluss.decision}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
    padding: 18,
    borderRadius: 22,
    backgroundColor: colors.card
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
  decision: {
    gap: 4
  },
  decisionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink
  }
});
