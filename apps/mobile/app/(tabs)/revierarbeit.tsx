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
import type { AufgabeListItem, CreateReviermeldungRequest, ReviermeldungListItem } from "../../lib/api";
import type { AufgabeStatus, ReviermeldungKategorie } from "@hege/domain";

import { ScreenShell } from "../../components/screen-shell";
import {
  createReviermeldung,
  fetchAufgabenList,
  fetchReviermeldungenList,
  updateAufgabe
} from "../../lib/api";
import { formatDateTime } from "../../lib/format";
import { buildGeoPoint, trimToUndefined } from "../../lib/form-utils";
import { colors } from "../../lib/theme";

interface ReviermeldungFormState {
  category: ReviermeldungKategorie;
  title: string;
  description: string;
  locationLabel: string;
  lat: string;
  lng: string;
}

const DEFAULT_FORM: ReviermeldungFormState = {
  category: "schaden",
  title: "",
  description: "",
  locationLabel: "",
  lat: "",
  lng: ""
};

const CATEGORIES: Array<{
  value: ReviermeldungKategorie;
  label: string;
}> = [
  { value: "schaden", label: "Schaden" },
  { value: "gefahr", label: "Gefahr" },
  { value: "sichtung", label: "Sichtung" },
  { value: "reviereinrichtung", label: "Einrichtung" },
  { value: "fuetterung", label: "Fütterung" },
  { value: "wasserung", label: "Wässerung" },
  { value: "sonstiges", label: "Sonstiges" }
];

export default function RevierarbeitScreen() {
  const [form, setForm] = useState<ReviermeldungFormState>(DEFAULT_FORM);
  const [aufgaben, setAufgaben] = useState<AufgabeListItem[]>([]);
  const [meldungen, setMeldungen] = useState<ReviermeldungListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadRevierarbeit();
  }, []);

  async function loadRevierarbeit(options?: { refreshing?: boolean }) {
    const refreshing = options?.refreshing ?? false;

    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const [nextMeldungen, nextAufgaben] = await Promise.all([
        fetchReviermeldungenList(),
        fetchAufgabenList()
      ]);
      setMeldungen(nextMeldungen);
      setAufgaben(nextAufgaben);
    } catch (fetchError) {
      setMeldungen([]);
      setAufgaben([]);
      setError(fetchError instanceof Error ? fetchError.message : "Revierarbeit konnte nicht geladen werden.");
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
      await createReviermeldung(buildReviermeldungPayload(form));
      setMessage("Reviermeldung gespeichert.");
      setForm(DEFAULT_FORM);
      await loadRevierarbeit({ refreshing: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Reviermeldung konnte nicht gespeichert werden.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTaskStatus(aufgabeId: string, status: AufgabeStatus) {
    setUpdatingTaskId(aufgabeId);
    setMessage(null);
    setError(null);

    try {
      await updateAufgabe(aufgabeId, { status });
      setMessage(status === "erledigt" ? "Aufgabe erledigt." : "Aufgabe aktualisiert.");
      await loadRevierarbeit({ refreshing: true });
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Aufgabe konnte nicht aktualisiert werden.");
    } finally {
      setUpdatingTaskId(null);
    }
  }

  const openTaskCount = aufgaben.filter((entry) => !["erledigt", "abgelehnt", "archiviert"].includes(entry.status)).length;

  return (
    <ScreenShell
      eyebrow="Revierarbeit"
      title="Meldungen und Aufgaben dort festhalten, wo sie entstehen."
      subtitle="Reviermeldungen gehen direkt an die API. Aufgaben zeigen, was für dich oder das Revier offen ist."
      aside={
        <View style={styles.asideCard}>
          <Text style={styles.asideLabel}>Offene Aufgaben</Text>
          <Text style={styles.asideValue}>{openTaskCount}</Text>
          <Text style={styles.asideCopy}>{meldungen.length} Reviermeldungen im aktuellen Revier.</Text>
        </View>
      }
    >
      <View style={styles.formCard}>
        <Text style={styles.sectionLabel}>Neue Reviermeldung</Text>
        <Text style={styles.sectionCopy}>Kurztext reicht. Standort ist optional; Fotos folgen im nächsten Medien-Slice.</Text>

        <View style={styles.chipGrid}>
          {CATEGORIES.map((category) => (
            <Pressable
              key={category.value}
              accessibilityRole="button"
              accessibilityLabel={`Kategorie ${category.label}`}
              style={[styles.chip, form.category === category.value ? styles.chipActive : null]}
              onPress={() => setForm((current) => ({ ...current, category: category.value }))}
            >
              <Text style={[styles.chipText, form.category === category.value ? styles.chipTextActive : null]}>
                {category.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Kurztext</Text>
          <TextInput
            autoCapitalize="sentences"
            placeholder="Zaun beschädigt, Wildsichtung, Gefahr am Weg..."
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={form.title}
            onChangeText={updateField(setForm, "title")}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Details</Text>
          <TextInput
            multiline
            placeholder="Was ist passiert? Was sollen andere wissen?"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.textArea]}
            value={form.description}
            onChangeText={updateField(setForm, "description")}
          />
        </View>

        <View style={styles.fieldRow}>
          <View style={[styles.field, styles.grow]}>
            <Text style={styles.label}>Breitengrad</Text>
            <TextInput
              keyboardType="decimal-pad"
              placeholder="optional"
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
              placeholder="optional"
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
            placeholder="z. B. Feldweg Süd"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={form.locationLabel}
            onChangeText={updateField(setForm, "locationLabel")}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reviermeldung speichern"
          style={[styles.primaryButton, isSubmitting ? styles.buttonDisabled : null]}
          onPress={() => void handleSubmit()}
          disabled={isSubmitting}
        >
          {isSubmitting ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.primaryButtonText}>Meldung speichern</Text>}
        </Pressable>
      </View>

      <View style={styles.toolbar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Revierarbeit aktualisieren"
          style={[styles.refreshButton, isRefreshing ? styles.buttonDisabled : null]}
          onPress={() => void loadRevierarbeit({ refreshing: true })}
          disabled={isRefreshing}
        >
          {isRefreshing ? <ActivityIndicator color={colors.ink} /> : <Text style={styles.refreshButtonText}>Aktualisieren</Text>}
        </Pressable>
      </View>

      {message ? (
        <View style={styles.infoCard}>
          <Text style={styles.stateTitle}>Status</Text>
          <Text style={styles.stateCopy}>{message}</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.stateTitle}>Revierarbeit nicht verfügbar</Text>
          <Text style={styles.stateCopy}>{error}</Text>
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Revierarbeit wird geladen</Text>
          <Text style={styles.stateCopy}>Meldungen und Aufgaben werden von der API abgefragt.</Text>
        </View>
      ) : null}

      <ScrollView
        nestedScrollEnabled
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => void loadRevierarbeit({ refreshing: true })} />
        }
        contentContainerStyle={styles.listContent}
        style={styles.listScroll}
      >
        <Text style={styles.listHeadline}>Meine Aufgaben</Text>
        {!isLoading && aufgaben.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Keine Aufgaben</Text>
            <Text style={styles.stateCopy}>Zugewiesene oder eigene Aufgaben erscheinen hier.</Text>
          </View>
        ) : null}

        {aufgaben.map((entry) => (
          <View key={entry.id} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.grow}>
                <Text style={styles.badgeText}>{`${formatPriorityLabel(entry.priority)} / ${formatTaskStatusLabel(entry.status)}`}</Text>
                <Text style={styles.title}>{entry.title}</Text>
              </View>
              <View style={getTaskBadgeStyle(entry.status)}>
                <Text style={getTaskBadgeTextStyle(entry.status)}>
                  {formatTaskStatusLabel(entry.status)}
                </Text>
              </View>
            </View>
            {entry.description ? <Text style={styles.copy}>{entry.description}</Text> : null}
            {entry.dueAt ? <Text style={styles.copy}>Fällig: {formatDateTime(entry.dueAt)}</Text> : null}
            {entry.sourceType ? <Text style={styles.copy}>Bezug: {formatSourceLabel(entry.sourceType)}</Text> : null}
            <View style={styles.actionRow}>
              {entry.status !== "in_arbeit" && entry.status !== "erledigt" ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Aufgabe ${entry.title} in Arbeit setzen`}
                  style={[styles.secondaryButton, updatingTaskId === entry.id ? styles.buttonDisabled : null]}
                  onPress={() => void handleTaskStatus(entry.id, "in_arbeit")}
                  disabled={updatingTaskId === entry.id}
                >
                  <Text style={styles.secondaryButtonText}>In Arbeit</Text>
                </Pressable>
              ) : null}
              {entry.status !== "erledigt" ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Aufgabe ${entry.title} erledigen`}
                  style={[styles.secondaryButton, updatingTaskId === entry.id ? styles.buttonDisabled : null]}
                  onPress={() => void handleTaskStatus(entry.id, "erledigt")}
                  disabled={updatingTaskId === entry.id}
                >
                  <Text style={styles.secondaryButtonText}>Erledigen</Text>
                </Pressable>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Aufgabe ${entry.title} wieder öffnen`}
                  style={[styles.secondaryButton, updatingTaskId === entry.id ? styles.buttonDisabled : null]}
                  onPress={() => void handleTaskStatus(entry.id, "offen")}
                  disabled={updatingTaskId === entry.id}
                >
                  <Text style={styles.secondaryButtonText}>Wieder öffnen</Text>
                </Pressable>
              )}
            </View>
          </View>
        ))}

        <Text style={styles.listHeadline}>Letzte Reviermeldungen</Text>
        {!isLoading && meldungen.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Keine Meldungen</Text>
            <Text style={styles.stateCopy}>Neue Hinweise aus dem Revier erscheinen hier.</Text>
          </View>
        ) : null}

        {meldungen.slice(0, 6).map((entry) => (
          <View key={entry.id} style={styles.card}>
            <Text style={styles.badgeText}>{`${formatCategoryLabel(entry.category)} / ${formatMeldungStatusLabel(entry.status)}`}</Text>
            <Text style={styles.title}>{entry.title}</Text>
            {entry.description ? <Text style={styles.copy}>{entry.description}</Text> : null}
            <Text style={styles.copy}>Zeitpunkt: {formatDateTime(entry.occurredAt)}</Text>
            {entry.location ? <Text style={styles.copy}>Standort: {entry.location.label ?? `${entry.location.lat}, ${entry.location.lng}`}</Text> : null}
          </View>
        ))}
      </ScrollView>
    </ScreenShell>
  );
}

function updateField(
  setForm: Dispatch<SetStateAction<ReviermeldungFormState>>,
  key: keyof ReviermeldungFormState
) {
  return (value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };
}

function buildReviermeldungPayload(form: ReviermeldungFormState): CreateReviermeldungRequest {
  const title = form.title.trim();

  if (!title) {
    throw new Error("Bitte einen Kurztext eingeben.");
  }

  const hasLat = form.lat.trim().length > 0;
  const hasLng = form.lng.trim().length > 0;

  if (hasLat !== hasLng) {
    throw new Error("Bitte Breitengrad und Längengrad gemeinsam eingeben oder beide leer lassen.");
  }

  return {
    category: form.category,
    title,
    description: trimToUndefined(form.description),
    occurredAt: new Date().toISOString(),
    location: hasLat && hasLng ? buildGeoPoint(form.lat, form.lng, form.locationLabel, "Mobil gemeldet") : undefined
  };
}

function formatCategoryLabel(value: ReviermeldungKategorie) {
  return CATEGORIES.find((category) => category.value === value)?.label ?? value;
}

function formatMeldungStatusLabel(value: ReviermeldungListItem["status"]) {
  switch (value) {
    case "neu":
      return "Neu";
    case "geprueft":
      return "Geprüft";
    case "in_bearbeitung":
      return "In Bearbeitung";
    case "erledigt":
      return "Erledigt";
    case "verworfen":
      return "Verworfen";
    case "archiviert":
      return "Archiviert";
    default:
      return value;
  }
}

function formatTaskStatusLabel(value: AufgabeStatus) {
  switch (value) {
    case "offen":
      return "Offen";
    case "angenommen":
      return "Angenommen";
    case "in_arbeit":
      return "In Arbeit";
    case "blockiert":
      return "Blockiert";
    case "erledigt":
      return "Erledigt";
    case "abgelehnt":
      return "Abgelehnt";
    case "archiviert":
      return "Archiviert";
    default:
      return value;
  }
}

function getTaskBadgeStyle(status: AufgabeStatus) {
  if (status === "erledigt") {
    return styles.okBadge;
  }

  if (status === "in_arbeit" || status === "angenommen") {
    return styles.infoBadge;
  }

  if (status === "blockiert" || status === "abgelehnt") {
    return styles.errorBadge;
  }

  return styles.warningBadge;
}

function getTaskBadgeTextStyle(status: AufgabeStatus) {
  if (status === "erledigt") {
    return styles.okText;
  }

  if (status === "in_arbeit" || status === "angenommen") {
    return styles.infoText;
  }

  if (status === "blockiert" || status === "abgelehnt") {
    return styles.errorText;
  }

  return styles.warningText;
}

function formatPriorityLabel(value: AufgabeListItem["priority"]) {
  switch (value) {
    case "niedrig":
      return "Niedrig";
    case "normal":
      return "Normal";
    case "hoch":
      return "Hoch";
    case "dringend":
      return "Dringend";
    default:
      return value;
  }
}

function formatSourceLabel(value: NonNullable<AufgabeListItem["sourceType"]>) {
  switch (value) {
    case "reviermeldung":
      return "Reviermeldung";
    case "reviereinrichtung":
      return "Reviereinrichtung";
    case "fallwild_vorgang":
      return "Fallwild";
    case "sitzung":
      return "Sitzung";
    case "beschluss":
      return "Beschluss";
    default:
      return value;
  }
}

const styles = StyleSheet.create({
  listScroll: {
    maxHeight: 720
  },
  listContent: {
    gap: 12,
    paddingBottom: 24
  },
  asideCard: {
    gap: 8
  },
  asideLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "#f7f2e5"
  },
  asideValue: {
    fontSize: 34,
    fontWeight: "700",
    color: "#fff9ef"
  },
  asideCopy: {
    fontSize: 14,
    lineHeight: 20,
    color: "#f7f2e5"
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
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#e3dccd"
  },
  chipActive: {
    backgroundColor: colors.accent
  },
  chipText: {
    color: colors.ink,
    fontWeight: "600"
  },
  chipTextActive: {
    color: colors.surface
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
    minHeight: 44,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#e3dccd"
  },
  secondaryButtonText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "600"
  },
  buttonDisabled: {
    opacity: 0.7
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
  listHeadline: {
    marginTop: 6,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: colors.muted
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
  badgeText: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: colors.muted
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  okBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#dde7cf"
  },
  infoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#dce6df"
  },
  warningBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#efe3d1"
  },
  errorBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#f0d9d4"
  },
  okText: {
    color: colors.accent,
    fontWeight: "700"
  },
  infoText: {
    color: colors.ink,
    fontWeight: "700"
  },
  warningText: {
    color: colors.warning,
    fontWeight: "700"
  },
  errorText: {
    color: colors.danger,
    fontWeight: "700"
  }
});
