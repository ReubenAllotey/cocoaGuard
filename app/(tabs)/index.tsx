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
import InfoBanner from "@/components/InfoBanner";
import CameraIcon from "@/components/ui/CameraIcon";
import CocoaLogo from "@/components/ui/CocoaLogo";
import LeafIcon from "@/components/ui/LeafIcon";
import { colors, radius, spacing } from "@/constants/theme";
import { useScanHistory } from "@/contexts/ScanHistoryContext";
import { getConfidenceLevel } from "@/utils/confidence";
import { formatRelativeTime } from "@/utils/formatRelativeTime";

export default function Home() {
  const router = useRouter();
  const { scans } = useScanHistory();
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const latestScan = scans[0];

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    if (tab === "library") router.push("/library");
    if (tab === "history") router.push("/history");
    if (tab === "profile") router.push("/profile");
    // "home" is already this screen â€” no navigation needed
  };

  return (
    // Fills the entire screen (including under the status bar / home indicator)
    // so there's never a flash of default background behind the safe areas.
    <View style={styles.fullBleed}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Top bar */}
          <View style={styles.topBar}>
            <View style={styles.brand}>
              <CocoaLogo size={24} />
              <Text style={styles.brandText}>CocoaGuard</Text>
            </View>
            <TouchableOpacity style={styles.offlinePill}>
              <Feather name="wifi-off" size={14} color={colors.primaryLight} />
              <Text style={styles.offlineText}>work offline</Text>
            </TouchableOpacity>
          </View>

          {/* Rotating risk alert / tip banner */}
          <InfoBanner />

          {/* Scan card */}
          <TouchableOpacity
            style={styles.scanCard}
            activeOpacity={0.85}
            onPress={() => router.push("/scan")}
          >
            <View style={styles.scanIconWrap}>
              <CameraIcon size={28} />
            </View>
            <Text style={styles.scanTitle}>Scan a leaf or pod</Text>
            <Text style={styles.scanSubtitle}>Tap to take a photo</Text>
          </TouchableOpacity>

          {/* Quick actions */}
          <View style={styles.quickActions}>
            <QuickAction
              icon="clock"
              label="History"
              onPress={() => router.push("/history")}
            />
            <QuickAction
              icon="book-open"
              label="Library"
              onPress={() => router.push("/library")}
            />
            <QuickAction
              icon="zap"
              label="Tips"
              onPress={() => router.push("/tips")}
            />
            <QuickAction
              icon="settings"
              label="Settings"
              onPress={() => router.push("/settings")}
            />
          </View>

          {/* Recent scan â€” reflects whatever scan was logged most recently */}
          <View style={styles.recentSection}>
            <Text style={styles.recentLabel}>Recent Scan</Text>
            {latestScan ? (
              <TouchableOpacity style={styles.recentCard} activeOpacity={0.85}>
                <View style={styles.recentIconWrap}>
                  <LeafIcon size={20} />
                </View>
                <View>
                  <Text style={styles.recentTitle}>
                    {latestScan.diseaseName}
                  </Text>
                  <Text style={styles.recentSubtitle}>
                    {formatRelativeTime(latestScan.scannedAt)} ·{" "}
                    {latestScan.confidenceLevel ??
                      getConfidenceLevel(latestScan.confidence)}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  No scans yet â€” tap above to scan your first leaf or pod.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <BottomNav active={activeTab} onChange={handleTabChange} />
      </SafeAreaView>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.quickAction}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.quickActionIcon}>
        <Feather name={icon} size={20} color={colors.textDark} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
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
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  brandText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textDark,
  },
  offlinePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  offlineText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.primaryLight,
  },
  scanCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.lg,
    paddingVertical: 36,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  scanIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  scanTitle: {
    color: colors.textOnDark,
    fontSize: 20,
    fontWeight: "600",
  },
  scanSubtitle: {
    color: colors.textOnDarkMuted,
    fontSize: 14,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
  },
  quickAction: {
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  quickActionLabel: {
    fontSize: 12,
    color: "#374151",
  },
  recentSection: {
    marginTop: 24,
  },
  recentLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  recentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  recentIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerBg,
    alignItems: "center",
    justifyContent: "center",
  },
  recentTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textDark,
  },
  recentSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
