import {
  assertExactTensorMetadata,
  decodeProbabilityScores,
  decodeTensorBuffer,
  getTopClass,
  prepareImageAsRgba,
  rgbaToFloat32RgbTensor,
} from "@/utils/modelImagePreprocessing";
import { loadBundledTfliteModel } from "@/services/tfliteAsset";
import type { TfliteModel } from "react-native-fast-tflite";

export type CocoaLeafLabel = "Cocoa Leaf" | "Not Cocoa Leaf";

export interface CocoaLeafValidationResult {
  classIndex: number;
  label: CocoaLeafLabel;
  confidence: number;
  probabilities: number[];
  isCocoaLeaf: boolean;
}

type LeafDetectorModel = TfliteModel & {
  inputs: [TfliteModel["inputs"][number]];
  outputs: [TfliteModel["outputs"][number]];
};

export const COCOA_VALIDATION_THRESHOLD = 0.7;
// Provisional prototype threshold. This is not scientifically calibrated and
// should be adjusted later with a larger validation set.

const MODEL_NAME = "cocoa_leaf_detector.tflite";
const EXPECTED_INPUT_SHAPE = [1, 224, 224, 3];
const EXPECTED_OUTPUT_SHAPE = [1, 2];
const EXPECTED_LABELS: readonly CocoaLeafLabel[] = [
  "Cocoa Leaf",
  "Not Cocoa Leaf",
] as const;

const cocoaLeafLabels = require("../assets/models/cocoa_leaf_labels.json") as string[];

let modelPromise: Promise<LeafDetectorModel> | null = null;
let cachedModel: LeafDetectorModel | null = null;

function assertLabelManifest() {
  const actual = cocoaLeafLabels.join("|");
  const expected = EXPECTED_LABELS.join("|");

  if (actual !== expected) {
    throw new Error(
      `assets/models/cocoa_leaf_labels.json must contain exactly ${expected}, but received ${actual}.`,
    );
  }
}

function logModelMetadataOnce(model: LeafDetectorModel) {
  if (!__DEV__) {
    return;
  }

  console.log(MODEL_NAME, {
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
      require("../assets/models/cocoa_leaf_detector.tflite"),
      [],
      MODEL_NAME,
    )
      .then((model) => {
        assertLabelManifest();
        assertExactTensorMetadata(
          MODEL_NAME,
          model.inputs[0],
          model.outputs[0],
          {
            inputShape: EXPECTED_INPUT_SHAPE,
            inputDataType: "float32",
            outputShape: EXPECTED_OUTPUT_SHAPE,
            outputDataType: "float32",
          },
        );

        cachedModel = model as LeafDetectorModel;
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

function getLeafLabel(index: number): CocoaLeafLabel {
  const label = cocoaLeafLabels[index];

  if (label === "Cocoa Leaf" || label === "Not Cocoa Leaf") {
    return label;
  }

  throw new Error(`Invalid cocoa leaf class index ${index}.`);
}

export async function validateCocoaLeaf(
  imageUri: string,
): Promise<CocoaLeafValidationResult> {
  if (!imageUri) {
    throw new Error("An image URI is required for validation.");
  }

  const model = await getModel();
  const output = model.outputs[0];

  const rgbaPixels = await prepareImageAsRgba(imageUri, 224, 224);
  const inputBuffer = rgbaToFloat32RgbTensor(rgbaPixels);
  const outputs = model.runSync([inputBuffer]);
  const rawOutput = outputs[0];

  if (!rawOutput) {
    throw new Error("The cocoa leaf validator did not return any output.");
  }

  const decoded = decodeTensorBuffer(rawOutput, output.dataType);
  const probabilities = decodeProbabilityScores(decoded, 2);
  const { classIndex, confidence } = getTopClass(probabilities);
  const label = getLeafLabel(classIndex);
  const isCocoaLeaf =
    label === "Cocoa Leaf" && confidence >= COCOA_VALIDATION_THRESHOLD;

  return {
    classIndex,
    label,
    confidence,
    probabilities,
    isCocoaLeaf,
  };
}
