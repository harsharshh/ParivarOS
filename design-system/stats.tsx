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
      background: isDark ? withAlpha(accentSpectrum[4], 0.26) : withAlpha(accentSpectrum[1], 0.12),
      border: isDark ? withAlpha(accentSpectrum[6], 0.52) : withAlpha(accentSpectrum[3], 0.32),
      hoverBorder: isDark ? accentSpectrum[9] : accentSpectrum[4],
      primary: isDark ? accentSpectrum[8] : accentSpectrum[4],
      secondary: isDark ? withAlpha(accentSpectrum[10], 0.9) : withAlpha(palette.text, 0.6),
      label: isDark ? accentSpectrum[11] : withAlpha(palette.text, 0.72),
      shadow: withAlpha(accentSpectrum[isDark ? 7 : 5], 0.22),
    }),
    [accentSpectrum, isDark, palette.accentForeground, palette.text, palette.tint]
  );

  const width = layout === 'half' ? '48%' : '100%';

  return (
    <Card
      bordered
      padding="$4"
      borderRadius="$8"
      width={width}
      flexShrink={0}
      alignSelf="stretch"
      height={132}
      borderColor={colors.border}
      backgroundColor={colors.background}
      shadowColor={colors.shadow}
      shadowRadius={18}
      hoverStyle={{
        borderColor: colors.hoverBorder,
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
