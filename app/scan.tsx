import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { CameraView, useCameraPermissions, CameraType } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import LeafIcon from "@/components/ui/LeafIcon";
import { colors, radius, spacing } from "@/constants/theme";

type Subject = "leaf" | "pod";
type CaptureSource = "camera" | "gallery";

export default function ScanScreen() {
  const router = useRouter();
  const [permission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [subject, setSubject] = useState<Subject>("leaf");
  const [facing] = useState<CameraType>("back");
  const [torchOn, setTorchOn] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<{ uri: string } | null>(null);
  const [captureSource, setCaptureSource] = useState<CaptureSource>("camera");

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.85,
    });
    if (photo?.uri) {
      setCaptureSource("camera");
      setCapturedPhoto({ uri: photo.uri });
    }
  };

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setCaptureSource("gallery");
      setCapturedPhoto({ uri: result.assets[0].uri });
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setCaptureSource("camera");
  };

  const handleUsePhoto = () => {
    if (!capturedPhoto) return;

    router.push({
      pathname: "/analyzing",
      params: {
        imageUri: capturedPhoto.uri,
        source: captureSource,
        subject,
      },
    });
  };

  useEffect(() => {
    // Only act once permission has actually resolved (it starts as null
    // while the OS check is in flight) — don't redirect on a still-loading
    // state, or we'll bounce back before the real "granted" comes through.
    if (permission && !permission.granted) {
      router.replace("/camera-permission");
    }
  }, [permission, router]);

  if (!permission || !permission.granted) {
    // Either still checking, or genuinely not granted (about to redirect).
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryDark}
        translucent
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.back()}
        >
          <Feather name="x" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segment, subject === "leaf" && styles.segmentActive]}
            onPress={() => setSubject("leaf")}
          >
            <Text
              style={[
                styles.segmentText,
                subject === "leaf" && styles.segmentTextActive,
              ]}
            >
              Cocoa leaf
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segment, subject === "pod" && styles.segmentActive]}
            onPress={() => setSubject("pod")}
          >
            <Text
              style={[
                styles.segmentText,
                subject === "pod" && styles.segmentTextActive,
              ]}
            >
              Other plant
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setTorchOn((t) => !t)}
        >
          <Feather
            name={torchOn ? "zap" : "zap-off"}
            size={18}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      {/* Camera / preview frame */}
      <View style={styles.frameWrap}>
        {capturedPhoto ? (
          <Image source={{ uri: capturedPhoto.uri }} style={styles.preview} />
        ) : (
          <CameraView
            ref={cameraRef}
            style={styles.preview}
            facing={facing}
            enableTorch={torchOn}
          >
            <View style={styles.viewfinder}>
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
              <LeafIcon size={48} />
            </View>
            <View style={styles.instructionBanner}>
              <Text style={styles.instructionText}>
                {subject === "leaf"
                  ? "Put the cocoa leaf inside the frame"
                  : "Put the other plant inside the frame"}
              </Text>
            </View>
          </CameraView>
        )}
      </View>

      {/* Bottom controls */}
      {capturedPhoto ? (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={handleRetake}
          >
            <Feather name="rotate-ccw" size={20} color="#FFFFFF" />
            <Text style={styles.secondaryActionText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.usePhotoButton}
            onPress={handleUsePhoto}
          >
            <Feather name="check" size={22} color={colors.primaryDark} />
            <Text style={styles.usePhotoText}>Analyze photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.iconButtonMuted}
            onPress={handlePickFromGallery}
          >
            <Feather name="image" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shutterButton}
            onPress={handleCapture}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButtonMuted}
            onPress={() => setCapturedPhoto(null)}
          >
            <Feather name="rotate-cw" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const CORNER_SIZE = 28;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    paddingBottom: spacing.md,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: radius.pill,
    padding: 3,
  },
  segment: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  segmentActive: {
    backgroundColor: colors.accent,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },
  segmentTextActive: {
    color: colors.primaryDark,
  },
  frameWrap: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  preview: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  viewfinder: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.9,
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: colors.accent,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },
  instructionBanner: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  instructionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
    paddingTop: spacing.sm,
  },
  iconButtonMuted: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
  },
  secondaryAction: {
    alignItems: "center",
    gap: 6,
  },
  secondaryActionText: {
    color: "#FFFFFF",
    fontSize: 13,
  },
  usePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.accent,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: radius.pill,
  },
  usePhotoText: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: "600",
  },
});
