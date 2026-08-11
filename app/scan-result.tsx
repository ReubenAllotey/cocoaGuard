import { Feather } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LeafIcon from "@/components/ui/LeafIcon";
import { colors, radius, spacing } from "@/constants/theme";
import { useScanHistory, type ScanRecord } from "@/contexts/ScanHistoryContext";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import { buildScanShareMessage } from "@/utils/scanSharing";

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseScanData(raw: string | undefined): ScanRecord | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Omit<ScanRecord, "scannedAt"> & {
      scannedAt: string;
    };

    return {
      ...parsed,
      scannedAt: new Date(parsed.scannedAt),
    };
  } catch {
    return null;
  }
}

function getStageColor(stageLabel: string) {
  if (stageLabel === "Healthy") return "#2E8B57";
  if (stageLabel === "Early") return colors.warningIcon;
  if (stageLabel === "Moderate") return "#D97706";
  return colors.dangerIcon;
}

export default function ScanResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ scanId?: string; scanData?: string }>();
  const { scans } = useScanHistory();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const scanId = getSingleParam(params.scanId);
  const scanData = parseScanData(getSingleParam(params.scanData));
  const scan = useMemo(
    () => scans.find((item) => item.id === scanId) ?? scanData ?? scans[0],
    [scanData, scanId, scans],
  );

  useEffect(() => {
    return () => {
      void Speech.stop();
    };
  }, []);

  if (!scan) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.notFoundWrap}>
          <Text style={styles.notFoundTitle}>Result not found</Text>
          <Text style={styles.notFoundText}>
            This scan may have been cleared. Please run a new scan.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/scan")}>
            <Text style={styles.primaryButtonText}>Start new scan</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const stageColor = getStageColor(scan.stageLabel);

  const handleListen = async () => {
    const speaking = await Speech.isSpeakingAsync();
    if (speaking || isSpeaking) {
      void Speech.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    Speech.speak(
      `${scan.diseaseName}. Confidence ${scan.confidence} percent. Severity stage ${scan.stageLabel}. ${scan.recommendation}. ${scan.warning}.`,
      {
        rate: 0.95,
        pitch: 1,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      },
    );
  };

  const handleShare = async () => {
    await Share.share({
      title: scan.diseaseName,
      message: buildScanShareMessage(scan),
    });
  };

  return (
    <View style={styles.fullBleed}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.content}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <Feather name="arrow-left" size={20} color={colors.textDark} />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Diagnosis result</Text>
            <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
              <Feather name="share-2" size={18} color={colors.textDark} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroCard}>
            {scan.imageUri ? (
              <Image source={{ uri: scan.imageUri }} style={styles.heroImage} />
            ) : (
              <View style={styles.heroFallback}>
                <LeafIcon size={56} />
              </View>
            )}
            <View style={styles.heroOverlay}>
              <LeafIcon size={52} />
            </View>
          </View>

          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.diseaseName}>{scan.diseaseName}</Text>
              <Text style={styles.diseaseMeta}>{scan.scientificName}</Text>
            </View>
            <View style={[styles.stagePill, { backgroundColor: `${stageColor}20` }]}>
              <Text style={[styles.stagePillText, { color: stageColor }]}>
                {scan.stageLabel}
              </Text>
            </View>
          </View>

          {!scan.isCocoaLeaf ? (
            <View style={styles.noticeCard}>
              <Feather name="image" size={16} color={colors.warningIcon} />
              <Text style={styles.noticeText}>
                The detector did not see cocoa leaf features in this photo. Try
                again with one leaf filling most of the frame.
              </Text>
            </View>
          ) : null}

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryLabel}>Confidence</Text>
              <Text style={styles.summaryValue}>{scan.confidence}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${scan.confidence}%` }]} />
            </View>
            <Text style={styles.summaryText}>{scan.description ?? scan.summary}</Text>
          </View>

          <View style={styles.alertCard}>
            <Feather name="alert-triangle" size={16} color={colors.warningIcon} />
            <Text style={styles.alertText}>{scan.warning}</Text>
          </View>

          <TouchableOpacity style={styles.listenButton} onPress={handleListen} activeOpacity={0.85}>
            <View style={styles.listenIconWrap}>
              <Feather
                name={isSpeaking ? "volume-2" : "volume-1"}
                size={16}
                color={colors.primaryDark}
              />
            </View>
            <Text style={styles.listenButtonText}>
              {isSpeaking ? "Stop listening" : "Tap to Listen"}
            </Text>
            <View style={styles.listenBadge}>
              <Feather name="music" size={12} color={colors.primaryDark} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              router.push({
                pathname: "/treatment",
                params: { scanId: scan.id, scanData: JSON.stringify(scan) },
              })
            }
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>
              {scan.isCocoaLeaf ? "View Treatment steps" : "View retake tips"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.replace("/scan")}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>Not sure? Retake Photo</Text>
          </TouchableOpacity>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Scanned {formatRelativeTime(scan.scannedAt)}</Text>
            <Text style={styles.metaText}>
              {scan.isCocoaLeaf ? "Cocoa leaf detected" : "Not a cocoa leaf"}
            </Text>
          </View>
        </View>
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
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textDark,
  },
  heroCard: {
    height: 140,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.18,
  },
  heroFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  heroOverlay: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
  },
  diseaseName: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  diseaseMeta: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  stagePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  stagePillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  summaryCard: {
    marginTop: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E9E4D7",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  summaryText: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
  alertCard: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FBF4E4",
    borderRadius: radius.md,
    padding: 14,
  },
  noticeCard: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FFF8E8",
    borderRadius: radius.md,
    padding: 14,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.warningText,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.warningText,
  },
  listenButton: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderRadius: radius.md,
    backgroundColor: "#E8F2ED",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  listenIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  listenButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: colors.primaryDark,
  },
  listenBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    marginTop: 14,
    backgroundColor: colors.primaryDark,
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.textOnDark,
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#D7D0C0",
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  notFoundWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textDark,
  },
  notFoundText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 18,
  },
});
