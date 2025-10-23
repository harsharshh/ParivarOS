import { useContext, useEffect, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { Avatar, Button, Card, Paragraph, Text, XStack, YStack } from 'tamagui';
import { Bell } from '@tamagui/lucide-icons';
import { doc, getDoc } from 'firebase/firestore';

import { FamilyCardIllustration } from '@/assets/images/family-card-illustration';
import { firebaseAuth, firebaseDb } from '@/config/firebase';
import { BrandSpacing, BrandTypography } from '@/design-system';
import { ThemePreferenceContext } from '@/app/_layout';
import { ThemeColors, darkPalette, lightPalette } from '@/constants/tamagui-theme';

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

  const [profileName, setProfileName] = useState<string>('Parivar Friend');

  const colors = useMemo(
    () => ({
      background: palette.background,
      card: basePalette[themeName === 'dark' ? 3 : 1],
      border: basePalette[themeName === 'dark' ? 6 : 7],
      accent: palette.tint,
      text: palette.text,
      secondary: basePalette[themeName === 'dark' ? 9 : 6],
    }),
    [palette, basePalette, themeName]
  );

  useEffect(() => {
    const fetchProfile = async () => {
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
    };

    void fetchProfile();
  }, []);

  const firstName = useMemo(() => {
    if (!profileName) return 'Parivar Friend';
    const [first] = profileName.split(' ');
    return first || profileName;
  }, [profileName]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingHorizontal: BrandSpacing.gutter,
        paddingBottom: BrandSpacing.stackGap,
        gap: BrandSpacing.stackGap,
      }}
    >
      <XStack ai="center" jc="space-between" mt="$4">
        <XStack ai="center" gap="$3">
          <Avatar size="$4" circular bg="rgba(148,124,255,0.9)" ai="center" jc="center">
            <Avatar.Image src={firebaseAuth?.currentUser?.photoURL ?? undefined} />
            <Avatar.Fallback ai="center" jc="center">
              <Text color="#fff" fontWeight="700" textAlign="center">
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

      <Card padding="$5" bordered borderColor={colors.border} backgroundColor={colors.card} gap="$4" shadowColor="rgba(92,70,205,0.18)" shadowRadius={20}>
        <YStack ai="center" gap="$3">
          <FamilyCardIllustration width={220} height={140} />
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
  );
}

function PaletteAccent(palette: readonly string[], index: number) {
  return palette[index] ?? palette[palette.length - 1];
}
