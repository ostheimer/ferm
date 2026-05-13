import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import type { PropsWithChildren, ReactNode } from "react";

import { useThemeColors, type ThemeColors } from "../lib/theme";
import { useThemedStyles } from "../lib/use-themed-styles";

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
  const styles = useThemedStyles(createStyles);
  const theme = useThemeColors();

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
              tintColor={theme.accent}
              colors={[theme.accent]}
            />
          ) : undefined
        }
      >
        <LinearGradient colors={["#fff8ec", "#dde6c3"]} style={styles.hero}>
          <View style={styles.heroHeaderRow}>
            <Text style={styles.eyebrow} numberOfLines={1}>
              {eyebrow}
            </Text>
            {aside ? <View style={styles.asideSlot}>{aside}</View> : null}
          </View>
          <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={2} style={styles.title}>
            {title}
          </Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </LinearGradient>
        <View style={styles.children}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: ThemeColors) =>
  ({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background
    },
    scrollContent: {
      padding: 16,
      gap: 16
    },
    hero: {
      borderRadius: 24,
      padding: 18,
      gap: 6
    },
    heroHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    },
    eyebrow: {
      flex: 1,
      fontSize: 12,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: theme.muted
    },
    asideSlot: {
      flexShrink: 0
    },
    title: {
      fontSize: 26,
      lineHeight: 30,
      color: theme.ink,
      fontWeight: "700",
      marginTop: 4
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.muted
    },
    children: {
      gap: 16
    }
  }) as const;
