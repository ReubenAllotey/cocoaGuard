import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useCameraPermissions } from "expo-camera";
import CameraIcon from "@/components/ui/CameraIcon";
import { colors, radius, spacing } from "@/constants/theme";

export default function CameraPermissionScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  // Note: no auto-redirect-if-already-granted effect here. Home always
  // routes to /scan first, and /scan only sends the user here when it has
  // already confirmed permission is genuinely not granted — so by the time
  // this screen is reached, self-checking again just races with that
  // decision and can bounce the user back before they can tap anything.

  const handleAllow = async () => {
    const result = await requestPermission();
    if (result.granted) {
      // permission granted — go to home, not straight into the camera
      router.replace("/(tabs)" as any);
    } else {
      // permission denied — show explanation
      Alert.alert(
        "Camera access needed",
        "CocoaGuard needs camera access to scan your cocoa plants. You can enable it in your phone settings.",
        [
          {
            text: "Open settings",
            onPress: () => {
              // on a real device this would open settings
              // import { Linking } from "react-native"
              // Linking.openSettings();
            },
          },
          {
            text: "Not now",
            style: "cancel",
          },
        ],
      );
    }
  };

  const handleNotNow = () => {
    // skip permission for now, go to home
    // camera will prompt again when scan button is tapped
    router.replace("/(tabs)" as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryDark}
        translucent
      />

      {/* center content */}
      <View style={styles.content}>
        <CameraIcon size={180} />

        <View style={styles.textBlock}>
          <Text style={styles.title}>Allow camera access</Text>
          <Text style={styles.subtitle}>
            CocoaGuard needs your camera to scan leaves and pods. Photos stay on
            your phone and are never uploaded without your permission.
          </Text>
        </View>
      </View>

      {/* bottom buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleAllow}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Allow camera access</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleNotNow}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>Not now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: 28,
  },
  textBlock: {
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.textOnDark,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: colors.textOnDarkMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  buttons: {
    width: "100%",
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: spacing.sm + 4,
  },
  primaryButton: {
    width: "100%",
    height: 50,
    borderRadius: radius.sm + 2,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primaryDark,
  },
  secondaryButton: {
    width: "100%",
    height: 44,
    borderRadius: radius.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    color: colors.textOnDark,
  },
});
