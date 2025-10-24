import { useMemo } from 'react';
import { Card, Text, YStack } from 'tamagui';

import { ThemeColors, accentPalette } from '@/constants/tamagui-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { withAlpha } from '@/utils/color';

export type ModuleCardProps = {
  title: string;
  subtitle: string;
  description: string;
  onPress?: () => void;
  layout?: 'half' | 'full';
};

export function ModuleCard({ title, subtitle, description, onPress, layout = 'half' }: ModuleCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = ThemeColors[colorScheme];
  const accentSpectrum = accentPalette[colorScheme];

  const colors = useMemo(
    () => ({
      background: withAlpha(accentSpectrum[colorScheme === 'dark' ? 5 : 1], colorScheme === 'dark' ? 0.26 : 0.12),
      border: withAlpha(accentSpectrum[colorScheme === 'dark' ? 7 : 3], 0.32),
      hoverBorder: accentSpectrum[colorScheme === 'dark' ? 9 : 4],
      title: accentSpectrum[colorScheme === 'dark' ? 10 : 4],
      subtitle: withAlpha(palette.text, 0.8),
      description: withAlpha(palette.text, colorScheme === 'dark' ? 0.64 : 0.68),
      shadow: withAlpha(accentSpectrum[colorScheme === 'dark' ? 8 : 5], 0.16),
    }),
    [accentSpectrum, colorScheme, palette.text]
  );

  const width = layout === 'half' ? '48%' : '100%';

  return (
    <Card
      bordered
      padding="$4"
      borderRadius="$8"
      width={width}
      height={layout === 'half' ? 148 : undefined}
      minWidth={160}
      alignSelf="stretch"
      borderColor={colors.border}
      backgroundColor={colors.background}
      shadowColor={colors.shadow}
      shadowRadius={18}
      hoverStyle={{ borderColor: colors.hoverBorder }}
      pressStyle={{ scale: 0.98 }}
      onPress={onPress}
      disabled={!onPress}
    >
      <YStack gap="$2">
        <Text color={colors.title} fontSize={16} fontWeight="600">
          {title}
        </Text>
        <Text color={colors.subtitle} fontSize={14}>
          {subtitle}
        </Text>
        <Text color={colors.description} fontSize={12} lineHeight={16}>
          {description}
        </Text>
      </YStack>
    </Card>
  );
}
