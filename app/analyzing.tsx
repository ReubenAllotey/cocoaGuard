import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import LeafIcon from "@/components/ui/LeafIcon";
import { colors, radius, spacing } from "@/constants/theme";
import { useScanHistory } from "@/contexts/ScanHistoryContext";
import {
  buildPlantScanRecord,
  predictPlantDisease,
  type DetectionSource,
  type DetectionSubject,
} from "@/services/plantDetection";

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseSource(value: string | undefined): DetectionSource {
  return value === "gallery" ? "gallery" : "camera";
}

function parseSubject(value: string | undefined): DetectionSubject {
  return value === "pod" ? "pod" : "leaf";
}

function normalizeUri(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default function AnalyzingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    imageUri?: string;
    source?: string;
    subject?: string;
  }>();
  const { addScan, isHydrated } = useScanHistory();

  const imageUri = useMemo(() => {
    const raw = getSingleParam(params.imageUri);
    return raw ? normalizeUri(raw) : "";
  }, [params.imageUri]);
  const source = useMemo(
    () => parseSource(getSingleParam(params.source)),
    [params.source],
  );
  const subject = useMemo(
    () => parseSubject(getSingleParam(params.subject)),
    [params.subject],
  );

  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!isHydrated || !imageUri) {
      return;
    }

    const runAnalysis = async () => {
      setIsRunning(true);
      setError(null);

      try {
        const prediction = await predictPlantDisease(imageUri);
        if (cancelled) {
          return;
        }

        const preparedScan = buildPlantScanRecord(
          prediction,
          imageUri,
          source,
          subject,
        );
        const savedScan = addScan(preparedScan);

        router.replace({
          pathname: "/scan-result",
          params: {
            label: prediction.label,
            confidence: String(prediction.confidence),
            classIndex: String(prediction.classIndex),
            imageUri,
            scanData: JSON.stringify(savedScan),
          },
        });
      } catch (analysisError) {
        if (!cancelled) {
          setError(
            analysisError instanceof Error
              ? analysisError.message
              : "We could not complete the scan.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsRunning(false);
        }
      }
    };

    void runAnalysis();

    return () => {
      cancelled = true;
    };
  }, [addScan, imageUri, isHydrated, router, retryToken, source, subject]);

  const handleRetry = () => {
    setRetryToken((value) => value + 1);
  };

  if (!imageUri) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
        <View style={styles.centered}>
          <Text style={styles.title}>No image to analyze</Text>
          <Text style={styles.subtitle}>
            Go back and take or choose a plant photo first.
          </Text>
          <Pressable style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Return to scan</Text>
          </Pressable>
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
        <Image source={{ uri: imageUri }} style={styles.previewImage} />
        <View style={styles.previewOverlay}>
          <View style={styles.cornerRow}>
            <View style={styles.corner} />
            <View style={styles.corner} />
          </View>
          <View style={styles.centerIconWrap}>
            {isRunning ? <ActivityIndicator size="large" color={colors.accent} /> : <LeafIcon size={56} />}
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
          The image is being resized to 224 by 224 pixels and passed through the
          cocoa model on this device.
        </Text>

        <View style={styles.progressWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.progressText}>
            {isRunning ? "Identifying symptoms..." : "Preparing analysis..."}
          </Text>
        </View>

        <View style={styles.noteCard}>
          <Feather name="shield" size={16} color={colors.primaryLight} />
          <Text style={styles.noteText}>
            The scan stays on your device while the model runs locally.
          </Text>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Feather name="alert-triangle" size={16} color={colors.warningIcon} />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Try again</Text>
            </Pressable>
          </View>
        ) : null}
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
  errorCard: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexWrap: "wrap",
  },
  errorText: {
    flex: 1,
    color: colors.textOnDark,
    fontSize: 13,
    lineHeight: 18,
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "700",
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
