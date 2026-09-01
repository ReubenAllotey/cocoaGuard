import { colors } from "@/constants/theme";

export function normalizeConfidence(confidence: number) {
  if (!Number.isFinite(confidence) || confidence < 0) {
    return 0;
  }

  return confidence <= 1 ? confidence * 100 : confidence;
}

export function formatConfidence(confidence: number, fractionDigits = 1) {
  return `${normalizeConfidence(confidence).toFixed(fractionDigits)}%`;
}

export type ConfidenceLevel =
  | "High confidence"
  | "Moderate confidence"
  | "Low confidence";

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.85) {
    return "High confidence";
  }

  if (confidence >= 0.65) {
    return "Moderate confidence";
  }

  return "Low confidence";
}

export function getConfidenceLevelColor(level: ConfidenceLevel) {
  if (level === "High confidence") {
    return "#2E8B57";
  }

  if (level === "Moderate confidence") {
    return "#D97706";
  }

  return colors.warningIcon;
}
