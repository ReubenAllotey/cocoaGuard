import { Image } from "react-native";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { toByteArray } from "base64-js";
import * as jpeg from "jpeg-js";
import type { TfliteModel } from "react-native-fast-tflite";

export type TensorDataType = TfliteModel["inputs"][number]["dataType"];

export type TensorMetadata = {
  shape: number[];
  dataType: TensorDataType;
  name?: string;
};

export type ExpectedTensorMetadata = {
  inputShape: number[];
  inputDataType: TensorDataType;
  outputShape: number[];
  outputDataType: TensorDataType;
};

const DEFAULT_CROP_WARNING =
  "The image could not be prepared for model input.";

function getImageSize(uri: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error),
    );
  });
}

function centerCropToSquare(
  width: number,
  height: number,
  targetWidth: number,
  targetHeight: number,
) {
  const cropSize = Math.min(width, height);
  const cropX = Math.max(0, Math.round((width - cropSize) / 2));
  const cropY = Math.max(0, Math.round((height - cropSize) / 2));

  if (width === height) {
    return [{ resize: { width: targetWidth, height: targetHeight } }];
  }

  return [
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
}

export async function prepareImageAsRgba(
  imageUri: string,
  targetWidth: number,
  targetHeight: number,
) {
  if (!imageUri) {
    throw new Error("An image URI is required for preprocessing.");
  }

  const size = await getImageSize(imageUri).catch(() => ({
    width: targetWidth,
    height: targetHeight,
  }));

  const manipulated = await manipulateAsync(
    imageUri,
    centerCropToSquare(size.width, size.height, targetWidth, targetHeight),
    {
      format: SaveFormat.JPEG,
      base64: true,
      compress: 1,
    },
  );

  if (!manipulated.base64) {
    throw new Error(DEFAULT_CROP_WARNING);
  }

  const jpegBytes = toByteArray(manipulated.base64);
  const decoded = jpeg.decode(jpegBytes, {
    useTArray: true,
    formatAsRGBA: true,
  });

  if (decoded.width !== targetWidth || decoded.height !== targetHeight) {
    throw new Error(
      `Expected a ${targetWidth}x${targetHeight} image tensor, but received ${decoded.width}x${decoded.height}.`,
    );
  }

  return decoded.data;
}

export function rgbaToFloat32RgbTensor(rgbaPixels: Uint8Array) {
  const rgbPixelCount = (rgbaPixels.length / 4) * 3;
  const tensor = new Float32Array(rgbPixelCount);

  for (let rgbaIndex = 0, rgbIndex = 0; rgbaIndex < rgbaPixels.length; rgbaIndex += 4) {
    tensor[rgbIndex++] = rgbaPixels[rgbaIndex];
    tensor[rgbIndex++] = rgbaPixels[rgbaIndex + 1];
    tensor[rgbIndex++] = rgbaPixels[rgbaIndex + 2];
  }

  return tensor.buffer;
}

export function rgbaToUint8RgbTensor(rgbaPixels: Uint8Array) {
  const rgbPixelCount = (rgbaPixels.length / 4) * 3;
  const tensor = new Uint8Array(rgbPixelCount);

  for (let rgbaIndex = 0, rgbIndex = 0; rgbaIndex < rgbaPixels.length; rgbaIndex += 4) {
    tensor[rgbIndex++] = rgbaPixels[rgbaIndex];
    tensor[rgbIndex++] = rgbaPixels[rgbaIndex + 1];
    tensor[rgbIndex++] = rgbaPixels[rgbaIndex + 2];
  }

  return tensor.buffer;
}

export function decodeTensorBuffer(buffer: ArrayBuffer, dataType: TensorDataType) {
  switch (dataType) {
    case "float32":
      return Array.from(new Float32Array(buffer));
    case "float16":
      return Array.from(new Uint16Array(buffer), decodeFloat16);
    case "uint8":
      return Array.from(new Uint8Array(buffer));
    case "int8":
      return Array.from(new Int8Array(buffer));
    default:
      throw new Error(`Unsupported tensor data type: ${dataType}`);
  }
}

export function decodeProbabilityScores(values: number[], expectedLength: number) {
  if (values.length !== expectedLength) {
    throw new Error(
      `Expected ${expectedLength} output values, but received ${values.length}.`,
    );
  }

  if (values.some((value) => !Number.isFinite(value))) {
    throw new Error("Model output contained NaN or Infinity.");
  }

  if (
    values.every((value) => value >= 0 && value <= 1) &&
    Math.abs(values.reduce((sum, value) => sum + value, 0) - 1) < 0.02
  ) {
    return values;
  }

  return softmax(values);
}

export function getTopClass(probabilities: number[]) {
  if (probabilities.length === 0) {
    throw new Error("The model returned no probability values.");
  }

  let classIndex = 0;
  let confidence = probabilities[0];

  probabilities.forEach((value, index) => {
    if (value > confidence) {
      confidence = value;
      classIndex = index;
    }
  });

  return { classIndex, confidence };
}

export function assertExactTensorMetadata(
  modelName: string,
  input: TensorMetadata | undefined,
  output: TensorMetadata | undefined,
  expected: ExpectedTensorMetadata,
) {
  if (!input || !output) {
    throw new Error(`${modelName} did not expose the expected input and output tensors.`);
  }

  const inputShape = JSON.stringify(input.shape);
  const outputShape = JSON.stringify(output.shape);
  const expectedInputShape = JSON.stringify(expected.inputShape);
  const expectedOutputShape = JSON.stringify(expected.outputShape);

  if (inputShape !== expectedInputShape) {
    throw new Error(
      `${modelName} input shape must be ${expectedInputShape}, but received ${inputShape}.`,
    );
  }

  if (outputShape !== expectedOutputShape) {
    throw new Error(
      `${modelName} output shape must be ${expectedOutputShape}, but received ${outputShape}.`,
    );
  }

  if (input.dataType !== expected.inputDataType) {
    throw new Error(
      `${modelName} input dtype must be ${expected.inputDataType}, but received ${input.dataType}.`,
    );
  }

  if (output.dataType !== expected.outputDataType) {
    throw new Error(
      `${modelName} output dtype must be ${expected.outputDataType}, but received ${output.dataType}.`,
    );
  }
}

function softmax(values: number[]) {
  const max = Math.max(...values);

  if (!Number.isFinite(max)) {
    throw new Error("Unable to normalize invalid model outputs.");
  }

  const exps = values.map((value) => Math.exp(value - max));
  const sum = exps.reduce((accumulator, value) => accumulator + value, 0);

  if (sum <= 0) {
    throw new Error("Unable to normalize model outputs.");
  }

  return exps.map((value) => value / sum);
}

function decodeFloat16(bits: number) {
  const sign = (bits & 0x8000) >> 15;
  const exponent = (bits & 0x7c00) >> 10;
  const fraction = bits & 0x03ff;

  if (exponent === 0) {
    if (fraction === 0) {
      return sign ? -0 : 0;
    }

    return (sign ? -1 : 1) * Math.pow(2, -14) * (fraction / Math.pow(2, 10));
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
