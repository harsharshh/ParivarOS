import Svg, { Rect, Circle, Path, LinearGradient, Stop, Defs } from 'react-native-svg';

export function FamilyCardIllustration({ width = 220, height = 140 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 220 140" fill="none">
      <Defs>
        <LinearGradient id="bgGradient" x1="0" y1="0" x2="220" y2="140" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F3EFFF" />
          <Stop offset="1" stopColor="#E5DFFF" />
        </LinearGradient>
      </Defs>

      <Rect x="0" y="20" width="220" height="100" rx="24" fill="url(#bgGradient)" />

      <Circle cx="70" cy="86" r="36" fill="#6C5CFE" opacity="0.18" />
      <Circle cx="150" cy="80" r="42" fill="#947CFF" opacity="0.18" />

      <Circle cx="72" cy="70" r="18" fill="#6C5CFE" />
      <Path
        d="M72 92c-11 0-20 9-20 20h40c0-11-9-20-20-20Z"
        fill="#6C5CFE"
      />
      <Circle cx="108" cy="64" r="20" fill="#947CFF" />
      <Path
        d="M108 90c-12 0-22 10-22 22h44c0-12-10-22-22-22Z"
        fill="#947CFF"
      />
      <Circle cx="150" cy="72" r="22" fill="#5E4EE6" />
      <Path
        d="M150 102c-13 0-24 11-24 24h48c0-13-11-24-24-24Z"
        fill="#5E4EE6"
      />
      <Circle cx="138" cy="52" r="10" fill="#F9F5FF" opacity="0.9" />
      <Circle cx="96" cy="50" r="9" fill="#F9F5FF" opacity="0.9" />
      <Circle cx="176" cy="66" r="12" fill="#F9F5FF" opacity="0.9" />
      <Path
        d="M128 38c2-5 7-9 14-9 8 0 14 6 15 14"
        stroke="#5E4EE6"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </Svg>
  );
}
