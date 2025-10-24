import { ChevronRight } from '@tamagui/lucide-icons';
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
};

export function ModuleCard({ title, subtitle, description, onPress, layout = 'half' }: ModuleCardProps) {
  const themeName = useThemeName();
  const colorScheme: 'light' | 'dark' = themeName?.toString().startsWith('dark') ? 'dark' : 'light';
  const palette = ThemeColors[colorScheme];
  const accentSpectrum = accentPalette[colorScheme];
  const isDark = colorScheme === 'dark';

  const colors = useMemo(
    () => ({
      background: isDark ? withAlpha(accentSpectrum[4], 0.3) : withAlpha(accentSpectrum[1], 0.12),
      border: isDark ? withAlpha(accentSpectrum[6], 0.55) : withAlpha(accentSpectrum[3], 0.32),
      hoverBorder: accentSpectrum[isDark ? 9 : 4],
      title: isDark ? accentSpectrum[8] : accentSpectrum[4],
      subtitle: isDark ? withAlpha(accentSpectrum[10], 0.95) : withAlpha(palette.text, 0.85),
      description: isDark ? withAlpha(accentSpectrum[10], 0.82) : withAlpha(palette.text, 0.68),
      shadow: withAlpha(accentSpectrum[isDark ? 7 : 5], 0.18),
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
      <YStack gap="$3" flex={1} position="relative">
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
        <YStack position="absolute" bottom="$0" right="$0" pointerEvents="none">
          <ChevronRight size={18} color={colors.title} />
        </YStack>
      </YStack>
    </Card>
  );
}
