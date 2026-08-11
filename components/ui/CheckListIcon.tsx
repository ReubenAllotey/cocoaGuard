import Svg, { Circle, Rect, Path } from "react-native-svg";

export default function ChecklistIcon({
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
      <Circle cx="100" cy="100" r="90" fill={color} opacity="0.5" />
      {/* clipboard body */}
      <Rect x="52" y="55" width="96" height="110" rx="10" fill={color} />
      {/* clipboard top clip outer */}
      <Rect x="78" y="45" width="44" height="20" rx="6" fill={color} />
      {/* clipboard top clip inner */}
      <Rect
        x="86"
        y="48"
        width="28"
        height="12"
        rx="4"
        fill={bgColor}
        opacity="0.3"
      />
      {/* row 1 — checked */}
      <Circle cx="74" cy="86" r="8" fill={bgColor} opacity="0.85" />
      <Path
        d="M70 86 L73 89 L78 83"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect
        x="88"
        y="82"
        width="48"
        height="7"
        rx="3.5"
        fill={bgColor}
        opacity="0.25"
      />
      {/* row 2 — checked */}
      <Circle cx="74" cy="110" r="8" fill={bgColor} opacity="0.85" />
      <Path
        d="M70 110 L73 113 L78 107"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect
        x="88"
        y="106"
        width="40"
        height="7"
        rx="3.5"
        fill={bgColor}
        opacity="0.25"
      />
      {/* row 3 — unchecked */}
      <Circle cx="74" cy="134" r="8" fill={bgColor} opacity="0.2" />
      <Rect
        x="88"
        y="130"
        width="44"
        height="7"
        rx="3.5"
        fill={bgColor}
        opacity="0.15"
      />
    </Svg>
  );
}
