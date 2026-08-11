import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LeafIcon from "@/components/ui/LeafIcon";
import { getLibraryEntry } from "@/constants/libraryData";
import { colors, radius, spacing } from "@/constants/theme";

export default function LibraryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const entry = getLibraryEntry(id ?? "");

  if (!entry) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.notFoundWrap}>
          <Text style={styles.notFoundText}>Entry not found.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.notFoundLink}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={20} color={colors.textDark} />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Library</Text>
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerIconWrap}>
              <LeafIcon size={22} />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.entryName}>{entry.name}</Text>
              <Text style={styles.entryMeta}>
                {entry.scientificName} · {entry.type}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Section
            title="Symptoms"
            items={entry.symptoms}
            dotColor={colors.dangerIcon}
          />

          <View style={styles.divider} />

          <Section
            title="Prevention"
            items={entry.prevention}
            dotColor={colors.primaryLight}
          />

          <View style={styles.divider} />

          <Section
            title="Treatment"
            items={entry.treatment}
            dotColor={colors.warningIcon}
          />

          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.85}
            onPress={() => router.push("/scan")}
          >
            <Text style={styles.ctaButtonText}>Scan for this disease</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Section({
  title,
  items,
  dotColor,
}: {
  title: string;
  items: string[];
  dotColor: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.bulletRow}>
          <View style={[styles.bulletDot, { backgroundColor: dotColor }]} />
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
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
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textDark,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: spacing.sm,
  },
  headerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerBg,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    flex: 1,
  },
  entryName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  entryMeta: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: spacing.md,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primaryDark,
    marginBottom: 2,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  ctaButtonText: {
    color: colors.textOnDark,
    fontSize: 16,
    fontWeight: "600",
  },
  notFoundWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  notFoundLink: {
    fontSize: 14,
    color: colors.primaryDark,
    fontWeight: "600",
  },
});
