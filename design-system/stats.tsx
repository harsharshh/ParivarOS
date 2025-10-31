import { useMemo } from 'react';
import { Card, Text, YStack, useThemeName } from 'tamagui';

import { ThemeColors, accentPalette } from '@/constants/tamagui-theme';
import { withAlpha } from '@/utils/color';

export type StatsCardProps = {
  title: string;
  value: string;
  description: string;
  onPress?: () => void;
  layout?: 'half' | 'full';
};

export function StatsCard({ title, value, description, onPress, layout = 'half' }: StatsCardProps) {
  const themeName = useThemeName();
  const colorScheme: 'light' | 'dark' = themeName?.toString().startsWith('dark') ? 'dark' : 'light';
  const palette = ThemeColors[colorScheme];
  const accentSpectrum = accentPalette[colorScheme];
  const isDark = colorScheme === 'dark';

  const colors = useMemo(
    () => ({
      background: palette.surface,
      primary: isDark ? palette.accentStrong : palette.accent,
      secondary: palette.subtleText,
      label: palette.mutedText,
      hoverBackground: isDark
        ? withAlpha(palette.accentStrong, 0.22)
        : withAlpha(palette.accent, 0.18),
      shadow: palette.elevatedShadow,
    }),
    [isDark, palette]
  );

  const width = layout === 'half' ? '48%' : '100%';

  return (
    <Card
      padding="$4"
      borderRadius="$8"
      width={width}
      flexShrink={0}
      alignSelf="stretch"
      height={132}
      backgroundColor={colors.background}
      shadowColor={colors.shadow}
      shadowRadius={18}
      hoverStyle={{
        backgroundColor: colors.hoverBackground,
      }}
      pressStyle={{
        scale: 0.98,
      }}
      onPress={onPress}
      disabled={!onPress}
    >
      <YStack gap="$2" flex={1} justifyContent="space-between">
        <Text color={colors.label} fontSize={12} textTransform="uppercase" letterSpacing={0.6}>
          {title}
        </Text>
        <Text color={colors.primary} fontSize={24} fontWeight="700">
          {value}
        </Text>
        <Text color={colors.secondary} fontSize={12} lineHeight={16}>
          {description}
        </Text>
      </YStack>
    </Card>
  );
}
