import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import LeafIcon from "@/components/ui/LeafIcon";
import { colors, radius, spacing } from "@/constants/theme";
import { usePendingScan } from "@/contexts/PendingScanContext";
import { useScanHistory } from "@/contexts/ScanHistoryContext";
import { analyzeScan } from "@/services/scanBackend";

export default function AnalyzingScreen() {
  const router = useRouter();
  const { pendingScan, clearPendingScan } = usePendingScan();
  const { addScan, isHydrated } = useScanHistory();

  useEffect(() => {
    let cancelled = false;

    if (!pendingScan || !isHydrated) {
      return;
    }

    const runAnalysis = async () => {
      try {
        const analysis = await analyzeScan(pendingScan);
        if (cancelled) {
          return;
        }

        const savedScan = addScan({
          diseaseId: analysis.diseaseId,
          diseaseName: analysis.diseaseName,
          scientificName: analysis.scientificName,
          summary: analysis.summary,
          description: analysis.description,
          severity: analysis.severity,
          stageLabel: analysis.stageLabel,
          confidence: analysis.confidence,
          imageUri: analysis.imageUri,
          subject: pendingScan.subject,
          source: pendingScan.source,
          treatmentSteps: analysis.treatmentSteps,
          recommendation: analysis.recommendation,
          warning: analysis.warning,
          isCocoaLeaf: analysis.isCocoaLeaf,
          modelLabel: analysis.modelLabel,
        });

        clearPendingScan();
        router.replace({
          pathname: "/scan-result",
          params: { scanId: savedScan.id, scanData: JSON.stringify(savedScan) },
        });
      } catch {
        if (!cancelled) {
          router.back();
        }
      }
    };

    void runAnalysis();

    return () => {
      cancelled = true;
    };
  }, [addScan, clearPendingScan, isHydrated, pendingScan, router]);

  if (!pendingScan) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
        <View style={styles.centered}>
          <Text style={styles.title}>No photo to analyze</Text>
          <Text style={styles.subtitle}>
            Go back and capture or upload a cocoa leaf or pod first.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      <View style={styles.topBar}>
        <View style={styles.iconButton}>
          <Feather name="x" size={18} color={colors.textOnDark} />
        </View>
        <View style={styles.subjectPill}>
          <Text style={styles.subjectPillText}>Analyzing photo</Text>
        </View>
        <View style={styles.iconButton}>
          <Feather name="loader" size={18} color={colors.textOnDark} />
        </View>
      </View>

      <View style={styles.previewCard}>
        {pendingScan?.uri ? (
          <Image source={{ uri: pendingScan.uri }} style={styles.previewImage} />
        ) : (
          <View style={styles.previewFallback}>
            <LeafIcon size={54} />
          </View>
        )}
        <View style={styles.previewOverlay}>
          <View style={styles.cornerRow}>
            <View style={styles.corner} />
            <View style={styles.corner} />
          </View>
          <View style={styles.centerIconWrap}>
            <LeafIcon size={56} />
          </View>
          <View style={styles.cornerRow}>
            <View style={styles.corner} />
            <View style={styles.corner} />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>Analyzing your photo</Text>
        <Text style={styles.body}>
          Running the cocoa detector now. The current payload is being
          preprocessed before the analysis step.
        </Text>

        <View style={styles.progressWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.progressText}>Identifying symptoms...</Text>
        </View>

        <View style={styles.noteCard}>
          <Feather name="shield" size={16} color={colors.primaryLight} />
          <Text style={styles.noteText}>
            Photos stay on your device while the analysis request is prepared.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.lg,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingBottom: spacing.md,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  subjectPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  subjectPillText: {
    color: colors.textOnDark,
    fontSize: 13,
    fontWeight: "600",
  },
  previewCard: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: "#184B37",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.22,
  },
  previewFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  previewOverlay: {
    position: "absolute",
    alignItems: "center",
    gap: 18,
  },
  cornerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 150,
  },
  corner: {
    width: 26,
    height: 26,
    borderColor: "#C99A57",
    borderTopWidth: 3,
    borderLeftWidth: 3,
    opacity: 0.9,
  },
  centerIconWrap: {
    width: 150,
    height: 150,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  content: {
    paddingBottom: 40,
  },
  heading: {
    color: colors.textOnDark,
    fontSize: 24,
    fontWeight: "700",
  },
  body: {
    color: colors.textOnDarkMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  progressWrap: {
    marginTop: 28,
    alignItems: "center",
    gap: 12,
  },
  progressText: {
    color: colors.textOnDark,
    fontSize: 15,
    fontWeight: "600",
  },
  noteCard: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  noteText: {
    flex: 1,
    color: colors.textOnDarkMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  title: {
    color: colors.textOnDark,
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textOnDarkMuted,
    textAlign: "center",
    lineHeight: 20,
  },
});
