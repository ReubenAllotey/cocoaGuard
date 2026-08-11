import { colors, radius, spacing } from "@/constants/theme";
import { ALL_TIPS } from "@/constants/tipsData";
import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

type BannerItem = {
  icon: keyof typeof Feather.glyphMap;
  text: string;
  kind: "risk" | "tip";
};

// A couple of real risk-style alerts, mixed in with tips pulled from the
// same data the Tips screen uses. Hard-coded for now — the risk items would
// eventually come from real weather/model data instead.
const RISK_ITEMS: BannerItem[] = [
  {
    icon: "cloud-rain",
    text: "Black pod risk is high this month due to recent rainfall",
    kind: "risk",
  },
  {
    icon: "sun",
    text: "Dry spell ahead — a good window to catch up on scans across your plot",
    kind: "risk",
  },
];

const TIP_ITEMS: BannerItem[] = ALL_TIPS.map((tip) => ({
  icon: tip.icon,
  text: tip.title + " — " + tip.body,
  kind: "tip",
}));

const BANNER_ITEMS: BannerItem[] = [...RISK_ITEMS, ...TIP_ITEMS];

const ROTATE_INTERVAL_MS = 6000;
const FADE_DURATION_MS = 300;

export default function InfoBanner() {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_DURATION_MS,
        useNativeDriver: true,
      }).start(() => {
        setIndex((prev) => (prev + 1) % BANNER_ITEMS.length);
        Animated.timing(opacity, {
          toValue: 1,
          duration: FADE_DURATION_MS,
          useNativeDriver: true,
        }).start();
      });
    }, ROTATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [opacity]);

  const item = BANNER_ITEMS[index];
  const isRisk = item.kind === "risk";

  return (
    <View style={[styles.banner, isRisk ? styles.riskStyle : styles.tipStyle]}>
      <Animated.View style={[styles.animatedRow, { opacity }]}>
        <Feather
          name={item.icon}
          size={20}
          color={isRisk ? colors.warningIcon : colors.primaryLight}
          style={styles.icon}
        />
        <Text style={[styles.text, isRisk ? styles.riskText : styles.tipText]}>
          {item.text}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 14,
    marginTop: spacing.sm,
    minHeight: 64,
    justifyContent: "center",
  },
  riskStyle: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
  },
  tipStyle: {
    backgroundColor: colors.pill,
    borderColor: "rgba(0,0,0,0.05)",
  },
  animatedRow: {
    flexDirection: "row",
    gap: 10,
  },
  icon: {
    marginTop: 2,
  },
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
  },
  riskText: {
    color: colors.warningText,
  },
  tipText: {
    color: colors.primaryDark,
  },
});
