import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BottomNav, { TabKey } from "@/components/BottomNav";
import { colors, radius, spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useScanHistory } from "@/contexts/ScanHistoryContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { scans } = useScanHistory();
  const { user, isSignedIn, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  const totalScans = scans.length;
  const needsAttentionCount = scans.filter(
    (s) => s.severity === "needs attention",
  ).length;

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    if (tab === "home") router.push("/(tabs)" as any);
    if (tab === "history") router.push("/history");
    if (tab === "library") router.push("/library");
    // "profile" is already this screen
  };

  if (!isSignedIn) {
    return (
      <View style={styles.fullBleed}>
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
          <View style={styles.content}>
            <View style={styles.topBar}>
              <Text style={styles.title}>Profile</Text>
            </View>

            <View style={styles.lockedWrap}>
              <View style={styles.lockedIconWrap}>
                <Feather name="user" size={28} color={colors.primaryDark} />
              </View>
              <Text style={styles.lockedTitle}>
                Sign in to view your profile
              </Text>
              <Text style={styles.lockedSubtitle}>
                You can keep scanning leaves and pods without an account — sign
                in when you want to see your stats and details here.
              </Text>
              <TouchableOpacity
                style={styles.signInButton}
                activeOpacity={0.85}
                onPress={() => router.push("/sign-in")}
              >
                <Text style={styles.signInButtonText}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>

          <BottomNav active={activeTab} onChange={handleTabChange} />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.fullBleed}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Top bar */}
          <View style={styles.topBar}>
            <Text style={styles.title}>Profile</Text>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push("/settings")}
            >
              <Feather name="settings" size={18} color={colors.textDark} />
            </TouchableOpacity>
          </View>

          {/* Avatar + name */}
          <View style={styles.identityCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>
                {user?.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userMeta}>{user?.email}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalScans}</Text>
              <Text style={styles.statLabel}>Total scans</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{needsAttentionCount}</Text>
              <Text style={styles.statLabel}>Needs attention</Text>
            </View>
          </View>

          {/* Menu */}
          <View style={styles.menuGroup}>
            <MenuRow
              icon="user"
              label="Account details"
              onPress={() => router.push("/settings")}
            />
            <MenuRow
              icon="bell"
              label="Notifications"
              onPress={() => router.push("/settings")}
            />
            <MenuRow
              icon="help-circle"
              label="Help & support"
              onPress={() => router.push("/settings")}
            />
            <MenuRow
              icon="info"
              label="About CocoaGuard"
              onPress={() => router.push("/settings")}
              isLast
            />
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.7}
            onPress={signOut}
          >
            <Feather name="log-out" size={16} color={colors.dangerIcon} />
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </ScrollView>

        <BottomNav active={activeTab} onChange={handleTabChange} />
      </SafeAreaView>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
  isLast,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress?: () => void;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.menuRow, !isLast && styles.menuRowBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconWrap}>
        <Feather name={icon} size={16} color={colors.primaryDark} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Feather name="chevron-right" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fullBleed: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textDark,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  lockedWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  lockedIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.pill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textDark,
    textAlign: "center",
  },
  lockedSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  signInButton: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.pill,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  signInButtonText: {
    color: colors.textOnDark,
    fontSize: 15,
    fontWeight: "600",
  },
  identityCard: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textOnDark,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textDark,
  },
  userMeta: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  menuGroup: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    marginBottom: spacing.lg,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0EEE6",
  },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.textDark,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.dangerIcon,
  },
});
