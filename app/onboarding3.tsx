import CheckList from "@/components/ui/CheckListIcon";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StatusBar, StyleSheet, Text, View } from "react-native";

export default function Onboarding2() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    // fade + scale in on load
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    // navigate to third onboarding screen  after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace("/camera-permission" as any);
    }, 4500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B3D2E" />

      {/* center content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/*     leaf icon*/}
        <CheckList size={180} color="#E8A33D" bgColor="#0B3D2E" />

        {/* onboarding stage 2 */}
        <Text style={styles.appName}>Follow Treatment Steps</Text>

        {/* tagline */}
        <Text style={styles.tagline}>
          Get a clear steps for your treatment of disease
        </Text>
      </Animated.View>

      {/* bottom section */}
      <Animated.View style={[styles.bottom, { opacity: fadeAnim }]}>
        {/* page indicators */}
        <View style={styles.indicators}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>

        {/* offline note */}
        <Text style={styles.offlineText}>
          works offline · no internet needed
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B3D2E",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    alignItems: "center",
    gap: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.3,
    marginTop: 4,
  },
  tagline: {
    fontSize: 14,
    color: "#9FCFBB",
    letterSpacing: 0.2,
  },
  bottom: {
    position: "absolute",
    bottom: 56,
    alignItems: "center",
    gap: 12,
  },
  indicators: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 22,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  dotActive: {
    backgroundColor: "#F2C57C",
  },
  offlineText: {
    fontSize: 11,
    color: "#6FA98C",
    marginTop: 4,
  },
});
