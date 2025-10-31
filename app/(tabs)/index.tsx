import { Bell } from '@tamagui/lucide-icons';
import { useCallback, useContext, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Button, Card, Spinner, Text, XStack, YStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { ThemePreferenceContext } from '@/app/_layout';
import { firebaseAuth } from '@/config/firebase';
import { ThemeColors, accentPalette, darkPalette, lightPalette } from '@/constants/tamagui-theme';
import { BrandSpacing, BrandTypography, ModuleCard, ParivarCtaCard, StatsCard } from '@/design-system';
import { withAlpha } from '@/utils/color';
import { useParivarStatus } from '@/hooks/use-parivar-status';
import { getCreateParivarProgress } from '@/utils/create-parivar-storage';

const summaryCardDefinitions = [
  {
    title: 'Parivar Members',
    value: '12',
    description: 'Loved ones connected',
    href: '/quick-stats/parivar-members',
  },
  {
    title: 'Parivar Linked',
    value: '3',
    description: 'Families you follow',
    href: '/quick-stats/parivar-linked',
  },
  {
    title: 'Events',
    value: '5',
    description: 'Joyful moments ahead',
    href: '/quick-stats/events',
  },
  {
    title: 'Health Reminders',
    value: '2',
    description: 'Care tasks scheduled',
    href: '/quick-stats/health-reminders',
  },
];

const familyModules = [
  {
    title: 'Kutumb Kendra',
    subtitle: 'कुटुंब केन्द्र',
    description: 'Family dashboard for birthdays, events, alerts.',
  },
  {
    title: 'Parivar Vriksh',
    subtitle: 'परिवार वृक्ष',
    description: 'Core family tree with self, spouse, kids, parents.',
  },
  {
    title: 'Smriti Mandal',
    subtitle: 'स्मृति मण्डल',
    description: 'Photos, videos, voice notes, and treasured moments.',
  },
  {
    title: 'Shraddhanjali',
    subtitle: 'श्रद्धांजलि',
    description: 'Remembrance hub for ancestors and anniversaries.',
  },
  {
    title: 'Sanskaar Dhan',
    subtitle: 'संस्कार धन',
    description: 'Culture, recipes, family values, and rituals archive.',
  },
  {
    title: 'Baithak',
    subtitle: 'बैठक',
    description: 'Private family chat with shared daily planner.',
  },
  {
    title: 'Sparsh+',
    subtitle: 'स्पर्श',
    description: 'Elder-care companion with voice-first updates.',
  },
  {
    title: 'ManMandal',
    subtitle: 'मनमण्डल',
    description: 'Emotional check-ins and wellbeing insights.',
  },
  {
    title: 'AarogyaBandhan',
    subtitle: 'आरोग्य बन्धन',
    description: 'Health tracker and reminders',
  },
  {
    title: 'SevaBank',
    subtitle: 'सेवा बैंक',
    description: 'Family gratitude, help, and support tracker.',
  },
  {
    title: 'Suraksha Kavach',
    subtitle: 'सुरक्षा कवच',
    description: 'SOS, geofence, and emergency contact alerts.',
  },
  {
    title: 'GharSeva',
    subtitle: 'घरसेवा',
    description: 'Household chores, staff, and routine management.',
  },
  {
    title: 'RasoiOS',
    subtitle: 'रसोई ओएस',
    description: 'Kitchen planner for groceries, inventory, recipes.',
  },
  {
    title: 'Niyam',
    subtitle: 'नियम',
    description: 'Habits, reminders, and routine builder.',
  },
  {
    title: 'KhataSmart',
    subtitle: 'खाता स्मार्ट',
    description: 'Family expenses, lending, and gifting ledger.',
  },
  {
    title: 'GharPatrika',
    subtitle: 'घरपत्रिका',
    description: 'Secure locker for IDs, insurance, receipts.',
  },
  {
    title: 'VastuSaathi',
    subtitle: 'वास्तु साथी',
    description: 'Home harmony and Vastu energy balancing guide.',
  },
  {
    title: 'MandirOS',
    subtitle: 'मंदिर ओएस',
    description: 'Aarti,panchang,bhajan and devotional reminders.',
  },
  {
    title: 'Chhoti Duniya',
    subtitle: 'छोटी दुनिया',
    description: 'Kids’ zone with drawings, learning, and diary.',
  },
  {
    title: 'MastiGhar',
    subtitle: 'मस्तीघर',
    description: 'Fun games and engagements for the whole family.',
  },
  {
    title: 'KathaLok',
    subtitle: 'कथालोक',
    description: 'AI-crafted family stories from your memories.',
  },
  {
    title: 'ParivarAI',
    subtitle: 'परिवार एआई',
    description: 'Family assistant for summaries, reminders, and chats.',
  },
];

const bondingQuotes = [
  { text: 'Family is not an important thing — it’s everything.', author: 'Michael J. Fox' },
  {
    text: 'In time of test, family is best.',
    author: 'Burmese Proverb',
  },
  { text: 'The love of family is life’s greatest blessing.', author: 'Eva Burrows' },
  { text: 'Where there is family, there is home.', author: 'Unknown' },
  { text: 'We may have our differences, but nothing’s more important than family.', author: 'Miguel Ángel Silvestre' },
  {
    text: 'घर वही है जहाँ परिवार की मुस्कान बसती है।',
    author: 'विक्रम सेठ',
  },
  {
    text: 'परिवार के बिना जीवन अधूरा संगीत है।',
    author: 'गुलज़ार',
  },
  {
    text: 'परिवार संग बिताया पल ही असली धन है।',
    author: 'अमृता प्रीतम',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { themeName } = useContext(ThemePreferenceContext);
  const palette = ThemeColors[themeName];
  const basePalette = themeName === 'dark' ? darkPalette : lightPalette;
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const { profileName, hasCreatedParivar, hasJoinedParivar, refreshStatus } = useParivarStatus();
  const [hasCreateParivarProgress, setHasCreateParivarProgress] = useState(false);

  const ensureParivarCreated = useCallback(() => {
    Alert.alert(
      'Create your Parivar',
      'Create or join your Parivar to unlock these experiences.'
    );
  }, []);

  const handleQuickStatPress = useCallback(
    (href: string) => {
      if (!hasJoinedParivar) {
        ensureParivarCreated();
        return;
      }
      router.push(href);
    },
    [ensureParivarCreated, hasJoinedParivar, router]
  );

  const handleModulePress = useCallback((title: string) => {
    if (!hasJoinedParivar) {
      ensureParivarCreated();
      return;
    }
    Alert.alert(title, 'This module is coming soon.');
  }, [ensureParivarCreated, hasJoinedParivar]);

  const handleCreateParivar = useCallback(() => {
    router.push('/create-parivar');
  }, [router]);

  const handleJoinParivar = useCallback(() => {
    Alert.alert('Join Parivar', 'Joining flow coming soon.');
  }, []);

  const colors = useMemo(() => {
    const accentSpectrum = accentPalette[themeName];
    return {
      background: palette.background,
      card: basePalette[themeName === 'dark' ? 3 : 1],
      border: basePalette[themeName === 'dark' ? 6 : 7],
      accent: palette.tint,
      accentSoft: accentSpectrum[themeName === 'dark' ? 4 : 2],
      text: palette.text,
      secondary: basePalette[themeName === 'dark' ? 9 : 6],
      avatarText: palette.accentForeground,
      shadow: withAlpha(palette.tint, themeName === 'dark' ? 0.25 : 0.18),
      quoteBackground: withAlpha(
        accentSpectrum[themeName === 'dark' ? 7 : 2],
        themeName === 'dark' ? 0.36 : 0.18
      ),
      quoteText: accentSpectrum[themeName === 'dark' ? 10 : 4],
    };
  }, [basePalette, palette, themeName]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshStatus();
    } finally {
      setRefreshing(false);
    }
  }, [refreshStatus]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        const progress = await getCreateParivarProgress();
        if (isActive) {
          setHasCreateParivarProgress(Boolean(progress));
        }
      })();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const firstName = useMemo(() => {
    if (!profileName) return 'Parivar Friend';
    const [first] = profileName.split(' ');
    return first || profileName;
  }, [profileName]);

  const headerPaddingTop = Math.max(insets.top, BrandSpacing.elementGap);
  const scrollPaddingTop = headerHeight > 0 ? headerHeight : headerPaddingTop + BrandSpacing.elementGap;
  const bondingQuote = useMemo(
    () => bondingQuotes[Math.floor(Math.random() * bondingQuotes.length)],
    []
  );
  const summaryCards = useMemo(
    () =>
      summaryCardDefinitions.map((definition) => ({
        ...definition,
        onPress: () => handleQuickStatPress(definition.href),
      })),
    [handleQuickStatPress]
  );
  const showCreateCTA = !hasCreatedParivar && !hasJoinedParivar;
  const showJoinCTA = hasCreatedParivar && !hasJoinedParivar;
  const createButtonLabel = hasCreateParivarProgress ? 'Continue creating Parivar' : 'Create Parivar';

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
        <YStack
          paddingTop={headerPaddingTop}
          paddingBottom={BrandSpacing.elementGap / 2}
          paddingHorizontal={BrandSpacing.gutter}
          gap="$3"
        >
          <XStack ai="center" jc="space-between">
            <XStack ai="center" gap="$3">
              <Avatar size="$4" circular bg={colors.accentSoft} ai="center" jc="center">
                <Avatar.Image src={firebaseAuth?.currentUser?.photoURL ?? undefined} />
                <Avatar.Fallback ai="center" jc="center">
                  <Text color={colors.avatarText} fontWeight="700" textAlign="center">
                    {firstName.charAt(0).toUpperCase()}
                  </Text>
                </Avatar.Fallback>
              </Avatar>
              <YStack>
                <Text fontSize={12} color={colors.secondary}>Namaste,</Text>
                <Text fontSize={16} fontFamily={BrandTypography.tagline.fontFamily} color={colors.text}>
                  {firstName}
                </Text>
              </YStack>
            </XStack>

            <XStack gap="$2">
              <Button
                size="$3"
                circular
                backgroundColor={colors.accent}
                onPress={() => Alert.alert('SOS', 'Family assistance is on the way.')}
              >
                <Text color="#fff" fontWeight="700">
                  SOS
                </Text>
              </Button>
              <Button
                size="$3"
                circular
                variant="outlined"
                icon={Bell}
                onPress={() => router.push('/notifications')}
              />
            </XStack>
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
          paddingHorizontal: BrandSpacing.gutter,
          paddingTop: scrollPaddingTop,
          paddingBottom: BrandSpacing.stackGap,
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
        {showCreateCTA && (
          <ParivarCtaCard
            themeName={themeName}
            title="You haven't created a Parivar yet."
            description="Start by creating your Parivar to add members, stories, and rituals in one joyful place."
            buttonLabel={createButtonLabel}
            onPress={handleCreateParivar}
            backgroundColor={colors.card}
            borderColor={colors.border}
            shadowColor={colors.shadow}
            descriptionColor={colors.secondary}
          />
        )}

        {showJoinCTA && (
          <ParivarCtaCard
            themeName={themeName}
            title="Join your Parivar to continue."
            description="You’ve created a Parivar workspace. Join it to collaborate with your loved ones."
            buttonLabel="Join Parivar"
            onPress={handleJoinParivar}
            backgroundColor={colors.card}
            borderColor={colors.border}
            shadowColor={colors.shadow}
            descriptionColor={colors.secondary}
          />
        )}

        <Card
          padding="$4"
          bordered
          borderColor={colors.border}
          backgroundColor={colors.quoteBackground}
          gap="$2"
        >
          <Text textAlign="center" color={colors.accent} fontWeight="600" fontSize={13}>
            Parivar Bonding
          </Text>
          <Text textAlign="center" color={colors.quoteText} fontSize={13} lineHeight={18} italic>
            “{bondingQuote.text}”
          </Text>
          <Text textAlign="center" color={colors.secondary} fontSize={12}>
            — {bondingQuote.author}
          </Text>
        </Card>

      <YStack gap="$3">
        <Text fontFamily={BrandTypography.tagline.fontFamily} fontSize={16} color={colors.text}>
          Quick Stats
        </Text>
        <XStack gap="$3" flexWrap="wrap">
          {summaryCards.map((card) => (
            <StatsCard
              key={card.title}
              title={card.title}
              value={card.value}
              description={card.description}
              onPress={card.onPress}
              layout="half"
            />
          ))}
        </XStack>
      </YStack>

      <YStack gap="$3">
        <Text fontFamily={BrandTypography.tagline.fontFamily} fontSize={16} color={colors.text}>
          Mera Parivar
        </Text>
        <XStack gap="$3" flexWrap="wrap">
          {familyModules.map((module) => (
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
