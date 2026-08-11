import Constants from "expo-constants";

import type { AnalyzePayload, ScanAnalysis } from "@/services/scanAnalysis";

type AnalyzeScanInput = AnalyzePayload;

function getApiBaseUrl() {
  const explicit = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "").trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const hostUri = Constants.expoConfig?.hostUri?.trim();
  if (hostUri) {
    const withoutScheme = hostUri.replace(/^exp:\/\//, "").replace(/^https?:\/\//, "");
    const host = withoutScheme.split("/")[0];
    return `http://${host}`;
  }

  return "";
}

const ANALYZE_PATH = `${getApiBaseUrl()}/analyze`;

export async function analyzeScan({
  imageUri,
  imageBase64,
  mimeType,
  subject,
  source,
}: AnalyzeScanInput): Promise<ScanAnalysis> {
  const response = await fetch(ANALYZE_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageUri,
      imageBase64,
      mimeType,
      subject,
      source,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Unable to analyze scan");
  }

  return (await response.json()) as ScanAnalysis;
}

export function buildListenText(scan: ScanAnalysis) {
  return scan.listenText;
}
