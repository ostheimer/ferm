import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useRouter } from "expo-router";

import { AppLoader } from "../components/app-loader";
import { loginWithCredentials, MobileApiError } from "../lib/api";
import { useSessionSnapshot } from "../lib/session";
import { colors } from "../lib/theme";

export default function LoginScreen() {
  const router = useRouter();
  const session = useSessionSnapshot();
  const [identifier, setIdentifier] = useState("");
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [identifier, pin]);

  if (session.status === "loading" || !session.hydrated) {
    return <AppLoader />;
  }

  if (session.status === "authenticated") {
    return <Redirect href="/" />;
  }

  async function handleLogin() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await loginWithCredentials({ identifier, pin });
      router.replace("/");
    } catch (loginError) {
      if (loginError instanceof MobileApiError) {
        setError(loginError.message);
      } else if (loginError instanceof Error) {
        setError(loginError.message);
      } else {
        setError("Login fehlgeschlagen.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <LinearGradient colors={["#fff8ec", "#dde6c3"]} style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>hege Revier</Text>
          <Text style={styles.title}>Anmelden und Revierkontext laden</Text>
          <Text style={styles.copy}>Der Zugriff laeuft jetzt ueber E-Mail oder Benutzername und eine vierstellige PIN.</Text>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>E-Mail oder Benutzername</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="E-Mail oder Benutzername eingeben"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={identifier}
                onChangeText={setIdentifier}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>PIN</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
                maxLength={4}
                placeholder="4-stellige PIN"
                placeholderTextColor={colors.muted}
                secureTextEntry
                style={styles.input}
                value={pin}
                onChangeText={setPin}
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Anmelden"
              style={[styles.primaryButton, isSubmitting ? styles.primaryButtonDisabled : null]}
              onPress={() => void handleLogin()}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.primaryButtonText}>Anmelden</Text>
              )}
            </Pressable>
          </View>

          <Text style={styles.footer}>Nach erfolgreichem Login werden Dashboard und Tabs automatisch freigeschaltet.</Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 20
  },
  flex: {
    flex: 1,
    justifyContent: "center"
  },
  card: {
    gap: 18,
    padding: 24,
    borderRadius: 28,
    backgroundColor: colors.card,
    shadowColor: "#10231d",
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 4
  },
  eyebrow: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    color: colors.muted
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
    color: colors.ink,
    fontWeight: "700"
  },
  copy: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted
  },
  form: {
    gap: 14
  },
  field: {
    gap: 6
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
  error: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.danger
  },
  primaryButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.accent
  },
  primaryButtonDisabled: {
    opacity: 0.7
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "700"
  },
  footer: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted
  }
});
