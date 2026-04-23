import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import type { Dispatch, SetStateAction } from "react";

import type { AnsitzSession } from "@hege/domain";

import { ScreenShell } from "../../components/screen-shell";
import { formatDateTime } from "../../lib/format";
import { buildGeoPoint, trimToUndefined } from "../../lib/form-utils";
import { fetchLiveAnsitze, type CreateAnsitzRequest } from "../../lib/api";
import {
  syncOfflineQueue,
  submitAnsitzWithOfflineFallback,
  useOfflineQueueSnapshot
} from "../../lib/offline-queue";
import { colors } from "../../lib/theme";

interface AnsitzFormState {
  standortName: string;
  locationLabel: string;
  lat: string;
  lng: string;
  note: string;
}

const DEFAULT_FORM: AnsitzFormState = {
  standortName: "",
  locationLabel: "Mobil gemeldet",
  lat: "47.9161",
  lng: "13.5182",
  note: ""
};

export default function AnsitzeScreen() {
  const queue = useOfflineQueueSnapshot();
  const [ansitze, setAnsitze] = useState<AnsitzSession[]>([]);
  const [form, setForm] = useState<AnsitzFormState>(DEFAULT_FORM);
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

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const payload = buildAnsitzPayload(form);
      const result = await submitAnsitzWithOfflineFallback(payload);

      setMessage(
        result.mode === "sent"
          ? "Ansitz direkt an die API gesendet."
          : "Keine Verbindung: Ansitz wurde in die Offline-Queue gelegt."
      );

      setForm({
        ...DEFAULT_FORM,
        lat: form.lat.trim() || DEFAULT_FORM.lat,
        lng: form.lng.trim() || DEFAULT_FORM.lng
      });

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
          : `${remaining.length} Queue-Einträge warten weiter auf Synchronisierung.`
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
      title="Ansitz mobil erfassen."
      subtitle="Standort, Koordinaten und Notiz werden online direkt an die API gesendet oder offline vorgemerkt."
      aside={
        <View style={styles.queueCard}>
          <Text style={styles.queueTitle}>Ansitz-Queue</Text>
          <Text style={styles.queueValue}>{queueEntries.length}</Text>
          <Text style={styles.queueCopy}>Pending und Failed Einträge werden bei bestehender Verbindung erneut gesendet.</Text>
        </View>
      }
    >
      <View style={styles.formCard}>
        <Text style={styles.sectionLabel}>Neuer Ansitz</Text>
        <Text style={styles.sectionCopy}>Die Erfassung bleibt bewusst knapp und funktioniert auch bei schlechter Verbindung.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Standortname</Text>
          <TextInput
            autoCapitalize="words"
            placeholder="Ansitz Wiesenrand"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={form.standortName}
            onChangeText={updateField(setForm, "standortName")}
          />
        </View>

        <View style={styles.fieldRow}>
          <View style={[styles.field, styles.grow]}>
            <Text style={styles.label}>Breitengrad</Text>
            <TextInput
              keyboardType="decimal-pad"
              placeholder="47.9161"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={form.lat}
              onChangeText={updateField(setForm, "lat")}
            />
          </View>
          <View style={[styles.field, styles.grow]}>
            <Text style={styles.label}>Längengrad</Text>
            <TextInput
              keyboardType="decimal-pad"
              placeholder="13.5182"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={form.lng}
              onChangeText={updateField(setForm, "lng")}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Standortbezeichnung</Text>
          <TextInput
            placeholder="Mobil gemeldet"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={form.locationLabel}
            onChangeText={updateField(setForm, "locationLabel")}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Notiz</Text>
          <TextInput
            multiline
            placeholder="Kurze Notiz für die Revierführung"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.textArea]}
            value={form.note}
            onChangeText={updateField(setForm, "note")}
          />
        </View>

        {message ? (
          <View style={styles.infoCard}>
            <Text style={styles.stateTitle}>Status</Text>
            <Text style={styles.stateCopy}>{message}</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.stateTitle}>Ansitz nicht verfügbar</Text>
            <Text style={styles.stateCopy}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.actionRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ansitz speichern"
            style={[styles.primaryButton, isSubmitting ? styles.buttonDisabled : null]}
            onPress={() => void handleSubmit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.primaryButtonText}>Ansitz speichern</Text>}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ansitz-Queue synchronisieren"
            style={[styles.secondaryButton, queue.isSyncing ? styles.buttonDisabled : null]}
            onPress={() => void handleQueueSync()}
            disabled={queue.isSyncing}
          >
            <Text style={styles.secondaryButtonText}>{queue.isSyncing ? "Synchronisiert..." : "Queue sync"}</Text>
          </Pressable>
        </View>
      </View>

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
      </View>

      {isLoading ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Ansitze werden geladen</Text>
          <Text style={styles.stateCopy}>Die aktuelle Liste wird von der API abgefragt.</Text>
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
        {!isLoading && !error && ansitze.length === 0 ? (
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

function updateField(
  setForm: Dispatch<SetStateAction<AnsitzFormState>>,
  key: keyof AnsitzFormState
) {
  return (value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };
}

function buildAnsitzPayload(form: AnsitzFormState): CreateAnsitzRequest {
  const standortName = form.standortName.trim();

  if (!standortName) {
    throw new Error("Bitte einen Standortnamen eingeben.");
  }

  return {
    standortName,
    location: buildGeoPoint(form.lat, form.lng, form.locationLabel, "Mobil gemeldet"),
    startedAt: new Date().toISOString(),
    note: trimToUndefined(form.note)
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
  refreshButtonText: {
    color: colors.ink,
    fontWeight: "600"
  },
  buttonDisabled: {
    opacity: 0.7
  },
  listContent: {
    gap: 12,
    paddingBottom: 24
  },
  formCard: {
    gap: 14,
    padding: 18,
    borderRadius: 22,
    backgroundColor: colors.card
  },
  sectionLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: colors.muted
  },
  sectionCopy: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted
  },
  fieldRow: {
    flexDirection: "row",
    gap: 12
  },
  field: {
    gap: 6
  },
  grow: {
    flex: 1
  },
  label: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: colors.muted
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d9d2c4",
    paddingHorizontal: 14,
    color: colors.ink,
    backgroundColor: colors.surface
  },
  textArea: {
    minHeight: 90,
    paddingTop: 12,
    textAlignVertical: "top"
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  primaryButton: {
    minHeight: 52,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.accent
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "700"
  },
  secondaryButton: {
    minHeight: 52,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#e3dccd"
  },
  secondaryButtonText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "600"
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
  errorCard: {
    gap: 6,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "#f0d9d4"
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
