import { useContext, useMemo } from 'react';
import { ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Text, YStack } from 'tamagui';

import { ThemePreferenceContext } from '@/app/_layout';
import { ThemeColors } from '@/constants/tamagui-theme';
import { BrandSpacing, BrandTypography } from '@/design-system';
import { responsiveFont } from '@/utils/responsive-font';

const sampleNotifications = [
  {
    title: 'Family Gathering',
    body: 'Kutumb Kendra: Sunday dinner hosted by Radhika.',
    timestamp: '2h ago',
  },
  {
    title: 'Health Reminder',
    body: 'Aarogya Bandhan: Dad’s blood pressure check due tomorrow.',
    timestamp: '5h ago',
  },
  {
    title: 'Memory Shared',
    body: 'Smriti Mandal: Neha added photos from Nana’s anniversary.',
    timestamp: '1d ago',
  },
];

export default function NotificationsScreen() {
  const { themeName } = useContext(ThemePreferenceContext);
  const palette = ThemeColors[themeName];

  const colors = useMemo(
    () => ({
      background: palette.surface,
      text: palette.text,
      secondary: palette.subtleText,
      muted: palette.mutedText,
      card: palette.surface,
      shadow: palette.shadow,
    }),
    [palette]
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingHorizontal: BrandSpacing.gutter,
          paddingVertical: BrandSpacing.stackGap,
          gap: BrandSpacing.stackGap,
        }}
        showsVerticalScrollIndicator={false}
      >
        <YStack gap="$4">
          {sampleNotifications.map((note) => (
            <YStack
              key={`${note.title}-${note.timestamp}`}
              padding="$4"
              borderRadius="$6"
              backgroundColor={colors.card}
              shadowColor={colors.shadow}
              shadowRadius={14}
              gap="$2"
            >
              <Text fontFamily={BrandTypography.tagline.fontFamily} fontSize={responsiveFont(16)} color={colors.text}>
                {note.title}
              </Text>
              <Text color={colors.secondary} fontSize={responsiveFont(14)}>
                {note.body}
              </Text>
              <Text color={colors.muted} fontSize={responsiveFont(12)}>
                {note.timestamp}
              </Text>
            </YStack>
          ))}
        </YStack>
      </ScrollView>
    </>
  );
}
