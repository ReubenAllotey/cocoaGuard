import { Feather } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius, spacing } from "@/constants/theme";
import { useScanHistory, type ScanRecord } from "@/contexts/ScanHistoryContext";

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

export default function TreatmentScreen() {
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
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>No treatment plan found</Text>
          <Text style={styles.emptyText}>
            Run a scan first so we can show the matching steps.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/scan")}
          >
            <Text style={styles.primaryButtonText}>Start new scan</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const speakTreatment = async () => {
    const speaking = await Speech.isSpeakingAsync();
    if (speaking || isSpeaking) {
      void Speech.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const stepText = scan.treatmentSteps
      .map((step, index) => `Step ${index + 1}. ${step.detail}`)
      .join(" ");

    Speech.speak(`${scan.diseaseName}. ${scan.recommendation}. ${stepText}`, {
      rate: 0.95,
      pitch: 1,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const callExtensionOfficer = async () => {
    try {
      await Linking.openURL("tel:+233000000000");
    } catch {
      Alert.alert(
        "Call unavailable",
        "Phone calling is not available on this device.",
      );
    }
  };

  return (
    <View style={styles.fullBleed}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={20} color={colors.textDark} />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Treatment steps</Text>
            <TouchableOpacity style={styles.iconButton} onPress={speakTreatment}>
              <Feather
                name={isSpeaking ? "volume-2" : "volume-1"}
                size={18}
                color={colors.textDark}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.headerCard}>
            <View style={styles.headerIcon}>
              <Feather name="check-circle" size={18} color={colors.accent} />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.diseaseName}>{scan.diseaseName}</Text>
              <Text style={styles.diseaseMeta}>
                {scan.isCocoaLeaf
                  ? `${scan.stageLabel} stage - Follow these steps`
                  : "Retake guidance - Follow these steps"}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.listenButton} onPress={speakTreatment}>
            <Feather
              name={isSpeaking ? "volume-2" : "volume-1"}
              size={16}
              color={colors.primaryDark}
            />
            <Text style={styles.listenButtonText}>
              {isSpeaking ? "Stop listening" : "Tap to Listen"}
            </Text>
            <View style={styles.listenDot}>
              <Feather name="music" size={11} color={colors.primaryDark} />
            </View>
          </TouchableOpacity>

          <View style={styles.stepList}>
            {scan.treatmentSteps.map((step, index) => (
              <View key={`${scan.id}-${index}`} style={styles.stepCard}>
                <View style={styles.stepNumberWrap}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                </View>
                <View style={styles.stepBody}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepText}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.warningCard}>
            <Feather name="alert-triangle" size={16} color={colors.warningIcon} />
            <Text style={styles.warningText}>{scan.warning}</Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={callExtensionOfficer}
          >
            <Feather name="phone-call" size={16} color={colors.textOnDark} />
            <Text style={styles.primaryButtonText}>Call extension officer</Text>
          </TouchableOpacity>
        </ScrollView>
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
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.primaryDark,
    borderRadius: radius.md,
    padding: 14,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    flex: 1,
  },
  diseaseName: {
    color: colors.textOnDark,
    fontSize: 18,
    fontWeight: "700",
  },
  diseaseMeta: {
    color: colors.textOnDarkMuted,
    fontSize: 13,
    marginTop: 2,
  },
  listenButton: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    backgroundColor: "#E8F2ED",
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  listenButtonText: {
    flex: 1,
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "700",
  },
  listenDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  stepList: {
    marginTop: 16,
    gap: 12,
  },
  stepCard: {
    flexDirection: "row",
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
  stepNumberWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepNumber: {
    color: colors.textOnDark,
    fontSize: 12,
    fontWeight: "700",
  },
  stepBody: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textDark,
  },
  stepText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  warningCard: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#FBF4E4",
    borderRadius: radius.md,
    padding: 14,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.warningText,
  },
  primaryButton: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primaryDark,
    borderRadius: radius.md,
    paddingVertical: 15,
  },
  primaryButtonText: {
    color: colors.textOnDark,
    fontSize: 15,
    fontWeight: "700",
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textDark,
  },
  emptyText: {
    marginTop: 8,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
});
