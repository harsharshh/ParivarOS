import { useContext, useMemo } from 'react';
import { ScrollView } from 'react-native';
import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { Card, Text, XStack, YStack } from 'tamagui';

import { ThemePreferenceContext } from '@/app/_layout';
import { ThemeColors } from '@/constants/tamagui-theme';
import { BrandSpacing, BrandTypography, StatsCard } from '@/design-system';
import { responsiveFont } from '@/utils/responsive-font';
import { withAlpha } from '@/utils/color';

type QuickStatMetric = {
  title: string;
  value: string;
  description: string;
};

type QuickStatFocusArea = {
  title: string;
  description: string;
};

type QuickStatConfig = {
  title: string;
  overview: string;
  hero: {
    value: string;
    label: string;
    caption: string;
  };
  metrics: QuickStatMetric[];
  focusAreas: QuickStatFocusArea[];
  suggestions: string[];
};

const quickStatConfigs: Record<string, QuickStatConfig> = {
  'parivar-members': {
    title: 'Parivar Members',
    overview:
      'See how your loved ones are connecting and where you might want to nudge for more engagement.',
    hero: {
      value: '12',
      label: 'Members connected',
      caption: 'Across immediate and extended family circles.',
    },
    metrics: [
      {
        title: 'Active this week',
        value: '9',
        description: 'Members who viewed or shared updates in the past 7 days.',
      },
      {
        title: 'Invites pending',
        value: '3',
        description: 'Family members still waiting to join your Parivar.',
      },
      {
        title: 'Core family setup',
        value: '75%',
        description: 'Profiles with completed DOB, blood group, and relation details.',
      },
    ],
    focusAreas: [
      {
        title: 'Profiles needing updates',
        description: 'Encourage members missing birthdays or photos to complete their profile.',
      },
      {
        title: 'Welcome the newcomers',
        description:
          'Send a warm note or share a family memory to help newly-joined relatives feel at home.',
      },
      {
        title: 'Strengthen inactive circles',
        description: 'Reconnect with elder relatives who have not visited recently.',
      },
    ],
    suggestions: [
      'Share a family highlight to spark conversation.',
      'Send invites again to relatives who have not accepted yet.',
      'Update relationship tags so every member knows how they are connected.',
    ],
  },
  'parivar-linked': {
    title: 'Parivar Linked',
    overview: 'Monitor the other Parivars you follow and the meaningful exchanges happening.',
    hero: {
      value: '3',
      label: 'Linked Parivars',
      caption: 'Families with shared stories and celebrations.',
    },
    metrics: [
      {
        title: 'Shared moments',
        value: '18',
        description: 'Updates exchanged with linked Parivars this month.',
      },
      {
        title: 'Pending collaborations',
        value: '2',
        description: 'Invitations awaiting confirmation for joint events or rituals.',
      },
      {
        title: 'Reciprocity score',
        value: '4.5',
        description: 'Average rating of how balanced your interactions feel.',
      },
    ],
    focusAreas: [
      {
        title: 'Celebrate together',
        description: 'Plan a shared event with your most active partner Parivar.',
      },
      {
        title: 'Revive quiet links',
        description: 'Reach out to Parivars that have been silent for over a month.',
      },
      {
        title: 'Share cultural gems',
        description: 'Exchange recipes, rituals, or songs that mean a lot to both families.',
      },
    ],
    suggestions: [
      'Send a gratitude note for recent support from a linked Parivar.',
      'Create a collaborative album to swap memories seamlessly.',
      'Schedule quarterly catch-ups with key family leads.',
    ],
  },
  events: {
    title: 'Events',
    overview:
      'Keep an eye on upcoming gatherings so every celebration and ritual stays coordinated.',
    hero: {
      value: '5',
      label: 'Upcoming events',
      caption: 'Including birthdays, anniversaries, and planned gatherings.',
    },
    metrics: [
      {
        title: 'Prepared checklists',
        value: '4',
        description: 'Events with assigned hosts, reminders, and preparation tasks.',
      },
      {
        title: 'Celebrations this week',
        value: '2',
        description: 'Special milestones happening in the next seven days.',
      },
      {
        title: 'Awaiting confirmation',
        value: '1',
        description: 'Events pending final approvals from key members.',
      },
    ],
    focusAreas: [
      {
        title: 'Finalize logistics',
        description: 'Confirm venues, timings, and rituals for the next two gatherings.',
      },
      {
        title: 'Assign hosts',
        description: 'Ensure each event has a family lead for coordination.',
      },
      {
        title: 'Capture memories',
        description: 'Plan who will record photos, videos, or voice memories during events.',
      },
    ],
    suggestions: [
      'Send reminders to participants about their responsibilities.',
      'Share the plan with relatives who live away so they can join virtually.',
      'Update the Parivar calendar to keep everyone aligned.',
    ],
  },
  'health-reminders': {
    title: 'Health Reminders',
    overview:
      'Track wellness routines and reminders to ensure the entire Parivar stays healthy together.',
    hero: {
      value: '2',
      label: 'Active reminders',
      caption: 'Tasks scheduled for medication, check-ups, and wellbeing habits.',
    },
    metrics: [
      {
        title: 'Completed this week',
        value: '6',
        description: 'Health reminders marked as done in the past seven days.',
      },
      {
        title: 'Overdue tasks',
        value: '1',
        description: 'Reminders that need immediate attention.',
      },
      {
        title: 'Care teams set',
        value: '4',
        description: 'Members who have an assigned caregiver or accountability partner.',
      },
    ],
    focusAreas: [
      {
        title: 'Support elders',
        description: 'Set gentle nudges or phone call reminders for senior members.',
      },
      {
        title: 'Sync medical records',
        description: 'Upload prescriptions and doctor notes for quick reference.',
      },
      {
        title: 'Celebrate health wins',
        description: 'Share short notes when someone completes a wellbeing goal.',
      },
    ],
    suggestions: [
      'Create a weekly rhythm where everyone logs their check-ins.',
      'Invite siblings or cousins to share responsibility for follow-ups.',
      'Add voice notes for complex routines to make them easier to follow.',
    ],
  },
};

export default function QuickStatDetailScreen() {
  const params = useLocalSearchParams<{ stat?: string }>();
  const slugParam = Array.isArray(params.stat) ? params.stat[0] : params.stat;
  const config = slugParam ? quickStatConfigs[slugParam] : undefined;

  const { themeName } = useContext(ThemePreferenceContext);
  const palette = ThemeColors[themeName];

  const colors = useMemo(
    () => ({
      background: palette.surface,
      text: palette.text,
      secondary: palette.subtleText,
      muted: palette.mutedText,
      cardBackground: palette.surface,
      highlightBackground: withAlpha(palette.accent, themeName === 'dark' ? 0.28 : 0.18),
      shadow: palette.shadow,
    }),
    [palette, themeName]
  );

  if (!config) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: config.title,
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
        <YStack gap="$3">
          <Text fontFamily={BrandTypography.tagline.fontFamily} fontSize={responsiveFont(16)} color={colors.text}>
            At a glance
          </Text>
          <Card
            padding="$4"
            borderRadius="$8"
            backgroundColor={colors.highlightBackground}
            gap="$2"
            shadowColor={colors.shadow}
            shadowRadius={18}
          >
            <Text color={colors.text} fontSize={responsiveFont(12)} textTransform="uppercase" letterSpacing={0.6}>
              {config.hero.label}
            </Text>
            <Text color={colors.text} fontSize={responsiveFont(32)} fontWeight="700">
              {config.hero.value}
            </Text>
            <Text color={colors.secondary} fontSize={responsiveFont(13)}>
              {config.hero.caption}
            </Text>
            <Text color={colors.secondary} fontSize={responsiveFont(13)}>
              {config.overview}
            </Text>
          </Card>
        </YStack>

        <YStack gap="$3">
          <Text fontFamily={BrandTypography.tagline.fontFamily} fontSize={responsiveFont(16)} color={colors.text}>
            Key metrics
          </Text>
          <XStack gap="$3" flexWrap="wrap">
            {config.metrics.map((metric) => (
              <StatsCard
                key={metric.title}
                title={metric.title}
                value={metric.value}
                description={metric.description}
                layout="half"
              />
            ))}
          </XStack>
        </YStack>

        <YStack gap="$3">
          <Text fontFamily={BrandTypography.tagline.fontFamily} fontSize={responsiveFont(16)} color={colors.text}>
            Focus areas
          </Text>
          <YStack gap="$3">
            {config.focusAreas.map((area) => (
              <Card
                key={area.title}
                padding="$4"
                borderRadius="$8"
                backgroundColor={colors.cardBackground}
                gap="$2"
                shadowColor={colors.shadow}
                shadowRadius={16}
              >
                <Text fontWeight="600" fontSize={responsiveFont(15)} color={colors.text}>
                  {area.title}
                </Text>
                <Text
                  color={colors.secondary}
                  fontSize={responsiveFont(13)}
                  lineHeight={responsiveFont(18, { minMultiplier: 0.9, maxMultiplier: 1.05 })}
                >
                  {area.description}
                </Text>
              </Card>
            ))}
          </YStack>
        </YStack>

        <YStack gap="$3">
          <Text fontFamily={BrandTypography.tagline.fontFamily} fontSize={responsiveFont(16)} color={colors.text}>
            Recommended next steps
          </Text>
          <Card
            padding="$4"
            borderRadius="$8"
            backgroundColor={colors.cardBackground}
            gap="$3"
            shadowColor={colors.shadow}
            shadowRadius={16}
          >
            <YStack gap="$2">
              {config.suggestions.map((suggestion) => (
                <Text
                  key={suggestion}
                  color={colors.secondary}
                  fontSize={responsiveFont(13)}
                  lineHeight={responsiveFont(18, { minMultiplier: 0.9, maxMultiplier: 1.05 })}
                >
                  {`\u2022 ${suggestion}`}
                </Text>
              ))}
            </YStack>
            <Text color={colors.muted} fontSize={responsiveFont(12)}>
              Tip: periodic check-ins keep everyone aligned and nurtured.
            </Text>
          </Card>
        </YStack>
      </ScrollView>
    </>
  );
}
