import { memo } from 'react';
import { Button, Card, Paragraph, Text, YStack } from 'tamagui';
import { Platform } from 'react-native';

import { FamilyCardIllustration } from '@/assets/images/family-card-illustration';
import { ThemeColors } from '@/constants/tamagui-theme';
import { responsiveFont } from '@/utils/responsive-font';

type ParivarCtaCardProps = {
  title: string;
  description: string;
  buttonLabel: string;
  onPress: () => void;
  themeName: 'light' | 'dark';
  backgroundColor?: string;
  shadowColor?: string;
  descriptionColor?: string;
  buttonTheme?: 'accent' | 'primary' | 'tint' | 'surface' | 'outline';
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  marginTop?: number;
};

export const ParivarCtaCard = memo(function ParivarCtaCard({
  title,
  description,
  buttonLabel,
  onPress,
  themeName,
  backgroundColor,
  shadowColor,
  descriptionColor,
  buttonTheme = 'accent',
  buttonBackgroundColor,
  buttonTextColor,
  marginTop,
}: ParivarCtaCardProps) {
  const palette = ThemeColors[themeName];
  const cardBackground = backgroundColor ?? palette.surface;
  const cardShadow = shadowColor ?? palette.elevatedShadow;
  const bodyText = descriptionColor ?? palette.subtleText;

  return (
    <Card
      padding="$5"
      backgroundColor={cardBackground}
      gap="$4"
      shadowColor={cardShadow}
      shadowRadius={20}
      marginTop={marginTop}
      {...(Platform.OS === 'android' ? { elevation: 6 } : {})}
    >
      <YStack ai="center" gap="$3">
        <FamilyCardIllustration width={220} height={140} theme={themeName} />
        <Text fontSize={responsiveFont(18)} fontFamily="Inter SemiBold" color={palette.text} textAlign="center">
          {title}
        </Text>
        <Paragraph color={bodyText} fontSize={responsiveFont(14)} textAlign="center">
          {description}
        </Paragraph>
      </YStack>
      <Button
        size="$3"
        theme={buttonTheme}
        onPress={onPress}
        backgroundColor={buttonBackgroundColor}
      >
        <Text color={buttonTextColor ?? palette.accentForeground} fontWeight="600">
          {buttonLabel}
        </Text>
      </Button>
    </Card>
  );
});
