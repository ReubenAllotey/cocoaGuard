export type LibraryCategory = "disease" | "pest";

export type LibraryEntry = {
  id: string;
  name: string;
  scientificName: string;
  type: string; // e.g. "Fungal", "Viral", "Insect pest"
  category: LibraryCategory;
  summary: string; // short line used in the list screen
  symptoms: string[];
  prevention: string[];
  treatment: string[];
};

export const LIBRARY_ENTRIES: LibraryEntry[] = [
  {
    id: "black-pod",
    name: "Black Pod Disease",
    scientificName: "Phytophthora species",
    type: "Fungal",
    category: "disease",
    summary:
      "A fungal infection that causes dark, sunken lesions on pods, especially common during and after heavy rainfall.",
    symptoms: [
      "Brown or black patches on pods",
      "White fungal growth in wet conditions",
      "Pods rot from the inside, ruining the beans",
    ],
    prevention: [
      "Remove infected pods immediately",
      "Clear fallen leaves and debris around trees",
      "Improve airflow by pruning overcrowded branches",
    ],
    treatment: [
      "Cut and remove all visibly infected pods",
      "Apply a copper-based fungicide as recommended locally",
    ],
  },
  {
    id: "frosty-pod-rot",
    name: "Frosty Pod Rot",
    scientificName: "Moniliophthora roreri",
    type: "Fungal",
    category: "disease",
    summary:
      "Covers infected pods with a powdery white fungal growth, usually starting near the pod's stem end.",
    symptoms: [
      "White, frost-like fungal coating on the pod surface",
      "Premature yellowing or discoloration of pods",
      "Beans inside become hard and unusable",
    ],
    prevention: [
      "Harvest ripe pods promptly, don't let them linger on the tree",
      "Remove and destroy infected pods weekly during peak season",
    ],
    treatment: [
      "Bury or burn infected pods away from the plantation",
      "Increase harvest frequency to catch infections early",
    ],
  },
  {
    id: "witches-broom",
    name: "Witches' Broom",
    scientificName: "Moniliophthora perniciosa",
    type: "Fungal",
    category: "disease",
    summary:
      "Causes abnormal, broom-like clusters of shoots to form, stunting growth and reducing pod yield.",
    symptoms: [
      "Dense, broom-like clusters of small shoots",
      "Swollen stems near infected growth points",
      "Distorted, undersized pods",
    ],
    prevention: [
      "Prune and destroy broom growths as soon as spotted",
      "Avoid excessive nitrogen fertilizer, which encourages soft new growth",
    ],
    treatment: [
      "Remove infected branches well below the visible broom growth",
      "Dispose of pruned material away from healthy trees",
    ],
  },
  {
    id: "cssvd",
    name: "Cocoa Swollen Shoot Virus",
    scientificName: "Cacao swollen shoot virus (CSSV)",
    type: "Viral",
    category: "disease",
    summary:
      "A viral disease spread by mealybugs that causes swelling of shoots and roots and gradual tree decline.",
    symptoms: [
      "Swelling of shoots, stems, or roots",
      "Red vein banding on young leaves",
      "Gradual dieback and reduced pod production",
    ],
    prevention: [
      "Control mealybug populations, since they spread the virus",
      "Avoid planting near known infected trees",
    ],
    treatment: [
      "Remove and destroy infected trees to stop further spread",
      "Replant with virus-resistant cocoa varieties where available",
    ],
  },
  {
    id: "vsd",
    name: "Vascular-Streak Dieback",
    scientificName: "Ceratobasidium theobromae",
    type: "Fungal",
    category: "disease",
    summary:
      "Affects young leaves and branches, causing them to yellow and die back from the tips inward.",
    symptoms: [
      "Yellowing of young leaves with green spots remaining",
      "Dark streaks visible inside affected branches",
      "Dieback starting from branch tips",
    ],
    prevention: [
      "Prune affected branches well below the visible streaking",
      "Avoid excessive shade, which favors fungal spread",
    ],
    treatment: [
      "Cut affected branches at least 30cm below symptoms",
      "Destroy pruned material rather than leaving it on the ground",
    ],
  },
  {
    id: "mirids",
    name: "Mirids (Capsids)",
    scientificName: "Sahlbergella / Distantiella species",
    type: "Insect pest",
    category: "pest",
    summary:
      "Sap-sucking insects that leave dark sunken lesions on pods and stems, creating entry points for fungal infection.",
    symptoms: [
      "Dark, sunken lesions on pods and young stems",
      "Wilting or dieback of affected shoots",
      "Sticky residue where insects have fed",
    ],
    prevention: [
      "Monitor trees regularly during high-risk seasons",
      "Maintain shade levels recommended for your region",
    ],
    treatment: [
      "Apply an approved insecticide following local guidance",
      "Remove severely damaged branches to limit spread",
    ],
  },
  {
    id: "pod-borer",
    name: "Cocoa Pod Borer",
    scientificName: "Conopomorpha cramerella",
    type: "Insect pest",
    category: "pest",
    summary:
      "Moth larvae that tunnel into pods, disrupting bean development and often reducing pod quality.",
    symptoms: [
      "Premature yellowing patches on the pod surface",
      "Beans inside stick together and fail to develop properly",
      "Small entry holes visible on the pod husk",
    ],
    prevention: [
      "Harvest pods frequently so fewer are exposed to egg-laying moths",
      "Bag young pods where practical to block access",
    ],
    treatment: [
      "Remove and destroy infested pods immediately",
      "Bury pod husks after harvest rather than leaving them nearby",
    ],
  },
];

export function getLibraryEntry(id: string) {
  return LIBRARY_ENTRIES.find((entry) => entry.id === id);
}
