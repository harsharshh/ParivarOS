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
      background: palette.surface,
      hoverBackground: isDark
        ? withAlpha(palette.accentStrong, 0.18)
        : withAlpha(palette.accent, 0.16),
      title: palette.text,
      subtitle: palette.subtleText,
      description: palette.mutedText,
      shadow: palette.shadow,
      accent: palette.accent,
    }),
    [isDark, palette]
  );

  const width = layout === 'half' ? '48%' : '100%';

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
          <ChevronRight size={18} color={colors.accent} />
        </YStack>
      </YStack>
    </Card>
  );
}
