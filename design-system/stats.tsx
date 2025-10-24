import { useMemo } from 'react';
import { Card, Text, YStack } from 'tamagui';

import { ThemeColors, accentPalette } from '@/constants/tamagui-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { withAlpha } from '@/utils/color';

export type StatsCardProps = {
  title: string;
  value: string;
  description: string;
  onPress?: () => void;
  layout?: 'half' | 'full';
};

export function StatsCard({ title, value, description, onPress, layout = 'half' }: StatsCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = ThemeColors[colorScheme];
  const accentSpectrum = accentPalette[colorScheme];

  const colors = useMemo(
    () => ({
      background: withAlpha(accentSpectrum[colorScheme === 'dark' ? 4 : 1], colorScheme === 'dark' ? 0.22 : 0.12),
      border: withAlpha(accentSpectrum[colorScheme === 'dark' ? 6 : 3], 0.28),
      hoverBorder: accentSpectrum[colorScheme === 'dark' ? 8 : 4],
      primary: accentSpectrum[colorScheme === 'dark' ? 10 : 4],
      secondary: withAlpha(palette.text, colorScheme === 'dark' ? 0.64 : 0.58),
      label: palette.icon,
      shadow: withAlpha(accentSpectrum[colorScheme === 'dark' ? 8 : 5], 0.18),
    }),
    [accentSpectrum, colorScheme, palette.icon, palette.text]
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
