import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { DashboardResponse } from "@hege/domain";

import { ScreenShell } from "../../components/screen-shell";
import { fetchDashboardSnapshot, logout } from "../../lib/api";
import { useSessionSnapshot } from "../../lib/session";
import { useThemeColors, type ThemeColors } from "../../lib/theme";
import { useThemedStyles } from "../../lib/use-themed-styles";

interface MehrLink {
  href: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const MEHR_LINKS: ReadonlyArray<MehrLink> = [
  {
    href: "/tagesuebersicht",
    label: "Tagesuebersicht",
    description: "Kennzahlen, Warteschlange und naechste Sitzung im Detail.",
    icon: "today-outline"
  },
  {
    href: "/(tabs)/reviereinrichtungen",
    label: "Reviereinrichtungen",
    description: "Hochstände, Fütterungen und Wartungen.",
    icon: "map-outline"
  },
  {
    href: "/(tabs)/revierarbeit",
    label: "Meldungen",
    description: "Reviermeldungen erfassen, Aufgabenstatus pflegen.",
    icon: "checkbox-outline"
  },
  {
    href: "/(tabs)/protokolle",
    label: "Protokolle",
    description: "Sitzungs- und Beschlussprotokolle nachlesen.",
    icon: "document-text-outline"
  }
];

export default function MehrScreen() {
  const router = useRouter();
  const session = useSessionSnapshot();
  const styles = useThemedStyles(createStyles);
  const theme = useThemeColors();
  const [snapshot, setSnapshot] = useState<DashboardResponse | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (session.status !== "authenticated") {
      return;
    }

    let isMounted = true;

    fetchDashboardSnapshot()
      .then((data) => {
        if (isMounted) {
          setSnapshot(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSnapshot(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [session.status, session.session?.user.id]);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout();
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <ScreenShell
      eyebrow="Mehr"
      title="Profil und weitere Bereiche"
      subtitle="Selten genutzte Aufgaben sind hier gebündelt, damit der Heute-Bildschirm fokussiert bleibt."
    >
      <View style={styles.profileCard}>
        <Text style={styles.profileLabel}>Angemeldet als</Text>
        <Text style={styles.profileName}>{snapshot?.user.name ?? "Wird geladen..."}</Text>
        <Text style={styles.profileMeta}>
          {snapshot
            ? `${formatRoleLabel(snapshot.membership.role)} · ${snapshot.membership.jagdzeichen}`
            : "Rolle wird geladen..."}
        </Text>
        <Text style={styles.profileMeta}>{snapshot?.revier.name ?? "Revier wird geladen..."}</Text>
      </View>

      <View style={styles.linkList}>
        {MEHR_LINKS.map((entry) => (
          <Pressable
            key={entry.href}
            accessibilityRole="link"
            accessibilityLabel={entry.label}
            onPress={() => router.push(entry.href)}
            style={({ pressed }) => [styles.linkRow, pressed ? styles.linkRowPressed : null]}
          >
            <View style={styles.linkIcon}>
              <Ionicons color={theme.ink} name={entry.icon} size={22} />
            </View>
            <View style={styles.linkCopy}>
              <Text style={styles.linkLabel}>{entry.label}</Text>
              <Text style={styles.linkDescription}>{entry.description}</Text>
            </View>
            <Ionicons color={theme.muted} name="chevron-forward" size={20} />
          </Pressable>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abmelden"
        onPress={() => void handleLogout()}
        disabled={isLoggingOut}
        style={[styles.logoutButton, isLoggingOut ? styles.logoutDisabled : null]}
      >
        {isLoggingOut ? (
          <ActivityIndicator color={theme.ink} />
        ) : (
          <Text style={styles.logoutText}>Abmelden</Text>
        )}
      </Pressable>
    </ScreenShell>
  );
}

const createStyles = (theme: ThemeColors) =>
  ({
  profileCard: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: theme.card,
    gap: 6
  },
  profileLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: theme.muted
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.ink
  },
  profileMeta: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.muted
  },
  linkList: {
    borderRadius: 22,
    backgroundColor: theme.card,
    overflow: "hidden"
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(25, 57, 44, 0.08)"
  },
  linkRowPressed: {
    backgroundColor: "rgba(25, 57, 44, 0.04)"
  },
  linkIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(157, 179, 111, 0.18)",
    alignItems: "center",
    justifyContent: "center"
  },
  linkCopy: {
    flex: 1,
    gap: 4
  },
  linkLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.ink
  },
  linkDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.muted
  },
  logoutButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#e3dccd"
  },
  logoutDisabled: {
    opacity: 0.7
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.ink
  }
}) as const;

function formatRoleLabel(role: DashboardResponse["membership"]["role"]) {
  switch (role) {
    case "revier-admin":
      return "Admin";
    case "schriftfuehrer":
      return "Schriftführung";
    case "jaeger":
      return "Jäger";
    case "ausgeher":
      return "Ausgeher";
    case "platform-admin":
      return "Plattform";
    default:
      return role;
  }
}
