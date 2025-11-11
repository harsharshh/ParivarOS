import { useMemo } from 'react';
import { Avatar, Button, Card, Text, XStack, YStack, useThemeName } from 'tamagui';
import { Platform } from 'react-native';

import { ThemeColors, accentPalette } from '@/constants/tamagui-theme';
import { responsiveFont } from '@/utils/responsive-font';
import { withAlpha } from '@/utils/color';

export type ParivarMemberCardProps = {
  id?: string;
  name: string;
  relation: string;
  statusLabel?: string;
  note?: string;
  tags?: string[];
  avatarUri?: string;
  initials?: string;
  accentTone?: 'soft' | 'bold';
  actions?: React.ReactNode;
  onPressPrimary?: () => void;
  primaryActionLabel?: string;
};

export function ParivarMemberCard({
  name,
  relation,
  statusLabel,
  note,
  tags,
  avatarUri,
  initials,
  accentTone = 'soft',
  actions,
  onPressPrimary,
  primaryActionLabel = 'View details',
}: ParivarMemberCardProps) {
  const themeName = useThemeName();
  const colorScheme: 'light' | 'dark' = themeName?.toString().startsWith('dark') ? 'dark' : 'light';
  const palette = ThemeColors[colorScheme];
  const accentSpectrum = accentPalette[colorScheme];

  const colors = useMemo(
    () => ({
      background: palette.surface,
      shadow: palette.elevatedShadow,
      title: palette.text,
      subtitle: palette.subtleText,
      badgeBackground:
        accentTone === 'bold' ? accentSpectrum[6] : withAlpha(accentSpectrum[5], colorScheme === 'dark' ? 0.35 : 0.2),
      badgeText: accentTone === 'bold' ? palette.accentForeground : palette.text,
      chipBackground:
        colorScheme === 'dark'
          ? withAlpha(palette.accentStrong, 0.28)
          : withAlpha(accentSpectrum[3], 0.3),
      chipText: colorScheme === 'dark' ? palette.accentForeground : palette.text,
      avatarBackground:
        colorScheme === 'dark'
          ? withAlpha(accentSpectrum[7], 0.3)
          : withAlpha(accentSpectrum[5], 0.2),
      divider: withAlpha(palette.border, 0.6),
    }),
    [accentSpectrum, accentTone, colorScheme, palette]
  );

  return (
    <Card
      padding="$4"
      borderRadius="$8"
      backgroundColor={colors.background}
      shadowColor={colors.shadow}
      shadowRadius={18}
      {...(Platform.OS === 'android' ? { elevation: 4 } : {})}
      gap="$3"
    >
      <XStack gap="$3" ai="center">
        <Avatar size="$4" circular bg={colors.avatarBackground} ai="center" jc="center">
          {avatarUri ? (
            <Avatar.Image src={avatarUri} />
          ) : (
            <Avatar.Fallback ai="center" jc="center">
              <Text fontWeight="700" color={colors.title}>
                {(initials ?? name.charAt(0)).toUpperCase()}
              </Text>
            </Avatar.Fallback>
          )}
        </Avatar>
        <YStack flex={1} gap="$1">
          <XStack ai="center" gap="$2">
            <Text fontSize={responsiveFont(16)} fontWeight="700" color={colors.title}>
              {name}
            </Text>
            {statusLabel ? (
              <Text
                paddingHorizontal="$2"
                paddingVertical="$1"
                borderRadius="$6"
                backgroundColor={colors.badgeBackground}
                color={colors.badgeText}
                fontSize={responsiveFont(11, { min: 10, max: 12 })}
                fontWeight="600"
              >
                {statusLabel}
              </Text>
            ) : null}
          </XStack>
          <Text color={colors.subtitle} fontSize={responsiveFont(13)}>
            {relation}
          </Text>
          {note ? (
            <Text color={colors.subtitle} fontSize={responsiveFont(12)}>
              {note}
            </Text>
          ) : null}
        </YStack>
      </XStack>

      {Array.isArray(tags) && tags.length ? (
        <XStack gap="$2" flexWrap="wrap">
          {tags.map((tag) => (
            <Text
              key={`${name}-${tag}`}
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius="$6"
              backgroundColor={colors.chipBackground}
              color={colors.chipText}
              fontSize={responsiveFont(11, { min: 10, max: 12 })}
            >
              {tag}
            </Text>
          ))}
        </XStack>
      ) : null}

      {(actions || onPressPrimary) && (
        <XStack
          paddingTop="$2"
          marginTop="$2"
          borderTopWidth={1}
          borderTopColor={colors.divider}
          gap="$2"
          flexWrap="wrap"
        >
          {actions}
          {onPressPrimary ? (
            <Button
              size="$3"
              backgroundColor={palette.accent}
              color={palette.accentForeground}
              fontWeight="700"
              onPress={onPressPrimary}
              flexShrink={0}
            >
              {primaryActionLabel}
            </Button>
          ) : null}
        </XStack>
      )}
    </Card>
  );
}
