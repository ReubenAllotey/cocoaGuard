import Svg, { Circle, Rect } from "react-native-svg";

export default function CameraIcon({
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
      {/* camera body */}
      <Rect x="46" y="78" width="108" height="72" rx="12" fill={color} />
      {/* viewfinder bump */}
      <Rect x="72" y="60" width="40" height="22" rx="6" fill={color} />
      {/* lens outer */}
      <Circle cx="100" cy="114" r="24" fill={bgColor} />
      {/* lens mid */}
      <Circle cx="100" cy="114" r="16" fill={color} opacity="0.3" />
      {/* lens inner */}
      <Circle cx="100" cy="114" r="9" fill={color} opacity="0.6" />
      {/* flash dot */}
      <Circle cx="130" cy="88" r="5" fill={bgColor} />
    </Svg>
  );
}
