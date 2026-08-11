import Svg, { Ellipse, Path } from "react-native-svg";

export default function CocoaLogo({ size = 120 }: { size?: number }) {
  const scale = size / 120;
  return (
    <Svg width={size} height={size * 1.33} viewBox="0 0 120 160">
      {/* pod body */}
      <Path
        d="M60 8 C80 20 92 45 90 80 C88 112 76 138 60 152 C44 138 32 112 30 80 C28 45 40 20 60 8 Z"
        fill="#E8A33D"
      />
      {/* center ridge */}
      <Path
        d="M60 12 C60 40 59 90 60 148"
        stroke="#C4781F"
        strokeWidth="1.8"
        fill="none"
        opacity="0.6"
        strokeLinecap="round"
      />
      {/* inner ridges */}
      <Path
        d="M47 20 C44 48 44 90 48 136"
        stroke="#C4781F"
        strokeWidth="1.4"
        fill="none"
        opacity="0.5"
        strokeLinecap="round"
      />
      <Path
        d="M73 20 C76 48 76 90 72 136"
        stroke="#C4781F"
        strokeWidth="1.4"
        fill="none"
        opacity="0.5"
        strokeLinecap="round"
      />
      {/* outer ridges */}
      <Path
        d="M38 38 C36 62 36 98 40 122"
        stroke="#C4781F"
        strokeWidth="1"
        fill="none"
        opacity="0.35"
        strokeLinecap="round"
      />
      <Path
        d="M82 38 C84 62 84 98 80 122"
        stroke="#C4781F"
        strokeWidth="1"
        fill="none"
        opacity="0.35"
        strokeLinecap="round"
      />
      {/* stem */}
      <Ellipse cx="60" cy="6" rx="4" ry="3" fill="#8B5E1A" opacity="0.7" />
    </Svg>
  );
}
