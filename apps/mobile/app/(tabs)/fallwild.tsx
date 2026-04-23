import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import type { Dispatch, SetStateAction } from "react";
import * as ImagePicker from "expo-image-picker";

import { ScreenShell } from "../../components/screen-shell";
import { formatDateTime } from "../../lib/format";
import { buildGeoPoint, trimToUndefined } from "../../lib/form-utils";
import {
  fetchFallwildDetail,
  fetchFallwildList,
  type CreateFallwildRequest,
  type FallwildListItem
} from "../../lib/api";
import {
  FALLWILD_PHOTO_QUALITY,
  MAX_FALLWILD_PHOTOS,
  getRemainingFallwildPhotoSlots,
  limitFallwildPhotoAttachments,
  mergePickedFallwildPhotos,
  type LocalPendingPhoto
} from "../../lib/fallwild-photos";
import { submitFallwildSubmission } from "../../lib/fallwild-submission";
import {
  getOfflineQueueEntryAttachmentHint,
  getOfflineQueueEntryStatusLine,
  summarizeOfflineQueue
} from "../../lib/offline-queue-status";
import {
  syncOfflineQueue,
  useOfflineQueueSnapshot
} from "../../lib/offline-queue";
import { colors } from "../../lib/theme";

interface FallwildFormState {
  locationLabel: string;
  lat: string;
  lng: string;
  wildart: CreateFallwildRequest["wildart"];
  geschlecht: CreateFallwildRequest["geschlecht"];
  altersklasse: CreateFallwildRequest["altersklasse"];
  bergungsStatus: CreateFallwildRequest["bergungsStatus"];
  gemeinde: string;
  strasse: string;
  note: string;
}

const DEFAULT_FORM: FallwildFormState = {
  locationLabel: "Forststrasse",
  lat: "47.9184",
  lng: "13.5219",
  wildart: "Fuchs",
  geschlecht: "weiblich",
  altersklasse: "Adult",
  bergungsStatus: "geborgen",
  gemeinde: "",
  strasse: "",
  note: ""
};

const WILDLIFE_OPTIONS: Array<CreateFallwildRequest["wildart"]> = ["Reh", "Rotwild", "Schwarzwild", "Fuchs", "Dachs", "Hase", "Muffelwild"];
const GESCHLECHT_OPTIONS: Array<CreateFallwildRequest["geschlecht"]> = ["maennlich", "weiblich", "unbekannt"];
const ALTERSKLASSE_OPTIONS: Array<CreateFallwildRequest["altersklasse"]> = ["Kitz", "Jaehrling", "Adult", "unbekannt"];
const BERGUNGS_STATUS_OPTIONS: Array<CreateFallwildRequest["bergungsStatus"]> = [
  "erfasst",
  "geborgen",
  "entsorgt",
  "an-behoerde-gemeldet"
];

type FeedbackState = {
  variant: "success" | "warning";
  title: string;
  copy: string;
} | null;

export default function FallwildScreen() {
  const queue = useOfflineQueueSnapshot();
  const [fallwild, setFallwild] = useState<FallwildListItem[]>([]);
  const [form, setForm] = useState<FallwildFormState>(DEFAULT_FORM);
  const [attachments, setAttachments] = useState<LocalPendingPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPickingPhotos, setIsPickingPhotos] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadFallwild();
  }, []);

  async function loadFallwild(options?: { refreshing?: boolean }) {
    const refreshing = options?.refreshing ?? false;

    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const entries = await fetchFallwildList();
      setFallwild(entries);
    } catch (fetchError) {
      setFallwild([]);
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
    setFeedback(null);
    setError(null);

    try {
      const payload = buildFallwildPayload(form);
      const attachmentSnapshot = limitFallwildPhotoAttachments(attachments);
      const result = await submitFallwildSubmission(payload, attachmentSnapshot);

      setAttachments([]);

      setForm({
        ...DEFAULT_FORM,
        lat: form.lat.trim() || DEFAULT_FORM.lat,
        lng: form.lng.trim() || DEFAULT_FORM.lng
      });

      if (result.mode === "queued") {
        setFeedback({
          variant: "warning",
          title: "Fallwild in der Queue",
          copy:
            attachmentSnapshot.length > 0
              ? `${formatPhotoCount(attachmentSnapshot.length)} ${formatPhotoVerb(attachmentSnapshot.length)} gemeinsam mit dem Vorgang offline vorgemerkt.`
              : "Der Vorgang wurde offline vorgemerkt."
        });
      } else if (result.mode === "partial") {
        setFeedback({
          variant: "warning",
          title: "Fallwild gespeichert",
          copy:
            result.queuedCount > 0
              ? `${formatPhotoCount(result.uploadedCount)} hochgeladen, ${formatPhotoCount(result.queuedCount)} ${formatPhotoVerb(result.queuedCount)} in die Queue gelegt.`
              : `${formatPhotoCount(result.uploadedCount)} ${formatPhotoVerb(result.uploadedCount)} hochgeladen.`
        });
      } else {
        setFeedback({
          variant: "success",
          title: "Fallwild gespeichert",
          copy:
            result.uploadedCount > 0
              ? `${formatPhotoCount(result.uploadedCount)} ${formatPhotoVerb(result.uploadedCount)} direkt mitgespeichert.`
              : "Der Vorgang wurde direkt an die API gesendet."
        });
      }

      if (result.createdId) {
        await refreshFallwildAfterSubmit(result.createdId);
      } else {
        await loadFallwild({ refreshing: true });
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Fallwild konnte nicht erfasst werden.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleQueueSync() {
    setFeedback(null);
    setError(null);

    try {
      const remaining = await syncOfflineQueue();
      setFeedback({
        variant: remaining.length === 0 ? "success" : "warning",
        title: remaining.length === 0 ? "Offline-Queue synchronisiert" : "Offline-Queue teilweise synchronisiert",
        copy:
          remaining.length === 0
            ? "Alle Einträge wurden verarbeitet."
            : `${remaining.length} Queue-Einträge warten weiter auf Synchronisierung.`
      });
      await loadFallwild({ refreshing: true });
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Queue konnte nicht synchronisiert werden.");
    }
  }

  async function handleAddPhotos() {
    const remainingSlots = getRemainingFallwildPhotoSlots(attachments.length);

    if (remainingSlots === 0 || isSubmitting || isPickingPhotos) {
      return;
    }

    setError(null);
    setFeedback(null);
    setIsPickingPhotos(true);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setError("Der Zugriff auf die Fotobibliothek ist nicht erlaubt.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: remainingSlots > 1,
        selectionLimit: remainingSlots,
        quality: FALLWILD_PHOTO_QUALITY,
        allowsEditing: false
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      setAttachments((current) => mergePickedFallwildPhotos(current, result.assets));
    } catch (photoError) {
      setError(photoError instanceof Error ? photoError.message : "Fotos konnten nicht ausgewählt werden.");
    } finally {
      setIsPickingPhotos(false);
    }
  }

  async function refreshFallwildAfterSubmit(createdId: string) {
    try {
      const detail = await fetchFallwildDetail(createdId);
      setFallwild((current) => [detail, ...current.filter((entry) => entry.id !== detail.id)]);
    } catch {
      await loadFallwild({ refreshing: true });
    }
  }

  const queueEntries = queue.entries.filter(
    (entry) => entry.kind === "fallwild-create" || entry.kind === "fallwild-photo-upload"
  );
  const queueSummary = summarizeOfflineQueue(queueEntries);

  return (
    <ScreenShell
      eyebrow="Fallwild"
      title="Fallwild mobil erfassen."
      subtitle="Zeitpunkt, GPS, Wildart und bis zu drei Bibliotheksfotos werden direkt oder offline erfasst."
      aside={
        <View style={styles.queueCard}>
          <Text style={styles.queueTitle}>Ausstehende Synchronisierung</Text>
          <Text style={styles.queueValue}>{queueSummary.totalCount}</Text>
          <Text style={styles.queueCopy}>
            {queueSummary.failedCount > 0
              ? `${queueSummary.failedCount} Einträge brauchen Aufmerksamkeit.`
              : queue.isSyncing
                ? "Queue wird gerade synchronisiert."
                : "Erfasste Vorgänge werden automatisch nachgereicht."}
          </Text>
        </View>
      }
    >
      <View style={styles.formCard}>
        <Text style={styles.sectionLabel}>Neuer Fallwild-Vorgang</Text>
        <Text style={styles.sectionCopy}>Die Erfassung bleibt im Feld schnell bedienbar und nutzt die Queue bei Verbindungsproblemen.</Text>

        <View style={styles.fieldRow}>
          <View style={[styles.field, styles.grow]}>
            <Text style={styles.label}>Breitengrad</Text>
            <TextInput
              keyboardType="decimal-pad"
              placeholder="47.9184"
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
              placeholder="13.5219"
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
            placeholder="Forststrasse"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={form.locationLabel}
            onChangeText={updateField(setForm, "locationLabel")}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Gemeinde</Text>
          <TextInput
            autoCapitalize="words"
            placeholder="Steinbach am Attersee"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={form.gemeinde}
            onChangeText={updateField(setForm, "gemeinde")}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Straße oder Lage</Text>
          <TextInput
            autoCapitalize="words"
            placeholder="L127"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={form.strasse}
            onChangeText={updateField(setForm, "strasse")}
          />
        </View>

        <ChoiceGroup
          label="Wildart"
          options={WILDLIFE_OPTIONS}
          value={form.wildart}
          onChange={updateChoice(setForm, "wildart")}
        />
        <ChoiceGroup
          label="Geschlecht"
          options={GESCHLECHT_OPTIONS}
          value={form.geschlecht}
          onChange={updateChoice(setForm, "geschlecht")}
          formatOption={formatGeschlechtLabel}
        />
        <ChoiceGroup
          label="Altersklasse"
          options={ALTERSKLASSE_OPTIONS}
          value={form.altersklasse}
          onChange={updateChoice(setForm, "altersklasse")}
          formatOption={formatAltersklasseLabel}
        />
        <ChoiceGroup
          label="Bergungsstatus"
          options={BERGUNGS_STATUS_OPTIONS}
          value={form.bergungsStatus}
          onChange={updateChoice(setForm, "bergungsStatus")}
          formatOption={formatBergungsStatusLabel}
        />

        <View style={styles.field}>
          <Text style={styles.label}>Notiz</Text>
          <TextInput
            multiline
            placeholder="Kurze Dokumentation für die Revierleitung"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.textArea]}
            value={form.note}
            onChangeText={updateField(setForm, "note")}
          />
        </View>

        <View style={styles.photoSection}>
          <View style={styles.photoHeader}>
            <View style={styles.grow}>
              <Text style={styles.label}>Fotos</Text>
              <Text style={styles.helperCopy}>
                Bibliothek auswählen, Qualität 0,7, maximal {MAX_FALLWILD_PHOTOS} Bilder.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fotos aus Bibliothek wählen"
              testID="fallwild-photo-picker-button"
              style={[
                styles.photoPickerButton,
                attachments.length >= MAX_FALLWILD_PHOTOS || isPickingPhotos || isSubmitting ? styles.buttonDisabled : null
              ]}
              onPress={() => void handleAddPhotos()}
              disabled={attachments.length >= MAX_FALLWILD_PHOTOS || isPickingPhotos || isSubmitting}
            >
              {isPickingPhotos ? (
                <ActivityIndicator color={colors.ink} />
              ) : (
                <Text style={styles.photoPickerButtonText}>
                  {attachments.length >= MAX_FALLWILD_PHOTOS ? "Maximal erreicht" : "Fotos wählen"}
                </Text>
              )}
            </Pressable>
          </View>

          {attachments.length > 0 ? (
            <View style={styles.photoPreviewList}>
              {attachments.map((photo, index) => (
                <View key={photo.id} style={styles.photoPreviewCard}>
                  <Image accessibilityLabel={`Vorschau ${photo.fileName}`} source={{ uri: photo.uri }} style={styles.photoPreviewImage} />
                  <View style={styles.photoPreviewMeta}>
                    <Text style={styles.photoPreviewTitle}>{photo.title ?? `Foto ${index + 1}`}</Text>
                    <Text style={styles.photoPreviewCopy}>{photo.fileName}</Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Foto entfernen: ${photo.fileName}`}
                    testID={`fallwild-photo-remove-${photo.id}`}
                    style={styles.photoRemoveButton}
                    onPress={removeAttachment(setAttachments, photo.id)}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.photoRemoveButtonText}>Entfernen</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.helperCopy}>Noch keine Fotos ausgewählt.</Text>
          )}
        </View>

        {feedback ? (
          <View style={[styles.feedbackCard, feedback.variant === "success" ? styles.feedbackCardSuccess : styles.feedbackCardWarning]}>
            <Text style={styles.stateTitle}>{feedback.title}</Text>
            <Text style={styles.stateCopy}>{feedback.copy}</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.stateTitle}>Fallwild nicht verfügbar</Text>
            <Text style={styles.stateCopy}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.actionRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fallwild speichern"
            style={[styles.primaryButton, isSubmitting ? styles.buttonDisabled : null]}
            onPress={() => void handleSubmit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.primaryButtonText}>Fallwild speichern</Text>
            )}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fallwild-Queue synchronisieren"
            style={[styles.secondaryButton, queue.isSyncing ? styles.buttonDisabled : null]}
            onPress={() => void handleQueueSync()}
            disabled={queue.isSyncing}
          >
            <Text style={styles.secondaryButtonText}>{queue.isSyncing ? "Synchronisiert..." : "Queue synchronisieren"}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.toolbar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fallwild aktualisieren"
          style={[styles.refreshButton, isRefreshing ? styles.buttonDisabled : null]}
          onPress={() => void loadFallwild({ refreshing: true })}
          disabled={isRefreshing}
        >
          {isRefreshing ? <ActivityIndicator color={colors.ink} /> : <Text style={styles.refreshButtonText}>Aktualisieren</Text>}
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Fallwild wird geladen</Text>
          <Text style={styles.stateCopy}>Die aktuelle Liste wird über die API abgefragt.</Text>
        </View>
      ) : null}

      {queueEntries.length > 0 ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Offline-Vormerkungen</Text>
          {queueEntries.slice(0, 3).map((entry) => (
            <View key={entry.id} style={styles.queueRow}>
              <Text style={styles.queueRowTitle}>{entry.title}</Text>
              <Text style={styles.queueRowCopy}>{getOfflineQueueEntryStatusLine(entry)}</Text>
              <Text style={styles.queueRowCopy}>{getOfflineQueueEntryAttachmentHint(entry)}</Text>
              {entry.lastError ? <Text style={styles.queueRowCopy}>{entry.lastError}</Text> : null}
            </View>
          ))}
          {queueEntries.length > 3 ? (
            <Text style={styles.queueRowCopy}>{`${queueEntries.length - 3} weitere Einträge in der Queue.`}</Text>
          ) : null}
        </View>
      ) : null}

      <ScrollView
        nestedScrollEnabled
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => void loadFallwild({ refreshing: true })} />
        }
        contentContainerStyle={styles.listContent}
        style={styles.listScroll}
      >
        {!isLoading && !error && fallwild.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Kein Fallwild gemeldet</Text>
            <Text style={styles.stateCopy}>Sobald ein Vorgang erfasst ist, erscheint er hier.</Text>
          </View>
        ) : null}

        {fallwild.map((entry) => (
          <View key={entry.id} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.grow}>
                <Text style={styles.title}>
                  {entry.wildart} / {entry.gemeinde}
                </Text>
                <Text style={styles.copy}>
                  {formatGeschlechtLabel(entry.geschlecht)}, {formatAltersklasseLabel(entry.altersklasse)}
                </Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{formatBergungsStatusLabel(entry.bergungsStatus)}</Text>
              </View>
            </View>

            <Text style={styles.copy}>{entry.location.label ?? "Ohne Standort"}</Text>
            <Text style={styles.copy}>{formatDateTime(entry.recordedAt)}</Text>
            {entry.strasse ? <Text style={styles.copy}>{entry.strasse}</Text> : null}
            {entry.note ? <Text style={styles.copy}>{entry.note}</Text> : null}
            {entry.photos.length > 0 ? <Text style={styles.copy}>{formatPhotoCount(entry.photos.length)}</Text> : null}
          </View>
        ))}
      </ScrollView>
    </ScreenShell>
  );
}

function updateField(
  setForm: Dispatch<SetStateAction<FallwildFormState>>,
  key: keyof FallwildFormState
) {
  return (value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };
}

function updateChoice<Key extends keyof Pick<FallwildFormState, "wildart" | "geschlecht" | "altersklasse" | "bergungsStatus">>(
  setForm: Dispatch<SetStateAction<FallwildFormState>>,
  key: Key
) {
  return (value: FallwildFormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };
}

function buildFallwildPayload(form: FallwildFormState): CreateFallwildRequest {
  const gemeinde = form.gemeinde.trim();

  if (!gemeinde) {
    throw new Error("Bitte eine Gemeinde eingeben.");
  }

  return {
    recordedAt: new Date().toISOString(),
    location: buildGeoPoint(form.lat, form.lng, form.locationLabel, "Forststrasse"),
    wildart: form.wildart,
    geschlecht: form.geschlecht,
    altersklasse: form.altersklasse,
    bergungsStatus: form.bergungsStatus,
    gemeinde,
    strasse: trimToUndefined(form.strasse),
    note: trimToUndefined(form.note)
  };
}

function formatPhotoCount(count: number) {
  return count === 1 ? "1 Foto" : `${count} Fotos`;
}

function formatPhotoVerb(count: number) {
  return count === 1 ? "wurde" : "wurden";
}

function removeAttachment(setAttachments: Dispatch<SetStateAction<LocalPendingPhoto[]>>, photoId: string) {
  return () => {
    setAttachments((current) => current.filter((photo) => photo.id !== photoId));
  };
}

function formatGeschlechtLabel(value: CreateFallwildRequest["geschlecht"]) {
  switch (value) {
    case "maennlich":
      return "männlich";
    default:
      return value;
  }
}

function formatAltersklasseLabel(value: CreateFallwildRequest["altersklasse"]) {
  switch (value) {
    case "Jaehrling":
      return "Jährling";
    default:
      return value;
  }
}

function formatBergungsStatusLabel(value: CreateFallwildRequest["bergungsStatus"]) {
  switch (value) {
    case "an-behoerde-gemeldet":
      return "an Behörde gemeldet";
    default:
      return value;
  }
}

function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  formatOption = (option) => option
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (value: T) => void;
  formatOption?: (value: T) => string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.choiceRow}>
        {options.map((option) => {
          const optionLabel = formatOption(option);

          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityLabel={`${label}: ${optionLabel}`}
              onPress={() => onChange(option)}
              style={[styles.choiceChip, option === value ? styles.choiceChipActive : null]}
            >
              <Text style={[styles.choiceText, option === value ? styles.choiceTextActive : null]}>{optionLabel}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
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
  photoSection: {
    gap: 10,
    paddingTop: 4
  },
  photoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  helperCopy: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted
  },
  photoPickerButton: {
    minWidth: 138,
    minHeight: 44,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#e8dfcc"
  },
  photoPickerButtonText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700"
  },
  photoPreviewList: {
    gap: 10
  },
  photoPreviewCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "#f3ecdf"
  },
  photoPreviewImage: {
    width: 68,
    height: 68,
    borderRadius: 14,
    backgroundColor: "#d5cbb8"
  },
  photoPreviewMeta: {
    flex: 1,
    gap: 3
  },
  photoPreviewTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink
  },
  photoPreviewCopy: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.muted
  },
  photoRemoveButton: {
    minHeight: 36,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#ddcfb7"
  },
  photoRemoveButtonText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "700"
  },
  choiceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  choiceChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#efe7d8"
  },
  choiceChipActive: {
    backgroundColor: colors.accent
  },
  choiceText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "600"
  },
  choiceTextActive: {
    color: colors.surface
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
  feedbackCard: {
    gap: 6,
    padding: 18,
    borderRadius: 22
  },
  feedbackCardSuccess: {
    backgroundColor: "#e3ecd7"
  },
  feedbackCardWarning: {
    backgroundColor: "#efe3d1"
  },
  stateCard: {
    gap: 6,
    padding: 18,
    borderRadius: 22,
    backgroundColor: colors.card
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
    gap: 6,
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
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#efe3d1"
  },
  badgeText: {
    color: colors.warning,
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
