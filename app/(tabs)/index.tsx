import { Bell } from '@tamagui/lucide-icons';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Button, Card, Paragraph, Spinner, Text, XStack, YStack } from 'tamagui';

import { ThemePreferenceContext } from '@/app/_layout';
import { FamilyCardIllustration } from '@/assets/images/family-card-illustration';
import { firebaseAuth, firebaseDb } from '@/config/firebase';
import { ThemeColors, accentPalette, darkPalette, lightPalette } from '@/constants/tamagui-theme';
import { BrandSpacing, BrandTypography } from '@/design-system';
import { withAlpha } from '@/utils/color';

const summaryCards = [
  { title: 'Parivar Circles', count: 0, accentIndex: 8 },
  { title: 'Parivar Members', count: 1, accentIndex: 9 },
  { title: 'Business Circles', count: 0, accentIndex: 7 },
  { title: 'Upcoming Rituals', count: 0, accentIndex: 6 },
];

export default function HomeScreen() {
  const { themeName } = useContext(ThemePreferenceContext);
  const palette = ThemeColors[themeName];
  const basePalette = themeName === 'dark' ? darkPalette : lightPalette;
  const insets = useSafeAreaInsets();

  const [profileName, setProfileName] = useState<string>('Parivar Friend');
  const [refreshing, setRefreshing] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

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
    };
  }, [basePalette, palette, themeName]);

  const fetchProfile = useCallback(async () => {
    if (!firebaseAuth?.currentUser || !firebaseDb) return;
    try {
      const snapshot = await getDoc(doc(firebaseDb, 'users', firebaseAuth.currentUser.uid));
      const data = snapshot.exists() ? (snapshot.data() as Record<string, unknown>) : {};
      const resolvedName =
        (data?.name as string | undefined)?.trim() ||
        firebaseAuth.currentUser.displayName ||
        firebaseAuth.currentUser.email?.split('@')[0] ||
        'Parivar Friend';
      setProfileName(resolvedName);
    } catch {
      const fallback =
        firebaseAuth.currentUser?.displayName ||
        firebaseAuth.currentUser?.email?.split('@')[0] ||
        'Parivar Friend';
      setProfileName(fallback);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchProfile();
    } finally {
      setRefreshing(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const firstName = useMemo(() => {
    if (!profileName) return 'Parivar Friend';
    const [first] = profileName.split(' ');
    return first || profileName;
  }, [profileName]);

  const headerPaddingTop = Math.max(insets.top, BrandSpacing.elementGap);
  const scrollPaddingTop = headerHeight > 0 ? headerHeight : headerPaddingTop + BrandSpacing.elementGap;

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

            <Button size="$3" circular variant="outlined" icon={Bell} />
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        <Card padding="$5" bordered borderColor={colors.border} backgroundColor={colors.card} gap="$4" shadowColor={colors.shadow} shadowRadius={20}>
        <YStack ai="center" gap="$3">
          <FamilyCardIllustration width={220} height={140} theme={themeName} accentStart={palette.tint} accentEnd={palette.accent} />
          <Text fontSize={18} fontFamily={BrandTypography.tagline.fontFamily} color={colors.text} textAlign="center">
            You haven&apos;t joined a Parivar yet.
          </Text>
          <Paragraph textAlign="center" color={colors.secondary} fontSize={14}>
            Join or create a parivar to share updates, celebrate milestones, and stay close to your people.
          </Paragraph>
        </YStack>
        <XStack gap="$3" flexWrap="wrap">
          <Button flex={1} size="$3" theme="accent">
            Join Parivar
          </Button>
          <Button flex={1} size="$3" variant="outlined" borderColor={colors.accent}>
            Create Parivar
          </Button>
        </XStack>
      </Card>

      <Card padding="$4" bordered borderColor={colors.border} backgroundColor={basePalette[themeName === 'dark' ? 4 : 2]} gap="$3">
        <Text textAlign="center" color={colors.accent} fontWeight="600" fontSize={14}>
          Parivar Bonding
        </Text>
        <Paragraph textAlign="center" color={colors.secondary} fontSize={14}>
          “Celebrating every story keeps the family close.”
        </Paragraph>
        <Text textAlign="center" color={colors.secondary} fontSize={13}>
          — ParivarOS
        </Text>
      </Card>

      <YStack gap="$3">
        <Text fontFamily={BrandTypography.tagline.fontFamily} fontSize={16} color={colors.text}>
          Quick Stats
        </Text>
        <XStack flexWrap="wrap" gap="$3">
          {summaryCards.map((card) => (
            <Card
              key={card.title}
              bordered
              borderColor={colors.border}
              backgroundColor={colors.card}
              padding="$4"
              width="48%"
              gap="$2"
            >
              <Text color={colors.text} fontWeight="600" fontSize={14}>
                {card.title}
              </Text>
              <Text fontSize={22} fontWeight="700" color={PaletteAccent(basePalette, card.accentIndex)}>
                {card.count}
              </Text>
              <Button variant="ghost" justifyContent="flex-start" paddingHorizontal={0} size="$2">
                View
              </Button>
            </Card>
          ))}
        </XStack>
      </YStack>
      </ScrollView>
    </View>
  );
}

function PaletteAccent(palette: readonly string[], index: number) {
  return palette[index] ?? palette[palette.length - 1];
}
