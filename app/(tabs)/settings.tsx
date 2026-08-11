import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius, spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useScanHistory } from "@/contexts/ScanHistoryContext";

export default function SettingsScreen() {
  const router = useRouter();
  const { scans, clearScans } = useScanHistory();
  const { user, isSignedIn, signOut } = useAuth();

  const [workOffline, setWorkOffline] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleClearHistory = () => {
    if (scans.length === 0) return;
    Alert.alert(
      "Clear scan history",
      "This removes all logged scans from this device. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: clearScans },
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
          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={20} color={colors.textDark} />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Settings</Text>
          </View>

          {/* Account */}
          <SectionLabel text="Account" />
          <View style={styles.group}>
            {isSignedIn ? (
              <>
                <InfoRow label="Signed in as" value={user?.email ?? ""} />
                <TouchableOpacity
                  style={[styles.row, styles.rowBorder]}
                  onPress={signOut}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.rowLabel, styles.destructiveText]}>
                    Log out
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.row}
                onPress={() => router.push("/sign-in")}
                activeOpacity={0.7}
              >
                <Text style={styles.rowLabel}>Sign in</Text>
                <Feather
                  name="chevron-right"
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Preferences */}
          <SectionLabel text="Preferences" />
          <View style={styles.group}>
            <View style={[styles.row, styles.rowBorder]}>
              <Text style={styles.rowLabel}>Work offline</Text>
              <Switch
                value={workOffline}
                onValueChange={setWorkOffline}
                trackColor={{ false: "#D1D5DB", true: colors.primaryLight }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#D1D5DB", true: colors.primaryLight }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Data */}
          <SectionLabel text="Data" />
          <View style={styles.group}>
            <TouchableOpacity
              style={styles.row}
              onPress={handleClearHistory}
              activeOpacity={0.7}
            >
              <Text style={[styles.rowLabel, styles.destructiveText]}>
                Clear scan history
              </Text>
              <Text style={styles.rowMeta}>{scans.length} scan(s)</Text>
            </TouchableOpacity>
          </View>

          {/* About */}
          <SectionLabel text="About" />
          <View style={styles.group}>
            <View style={[styles.row, styles.rowBorder]}>
              <Text style={styles.rowLabel}>App version</Text>
              <Text style={styles.rowMeta}>1.0.0</Text>
            </View>
            <TouchableOpacity
              style={[styles.row, styles.rowBorder]}
              activeOpacity={0.7}
            >
              <Text style={styles.rowLabel}>About CocoaGuard</Text>
              <Feather
                name="chevron-right"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.row} activeOpacity={0.7}>
              <Text style={styles.rowLabel}>Help & support</Text>
              <Feather
                name="chevron-right"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SectionLabel({ text }: { text: string }) {
  return <Text style={styles.sectionLabel}>{text}</Text>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={[styles.row, styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowMeta}>{value}</Text>
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
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  group: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0EEE6",
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textDark,
  },
  rowMeta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  destructiveText: {
    color: colors.dangerIcon,
  },
});
