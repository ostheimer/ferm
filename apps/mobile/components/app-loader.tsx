import { LinearGradient } from "expo-linear-gradient";
import { Image, StyleSheet, Text, View } from "react-native";

import { colors } from "../lib/theme";

const logoMark = require("../assets/logo-mark.png");

export function AppLoader() {
  return (
    <LinearGradient colors={["#fff8ec", "#dde6c3"]} style={styles.root}>
      <View style={styles.card}>
        <Image accessibilityIgnoresInvertColors source={logoMark} style={styles.logo} />
        <Text style={styles.eyebrow}>hege</Text>
        <Text style={styles.title}>Session wird geladen</Text>
        <Text style={styles.copy}>Wir stellen den gesicherten Revier-Kontext wieder her.</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  card: {
    width: "100%",
    maxWidth: 420,
    gap: 10,
    padding: 24,
    borderRadius: 28,
    backgroundColor: colors.card,
    shadowColor: "#10231d",
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 4
  },
  logo: {
    width: 72,
    height: 72,
    resizeMode: "contain"
  },
  eyebrow: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    color: colors.muted
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    color: colors.ink,
    fontWeight: "700"
  },
  copy: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted
  }
});
