import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, spacing } from "@/constants/theme";

export type TabKey = "home" | "library" | "history" | "profile";

const TABS: {
  key: TabKey;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}[] = [
  { key: "home", label: "Home", icon: "home" },
  { key: "library", label: "Library", icon: "book-open" },
  { key: "history", label: "History", icon: "clock" },
  { key: "profile", label: "Profile", icon: "user" },
];

export default function BottomNav({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.7}
          >
            <Feather
              name={tab.icon}
              size={20}
              color={isActive ? colors.primaryDark : colors.textMuted}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: colors.background,
    paddingTop: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingBottom: 4,
  },
  label: {
    fontSize: 11,
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.primaryDark,
    fontWeight: "600",
  },
});
