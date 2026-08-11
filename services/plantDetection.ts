import { Image } from "react-native";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { toByteArray } from "base64-js";
import * as jpeg from "jpeg-js";
import {
  loadTensorflowModel,
  type TfliteModel,
} from "react-native-fast-tflite";

import { getLibraryEntry } from "@/constants/libraryData";

export type CocoaLabel = "Healthy" | "Black Pod" | "CSSVD";
export type DetectionSource = "camera" | "gallery";
export type DetectionSubject = "leaf" | "pod";

export type TreatmentStep = {
  title: string;
  detail: string;
};

export type DetectionScanStage = "Early" | "Moderate" | "Advanced" | "Healthy";
export type DetectionSeverity = "needs attention" | "monitor" | "healthy";

export type PredictionResult = {
  classIndex: number;
  label: CocoaLabel;
  confidence: number;
  probabilities: number[];
};

type TensorDataType = TfliteModel["inputs"][number]["dataType"];

export type PlantScanRecord = {
  diseaseId: string;
  diseaseName: CocoaLabel;
  scientificName: string;
  summary: string;
  description: string;
  severity: DetectionSeverity;
  stageLabel: DetectionScanStage;
  confidence: number;
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

type ModelTensorInfo = {
  shape: number[];
  dataType: TensorDataType;
};

const MODEL_LABELS: readonly CocoaLabel[] = [
  "Healthy",
  "Black Pod",
  "CSSVD",
] as const;

const TARGET_CHANNELS = 3;
const MODEL_REQUIREMENT_MESSAGE =
  "The cocoa model must expose a 3-channel image tensor.";

let modelPromise: Promise<TfliteModel> | null = null;
let cachedModel: TfliteModel | null = null;

function getModel() {
  if (cachedModel) {
    return Promise.resolve(cachedModel);
  }

  if (!modelPromise) {
    modelPromise = loadTensorflowModel(
      require("../assets/models/cocoa_model.tflite"),
      [],
    ).then((model) => {
      cachedModel = model;

      if (__DEV__) {
        const details = {
          inputs: model.inputs.map((tensor) => ({
            name: tensor.name,
            shape: tensor.shape,
            dataType: tensor.dataType,
          })),
          outputs: model.outputs.map((tensor) => ({
            name: tensor.name,
            shape: tensor.shape,
            dataType: tensor.dataType,
          })),
        };

        console.log("Loaded cocoa_model.tflite", details);
      }

      return model;
    });
  }

  return modelPromise;
}

function getTensorInfo(tensor: { shape: number[]; dataType: TensorDataType }) {
  return {
    shape: tensor.shape,
    dataType: tensor.dataType,
  } satisfies ModelTensorInfo;
}

function getSpatialDimensions(shape: number[]) {
  if (shape.length < 3) {
    throw new Error(
      `Unexpected tensor shape ${JSON.stringify(shape)}. ${MODEL_REQUIREMENT_MESSAGE}`,
    );
  }

  const [height, width, channels] = shape.slice(-3);

  if (channels !== TARGET_CHANNELS) {
    throw new Error(
      `Expected a 3-channel RGB input tensor, received shape ${JSON.stringify(shape)}.`,
    );
  }

  return { height, width, channels };
}

function softmax(values: number[]) {
  const max = Math.max(...values);

  if (!Number.isFinite(max)) {
    throw new Error("Model output contained invalid scores.");
  }

  const expValues = values.map((value) => Math.exp(value - max));
  const sum = expValues.reduce((accumulator, value) => accumulator + value, 0);

  if (sum <= 0) {
    throw new Error("Model output normalization failed.");
  }

  return expValues.map((value) => value / sum);
}

function convertHalfToFloat(value: number) {
  const sign = (value & 0x8000) >> 15;
  const exponent = (value & 0x7c00) >> 10;
  const fraction = value & 0x03ff;

  if (exponent === 0) {
    if (fraction === 0) {
      return sign ? -0 : 0;
    }

    return (
      (sign ? -1 : 1) *
      Math.pow(2, -14) *
      (fraction / Math.pow(2, 10))
    );
  }

  if (exponent === 0x1f) {
    return fraction === 0 ? (sign ? -Infinity : Infinity) : NaN;
  }

  return (
    (sign ? -1 : 1) *
    Math.pow(2, exponent - 15) *
    (1 + fraction / Math.pow(2, 10))
  );
}

function normalizeScores(values: number[]) {
  if (values.length !== MODEL_LABELS.length) {
    throw new Error(
      `Expected ${MODEL_LABELS.length} output scores, received ${values.length}.`,
    );
  }

  if (values.every((value) => Number.isFinite(value) && value >= 0 && value <= 1)) {
    const sum = values.reduce((accumulator, value) => accumulator + value, 0);

    if (Math.abs(sum - 1) < 0.02) {
      return values;
    }
  }

  return softmax(values);
}

function decodeTensorBuffer(buffer: ArrayBuffer, dataType: TensorDataType) {
  switch (dataType) {
    case "float32":
      return Array.from(new Float32Array(buffer));
    case "float16": {
      const source = new Uint16Array(buffer);
      return Array.from(source, convertHalfToFloat);
    }
    case "uint8":
      return Array.from(new Uint8Array(buffer));
    case "int8":
      return Array.from(new Int8Array(buffer));
    default:
      throw new Error(`Unsupported output tensor data type: ${dataType}`);
  }
}

function buildInputTensor(
  rgbaPixels: Uint8Array,
  dataType: TensorDataType,
) {
  if (dataType === "float32") {
    const input = new Float32Array(rgbaPixels.length / 4 * 3);
    for (let rgbaIndex = 0, rgbIndex = 0; rgbaIndex < rgbaPixels.length; rgbaIndex += 4) {
      input[rgbIndex++] = rgbaPixels[rgbaIndex];
      input[rgbIndex++] = rgbaPixels[rgbaIndex + 1];
      input[rgbIndex++] = rgbaPixels[rgbaIndex + 2];
    }
    return input.buffer;
  }

  if (dataType === "uint8") {
    const input = new Uint8Array((rgbaPixels.length / 4) * 3);
    for (let rgbaIndex = 0, rgbIndex = 0; rgbaIndex < rgbaPixels.length; rgbaIndex += 4) {
      input[rgbIndex++] = rgbaPixels[rgbaIndex];
      input[rgbIndex++] = rgbaPixels[rgbaIndex + 1];
      input[rgbIndex++] = rgbaPixels[rgbaIndex + 2];
    }
    return input.buffer;
  }

  throw new Error(
    `Unsupported input tensor data type: ${dataType}. ${MODEL_REQUIREMENT_MESSAGE}`,
  );
}

async function getImageSize(uri: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => {
        resolve({ width, height });
      },
      (error) => {
        reject(error);
      },
    );
  });
}

async function preprocessImageToRgb(imageUri: string, targetWidth: number, targetHeight: number) {
  const { width, height } = await getImageSize(imageUri).catch(() => ({
    width: targetWidth,
    height: targetHeight,
  }));

  const cropSize = Math.min(width, height);
  const cropX = Math.max(0, Math.round((width - cropSize) / 2));
  const cropY = Math.max(0, Math.round((height - cropSize) / 2));

  const actions =
    width === height
      ? [{ resize: { width: targetWidth, height: targetHeight } }]
      : [
          {
            crop: {
              originX: cropX,
              originY: cropY,
              width: cropSize,
              height: cropSize,
            },
          },
          { resize: { width: targetWidth, height: targetHeight } },
        ];

  const manipulated = await manipulateAsync(imageUri, actions, {
    format: SaveFormat.JPEG,
    base64: true,
    compress: 1,
  });

  if (!manipulated.base64) {
    throw new Error("Failed to prepare image for the model.");
  }

  const jpegBytes = toByteArray(manipulated.base64);
  const decoded = jpeg.decode(jpegBytes, { useTArray: true });

  if (decoded.width !== targetWidth || decoded.height !== targetHeight) {
    throw new Error("Image preprocessing produced an unexpected tensor size.");
  }

  return decoded.data;
}

function pickLabelFromProbabilities(probabilities: number[]) {
  let classIndex = 0;
  let confidence = probabilities[0] ?? 0;

  probabilities.forEach((value, index) => {
    if (value > confidence) {
      confidence = value;
      classIndex = index;
    }
  });

  const label = MODEL_LABELS[classIndex];

  if (!label) {
    throw new Error(`Unsupported class index ${classIndex}.`);
  }

  return {
    classIndex,
    label,
    confidence,
  };
}

function getStageLabel(label: CocoaLabel, confidence: number): DetectionScanStage {
  if (label === "Healthy") {
    return "Healthy";
  }

  if (confidence >= 0.86) {
    return "Advanced";
  }

  if (confidence >= 0.72) {
    return "Moderate";
  }

  return "Early";
}

function buildDiseaseMetadata(label: CocoaLabel) {
  if (label === "Healthy") {
    return {
      diseaseId: "healthy",
      scientificName: "Healthy cocoa leaf",
      summary: "No disease signs were detected in this image.",
      description: "The classifier marked this leaf as healthy.",
      recommendation: "No treatment is needed. Keep monitoring the tree.",
      warning: "Healthy cocoa leaf detected.",
      treatmentSteps: [] as TreatmentStep[],
      severity: "healthy" as DetectionSeverity,
    };
  }

  const entry =
    label === "Black Pod"
      ? getLibraryEntry("black-pod")
      : getLibraryEntry("cssvd");

  if (!entry) {
    throw new Error(`No metadata found for class label ${label}.`);
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
    severity: "needs attention" as DetectionSeverity,
  };
}

export async function predictPlantDisease(imageUri: string): Promise<PredictionResult> {
  if (!imageUri) {
    throw new Error("An image URI is required for prediction.");
  }

  const model = await getModel();
  const input = model.inputs[0];
  const output = model.outputs[0];

  if (!input || !output) {
    throw new Error("The cocoa model does not expose the expected input/output tensors.");
  }

  const { height, width } = getSpatialDimensions(getTensorInfo(input).shape);
  const rgbPixels = await preprocessImageToRgb(imageUri, width, height);
  const inputBuffer = buildInputTensor(rgbPixels, input.dataType);
  const outputs = model.runSync([inputBuffer]);

  if (!outputs[0]) {
    throw new Error("The model did not return any output tensors.");
  }

  const rawScores = decodeTensorBuffer(outputs[0], output.dataType);
  const probabilities = normalizeScores(rawScores);
  const selected = pickLabelFromProbabilities(probabilities);

  return {
    classIndex: selected.classIndex,
    label: selected.label,
    confidence: selected.confidence,
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
  const stageLabel = getStageLabel(prediction.label, prediction.confidence);

  return {
    diseaseId: metadata.diseaseId,
    diseaseName: prediction.label,
    scientificName: metadata.scientificName,
    summary: metadata.summary,
    description: metadata.description,
    severity: metadata.severity,
    stageLabel,
    confidence: prediction.confidence,
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
