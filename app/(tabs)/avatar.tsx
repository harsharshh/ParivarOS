import { useContext, useEffect, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { Avatar, Button, Card, ListItem, Separator, Switch, Text, XStack, YStack } from 'tamagui';
import { Moon, Sun, Edit3, Settings, UsersRound, LogOut } from '@tamagui/lucide-icons';
import { doc, getDoc } from 'firebase/firestore';

import { ThemePreferenceContext } from '@/app/_layout';
import { BrandSpacing, BrandTypography } from '@/design-system';
import { ThemeColors, darkPalette, lightPalette } from '@/constants/tamagui-theme';
import { firebaseAuth, firebaseDb } from '@/config/firebase';

export default function AvatarScreen() {
  const { themeName, setThemeName } = useContext(ThemePreferenceContext);
  const palette = ThemeColors[themeName];
  const basePalette = themeName === 'dark' ? darkPalette : lightPalette;

  const [profileName, setProfileName] = useState<string>('');

  const colors = useMemo(
    () => ({
      background: palette.background,
      card: basePalette[themeName === 'dark' ? 3 : 1],
      border: basePalette[themeName === 'dark' ? 6 : 7],
      surface: basePalette[themeName === 'dark' ? 5 : 2],
      divider: basePalette[themeName === 'dark' ? 7 : 8],
      text: palette.text,
      secondary: basePalette[themeName === 'dark' ? 9 : 6],
    }),
    [palette, basePalette, themeName]
  );

  useEffect(() => {
    const loadProfile = async () => {
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

    void loadProfile();
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingHorizontal: BrandSpacing.gutter,
        paddingVertical: BrandSpacing.stackGap,
        gap: BrandSpacing.stackGap,
      }}
    >
      <Text fontFamily={BrandTypography.tagline.fontFamily} fontSize={22} fontWeight='700' color={colors.text}>
        My Profile
      </Text>
      <Card padding="$4" backgroundColor={colors.card} bordered borderColor={colors.border} gap="$3" shadowColor="rgba(92,70,205,0.12)" shadowRadius={12}>
        <XStack ai="center" gap="$3">
          <Avatar size="$5" circular bg="rgba(148,124,255,0.9)" ai="center" jc="center">
            <Avatar.Image src={firebaseAuth?.currentUser?.photoURL ?? undefined} />
            <Avatar.Fallback ai="center" jc="center">
              <Text color="#fff" fontWeight="700">
                {profileName.charAt(0).toUpperCase()}
              </Text>
            </Avatar.Fallback>
          </Avatar>
          <YStack flex={1}>
            <Text fontSize={18} fontWeight="700" color={colors.text}>
              {profileName}
            </Text>
            <Text color={colors.secondary} fontSize={12}>
              ParivarOS Member
            </Text>
          </YStack>
          <Button size="$2" circular icon={Edit3} variant="outlined" borderColor={colors.border} />
        </XStack>

        <XStack ai="center" jc="space-between" mt="$3">
          <Text fontWeight="600" color={colors.text}>
            Theme
          </Text>
          <Switch
            checked={themeName === 'dark'}
            onCheckedChange={(value) => setThemeName(value ? 'dark' : 'light')}
          >
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

      <Card padding="$3" backgroundColor={colors.card} bordered borderColor={colors.border}>
        <YStack gap="$3">
          {[
            { icon: UsersRound, label: 'Parivar Hub' },
            { icon: UsersRound, label: 'Invite Member' },
          ].map((item) => (
            <ListItem
              key={item.label}
              borderRadius="$6"
              backgroundColor={colors.surface}
              borderWidth={1}
              borderColor={colors.border}
              icon={item.icon}
              pressTheme
            >
              <ListItem.Text numberOfLines={1} color={colors.text}>
                {item.label}
              </ListItem.Text>
            </ListItem>
          ))}
        </YStack>
      </Card>

      <Separator borderColor={colors.divider} marginVertical="$2" />

      <Card padding="$3" backgroundColor={colors.card} bordered borderColor={colors.border}>
        <YStack gap="$2">
          <ListItem
            borderRadius="$6"
            icon={Settings}
            backgroundColor={colors.surface}
            borderWidth={1}
            borderColor={colors.border}
            pressTheme
          >
            <ListItem.Text numberOfLines={1} color={colors.text}>
              Settings
            </ListItem.Text>
          </ListItem>
          <ListItem
            borderRadius="$6"
            icon={LogOut}
            backgroundColor={colors.surface}
            borderWidth={1}
            borderColor={colors.border}
            pressTheme
          >
            <ListItem.Text numberOfLines={1} color={colors.text}>
              Logout
            </ListItem.Text>
          </ListItem>
        </YStack>
      </Card>
    </ScrollView>
  );
}
