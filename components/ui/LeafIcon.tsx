import Svg, { Circle, Path } from "react-native-svg";

export default function LeafIcon({
  size = 200,
  color = "#E8A33D",
  bgColor = "#0B3D2E",
}: {
  size?: number;
  color?: string;
  bgColor?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      {/* full circle at 50% opacity */}
      <Circle cx="100" cy="100" r="90" fill={color} opacity="0.3" />
      {/* leaf shape */}
      <Path
        d="M100 40 C140 50 160 80 155 115 C150 145 130 165 100 170 C70 165 50 145 45 115 C40 80 60 50 100 40 Z"
        fill={color}
      />
      {/* center vein */}
      <Path
        d="M100 45 C100 80 100 130 100 165"
        stroke={bgColor}
        strokeWidth="2.5"
        fill="none"
        opacity="0.5"
        strokeLinecap="round"
      />
      {/* left veins */}
      <Path
        d="M100 75 C85 82 72 88 62 95"
        stroke={bgColor}
        strokeWidth="1.8"
        fill="none"
        opacity="0.4"
        strokeLinecap="round"
      />
      <Path
        d="M100 95 C83 103 70 110 58 118"
        stroke={bgColor}
        strokeWidth="1.8"
        fill="none"
        opacity="0.4"
        strokeLinecap="round"
      />
      <Path
        d="M100 115 C85 122 74 128 65 135"
        stroke={bgColor}
        strokeWidth="1.8"
        fill="none"
        opacity="0.4"
        strokeLinecap="round"
      />
      {/* right veins */}
      <Path
        d="M100 75 C115 82 128 88 138 95"
        stroke={bgColor}
        strokeWidth="1.8"
        fill="none"
        opacity="0.4"
        strokeLinecap="round"
      />
      <Path
        d="M100 95 C117 103 130 110 142 118"
        stroke={bgColor}
        strokeWidth="1.8"
        fill="none"
        opacity="0.4"
        strokeLinecap="round"
      />
      <Path
        d="M100 115 C115 122 126 128 135 135"
        stroke={bgColor}
        strokeWidth="1.8"
        fill="none"
        opacity="0.4"
        strokeLinecap="round"
      />
      {/* stem */}
      <Path
        d="M100 170 C100 175 100 180 100 185"
        stroke={bgColor}
        strokeWidth="3"
        fill="none"
        opacity="0.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}
