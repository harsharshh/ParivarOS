import {
  Activity,
  Baby,
  Book,
  BookOpen,
  Compass,
  Flame,
  Gamepad2,
  Heart,
  HeartPulse,
  Home,
  Image,
  Lock,
  MessageCircle,
  Repeat,
  Shield,
  Sparkles,
  Stethoscope,
  Sun,
  TreePine,
  Users,
  Utensils,
  Wallet,
  ChevronRight,
} from '@tamagui/lucide-icons';
import type { IconProps } from '@tamagui/lucide-icons';
import { useMemo } from 'react';
import { Card, Text, YStack, useThemeName } from 'tamagui';

import { ThemeColors, accentPalette } from '@/constants/tamagui-theme';
import { withAlpha } from '@/utils/color';

export type ModuleCardProps = {
  title: string;
  subtitle: string;
  description: string;
  onPress?: () => void;
  layout?: 'half' | 'full';
  iconKey?: keyof typeof moduleIconMap;
};

const moduleIconMap = {
  home: Users,
  tree: TreePine,
  memories: Image,
  tribute: Flame,
  culture: BookOpen,
  chat: MessageCircle,
  eldercare: HeartPulse,
  wellbeing: Sun,
  health: Stethoscope,
  gratitude: Heart,
  safety: Shield,
  household: Home,
  kitchen: Utensils,
  habits: Repeat,
  finance: Wallet,
  vault: Lock,
  vastu: Compass,
  spiritual: Book,
  kids: Baby,
  fun: Gamepad2,
  stories: BookOpen,
  ai: Sparkles,
  vitality: Activity,
} satisfies Record<string, (props: IconProps) => JSX.Element>;

function getIconComponent(iconKey?: keyof typeof moduleIconMap) {
  if (iconKey && moduleIconMap[iconKey]) {
    return moduleIconMap[iconKey];
  }
  return moduleIconMap.home;
}

export function ModuleCard({ title, subtitle, description, onPress, layout = 'half', iconKey }: ModuleCardProps) {
  const themeName = useThemeName();
  const colorScheme: 'light' | 'dark' = themeName?.toString().startsWith('dark') ? 'dark' : 'light';
  const palette = ThemeColors[colorScheme];
  const accentSpectrum = accentPalette[colorScheme];
  const isDark = colorScheme === 'dark';

  const colors = useMemo(
    () => ({
      background: palette.surface,
      hoverBackground: isDark
        ? withAlpha(palette.accentStrong, 0.18)
        : withAlpha(palette.accent, 0.16),
      title: palette.text,
      subtitle: palette.subtleText,
      description: palette.mutedText,
      shadow: palette.shadow,
      accent: palette.accent,
      iconGlow: isDark ? 'transparent' : withAlpha(palette.accentStrong, 0.26),
      iconBackground: isDark ? withAlpha(accentSpectrum[6], 0.18) : palette.surface,
    }),
    [isDark, palette]
  );

  const width = layout === 'half' ? '48%' : '100%';
  const IconComponent = getIconComponent(iconKey);

  return (
    <Card
      padding="$4"
      borderRadius="$8"
      width={width}
      height={layout === 'half' ? 148 : undefined}
      minWidth={160}
      alignSelf="stretch"
      backgroundColor={colors.background}
      shadowColor={colors.shadow}
      shadowRadius={18}
      hoverStyle={{ backgroundColor: colors.hoverBackground }}
      pressStyle={{ scale: 0.98 }}
      onPress={onPress}
      disabled={!onPress}
    >
      <YStack gap="$3" flex={1} position="relative">
        <YStack
          position="absolute"
          top={-20}
          right={-28}
          width={48}
          height={48}
          borderRadius={24}
          backgroundColor={colors.iconBackground}
          ai="center"
          jc="center"
          shadowColor={colors.iconGlow}
          shadowRadius={18}
          pointerEvents="none"
        >
          <IconComponent color={colors.accent} size={18} />
        </YStack>

        <YStack gap="$2" paddingTop="36px">
          <Text color={colors.title} fontSize={18} fontWeight="700">
            {subtitle}
          </Text>
          <Text color={colors.subtitle} fontSize={14} fontWeight="600">
            {title}
          </Text>
          <Text color={colors.description} fontSize={12} lineHeight={16}>
            {description}
          </Text>
        </YStack>
        <YStack position="absolute" bottom="$0" right="$0" pointerEvents="none">
          <ChevronRight size={18} color={colors.accent} />
        </YStack>
      </YStack>
    </Card>
  );
}
