import type { ScanRecord } from "@/contexts/ScanHistoryContext";
import { formatConfidence, getConfidenceLevel } from "@/utils/confidence";

export function buildScanShareMessage(scan: ScanRecord) {
  const confidenceLevel = scan.confidenceLevel ?? getConfidenceLevel(scan.confidence);
  const treatmentSteps = scan.treatmentSteps
    .map((step, index) => `${index + 1}. ${step.detail}`)
    .join("\n");

  return [
    `CocoaGuard scan result: ${scan.diseaseName}`,
    `Scientific name: ${scan.scientificName}`,
    `Confidence: ${formatConfidence(scan.confidence)}`,
    `Confidence level: ${confidenceLevel}`,
    `Recommendation: ${scan.recommendation}`,
    `Note: ${scan.warning}`,
    treatmentSteps ? "Treatment steps:" : "",
    treatmentSteps,
  ]
    .filter(Boolean)
    .join("\n");
}
