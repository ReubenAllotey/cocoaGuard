import type { ScanRecord } from "@/contexts/ScanHistoryContext";

export function buildScanShareMessage(scan: ScanRecord) {
  const treatmentSteps = scan.treatmentSteps
    .map((step, index) => `${index + 1}. ${step.detail}`)
    .join("\n");

  return [
    `CocoaGuard scan result: ${scan.diseaseName}`,
    `Scientific name: ${scan.scientificName}`,
    `Confidence: ${scan.confidence}%`,
    `Stage: ${scan.stageLabel}`,
    `Recommendation: ${scan.recommendation}`,
    `Note: ${scan.warning}`,
    "Treatment steps:",
    treatmentSteps,
  ]
    .filter(Boolean)
    .join("\n");
}
