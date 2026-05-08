import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import type { PropsWithChildren, ReactNode } from "react";

import { colors } from "../lib/theme";

/**
 * Tab-Bar-Hoehe wie in `apps/mobile/app/(tabs)/_layout.tsx` konfiguriert.
 * `height: 72` plus `paddingBottom: 12` plus `paddingTop: 8` = 92.
 * Wir lassen 16 px Atemraum oben drauf, damit Tiles nicht direkt am
 * Bar-Rand kleben. Den `safe-area`-Bottom-Inset zaehlen wir noch dazu.
 */
const TAB_BAR_VISUAL_HEIGHT = 92 + 16;

interface ScreenShellProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
  subtitle: string;
  aside?: ReactNode;
  /**
   * Pull-to-Refresh aktivieren. Wenn gesetzt, rendert ScreenShell automatisch
   * einen nativen RefreshControl mit Brand-Farbe.
   */
  refresh?: {
    refreshing: boolean;
    onRefresh: () => void;
  };
}

export function ScreenShell({ eyebrow, title, subtitle, aside, children, refresh }: ScreenShellProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = TAB_BAR_VISUAL_HEIGHT + insets.bottom;

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          refresh ? (
            <RefreshControl
              refreshing={refresh.refreshing}
              onRefresh={refresh.onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          ) : undefined
        }
      >
        <LinearGradient colors={["#fff8ec", "#dde6c3"]} style={styles.hero}>
          <View style={styles.heroContent}>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={2} style={styles.title}>
              {title}
            </Text>
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
    fontSize: 30,
    lineHeight: 34,
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
