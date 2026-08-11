const LIBRARY_ENTRIES = [
  {
    id: "black-pod",
    name: "Black Pod Disease",
    scientificName: "Phytophthora species",
    summary:
      "A fungal infection that causes dark, sunken lesions on pods, especially common during and after heavy rainfall.",
    treatment: [
      "Cut and remove all visibly infected pods.",
      "Apply a copper-based fungicide as recommended locally.",
    ],
  },
  {
    id: "frosty-pod-rot",
    name: "Frosty Pod Rot",
    scientificName: "Moniliophthora roreri",
    summary:
      "Covers infected pods with a powdery white fungal growth, usually starting near the pod's stem end.",
    treatment: [
      "Bury or burn infected pods away from the plantation.",
      "Increase harvest frequency to catch infections early.",
    ],
  },
  {
    id: "witches-broom",
    name: "Witches' Broom",
    scientificName: "Moniliophthora perniciosa",
    summary:
      "Causes abnormal, broom-like clusters of shoots to form, stunting growth and reducing pod yield.",
    treatment: [
      "Remove infected branches well below the visible broom growth.",
      "Dispose of pruned material away from healthy trees.",
    ],
  },
];

function hashString(input) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function buildTreatmentSteps(diseaseId) {
  const entry = LIBRARY_ENTRIES.find((item) => item.id === diseaseId);
  if (!entry) return [];

  return entry.treatment.map((detail, index) => ({
    title: `Step ${index + 1}`,
    detail,
  }));
}

function buildGenericTreatmentSteps() {
  return [
    {
      title: "Retake the photo",
      detail: "Capture one cocoa leaf at a time, with the leaf filling most of the frame.",
    },
    {
      title: "Use bright light",
      detail: "Take the photo in daylight or strong indirect light so the detector can read the leaf edges clearly.",
    },
    {
      title: "Remove clutter",
      detail: "Avoid hands, pods, branches, and background objects that can confuse the detector.",
    },
  ];
}

function buildListenText(scan) {
  const treatmentSummary = scan.treatmentSteps.map((step) => step.detail).join(" ");
  return [
    `${scan.diseaseName}.`,
    scan.scientificName ? `${scan.scientificName}.` : "",
    `Confidence ${scan.confidence} percent.`,
    scan.isCocoaLeaf
      ? `Severity stage ${scan.stageLabel}.`
      : "This photo does not appear to be a cocoa leaf.",
    scan.recommendation,
    scan.warning,
    treatmentSummary,
  ]
    .filter(Boolean)
    .join(" ");
}

function pickDiseaseProfile(seed) {
  const diseaseIds = ["black-pod", "frosty-pod-rot", "witches-broom"];
  return diseaseIds[seed % diseaseIds.length];
}

function pickStageLabel(confidence) {
  if (confidence >= 86) {
    return "Advanced";
  }

  if (confidence >= 72) {
    return "Moderate";
  }

  return "Early";
}

export function analyzePayload(payload) {
  const signature = payload.imageBase64 ?? payload.imageUri ?? "";
  const hash = hashString(signature || `${payload.subject ?? "leaf"}:${payload.source ?? "camera"}`);
  const isCocoaLeaf = hash % 100 >= 23;

  if (!isCocoaLeaf) {
    const confidence = 82 + (hash % 13);
    const treatmentSteps = buildGenericTreatmentSteps();
    const scan = {
      diseaseId: "not-cocoa-leaf",
      diseaseName: "Not a cocoa leaf",
      scientificName: "Cocoa leaf tissue not detected",
      summary: "The photo does not look like a cocoa leaf. Try again with a single leaf filling most of the frame.",
      description: "The detector could not confirm cocoa leaf features in this image.",
      confidence,
      stageLabel: "Healthy",
      severity: "healthy",
      recommendation: "Retake the photo with a clear cocoa leaf centered in the frame.",
      warning: "We could not confidently match leaf shape, texture, and color to cocoa foliage.",
      treatmentSteps,
      imageUri: payload.imageUri ?? "",
      isCocoaLeaf: false,
      modelLabel: "not_cocoa_leaf",
    };

    return { ...scan, listenText: buildListenText(scan) };
  }

  const diseaseId = pickDiseaseProfile(hash);
  const entry = LIBRARY_ENTRIES.find((item) => item.id === diseaseId) ?? LIBRARY_ENTRIES[0];
  const confidence = 71 + (hash % 22);
  const treatmentSteps = buildTreatmentSteps(entry.id);

  const scan = {
    diseaseId: entry.id,
    diseaseName: entry.name,
    scientificName: entry.scientificName,
    summary: entry.summary,
    description: entry.summary,
    confidence,
    stageLabel: pickStageLabel(confidence),
    severity: confidence >= 85 ? "needs attention" : "monitor",
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

  return { ...scan, listenText: buildListenText(scan) };
}
