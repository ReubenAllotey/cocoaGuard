import { Feather } from "@expo/vector-icons";

export type Tip = {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  body: string;
};

export type TipCategory = {
  title: string;
  tips: Tip[];
};

export const TIP_CATEGORIES: TipCategory[] = [
  {
    title: "Getting a good scan",
    tips: [
      {
        icon: "sun",
        title: "Use natural daylight",
        body: "Scan in bright, even daylight rather than direct harsh sun or dim indoor light — this helps the model read surface detail clearly.",
      },
      {
        icon: "crop",
        title: "Fill the frame",
        body: "Get close enough that the leaf or pod fills most of the guide frame, with the affected area clearly visible.",
      },
      {
        icon: "camera",
        title: "Hold steady",
        body: "Keep the camera still for a moment before capturing — a blurry photo is harder to analyze accurately.",
      },
    ],
  },
  {
    title: "Preventing disease spread",
    tips: [
      {
        icon: "trash-2",
        title: "Remove infected material promptly",
        body: "Cut away and dispose of infected pods, leaves, or branches as soon as you spot them, rather than leaving them on the ground.",
      },
      {
        icon: "wind",
        title: "Improve airflow",
        body: "Prune overcrowded branches so air can move through the canopy — many fungal diseases thrive in still, humid conditions.",
      },
      {
        icon: "droplet",
        title: "Watch for rainfall risk",
        body: "Disease pressure rises sharply after heavy rain — scanning more frequently during wet periods can catch problems earlier.",
      },
    ],
  },
  {
    title: "Seasonal care",
    tips: [
      {
        icon: "calendar",
        title: "Harvest ripe pods promptly",
        body: "Pods left too long on the tree are more exposed to pests and fungal infection — harvest as soon as they're ready.",
      },
      {
        icon: "layers",
        title: "Rotate scanning across your plot",
        body: "Try to scan different sections of your farm regularly rather than always checking the same few trees.",
      },
    ],
  },
];

// Flattened list — handy for anything that just wants to pick a random tip
// without caring which category it came from.
export const ALL_TIPS: Tip[] = TIP_CATEGORIES.flatMap(
  (category) => category.tips,
);
