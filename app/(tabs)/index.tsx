import { Bell, Menu, Edit3, Settings, UsersRound, LogOut, Sun, Moon } from '@tamagui/lucide-icons';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, DrawerLayoutAndroid, Modal, PanResponder, Platform, ScrollView, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Button, Card, Paragraph, Switch, Text, XStack, YStack, Separator } from 'tamagui';

import { FamilyCardIllustration } from '@/assets/images/family-card-illustration';
import { firebaseAuth, firebaseDb } from '@/config/firebase';
import { BrandSpacing, BrandTypography } from '@/design-system';
import { ThemePreferenceContext } from '@/app/_layout';
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
  const initialNameRef = useRef<string | null>(typeof params.profileName === 'string' ? params.profileName : null);
  const drawerRef = useRef<DrawerLayoutAndroid | null>(null);
  const [iosDrawerVisible, setIosDrawerVisible] = useState(false);
  const [profileName, setProfileName] = useState<string>(initialNameRef.current ?? '');
  const drawerWidth = 320;
  const iosDrawerTranslate = useRef(new Animated.Value(-drawerWidth)).current;
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
      style={{ flex: 1, backgroundColor: '#f4f1ff' }}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 56, flexGrow: 1 }}
    >
      <YStack flex={1} gap="$4">
        <Card padding="$4" backgroundColor="#ffffff" bordered borderColor="rgba(148,124,255,0.25)" gap="$3" shadowColor="rgba(92,70,205,0.12)" shadowRadius={12}>
          <XStack ai="center" gap="$3">
            <Avatar size="$5" circular bg="rgba(148,124,255,0.9)" ai="center" jc="center">
              <Avatar.Image src={firebaseAuth?.currentUser?.photoURL ?? undefined} />
              <Avatar.Fallback ai="center" jc="center">
                <Text color="#fff" fontWeight="700">{firstName.charAt(0).toUpperCase()}</Text>
              </Avatar.Fallback>
            </Avatar>
            <YStack flex={1}>
              <Text fontSize={18} fontWeight="700">{profileName || firstName}</Text>
              <Text color="rgba(49,38,92,0.6)" fontSize={12}>ParivarOS Member</Text>
            </YStack>
            <Button size="$2" circular icon={Edit3} variant="outlined" borderColor="rgba(148,124,255,0.4)" />
          </XStack>

          <XStack ai="center" jc="space-between" mt="$3">
            <Text fontWeight="600">Theme</Text>
            <Switch value={themeName === 'dark'} onValueChange={(value) => setThemeName(value ? 'dark' : 'light')}>
              <Switch.Thumb icon={themeName === 'dark' ? Moon : Sun} />
            </Switch>
          </XStack>
        </Card>

        <Card padding="$3" backgroundColor="#fff" bordered borderColor="rgba(148,124,255,0.2)">
          <YStack gap="$2">
            {mainMenuItems.map((item) => (
              <Button
                key={item.label}
                justifyContent="flex-start"
                icon={item.icon}
                variant="outlined"
                borderColor="rgba(148,124,255,0.2)"
                backgroundColor="rgba(148,124,255,0.12)"
                paddingHorizontal="$4"
                paddingVertical="$3"
                borderRadius="$5"
                width="100%"
              >
                <Text numberOfLines={1}>{item.label}</Text>
              </Button>
            ))}
          </YStack>
        </Card>

        <YStack gap="$3" marginTop="auto" paddingBottom="$6">
          <Separator borderColor="rgba(148,124,255,0.2)" />
          <Button
            justifyContent="flex-start"
            icon={Settings}
            variant="ghost"
            paddingHorizontal="$4"
            paddingVertical="$3"
            width="100%"
            borderRadius="$5"
            backgroundColor="rgba(148,124,255,0.12)"
          >
            <Text numberOfLines={1}>Settings</Text>
          </Button>
          <Button
            justifyContent="flex-start"
            icon={LogOut}
            variant="ghost"
            paddingHorizontal="$4"
            paddingVertical="$3"
            width="100%"
            borderRadius="$5"
            backgroundColor="rgba(148,124,255,0.12)"
          >
            <Text numberOfLines={1}>Logout</Text>
          </Button>
        </YStack>
      </YStack>
    </ScrollView>
  );
  const content = (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f4f1ff' }}
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
              <Text fontSize={12} color="rgba(49,38,92,0.6)">Namaste,</Text>
              <Text fontSize={16} fontFamily={BrandTypography.tagline.fontFamily}>
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

      <Card padding="$5" bordered borderColor="rgba(148,124,255,0.25)" backgroundColor="#fff" gap="$4" shadowRadius={20} shadowColor="rgba(92,70,205,0.18)">
        <YStack ai="center" gap="$3">
          <FamilyCardIllustration width={220} height={140} />
          <Text fontSize={18} fontFamily={BrandTypography.tagline.fontFamily} color="rgba(68,42,160,1)" textAlign="center">
            You haven&apos;t joined a Parivar yet.
          </Text>
          <Paragraph textAlign="center" color="rgba(67,54,115,0.7)" fontSize={14}>
            Join or create a parivar to share updates, celebrate milestones, and stay close to your people.
          </Paragraph>
        </YStack>
        <XStack gap="$3" flexWrap="wrap">
          <Button flex={1} size="$3" theme="accent">
            Join Parivar
          </Button>
          <Button flex={1} size="$3" variant="outlined" borderColor="rgba(148,124,255,0.4)">
            Create Parivar
          </Button>
        </XStack>
      </Card>

      <Card padding="$4" bordered borderColor="rgba(148,124,255,0.25)" backgroundColor="#efe9ff" gap="$3">
        <Text textAlign="center" color="rgba(148,124,255,0.8)" fontWeight="600" fontSize={14}>
          {mockQuote.category}
        </Text>
        <Paragraph textAlign="center" color="rgba(49,38,92,0.75)" fontSize={14}>
          “{mockQuote.text}”
        </Paragraph>
        <Text textAlign="center" color="rgba(49,38,92,0.5)" fontSize={13}>
          — {mockQuote.author}
        </Text>
      </Card>

      <YStack gap="$3">
        <Text fontFamily={BrandTypography.tagline.fontFamily} fontSize={16}>
          Quick Stats
        </Text>
        <XStack flexWrap="wrap" gap="$3">
          {summaryCards.map((card) => (
            <Card
              key={card.title}
              bordered
              borderColor="rgba(148,124,255,0.2)"
              backgroundColor="#fff"
              padding="$4"
              width="48%"
              gap="$2"
            >
              <Text color="rgba(49,38,92,0.8)" fontWeight="600" fontSize={14}>
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
      <SafeAreaView style={{ flex: 1 }}>{content}</SafeAreaView>
    </DrawerLayoutAndroid>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f1ff' }}>
      {Platform.OS === 'android' ? drawerLayout : content}
      {Platform.OS !== 'android' && (
        <Modal
          visible={iosDrawerVisible}
          animationType="none"
          transparent
          onRequestClose={closeDrawer}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', flexDirection: 'row' }}>
            <Animated.View
              {...panResponder.panHandlers}
              style={{
                width: drawerWidth,
                transform: [{ translateX: iosDrawerTranslate }],
              }}
            >
              <View style={{ flex: 1, backgroundColor: '#f4f1ff', paddingTop: 48 }}>{drawerContent}</View>
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
