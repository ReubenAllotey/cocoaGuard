import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BottomNav, { TabKey } from "@/components/BottomNav";
import { colors, radius, spacing } from "@/constants/theme";
import { useScanHistory } from "@/contexts/ScanHistoryContext";
import { formatConfidence } from "@/utils/confidence";
import { buildScanShareMessage } from "@/utils/scanSharing";

function getGroupLabel(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 Day Ago";
  if (diffDays < 7) return `${diffDays} Days Ago`;
  if (diffDays < 14) return "1 Week Ago";
  if (diffDays < 21) return "2 Weeks Ago";
  return `${Math.ceil(diffDays / 7)} Weeks Ago`;
}

function getStageColor(stageLabel: string) {
  if (stageLabel === "Healthy") return "#2E8B57";
  if (stageLabel === "Early") return colors.warningIcon;
  if (stageLabel === "Moderate") return "#D97706";
  return colors.dangerIcon;
}

export default function HistoryScreen() {
  const router = useRouter();
  const { scans, deleteScan } = useScanHistory();
  const [activeTab, setActiveTab] = useState<TabKey>("history");

  const groupedScans = useMemo(() => {
    const groups = new Map<string, typeof scans>();

    scans.forEach((scan) => {
      const label = getGroupLabel(scan.scannedAt);
      groups.set(label, [...(groups.get(label) ?? []), scan]);
    });

    return Array.from(groups.entries());
  }, [scans]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    if (tab === "home") router.push("/(tabs)" as any);
    if (tab === "library") router.push("/library");
    if (tab === "profile") router.push("/profile");
  };

  const handleShare = async (scanId: string) => {
    const scan = scans.find((item) => item.id === scanId);
    if (!scan) return;

    await Share.share({
      title: scan.diseaseName,
      message: buildScanShareMessage(scan),
    });
  };

  const handleDelete = (scanId: string) => {
    const scan = scans.find((item) => item.id === scanId);
    if (!scan) return;

    Alert.alert(
      "Delete scan",
      `Remove ${scan.diseaseName} from your history? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteScan(scanId),
        },
      ],
    );
  };

  return (
    <View style={styles.fullBleed}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Text style={styles.title}>History</Text>
            <Text style={styles.subtitle}>{scans.length} scans saved</Text>
          </View>

          {scans.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Feather name="clock" size={24} color={colors.primaryDark} />
              </View>
              <Text style={styles.emptyTitle}>No scans yet</Text>
              <Text style={styles.emptyText}>
                Every scan you make will appear here so you can review it later.
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push("/scan")}
              >
                <Text style={styles.primaryButtonText}>Start scanning</Text>
              </TouchableOpacity>
            </View>
          ) : (
            groupedScans.map(([label, items]) => (
              <View key={label} style={styles.group}>
                <Text style={styles.groupTitle}>{label}</Text>
                <View style={styles.groupCard}>
                  {items.map((scan, index) => {
                    const stageColor = getStageColor(scan.stageLabel);

                    return (
                      <View
                        key={scan.id}
                        style={[
                          styles.row,
                          index !== items.length - 1 && styles.rowBorder,
                        ]}
                      >
                        <TouchableOpacity
                          style={styles.rowMain}
                          activeOpacity={0.85}
                          onPress={() =>
                            router.push({
                              pathname: "/scan-result",
                              params: {
                                scanId: scan.id,
                                scanData: JSON.stringify(scan),
                              },
                            })
                          }
                        >
                          <View style={styles.thumbnail}>
                            {scan.imageUri ? (
                              <Image
                                source={{ uri: scan.imageUri }}
                                style={styles.thumbnailImage}
                              />
                            ) : (
                              <Feather
                                name="image"
                                size={16}
                                color={colors.primaryLight}
                              />
                            )}
                          </View>

                          <View style={styles.rowBody}>
                            <View style={styles.rowTop}>
                              <Text style={styles.rowTitle} numberOfLines={1}>
                                {scan.diseaseName}
                              </Text>
                              <View
                                style={[
                                  styles.stageChip,
                                  { backgroundColor: `${stageColor}20` },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.stageChipText,
                                    { color: stageColor },
                                  ]}
                                >
                                  {scan.stageLabel}
                                </Text>
                              </View>
                            </View>
                            <Text style={styles.rowMeta} numberOfLines={1}>
                              {formatConfidence(scan.confidence)} confidence - {scan.scientificName}
                            </Text>
                          </View>
                        </TouchableOpacity>

                        <View style={styles.rowActions}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleShare(scan.id)}
                            activeOpacity={0.75}
                          >
                            <Feather
                              name="share-2"
                              size={16}
                              color={colors.primaryDark}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => handleDelete(scan.id)}
                            activeOpacity={0.75}
                          >
                            <Feather
                              name="trash-2"
                              size={16}
                              color={colors.dangerIcon}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <BottomNav active={activeTab} onChange={handleTabChange} />
      </SafeAreaView>
    </View>
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  topBar: {
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.textDark,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 88,
    paddingHorizontal: spacing.lg,
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.pill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textDark,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 8,
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: colors.primaryDark,
    borderRadius: radius.pill,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },
  primaryButtonText: {
    color: colors.textOnDark,
    fontSize: 14,
    fontWeight: "700",
  },
  group: {
    marginTop: spacing.md,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textDark,
    marginBottom: 10,
  },
  groupCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0EEE6",
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.pill,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  rowTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.textDark,
  },
  rowMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },
  stageChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  stageChipText: {
    fontSize: 10,
    fontWeight: "700",
  },
  rowActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F6F4ED",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    backgroundColor: "#FBEBE8",
  },
});
