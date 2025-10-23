import { Bell, Menu, Edit3, Settings, UsersRound, LogOut, Sun, Moon } from '@tamagui/lucide-icons';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, DrawerLayoutAndroid, Modal, PanResponder, Platform, ScrollView, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Button, Card, ListItem, Paragraph, Separator, Switch, Text, XStack, YStack } from 'tamagui';

import { FamilyCardIllustration } from '@/assets/images/family-card-illustration';
import { firebaseAuth, firebaseDb } from '@/config/firebase';
import { BrandSpacing, BrandTypography } from '@/design-system';
import { ThemePreferenceContext } from '@/app/_layout';
import { ThemeColors, darkPalette, lightPalette } from '@/constants/tamagui-theme';
import { useLocalSearchParams } from 'expo-router';

const mockQuote = {
  category: 'Parivar Bonding',
  text: 'Celebrating every story keeps the family close.',
  author: 'ParivarOS',
};

const summaryCards = [
  { title: 'Parivar Circles', count: 0, accent: '#947CFF' },
  { title: 'Parivar Members', count: 1, accent: '#6C5CFE' },
  { title: 'Business Circles', count: 0, accent: '#5E4EE6' },
  { title: 'Upcoming Rituals', count: 0, accent: '#4F3BCB' },
];

export default function HomeScreen() {
  const { themeName, setThemeName } = useContext(ThemePreferenceContext);
  const params = useLocalSearchParams<{ profileName?: string }>();
  const palette = ThemeColors[themeName];
  const basePalette = themeName === 'dark' ? darkPalette : lightPalette;
  const initialNameRef = useRef<string | null>(typeof params.profileName === 'string' ? params.profileName : null);
  const drawerRef = useRef<DrawerLayoutAndroid | null>(null);
  const [iosDrawerVisible, setIosDrawerVisible] = useState(false);
  const [profileName, setProfileName] = useState<string>(initialNameRef.current ?? '');
  const drawerWidth = 320;
  const iosDrawerTranslate = useRef(new Animated.Value(-drawerWidth)).current;

  const backgroundColor = palette.background;
  const cardBackground = basePalette[themeName === 'dark' ? 3 : 1];
  const cardBorder = basePalette[themeName === 'dark' ? 6 : 7];
  const subtleSurface = basePalette[themeName === 'dark' ? 5 : 2];
  const dividerColor = basePalette[themeName === 'dark' ? 7 : 8];
  const primaryText = palette.text;
  const secondaryText = basePalette[themeName === 'dark' ? 9 : 6];
  const quoteCardBg = basePalette[themeName === 'dark' ? 4 : 2];
  const quoteAccent = palette.tint;
  const quoteText = basePalette[themeName === 'dark' ? 10 : 9];
  const quoteAuthor = basePalette[themeName === 'dark' ? 8 : 10];
  const statCardBg = basePalette[themeName === 'dark' ? 2 : 1];
  const statBorder = basePalette[themeName === 'dark' ? 7 : 8];
  const accentButtonBorder = palette.tint;
  const overlayShade = themeName === 'dark' ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.35)';

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Platform.OS !== 'android' && iosDrawerVisible && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderMove: (_, gesture) => {
          if (gesture.dx < 0) {
            iosDrawerTranslate.setValue(Math.max(-drawerWidth, gesture.dx));
          }
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx < -drawerWidth * 0.3) {
            closeDrawer();
          } else {
            Animated.timing(iosDrawerTranslate, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [closeDrawer, drawerWidth, iosDrawerTranslate, iosDrawerVisible]
  );

  useEffect(() => {
    const fetchProfile = async () => {
      if (!firebaseAuth?.currentUser || !firebaseDb) {
        return;
      }
      try {
        const snapshot = await getDoc(doc(firebaseDb, 'users', firebaseAuth.currentUser.uid));
        const data = snapshot.exists() ? (snapshot.data() as Record<string, unknown>) : {};
        const resolvedName =
          (data?.name as string | undefined)?.trim() ||
          firebaseAuth.currentUser.displayName ||
          firebaseAuth.currentUser.email?.split('@')[0] ||
          initialNameRef.current ||
          'Parivar Friend';
        setProfileName(resolvedName);
      } catch (error) {
        console.warn('Unable to fetch profile details', error);
        const fallback =
          firebaseAuth.currentUser?.displayName ||
          firebaseAuth.currentUser?.email?.split('@')[0] ||
          initialNameRef.current ||
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


  const openDrawer = useCallback(() => {
    if (Platform.OS === 'android') {
      drawerRef.current?.openDrawer();
    } else {
      setIosDrawerVisible(true);
      Animated.timing(iosDrawerTranslate, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [iosDrawerTranslate]);

  const closeDrawer = useCallback(() => {
    if (Platform.OS === 'android') {
      drawerRef.current?.closeDrawer();
    } else {
      Animated.timing(iosDrawerTranslate, {
        toValue: -drawerWidth,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setIosDrawerVisible(false));
    }
  }, [drawerWidth, iosDrawerTranslate]);

  const mainMenuItems = [
    { icon: UsersRound, label: 'Parivar Hub' },
    { icon: UsersRound, label: 'Invite Member' },
  ];

  const drawerContent = (
    <ScrollView
      style={{ flex: 1, backgroundColor }}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 56, flexGrow: 1 }}
    >
      <YStack flex={1} gap="$4">
        <Card padding="$4" backgroundColor={cardBackground} bordered borderColor={cardBorder} gap="$3" shadowColor="rgba(92,70,205,0.12)" shadowRadius={12}>
          <XStack ai="center" gap="$3">
            <Avatar size="$5" circular bg="rgba(148,124,255,0.9)" ai="center" jc="center">
              <Avatar.Image src={firebaseAuth?.currentUser?.photoURL ?? undefined} />
              <Avatar.Fallback ai="center" jc="center">
                <Text color="#fff" fontWeight="700">{firstName.charAt(0).toUpperCase()}</Text>
              </Avatar.Fallback>
            </Avatar>
            <YStack flex={1}>
              <Text fontSize={18} fontWeight="700" color={primaryText}>{profileName || firstName}</Text>
              <Text color={secondaryText} fontSize={12}>ParivarOS Member</Text>
            </YStack>
            <Button size="$2" circular icon={Edit3} variant="outlined" borderColor={accentButtonBorder} />
          </XStack>

          <XStack ai="center" jc="space-between" mt="$3">
            <Text fontWeight="600" color={primaryText}>Theme</Text>
            <Switch checked={themeName === 'dark'} onCheckedChange={(value) => setThemeName(value ? 'dark' : 'light')}>
              <Switch.Thumb
                backgroundColor={themeName === 'dark' ? 'rgba(255,255,255,0.18)' : '#fff'}
                ai="center"
                jc="center"
              >
                {themeName === 'dark' ? <Moon size={14} color="#fff" /> : <Sun size={14} color="#f7c948" />}
              </Switch.Thumb>
            </Switch>
          </XStack>
        </Card>

        <YStack gap="$2">
          {mainMenuItems.map((item) => (
            <ListItem
              key={item.label}
              borderRadius="$6"
              backgroundColor={subtleSurface}
              borderWidth={1}
              borderColor={statBorder}
              icon={item.icon}
              pressTheme
            >
              <ListItem.Text numberOfLines={1} color={primaryText}>{item.label}</ListItem.Text>
            </ListItem>
          ))}
        </YStack>

        <YStack gap="$2" marginTop="auto" paddingBottom="$6">
          <Separator borderColor={dividerColor} />
          <ListItem
            borderRadius="$6"
            icon={Settings}
            backgroundColor={subtleSurface}
            borderWidth={1}
            borderColor={dividerColor}
            pressTheme
          >
            <ListItem.Text numberOfLines={1} color={primaryText}>Settings</ListItem.Text>
          </ListItem>
          <ListItem
            borderRadius="$6"
            icon={LogOut}
            backgroundColor={subtleSurface}
            borderWidth={1}
            borderColor={dividerColor}
            pressTheme
          >
            <ListItem.Text numberOfLines={1} color={primaryText}>Logout</ListItem.Text>
          </ListItem>
        </YStack>
      </YStack>
    </ScrollView>
  );
  const content = (
    <ScrollView
      style={{ flex: 1, backgroundColor }}
      contentContainerStyle={{ paddingHorizontal: BrandSpacing.gutter, paddingBottom: BrandSpacing.stackGap, gap: BrandSpacing.stackGap }}
    >
      <XStack ai="center" jc="space-between" mt="$4">
        <Button unstyled onPress={openDrawer} pressStyle={{ opacity: 0.6 }}>
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
              <Text fontSize={12} color={secondaryText}>Namaste,</Text>
              <Text fontSize={16} fontFamily={BrandTypography.tagline.fontFamily} color={primaryText}>
                 {firstName}
              </Text>
            </YStack>
          </XStack>
        </Button>

        <XStack gap="$3">
          <Button size="$3" circular variant="outlined" icon={Menu} onPress={openDrawer} />
          <Button size="$3" circular variant="outlined" icon={Bell} />
        </XStack>
      </XStack>

      <Card padding="$5" bordered borderColor={cardBorder} backgroundColor={cardBackground} gap="$4" shadowRadius={20} shadowColor="rgba(92,70,205,0.18)">
        <YStack ai="center" gap="$3">
          <FamilyCardIllustration width={220} height={140} />
          <Text fontSize={18} fontFamily={BrandTypography.tagline.fontFamily} color={primaryText} textAlign="center">
            You haven&apos;t joined a Parivar yet.
          </Text>
          <Paragraph textAlign="center" color={secondaryText} fontSize={14}>
            Join or create a parivar to share updates, celebrate milestones, and stay close to your people.
          </Paragraph>
        </YStack>
        <XStack gap="$3" flexWrap="wrap">
          <Button flex={1} size="$3" theme="accent">
            Join Parivar
          </Button>
          <Button flex={1} size="$3" variant="outlined" borderColor={accentButtonBorder}>
            Create Parivar
          </Button>
        </XStack>
      </Card>

      <Card padding="$4" bordered borderColor={cardBorder} backgroundColor={quoteCardBg} gap="$3">
        <Text textAlign="center" color={quoteAccent} fontWeight="600" fontSize={14}>
          {mockQuote.category}
        </Text>
        <Paragraph textAlign="center" color={quoteText} fontSize={14}>
          “{mockQuote.text}”
        </Paragraph>
        <Text textAlign="center" color={quoteAuthor} fontSize={13}>
          — {mockQuote.author}
        </Text>
      </Card>

      <YStack gap="$3">
        <Text fontFamily={BrandTypography.tagline.fontFamily} fontSize={16} color={primaryText}>
          Quick Stats
        </Text>
        <XStack flexWrap="wrap" gap="$3">
          {summaryCards.map((card) => (
            <Card
              key={card.title}
              bordered
              borderColor={statBorder}
              backgroundColor={statCardBg}
              padding="$4"
              width="48%"
              gap="$2"
            >
              <Text color={primaryText} fontWeight="600" fontSize={14}>
                {card.title}
              </Text>
              <Text fontSize={22} fontWeight="700" color={card.accent}>
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

  const drawerLayout = (
    <DrawerLayoutAndroid
      ref={(ref) => {
        drawerRef.current = ref;
      }}
      drawerWidth={drawerWidth}
      renderNavigationView={() => drawerContent}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor }}>{content}</SafeAreaView>
    </DrawerLayoutAndroid>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      {Platform.OS === 'android' ? drawerLayout : content}
      {Platform.OS !== 'android' && (
        <Modal
          visible={iosDrawerVisible}
          animationType="none"
          transparent
          onRequestClose={closeDrawer}
        >
          <View style={{ flex: 1, backgroundColor: overlayShade, flexDirection: 'row' }}>
            <Animated.View
              {...panResponder.panHandlers}
              style={{
                width: drawerWidth,
                transform: [{ translateX: iosDrawerTranslate }],
              }}
            >
              <View style={{ flex: 1, backgroundColor, paddingTop: 48 }}>{drawerContent}</View>
            </Animated.View>
            <TouchableWithoutFeedback onPress={closeDrawer}>
              <View style={{ flex: 1 }} />
            </TouchableWithoutFeedback>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
