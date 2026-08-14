import { Asset } from "expo-asset";
import { Directory, File, Paths } from "expo-file-system";
import {
  loadTensorflowModel,
  type TensorflowModelDelegate,
  type TfliteModel,
} from "react-native-fast-tflite";

type BundledModelSource = number;

const resolvedModelUris = new Map<string, string>();

function assertFileUri(uri: string | null | undefined, modelName: string) {
  if (!uri) {
    throw new Error(`${modelName} did not resolve to a local file URI.`);
  }

  if (uri.startsWith("file://")) {
    return uri;
  }

  throw new Error(
    `${modelName} did not resolve to a local file URI. Received: ${uri}`,
  );
}

function getCopySourceUri(asset: Asset, modelName: string) {
  if (asset.localUri?.startsWith("file://")) {
    return asset.localUri;
  }

  if (asset.uri.startsWith("file://")) {
    return asset.uri;
  }

  throw new Error(
    `${modelName} did not resolve to a copyable file URI. localUri=${asset.localUri ?? "null"}, uri=${asset.uri}`,
  );
}

function getCacheDirectory() {
  const directory = new Directory(Paths.cache, "cocoa-tflite-models");
  directory.create({ intermediates: true, idempotent: true });
  return directory;
}

export async function resolveBundledTfliteAssetUri(
  moduleId: BundledModelSource,
  modelName: string,
) {
  const cacheKey = `${moduleId}:${modelName}`;
  const cachedUri = resolvedModelUris.get(cacheKey);

  if (cachedUri) {
    return cachedUri;
  }

  const asset = Asset.fromModule(moduleId);
  await asset.downloadAsync();

  const downloadedUri = getCopySourceUri(asset, modelName);
  const cacheDirectory = getCacheDirectory();
  const cachedModelFile = new File(cacheDirectory, modelName);

  if (cachedModelFile.exists) {
    const existingUri = assertFileUri(cachedModelFile.uri, modelName);
    resolvedModelUris.set(cacheKey, existingUri);
    return existingUri;
  }

  const sourceFile = new File(downloadedUri);
  sourceFile.copy(cachedModelFile);

  const finalUri = assertFileUri(cachedModelFile.uri, modelName);
  resolvedModelUris.set(cacheKey, finalUri);

  return finalUri;
}

export async function loadBundledTfliteModel(
  moduleId: BundledModelSource,
  delegates: TensorflowModelDelegate[],
  modelName: string,
): Promise<TfliteModel> {
  const modelUri = await resolveBundledTfliteAssetUri(moduleId, modelName);

  console.log("TFLite final URI:", modelUri);

  return loadTensorflowModel({ url: modelUri }, delegates);
}
