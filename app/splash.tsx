import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StatusBar, StyleSheet, Text, View } from "react-native";
import Svg, { Ellipse, Path } from "react-native-svg";

// Cocoa pod logo inline — no separate file needed
function CocoaPod({ size = 120 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 1.33} viewBox="0 0 120 160">
      {/* pod body */}
      <Path
        d="M60 8 C80 20 92 45 90 80 C88 112 76 138 60 152 C44 138 32 112 30 80 C28 45 40 20 60 8 Z"
        fill="#E8A33D"
      />
      {/* center ridge */}
      <Path
        d="M60 12 C60 40 59 90 60 148"
        stroke="#C4781F"
        strokeWidth="1.8"
        fill="none"
        opacity="0.6"
        strokeLinecap="round"
      />
      {/* inner ridge left */}
      <Path
        d="M47 20 C44 48 44 90 48 136"
        stroke="#C4781F"
        strokeWidth="1.4"
        fill="none"
        opacity="0.5"
        strokeLinecap="round"
      />
      {/* inner ridge right */}
      <Path
        d="M73 20 C76 48 76 90 72 136"
        stroke="#C4781F"
        strokeWidth="1.4"
        fill="none"
        opacity="0.5"
        strokeLinecap="round"
      />
      {/* outer ridge left */}
      <Path
        d="M38 38 C36 62 36 98 40 122"
        stroke="#C4781F"
        strokeWidth="1"
        fill="none"
        opacity="0.35"
        strokeLinecap="round"
      />
      {/* outer ridge right */}
      <Path
        d="M82 38 C84 62 84 98 80 122"
        stroke="#C4781F"
        strokeWidth="1"
        fill="none"
        opacity="0.35"
        strokeLinecap="round"
      />
      {/* stem */}
      <Ellipse cx="60" cy="6" rx="4" ry="3" fill="#8B5E1A" opacity="0.7" />
    </Svg>
  );
}

export default function SplashScreen() {
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

    // navigate to tabs after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace("/onboarding1" as any);
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
        {/* cocoa pod logo */}
        <CocoaPod size={100} />

        {/* app name */}
        <Text style={styles.appName}>CocoaGuard</Text>

        {/* tagline */}
        <Text style={styles.tagline}>Snap. Diagnose. Protect.</Text>
      </Animated.View>

      {/* bottom section */}
      <Animated.View style={[styles.bottom, { opacity: fadeAnim }]}>
        {/* page indicators */}
        <View style={styles.indicators}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
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
