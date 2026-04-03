import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { PropsWithChildren, ReactNode } from "react";

import { colors } from "../lib/theme";

interface ScreenShellProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
  subtitle: string;
  aside?: ReactNode;
}

export function ScreenShell({ eyebrow, title, subtitle, aside, children }: ScreenShellProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={["#fff8ec", "#dde6c3"]} style={styles.hero}>
          <View style={styles.heroContent}>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          {aside ? <View style={styles.aside}>{aside}</View> : null}
        </LinearGradient>
        <View style={styles.children}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    padding: 16,
    gap: 16
  },
  hero: {
    borderRadius: 28,
    padding: 22,
    gap: 18
  },
  heroContent: {
    gap: 10
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.muted
  },
  title: {
    fontSize: 34,
    lineHeight: 36,
    color: colors.ink,
    fontWeight: "700"
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.muted
  },
  aside: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.accent
  },
  children: {
    gap: 16
  }
});
