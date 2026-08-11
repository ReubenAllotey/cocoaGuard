import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius, spacing } from "@/constants/theme";
import { TIP_CATEGORIES } from "@/constants/tipsData";

type Tip = {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  body: string;
};

type TipCategory = {
  title: string;
  tips: Tip[];
};

export default function TipsScreen() {
  const router = useRouter();

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
            <Text style={styles.topBarTitle}>Tips</Text>
          </View>

          {TIP_CATEGORIES.map((category) => (
            <View key={category.title} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              {category.tips.map((tip) => (
                <View key={tip.title} style={styles.tipCard}>
                  <View style={styles.tipIconWrap}>
                    <Feather
                      name={tip.icon}
                      size={18}
                      color={colors.primaryDark}
                    />
                  </View>
                  <View style={styles.tipTextWrap}>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                    <Text style={styles.tipBody}>{tip.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
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
    fontSize: 22,
    fontWeight: "700",
    color: colors.textDark,
  },
  categorySection: {
    marginTop: spacing.lg,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primaryDark,
    marginBottom: spacing.sm,
  },
  tipCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  tipIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  tipTextWrap: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: 3,
  },
  tipBody: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
