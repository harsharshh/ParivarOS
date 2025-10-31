import { Compass } from '@tamagui/lucide-icons';
import { useCallback, useContext, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spinner, Text, XStack, YStack } from 'tamagui';

import { ThemePreferenceContext } from '@/app/_layout';
import { ThemeColors } from '@/constants/tamagui-theme';
import { BrandSpacing, BrandTypography, ModuleCard, ParivarCtaCard, StatsCard } from '@/design-system';
import { useParivarStatus } from '@/hooks/use-parivar-status';

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
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const { hasJoinedParivar, refreshStatus } = useParivarStatus();

  const colors = useMemo(
    () => ({
      background: palette.surface,
      card: palette.surface,
      text: palette.text,
      accent: palette.accent,
      secondary: palette.subtleText,
      shadow: palette.shadow,
      headerBackground: palette.surface,
      iconBackground: palette.surface,
      iconColor: palette.text,
    }),
    [palette]
  );

  const ensureJoined = useCallback(() => {
    Alert.alert('Join a Parivar', 'Connect to a Parivar to explore extended family spaces.');
  }, []);

  const handleStatPress = useCallback((title: string) => {
    if (!hasJoinedParivar) {
      ensureJoined();
      return;
    }
    Alert.alert(title, 'Detailed analytics are coming soon for extended families.');
  }, [ensureJoined, hasJoinedParivar]);

  const handleModulePress = useCallback((title: string) => {
    if (!hasJoinedParivar) {
      ensureJoined();
      return;
    }
    Alert.alert(title, 'This cross-family experience will be available shortly.');
  }, [ensureJoined, hasJoinedParivar]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshStatus(),
        new Promise((resolve) => setTimeout(resolve, 500)),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refreshStatus]);

  const handleJoinParivar = useCallback(() => {
    Alert.alert('Join Parivar', 'Joining flow coming soon.');
  }, []);

  const scrollPaddingTop = headerHeight || insets.top + BrandSpacing.elementGap;
  const requiresJoin = !hasJoinedParivar;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        backgroundColor={colors.background}
        zIndex={10}
        onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}
      >
        <YStack paddingTop={insets.top + BrandSpacing.elementGap / 2} paddingHorizontal={BrandSpacing.gutter} paddingBottom={BrandSpacing.elementGap / 2}>
          <XStack
            backgroundColor={colors.background}
            borderRadius={20}
            paddingHorizontal={BrandSpacing.elementGap}
            paddingVertical={BrandSpacing.elementGap / 1.5}
            ai="center"
            gap="$3"
            shadowColor={colors.shadow}
            shadowRadius={26}
          >
            <XStack
              width={44}
              height={44}
              borderRadius={22}
              ai="center"
              jc="center"
              backgroundColor={colors.iconBackground}
              shadowColor={colors.shadow}
              shadowRadius={14}
            >
              <Compass color={colors.iconColor} size={18} />
            </XStack>
            <YStack flex={1} gap="$1">
              <Text fontFamily={BrandTypography.tagline.fontFamily} fontSize={20} color={colors.text} fontWeight="700">
                Parivar +
              </Text>
              <Text color={colors.secondary} fontSize={14}>
                Discover every connected family.
              </Text>
            </YStack>
          </XStack>
        </YStack>
      </YStack>

      {refreshing && (
        <XStack
          position="absolute"
          top={headerHeight}
          left={0}
          right={0}
          zIndex={5}
          paddingHorizontal={BrandSpacing.gutter}
          paddingVertical={20}
          pointerEvents="none"
          backgroundColor="transparent"
          ai="center"
          jc="center"
        >
          <Spinner size="large" color={colors.accent} />
        </XStack>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: scrollPaddingTop,
          paddingBottom: BrandSpacing.stackGap,
          paddingHorizontal: BrandSpacing.gutter,
          gap: BrandSpacing.stackGap,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {requiresJoin && (
          <ParivarCtaCard
            marginTop={BrandSpacing.elementGap}
            themeName={themeName}
            title="Join your extended Parivar."
            description="Link with your loved ones to see cross-family stats, celebrations, and shared stories."
            buttonLabel="Join Parivar"
            onPress={handleJoinParivar}
            backgroundColor={colors.card}
            // shadowColor={colors.accent}
            descriptionColor={colors.secondary}
            buttonBackgroundColor={colors.accent}
            buttonTextColor="#fff"
          />
        )}

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
    </View>
  );
}
