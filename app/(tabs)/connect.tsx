import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Smile, Send, MessageCircle } from '@tamagui/lucide-icons';
import { Button, Input, Text, XStack, YStack } from 'tamagui';

import { ThemePreferenceContext } from '@/app/_layout';
import { ThemeColors } from '@/constants/tamagui-theme';
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
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  const colors = useMemo(
    () => ({
      background: palette.surface,
      card: palette.surface,
      border: palette.border,
      text: palette.text,
      secondary: palette.subtleText,
      bubbleOwn: withAlpha(palette.accent, themeName === 'dark' ? 0.32 : 0.2),
      bubbleOwnText: palette.accentForeground,
      bubbleOther: palette.surface,
      timestamp: palette.mutedText,
      shadow: palette.shadow,
      headerBackground: palette.surface,
      iconBackground: palette.surface,
      iconColor: palette.text,
    }),
    [palette, themeName]
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
        <YStack paddingTop={insets.top + BrandSpacing.elementGap / 2} paddingHorizontal={BrandSpacing.gutter} paddingBottom={BrandSpacing.elementGap / 2}>
          <XStack
            backgroundColor={colors.background}
            borderRadius={20}
            paddingHorizontal={BrandSpacing.elementGap}
            paddingVertical={BrandSpacing.elementGap / 1.5}
            gap="$3"
            ai="center"
            shadowColor={colors.shadow}
            shadowRadius={26}
          >
            <XStack
              width={44}
              height={44}
              borderRadius={22}
              ai="center"
              jc="center"
              backgroundColor={colors.iconBackground}
              shadowColor={colors.shadow}
              shadowRadius={14}
            >
              <MessageCircle color={colors.iconColor} size={18} />
            </XStack>
            <YStack flex={1} gap="$1">
              <Text
                fontFamily={BrandTypography.tagline.fontFamily}
                fontSize={20}
                fontWeight="700"
                color={colors.text}
              >
                Parivar Commons Chat
              </Text>
              <Text color={colors.secondary} fontSize={14}>
                A global lounge for every connected family. Share updates, plans, and love with the whole parivar.
              </Text>
            </YStack>
          </XStack>
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
            return (
              <XStack key={message.id} justifyContent={alignment}>
                <YStack
                  maxWidth="75%"
                  padding="$3"
                  borderRadius="$6"
                  backgroundColor={bubbleBg}
                  gap="$1"
                  shadowColor={message.isOwn ? colors.shadow : 'transparent'}
                  shadowRadius={message.isOwn ? 10 : 0}
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
      >
        <XStack gap="$3" ai="center">
          <Button
            size="$4"
            backgroundColor={colors.card}
            color={colors.text}
            icon={Smile}
            onPress={() => Alert.alert('Emojis', 'Emoji picker coming soon!')}
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
            color={colors.bubbleOwnText}
            icon={Send}
          />
        </XStack>
      </YStack>
    </KeyboardAvoidingView>
  );
}
