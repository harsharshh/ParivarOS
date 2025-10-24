import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Smile, Send, MessageCircle } from '@tamagui/lucide-icons';
import { Button, Input, Text, XStack, YStack } from 'tamagui';

import { ThemePreferenceContext } from '@/app/_layout';
import { ThemeColors, accentPalette, darkPalette, lightPalette } from '@/constants/tamagui-theme';
import { BrandSpacing, BrandTypography } from '@/design-system';
import { withAlpha } from '@/utils/color';

type ChatMessage = {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  isOwn?: boolean;
};

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    author: 'Neha',
    content: 'Good morning fam! Shared the photos from yesterday on Smriti Mandal.',
    timestamp: '08:12',
  },
  {
    id: '2',
    author: 'Karan',
    content: 'Aarogya update: Dadi finished her medication. Thank you SevaBank volunteers!',
    timestamp: '08:25',
  },
  {
    id: '3',
    author: 'You',
    content: 'Added tonight’s dinner menu to RasoiOS. Join by 8pm!',
    timestamp: '08:32',
    isOwn: true,
  },
  {
    id: '4',
    author: 'Radhika',
    content: 'Reminder: MandirOS aarti goes live at 7pm. See you all there.',
    timestamp: '09:10',
  },
];

export default function ConnectScreen() {
  const { themeName } = useContext(ThemePreferenceContext);
  const palette = ThemeColors[themeName];
  const basePalette = themeName === 'dark' ? darkPalette : lightPalette;
  const accentSpectrum = accentPalette[themeName];
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  const colors = useMemo(
    () => ({
      background: palette.background,
      card: basePalette[themeName === 'dark' ? 3 : 1],
      border: basePalette[themeName === 'dark' ? 6 : 7],
      text: palette.text,
      secondary: basePalette[themeName === 'dark' ? 9 : 6],
      bubbleOwn: withAlpha(accentSpectrum[themeName === 'dark' ? 8 : 4], themeName === 'dark' ? 0.34 : 0.22),
      bubbleOwnText: themeName === 'dark' ? palette.accentForeground : basePalette[10],
      bubbleOther: basePalette[themeName === 'dark' ? 5 : 0],
      bubbleOtherBorder: basePalette[themeName === 'dark' ? 7 : 2],
      timestamp: basePalette[themeName === 'dark' ? 8 : 5],
    }),
    [accentSpectrum, basePalette, palette, themeName]
  );

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        author: 'You',
        content: trimmed,
        timestamp,
        isOwn: true,
      },
    ]);
    setDraft('');
  };

  const scrollPaddingTop = headerHeight || insets.top + BrandSpacing.elementGap;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
          paddingTop={insets.top + BrandSpacing.elementGap / 2}
          paddingBottom={BrandSpacing.elementGap / 2}
          paddingHorizontal={BrandSpacing.gutter}
          gap="$2"
        >
          <XStack ai="center" gap="$3">
            <Button size="$3" circular variant="outlined" borderColor={colors.border} icon={MessageCircle} disabled />
            <Text
              fontFamily={BrandTypography.tagline.fontFamily}
              fontSize={22}
              fontWeight="700"
              color={colors.text}
            >
              Parivar Commons Chat
            </Text>
          </XStack>
          <Text color={colors.secondary} fontSize={14}>
            A global lounge for every connected family. Share updates, plans, and love with the whole parivar.
          </Text>
        </YStack>
      </YStack>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: BrandSpacing.gutter,
          paddingTop: scrollPaddingTop,
          paddingBottom: BrandSpacing.elementGap,
          gap: BrandSpacing.elementGap,
        }}
        showsVerticalScrollIndicator={false}
      >
        <YStack gap="$3">
          {messages.map((message) => {
            const alignment = message.isOwn ? 'flex-end' : 'flex-start';
            const bubbleBg = message.isOwn ? colors.bubbleOwn : colors.bubbleOther;
            const bubbleText = message.isOwn ? colors.bubbleOwnText : colors.text;
            const borderColor = message.isOwn ? colors.bubbleOwn : colors.bubbleOtherBorder;

            return (
              <XStack key={message.id} justifyContent={alignment}>
                <YStack
                  maxWidth="75%"
                  padding="$3"
                  borderRadius="$6"
                  backgroundColor={bubbleBg}
                  borderWidth={message.isOwn ? 0 : 1}
                  borderColor={borderColor}
                  gap="$1"
                >
                  <Text color={bubbleText} fontWeight="600" fontSize={13}>
                    {message.author}
                  </Text>
                  <Text color={bubbleText} fontSize={14}>
                    {message.content}
                  </Text>
                  <Text color={colors.timestamp} fontSize={11} textAlign="right">
                    {message.timestamp}
                  </Text>
                </YStack>
              </XStack>
            );
          })}
        </YStack>
      </ScrollView>

      <YStack
        paddingHorizontal={BrandSpacing.gutter}
        paddingBottom={Platform.OS === 'ios' ? BrandSpacing.elementGap : BrandSpacing.stackGap / 2}
        paddingTop={BrandSpacing.elementGap}
        backgroundColor={colors.background}
        borderTopWidth={1}
        borderTopColor={colors.border}
      >
        <XStack gap="$3" ai="center">
          <Button
            size="$4"
            variant="outlined"
            borderColor={colors.border}
            onPress={() => Alert.alert('Emojis', 'Emoji picker coming soon!')}
            icon={Smile}
          />
          <Input
            flex={1}
            value={draft}
            onChangeText={setDraft}
            placeholder="Share an update with the parivar..."
            size="$4"
            backgroundColor={colors.card}
            borderColor={colors.border}
            color={colors.text}
            placeholderTextColor={colors.secondary}
          />
          <Button
            size="$4"
            onPress={handleSend}
            disabled={!draft.trim()}
            backgroundColor={colors.bubbleOwn}
            icon={Send}
          />
        </XStack>
      </YStack>
    </KeyboardAvoidingView>
  );
}
