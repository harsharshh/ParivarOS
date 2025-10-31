import { Bell } from '@tamagui/lucide-icons';
import { useCallback, useContext, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Button, Card, Spinner, Text, XStack, YStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { ThemePreferenceContext } from '@/app/_layout';
import { firebaseAuth } from '@/config/firebase';
import { ThemeColors, accentPalette } from '@/constants/tamagui-theme';
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
    icon: 'home',
  },
  {
    title: 'Parivar Vriksh',
    subtitle: 'परिवार वृक्ष',
    description: 'Core family tree with self, spouse, kids, parents.',
    icon: 'tree',
  },
  {
    title: 'Smriti Mandal',
    subtitle: 'स्मृति मण्डल',
    description: 'Photos, videos, voice notes, and treasured moments.',
    icon: 'memories',
  },
  {
    title: 'Shraddhanjali',
    subtitle: 'श्रद्धांजलि',
    description: 'Remembrance hub for ancestors and anniversaries.',
    icon: 'tribute',
  },
  {
    title: 'Sanskaar Dhan',
    subtitle: 'संस्कार धन',
    description: 'Culture, recipes, family values, and rituals archive.',
    icon: 'culture',
  },
  {
    title: 'Baithak',
    subtitle: 'बैठक',
    description: 'Private family chat with shared daily planner.',
    icon: 'chat',
  },
  {
    title: 'Sparsh+',
    subtitle: 'स्पर्श',
    description: 'Elder-care companion with voice-first updates.',
    icon: 'eldercare',
  },
  {
    title: 'ManMandal',
    subtitle: 'मनमण्डल',
    description: 'Emotional check-ins and wellbeing insights.',
    icon: 'wellbeing',
  },
  {
    title: 'AarogyaBandhan',
    subtitle: 'आरोग्य बन्धन',
    description: 'Health tracker and reminders',
    icon: 'health',
  },
  {
    title: 'SevaBank',
    subtitle: 'सेवा बैंक',
    description: 'Family gratitude, help, and support tracker.',
    icon: 'gratitude',
  },
  {
    title: 'Suraksha Kavach',
    subtitle: 'सुरक्षा कवच',
    description: 'SOS, geofence, and emergency contact alerts.',
    icon: 'safety',
  },
  {
    title: 'GharSeva',
    subtitle: 'घरसेवा',
    description: 'Household chores, staff, and routine management.',
    icon: 'household',
  },
  {
    title: 'RasoiOS',
    subtitle: 'रसोई ओएस',
    description: 'Kitchen planner for groceries, inventory, recipes.',
    icon: 'kitchen',
  },
  {
    title: 'Niyam',
    subtitle: 'नियम',
    description: 'Habits, reminders, and routine builder.',
    icon: 'habits',
  },
  {
    title: 'KhataSmart',
    subtitle: 'खाता स्मार्ट',
    description: 'Family expenses, lending, and gifting ledger.',
    icon: 'finance',
  },
  {
    title: 'GharPatrika',
    subtitle: 'घरपत्रिका',
    description: 'Secure locker for IDs, insurance, receipts.',
    icon: 'vault',
  },
  {
    title: 'VastuSaathi',
    subtitle: 'वास्तु साथी',
    description: 'Home harmony and Vastu energy balancing guide.',
    icon: 'vastu',
  },
  {
    title: 'MandirOS',
    subtitle: 'मंदिर ओएस',
    description: 'Aarti,panchang,bhajan and devotional reminders.',
    icon: 'spiritual',
  },
  {
    title: 'Chhoti Duniya',
    subtitle: 'छोटी दुनिया',
    description: 'Kids’ zone with drawings, learning, and diary.',
    icon: 'kids',
  },
  {
    title: 'MastiGhar',
    subtitle: 'मस्तीघर',
    description: 'Fun games and engagements for the whole family.',
    icon: 'fun',
  },
  {
    title: 'KathaLok',
    subtitle: 'कथालोक',
    description: 'AI-crafted family stories from your memories.',
    icon: 'stories',
  },
  {
    title: 'ParivarAI',
    subtitle: 'परिवार एआई',
    description: 'Family assistant for summaries, reminders, and chats.',
    icon: 'ai',
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
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const { profileName, hasCreatedParivar, hasJoinedParivar, refreshStatus, latestFamilyDraft } =
    useParivarStatus();
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
      background: palette.surface,
      card: palette.surface,
      accent: palette.accent,
      accentStrong: palette.accentStrong,
      accentSoft: withAlpha(accentSpectrum[themeName === 'dark' ? 5 : 2], themeName === 'dark' ? 0.24 : 0.16),
      text: palette.text,
      secondary: palette.subtleText,
      muted: palette.mutedText,
      avatarBackground: palette.surfaceAlt,
      avatarBorder: withAlpha(palette.text, themeName === 'dark' ? 0.18 : 0.08),
      avatarText: palette.text,
      shadow: palette.elevatedShadow,
      headerBackground: palette.surface,
      headerShadow: palette.shadow,
      iconBackground: palette.surface,
      iconColor: palette.text,
      quoteBackground: palette.surfaceAlt,
      quoteText: palette.accentStrong,
    };
  }, [palette, themeName]);

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
        if (isActive && latestFamilyDraft) {
          setHasCreateParivarProgress(true);
        }
        const progress = await getCreateParivarProgress();
        if (isActive) {
          setHasCreateParivarProgress(Boolean(progress) || Boolean(latestFamilyDraft));
        }
      })();
      return () => {
        isActive = false;
      };
    }, [latestFamilyDraft])
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
        <YStack paddingTop={headerPaddingTop} paddingHorizontal={BrandSpacing.gutter} paddingBottom={BrandSpacing.elementGap / 2}>
          <XStack
            backgroundColor={colors.background}
            borderRadius={20}
            paddingHorizontal={BrandSpacing.elementGap}
            paddingVertical={BrandSpacing.elementGap / 1.5}
            ai="center"
            jc="space-between"
            shadowColor={colors.headerShadow}
            shadowRadius={28}
          >
            <XStack ai="center" gap="$3">
              <Avatar
                size="$5"
                circular
                bg={colors.avatarBackground}
                borderWidth={1}
                borderColor={colors.avatarBorder}
                ai="center"
                jc="center"
              >
                <Avatar.Image src={firebaseAuth?.currentUser?.photoURL ?? undefined} />
                <Avatar.Fallback ai="center" jc="center">
                  <Text color={colors.avatarText} fontWeight="700" textAlign="center">
                    {firstName.charAt(0).toUpperCase()}
                  </Text>
                </Avatar.Fallback>
              </Avatar>
              <YStack>
                <Text fontSize={12} color={colors.secondary}>
                  Namaste,
                </Text>
                <Text fontSize={18} fontFamily={BrandTypography.tagline.fontFamily} fontWeight="700" color={colors.text}>
                  {firstName}
                </Text>
              </YStack>
            </XStack>

            <XStack gap="$2">
              <Button
                size="$3"
                circular
                backgroundColor={colors.accentStrong}
                shadowColor={colors.headerShadow}
                shadowRadius={20}
                onPress={() => Alert.alert('SOS', 'Family assistance is on the way.')}
              >
                <Text color={palette.accentForeground} fontWeight="700">
                  SOS
                </Text>
              </Button>
              <Button
                size="$3"
                circular
                backgroundColor={colors.iconBackground}
                color={colors.iconColor}
                icon={Bell}
                shadowColor={colors.headerShadow}
                shadowRadius={18}
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
            marginTop={BrandSpacing.elementGap}
            themeName={themeName}
            title="You haven't created a Parivar yet."
            description="Start by creating your Parivar to add members, stories, and rituals in one joyful place."
            buttonLabel={createButtonLabel}
            onPress={handleCreateParivar}
            backgroundColor={colors.card}
            shadowColor={colors.shadow}
            descriptionColor={colors.secondary}
            buttonBackgroundColor={colors.accent}
            buttonTextColor="#fff"
          />
        )}

        {showJoinCTA && (
          <ParivarCtaCard
            marginTop={BrandSpacing.elementGap}
            themeName={themeName}
            title="Join your Parivar to continue."
            description="You’ve created a Parivar workspace. Join it to collaborate with your loved ones."
            buttonLabel="Join Parivar"
            onPress={handleJoinParivar}
            backgroundColor={colors.card}
            shadowColor={colors.shadow}
            descriptionColor={colors.secondary}
            buttonBackgroundColor={colors.accent}
            buttonTextColor="#fff"
          />
        )}

        <Card padding="$4" backgroundColor={colors.quoteBackground} gap="$2" shadowColor={colors.shadow} shadowRadius={16}>
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
              iconKey={module.icon}
              onPress={() => handleModulePress(module.title)}
            />
          ))}
        </XStack>
      </YStack>
      </ScrollView>
    </View>
  );
}
