import { memo } from 'react';
import { Button, Card, Paragraph, Text, YStack } from 'tamagui';

import { FamilyCardIllustration } from '@/assets/images/family-card-illustration';
import { ThemeColors } from '@/constants/tamagui-theme';

type ParivarCtaCardProps = {
  title: string;
  description: string;
  buttonLabel: string;
  onPress: () => void;
  themeName: 'light' | 'dark';
  backgroundColor: string;
  borderColor: string;
  shadowColor: string;
  descriptionColor: string;
  buttonTheme?: 'accent' | 'primary';
};

export const ParivarCtaCard = memo(function ParivarCtaCard({
  title,
  description,
  buttonLabel,
  onPress,
  themeName,
  backgroundColor,
  borderColor,
  shadowColor,
  descriptionColor,
  buttonTheme = 'accent',
}: ParivarCtaCardProps) {
  const palette = ThemeColors[themeName];

  return (
    <Card
      padding="$5"
      bordered
      borderColor={borderColor}
      backgroundColor={backgroundColor}
      gap="$4"
      shadowColor={shadowColor}
     // shadowRadius={20}
    >
      <YStack ai="center" gap="$3">
        <FamilyCardIllustration width={220} height={140} theme={themeName} />
        <Text fontSize={18} fontFamily="Inter SemiBold" color={palette.text} textAlign="center">
          {title}
        </Text>
        <Paragraph color={descriptionColor} fontSize={14} textAlign="center">
          {description}
        </Paragraph>
      </YStack>
      <Button size="$3" theme={buttonTheme} onPress={onPress}>
        {buttonLabel}
      </Button>
    </Card>
  );
});
