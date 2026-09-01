import { getLibraryEntry } from "@/constants/libraryData";
import {
  assertExactTensorMetadata,
  decodeProbabilityScores,
  decodeTensorBuffer,
  getTopClass,
  prepareImageAsRgba,
  rgbaToFloat32RgbTensor,
  type TensorDataType,
} from "@/utils/modelImagePreprocessing";
import { loadBundledTfliteModel } from "@/services/tfliteAsset";
import { getConfidenceLevel, type ConfidenceLevel } from "@/utils/confidence";
import type { TfliteModel } from "react-native-fast-tflite";

export type CocoaLabel = "Healthy" | "Black Pod" | "CSSVD";
export type DetectionSource = "camera" | "gallery";
export type DetectionSubject = "leaf" | "pod";

export type TreatmentStep = {
  title: string;
  detail: string;
};

export type PredictionResult = {
  classIndex: number;
  label: CocoaLabel;
  confidence: number;
  probabilities: number[];
};

export type PlantScanRecord = {
  diseaseId: string;
  diseaseName: CocoaLabel;
  scientificName: string;
  summary: string;
  description: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  imageUri: string;
  subject: DetectionSubject;
  source: DetectionSource;
  treatmentSteps: TreatmentStep[];
  recommendation: string;
  warning: string;
  isCocoaLeaf: boolean;
  modelLabel: CocoaLabel;
  classIndex: number;
  probabilities: number[];
};

type DiseaseModel = TfliteModel & {
  inputs: [TfliteModel["inputs"][number]];
  outputs: [TfliteModel["outputs"][number]];
};

const DISEASE_MODEL_NAME = "cocoa_model.tflite";
const DISEASE_INPUT_SHAPE = [1, 224, 224, 3];
const DISEASE_OUTPUT_SHAPE = [1, 3];
const EXPECTED_DISEASE_LABELS: readonly CocoaLabel[] = [
  "Healthy",
  "Black Pod",
  "CSSVD",
] as const;

const diseaseLabels = require("../assets/models/labels.json") as string[];

let modelPromise: Promise<DiseaseModel> | null = null;
let cachedModel: DiseaseModel | null = null;

function assertDiseaseLabelManifest() {
  const actual = diseaseLabels.join("|");
  const expected = EXPECTED_DISEASE_LABELS.join("|");

  if (actual !== expected) {
    throw new Error(
      `assets/models/labels.json must contain exactly ${expected}, but received ${actual}.`,
    );
  }
}

function logModelMetadataOnce(model: DiseaseModel) {
  if (!__DEV__) {
    return;
  }

  console.log(DISEASE_MODEL_NAME, {
    inputShape: model.inputs[0]?.shape,
    inputType: model.inputs[0]?.dataType,
    outputShape: model.outputs[0]?.shape,
    outputType: model.outputs[0]?.dataType,
  });
}

async function getModel() {
  if (cachedModel) {
    return cachedModel;
  }

  if (!modelPromise) {
    modelPromise = loadBundledTfliteModel(
      require("../assets/models/cocoa_model.tflite"),
      [],
      DISEASE_MODEL_NAME,
    )
      .then((model) => {
        assertDiseaseLabelManifest();
        assertExactTensorMetadata(
          DISEASE_MODEL_NAME,
          model.inputs[0],
          model.outputs[0],
          {
            inputShape: DISEASE_INPUT_SHAPE,
            inputDataType: "float32",
            outputShape: DISEASE_OUTPUT_SHAPE,
            outputDataType: "float32",
          },
        );

        cachedModel = model as DiseaseModel;
        logModelMetadataOnce(cachedModel);
        return cachedModel;
      })
      .catch((error) => {
        modelPromise = null;
        throw error;
      });
  }

  return modelPromise;
}

function getDiseaseLabel(index: number): CocoaLabel {
  const label = diseaseLabels[index];

  if (
    label === "Healthy" ||
    label === "Black Pod" ||
    label === "CSSVD"
  ) {
    return label;
  }

  throw new Error(`Invalid disease class index ${index}.`);
}

function buildDiseaseMetadata(label: CocoaLabel) {
  if (label === "Healthy") {
    return {
      diseaseId: "healthy",
      scientificName: "Healthy cocoa leaf",
      summary: "No disease signs were detected in this image.",
      description: "The classifier marked this leaf as healthy.",
      recommendation: "No treatment is needed. Keep monitoring the tree.",
      warning: "No treatment required.",
      treatmentSteps: [] as TreatmentStep[],
    };
  }

  const entry =
    label === "Black Pod"
      ? getLibraryEntry("black-pod")
      : getLibraryEntry("cssvd");

  if (!entry) {
    throw new Error(`No metadata found for disease class ${label}.`);
  }

  const treatmentSteps = entry.treatment.map((detail, index) => ({
    title: `Step ${index + 1}`,
    detail,
  }));

  return {
    diseaseId: entry.id,
    scientificName: entry.scientificName,
    summary: entry.summary,
    description: entry.summary,
    recommendation:
      label === "Black Pod"
        ? "Follow the treatment steps below and remove infected pods promptly."
        : "Follow the treatment steps below and stop further spread quickly.",
    warning: entry.summary,
    treatmentSteps,
  };
}

function buildRgbInputBuffer(rgbaPixels: Uint8Array, dataType: TensorDataType) {
  if (dataType !== "float32") {
    throw new Error(`Disease model input dtype must be float32, but received ${dataType}.`);
  }

  return rgbaToFloat32RgbTensor(rgbaPixels);
}

export async function predictPlantDisease(imageUri: string): Promise<PredictionResult> {
  if (!imageUri) {
    throw new Error("An image URI is required for prediction.");
  }

  const model = await getModel();
  const input = model.inputs[0];
  const output = model.outputs[0];

  const rgbaPixels = await prepareImageAsRgba(imageUri, 224, 224);
  const inputBuffer = buildRgbInputBuffer(rgbaPixels, input.dataType);
  const outputs = model.runSync([inputBuffer]);
  const rawOutput = outputs[0];

  if (!rawOutput) {
    throw new Error("The cocoa disease model did not return any output.");
  }

  const decoded = decodeTensorBuffer(rawOutput, output.dataType);
  const probabilities = decodeProbabilityScores(decoded, 3);
  const { classIndex, confidence } = getTopClass(probabilities);
  const label = getDiseaseLabel(classIndex);

  return {
    classIndex,
    label,
    confidence,
    probabilities,
  };
}

export function buildPlantScanRecord(
  prediction: PredictionResult,
  imageUri: string,
  source: DetectionSource,
  subject: DetectionSubject,
): PlantScanRecord {
  const metadata = buildDiseaseMetadata(prediction.label);

  return {
    diseaseId: metadata.diseaseId,
    diseaseName: prediction.label,
    scientificName: metadata.scientificName,
    summary: metadata.summary,
    description: metadata.description,
    confidence: prediction.confidence,
    confidenceLevel: getConfidenceLevel(prediction.confidence),
    imageUri,
    subject,
    source,
    treatmentSteps: metadata.treatmentSteps,
    recommendation: metadata.recommendation,
    warning: metadata.warning,
    isCocoaLeaf: true,
    modelLabel: prediction.label,
    classIndex: prediction.classIndex,
    probabilities: prediction.probabilities,
  };
}
