import { memo } from 'react';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { BrandColors } from './tokens';

export type IllustrationProps = {
  width?: number;
  height?: number;
};

const baseWidth = 320;
const baseHeight = 240;

const createDimensions = (width?: number, height?: number) => {
  const targetWidth = width ?? baseWidth;
  const targetHeight = height ?? baseHeight;

  return {
    width: targetWidth,
    height: targetHeight,
    viewBox: `0 0 ${baseWidth} ${baseHeight}`,
  };
};

export const FamilyTreeIllustration = memo(function FamilyTreeIllustration({
  width,
  height,
}: IllustrationProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = BrandColors[colorScheme];
  const dims = createDimensions(width, height);

  return (
    <Svg accessibilityRole="image" {...dims}>
      <Defs>
        <LinearGradient id="treeGradient" x1="32" y1="32" x2="288" y2="208" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={colors.tint} />
          <Stop offset="1" stopColor={colors.text} stopOpacity={0.85} />
        </LinearGradient>
        <LinearGradient id="treeBranch" x1="96" y1="72" x2="224" y2="192" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="rgba(255,255,255,0.94)" />
          <Stop offset="1" stopColor="rgba(255,255,255,0.62)" />
        </LinearGradient>
      </Defs>

      <Rect x="24" y="36" width="272" height="168" rx="32" fill="rgba(107,92,255,0.12)" />
      <Path
        d="M80 168C80 132 112 104 160 104C208 104 240 132 240 168"
        stroke="url(#treeGradient)"
        strokeWidth="32"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M120 132L96 96"
        stroke="url(#treeBranch)"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <Path
        d="M200 132L224 96"
        stroke="url(#treeBranch)"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <Circle cx="96" cy="92" r="20" fill="url(#treeGradient)" opacity={0.85} />
      <Circle cx="160" cy="92" r="22" fill="url(#treeGradient)" opacity={0.9} />
      <Circle cx="224" cy="92" r="20" fill="url(#treeGradient)" opacity={0.85} />
      <Circle cx="120" cy="180" r="16" fill="rgba(255,255,255,0.85)" />
      <Circle cx="200" cy="180" r="16" fill="rgba(255,255,255,0.85)" />
      <Rect x="148" y="164" width="24" height="36" rx="12" fill="rgba(255,255,255,0.6)" />
    </Svg>
  );
});

export const ConnectedParivarIllustration = memo(function ConnectedParivarIllustration({
  width,
  height,
}: IllustrationProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = BrandColors[colorScheme];
  const dims = createDimensions(width, height);

  return (
    <Svg accessibilityRole="image" {...dims}>
      <Defs>
        <LinearGradient
          id="chatGradient"
          x1="48"
          y1="60"
          x2="276"
          y2="184"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor={colors.tint} />
          <Stop offset="1" stopColor={colors.text} stopOpacity={0.82} />
        </LinearGradient>
      </Defs>

      <Rect x="32" y="52" width="256" height="136" rx="28" fill="rgba(107,92,255,0.14)" />
      <Path
        d="M84 88H212C223.046 88 232 96.9543 232 108V128C232 139.046 223.046 148 212 148H128L100 172V148H84C72.9543 148 64 139.046 64 128V108C64 96.9543 72.9543 88 84 88Z"
        fill="url(#chatGradient)"
      />
      <G opacity={0.75}>
        <Circle cx="108" cy="120" r="12" fill="rgba(255,255,255,0.92)" />
        <Circle cx="148" cy="120" r="12" fill="rgba(255,255,255,0.86)" />
        <Circle cx="188" cy="120" r="12" fill="rgba(255,255,255,0.92)" />
      </G>
      <Rect x="92" y="68" width="136" height="12" rx="6" fill="rgba(107,92,255,0.34)" />
      <Rect x="60" y="180" width="120" height="12" rx="6" fill="rgba(107,92,255,0.2)" />
      <Rect x="188" y="180" width="72" height="12" rx="6" fill="rgba(107,92,255,0.2)" />
    </Svg>
  );
});

export const AICareIllustration = memo(function AICareIllustration({ width, height }: IllustrationProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = BrandColors[colorScheme];
  const dims = createDimensions(width, height);

  return (
    <Svg accessibilityRole="image" {...dims}>
      <Defs>
        <LinearGradient id="aiOrb" x1="92" y1="68" x2="236" y2="196" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={colors.tint} />
          <Stop offset="1" stopColor={colors.text} stopOpacity={0.88} />
        </LinearGradient>
      </Defs>

      <Rect x="40" y="64" width="240" height="128" rx="36" fill="rgba(107,92,255,0.16)" />
      <Circle cx="164" cy="128" r="60" fill="url(#aiOrb)" />
      <Circle cx="164" cy="128" r="32" fill="rgba(255,255,255,0.85)" />
      <Path
        d="M140 126C140 118.268 146.268 112 154 112H174C181.732 112 188 118.268 188 126V148C188 155.732 181.732 162 174 162H154C146.268 162 140 155.732 140 148V126Z"
        fill="rgba(255,255,255,0.4)"
      />
      <Rect x="116" y="88" width="12" height="80" rx="6" fill="rgba(107,92,255,0.3)" />
      <Rect x="200" y="88" width="12" height="80" rx="6" fill="rgba(107,92,255,0.3)" />
      <Circle cx="116" cy="80" r="10" fill="rgba(107,92,255,0.6)" />
      <Circle cx="212" cy="80" r="10" fill="rgba(107,92,255,0.6)" />
      <Path
        d="M100 188C100 188 124 212 160 212C196 212 224 188 224 188"
        stroke="rgba(107,92,255,0.3)"
        strokeWidth="10"
        strokeLinecap="round"
      />
    </Svg>
  );
});
