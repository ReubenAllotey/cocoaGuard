import { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import LeafIcon from "@/components/ui/LeafIcon";
import { colors, radius, spacing } from "@/constants/theme";
import BottomNav, { TabKey } from "@/components/BottomNav";
import { LIBRARY_ENTRIES } from "@/constants/libraryData";

type Category = "all" | "disease" | "pest";

const FILTERS: { key: Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "disease", label: "Diseases" },
  { key: "pest", label: "Pests" },
];

export default function LibraryScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [activeTab, setActiveTab] = useState<TabKey>("library");

  const filteredEntries = useMemo(() => {
    return LIBRARY_ENTRIES.filter((entry) => {
      const matchesCategory = category === "all" || entry.category === category;
      const matchesQuery =
        query.trim().length === 0 ||
        entry.name.toLowerCase().includes(query.trim().toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    if (tab === "home") router.push("/(tabs)" as any);
    if (tab === "history") router.push("/history");
    if (tab === "profile") router.push("/profile");
  };

  return (
    <View style={styles.fullBleed}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.content}>
          {/* Header */}
          <Text style={styles.title}>Library</Text>
          <Text style={styles.subtitle}>
            Reference guide to common cocoa diseases and pests
          </Text>

          {/* Search bar */}
          <View style={styles.searchBar}>
            <Feather name="search" size={16} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search diseases or pests"
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
            />
          </View>

          {/* Category filter chips */}
          <View style={styles.filterRow}>
            {FILTERS.map((filter) => {
              const isActive = filter.key === category;
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                  ]}
                  onPress={() => setCategory(filter.key)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Entry list */}
          <FlatList
            data={filteredEntries}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No matches — try a different search or filter.
              </Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.entryCard}
                activeOpacity={0.85}
                onPress={() => router.push(`/library/${item.id}` as any)}
              >
                <View style={styles.entryIconWrap}>
                  <LeafIcon size={20} />
                </View>
                <View style={styles.entryTextWrap}>
                  <View style={styles.entryTitleRow}>
                    <Text style={styles.entryName}>{item.name}</Text>
                    <View
                      style={[
                        styles.categoryTag,
                        item.category === "pest" && styles.categoryTagPest,
                      ]}
                    >
                      <Text style={styles.categoryTagText}>
                        {item.category === "disease" ? "Disease" : "Pest"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.entrySummary} numberOfLines={2}>
                    {item.summary}
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            )}
          />
        </View>

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
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textDark,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textDark,
    padding: 0,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.pill,
  },
  filterChipActive: {
    backgroundColor: colors.primaryDark,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.primaryLight,
  },
  filterChipTextActive: {
    color: colors.textOnDark,
  },
  list: {
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
    gap: 10,
  },
  entryCard: {
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
  entryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerBg,
    alignItems: "center",
    justifyContent: "center",
  },
  entryTextWrap: {
    flex: 1,
  },
  entryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  entryName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textDark,
    flexShrink: 1,
  },
  categoryTag: {
    backgroundColor: colors.warningBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  categoryTagPest: {
    backgroundColor: colors.pill,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.warningText,
  },
  entrySummary: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 3,
    lineHeight: 18,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
