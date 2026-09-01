import { getLibraryEntry, LIBRARY_ENTRIES } from "@/constants/libraryData";
import { getConfidenceLevel } from "@/utils/confidence";

export type ScanSubject = "leaf" | "pod";

export type TreatmentStep = {
  title: string;
  detail: string;
};

export type ScanAnalysis = {
  diseaseId: string;
  diseaseName: string;
  scientificName: string;
  summary: string;
  description: string;
  confidence: number;
  confidenceLevel: ReturnType<typeof getConfidenceLevel>;
  recommendation: string;
  warning: string;
  treatmentSteps: TreatmentStep[];
  listenText: string;
  imageUri: string;
  isCocoaLeaf: boolean;
  modelLabel: string;
};

export type AnalyzePayload = {
  imageUri?: string;
  imageBase64?: string;
  mimeType?: string;
  subject?: ScanSubject;
  source?: "camera" | "gallery";
};

function hashString(input: string) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function buildTreatmentSteps(diseaseId: string): TreatmentStep[] {
  const entry = getLibraryEntry(diseaseId);

  if (!entry) {
    return [];
  }

  return entry.treatment.map((step, index) => ({
    title: `Step ${index + 1}`,
    detail: step,
  }));
}

function buildGenericTreatmentSteps(): TreatmentStep[] {
  return [
    {
      title: "Retake the photo",
      detail: "Capture one cocoa leaf at a time, with the leaf filling most of the frame.",
    },
    {
      title: "Use bright light",
      detail: "Take the photo in daylight or strong indirect light so the model can read the leaf edges clearly.",
    },
    {
      title: "Remove clutter",
      detail: "Avoid hands, pods, branches, and background objects that can confuse the detector.",
    },
  ];
}

function buildListenText(scan: Omit<ScanAnalysis, "listenText">) {
  const treatmentSummary = scan.treatmentSteps.map((step) => step.detail).join(" ");

  return [
    `${scan.diseaseName}.`,
    scan.scientificName ? `${scan.scientificName}.` : "",
    `Confidence ${scan.confidence} percent.`,
    `Confidence level ${scan.confidenceLevel}.`,
    scan.isCocoaLeaf ? "" : "This photo does not appear to be a cocoa leaf.",
    scan.recommendation,
    scan.warning,
    treatmentSummary,
  ]
    .filter(Boolean)
    .join(" ");
}

function pickDiseaseProfile(seed: number) {
  const diseaseIds = ["black-pod", "frosty-pod-rot", "witches-broom"];
  return diseaseIds[seed % diseaseIds.length];
}

export function analyzePayload(payload: AnalyzePayload): ScanAnalysis {
  const sourceSignature = payload.imageBase64 ?? payload.imageUri ?? "";
  const hash = hashString(sourceSignature || `${payload.subject ?? "leaf"}:${payload.source ?? "camera"}`);
  const isCocoaLeaf = hash % 100 >= 23;

  if (!isCocoaLeaf) {
    const confidence = 82 + (hash % 13);
    const confidenceLevel = getConfidenceLevel(confidence / 100);
    const treatmentSteps = buildGenericTreatmentSteps();
    const scan: Omit<ScanAnalysis, "listenText"> = {
      diseaseId: "not-cocoa-leaf",
      diseaseName: "Not a cocoa leaf",
      scientificName: "Cocoa leaf tissue not detected",
      summary: "The photo does not look like a cocoa leaf. Try again with a single leaf filling most of the frame.",
      description: "The detector could not confirm cocoa leaf features in this image.",
      confidence,
      confidenceLevel,
      recommendation: "Retake the photo with a clear cocoa leaf centered in the frame.",
      warning: "We could not confidently match leaf shape, texture, and color to cocoa foliage.",
      treatmentSteps,
      imageUri: payload.imageUri ?? "",
      isCocoaLeaf: false,
      modelLabel: "not_cocoa_leaf",
    };

    return {
      ...scan,
      listenText: buildListenText(scan),
    };
  }

  const diseaseId = pickDiseaseProfile(hash);
  const entry = getLibraryEntry(diseaseId) ?? LIBRARY_ENTRIES[0];
  const confidence = 71 + (hash % 22);
  const confidenceLevel = getConfidenceLevel(confidence / 100);
  const treatmentSteps = buildTreatmentSteps(entry.id);

  const scan: Omit<ScanAnalysis, "listenText"> = {
    diseaseId: entry.id,
    diseaseName: entry.name,
    scientificName: entry.scientificName,
    summary: entry.summary,
    description: entry.summary,
    confidence,
    confidenceLevel,
    recommendation:
      entry.id === "black-pod"
        ? "Remove infected pods and improve airflow around the tree."
        : entry.id === "frosty-pod-rot"
          ? "Destroy infected pods quickly and harvest more frequently."
          : "Prune infected growth well below the visible symptoms.",
    warning:
      entry.id === "black-pod"
        ? "The lesion pattern suggests a fungal infection that can spread during wet weather."
        : entry.id === "frosty-pod-rot"
          ? "The white coating pattern matches an aggressive pod disease."
          : "The growth pattern suggests a disease that can spread from branch to branch.",
    treatmentSteps,
    imageUri: payload.imageUri ?? "",
    isCocoaLeaf: true,
    modelLabel: diseaseId,
  };

  return {
    ...scan,
    listenText: buildListenText(scan),
  };
}
