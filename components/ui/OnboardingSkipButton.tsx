import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radius, spacing } from "@/constants/theme";

export function OnboardingSkipButton({
  onPress,
}: {
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.button} onPress={onPress} hitSlop={10}>
      <Text style={styles.text}>Skip</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 56,
    right: spacing.lg,
    zIndex: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  text: {
    color: colors.textOnDark,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
