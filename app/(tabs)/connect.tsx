import { useContext, useMemo } from 'react';
import { ScrollView } from 'react-native';
import { Paragraph, Card, Text, YStack } from 'tamagui';

import { ThemePreferenceContext } from '@/app/_layout';
import { ThemeColors, darkPalette, lightPalette } from '@/constants/tamagui-theme';
import { BrandSpacing, BrandTypography } from '@/design-system';

export default function ConnectScreen() {
  const { themeName } = useContext(ThemePreferenceContext);
  const palette = ThemeColors[themeName];
  const basePalette = themeName === 'dark' ? darkPalette : lightPalette;

  const colors = useMemo(
    () => ({
      background: palette.background,
      card: basePalette[themeName === 'dark' ? 3 : 1],
      border: basePalette[themeName === 'dark' ? 6 : 7],
      text: palette.text,
      secondary: basePalette[themeName === 'dark' ? 9 : 6],
    }),
    [basePalette, palette, themeName]
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingHorizontal: BrandSpacing.gutter,
        paddingTop: BrandSpacing.stackGap,
        paddingBottom: BrandSpacing.stackGap,
        gap: BrandSpacing.stackGap,
      }}
      showsVerticalScrollIndicator={false}
    >
      <YStack gap="$4">
        <Text
          fontFamily={BrandTypography.tagline.fontFamily}
          fontSize={22}
          fontWeight="700"
          color={colors.text}
        >
          Your Parivar Chats
        </Text>

        <Card padding="$5" bordered borderColor={colors.border} backgroundColor={colors.card} gap="$3">
          <Text fontSize={18} fontWeight="700" color={colors.text}>
            Coming soon!
          </Text>
          <Paragraph color={colors.secondary}>
            We&apos;re crafting a private space for families to share updates, memories, and joyful
            conversations. Stay tuned for Parivar Connect.
          </Paragraph>
        </Card>
      </YStack>
    </ScrollView>
  );
}
