import { useCallback, useContext, useMemo } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';

import { ThemePreferenceContext } from '@/app/_layout';
import { ThemeColors, accentPalette, darkPalette, lightPalette } from '@/constants/tamagui-theme';
import { BrandSpacing, BrandTypography, ModuleCard, StatsCard } from '@/design-system';
import { withAlpha } from '@/utils/color';

const extendedStats = [
  { title: 'Connected Parivar', value: '6', description: 'Linked across the parivar' },
  { title: 'Members', value: '142', description: 'Loved ones across generations' },
  { title: 'Shared Celebrations', value: '18', description: 'Festivals & milestones together' },
  { title: 'Active Families', value: '9', description: 'Communities staying in touch' },
];

const extendedModules = [
  {
    title: 'Kutumb Kendra (Shared)',
    subtitle: 'कुटुंब केन्द्र',
    description: 'One dashboard for all connected families.',
  },
  {
    title: 'RishtaSetu',
    subtitle: 'रिश्तासेतु',
    description: 'Keep in-laws and sibling families in sync.',
  },
  {
    title: 'Parivar Vriksh (Merged)',
    subtitle: 'परिवार वृक्ष',
    description: 'View the combined family tree at a glance.',
  },
  {
    title: 'Utsav Mandal Calendar',
    subtitle: 'उत्सव मण्डल',
    description: 'Share a celebration calendar with everyone.',
  },
  {
    title: 'KathaLok',
    subtitle: 'कथालोक',
    description: 'Swap stories and keep the lore alive.',
  },
  {
    title: 'ParivarAI',
    subtitle: 'परिवार एआई',
    description: 'Let AI help trace relationships and context.',
  },
  {
    title: 'Sanskaar Dhan',
    subtitle: 'संस्कार धन',
    description: 'Preserve shared culture, recipes, and values.',
  },
  {
    title: 'Suraksha Kavach',
    subtitle: 'सुरक्षा कवच',
    description: 'SOS, geo-fencing, and family safety alerts.',
  },
  {
    title: 'MastiGhar',
    subtitle: 'मस्तीघर',
    description: 'Fun challenges and games for every parivar.',
  },
  {
    title: 'Chhoti Duniya',
    subtitle: 'छोटी दुनिया',
    description: 'Kids share drawings and daily joys here.',
  },
  {
    title: 'Utsav Mandal',
    subtitle: 'उत्सव मण्डल',
    description: 'Plan joint festivities across every parivar.',
  },
  {
    title: 'Yatra Saathi',
    subtitle: 'यात्रा साथी',
    description: 'Share travel plans and relatives to meet.',
  },
  {
    title: 'Vasudha',
    subtitle: 'वसुधा',
    description: 'Stay close with your neighbourhood network.',
  },
  {
    title: 'Smriti Mandal',
    subtitle: 'स्मृति मण्डल',
    description: 'Exchange albums and treasured memories.',
  },
];

export default function ExploreScreen() {
  const { themeName } = useContext(ThemePreferenceContext);
  const palette = ThemeColors[themeName];
  const basePalette = themeName === 'dark' ? darkPalette : lightPalette;
  const insets = useSafeAreaInsets();

  const colors = useMemo(() => {
    const accentSpectrum = accentPalette[themeName];
    return {
      background: palette.background,
      text: palette.text,
      accent: palette.tint,
      secondary: basePalette[themeName === 'dark' ? 9 : 6],
      sectionBackground: withAlpha(accentSpectrum[themeName === 'dark' ? 3 : 1], themeName === 'dark' ? 0.22 : 0.12),
    };
  }, [basePalette, palette, themeName]);

  const handleStatPress = useCallback((title: string) => {
    Alert.alert(title, 'Detailed analytics are coming soon for extended families.');
  }, []);

  const handleModulePress = useCallback((title: string) => {
    Alert.alert(title, 'This cross-family experience will be available shortly.');
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top + BrandSpacing.elementGap,
        paddingBottom: BrandSpacing.stackGap,
        paddingHorizontal: BrandSpacing.gutter,
        gap: BrandSpacing.stackGap,
      }}
      showsVerticalScrollIndicator={false}
    >
      <YStack gap="$2">
        <Text fontFamily={BrandTypography.tagline.fontFamily} fontSize={20} color={colors.text} fontWeight="700">
          Explore Parivar Networks
        </Text>
        <Text color={colors.secondary} fontSize={14}>
          Discover insights and shared spaces across every connected family.
        </Text>
      </YStack>

      <YStack gap="$3">
        <Text fontFamily={BrandTypography.tagline.fontFamily} fontSize={16} color={colors.text}>
          Quick Stats
        </Text>
        <XStack gap="$3" flexWrap="wrap">
          {extendedStats.map((card) => (
            <StatsCard
              key={card.title}
              title={card.title}
              value={card.value}
              description={card.description}
              onPress={() => handleStatPress(card.title)}
              layout="half"
            />
          ))}
        </XStack>
      </YStack>

      <YStack gap="$3">
        <Text fontFamily={BrandTypography.tagline.fontFamily} fontSize={16} color={colors.text}>
          Extended Parivar
        </Text>
        <XStack gap="$3" flexWrap="wrap">
          {extendedModules.map((module) => (
            <ModuleCard
              key={module.title}
              title={module.title}
              subtitle={module.subtitle}
              description={module.description}
              onPress={() => handleModulePress(module.title)}
            />
          ))}
        </XStack>
      </YStack>
    </ScrollView>
  );
}
