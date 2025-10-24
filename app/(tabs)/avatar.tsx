import { Edit3, LogOut, Moon, Settings, Shield, Sun, UsersRound } from '@tamagui/lucide-icons';
import { doc, getDoc } from 'firebase/firestore';
import { useContext, useEffect, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { Avatar, Button, Card, ListItem, Separator, Switch, Text, XStack, YStack } from 'tamagui';

import { ThemePreferenceContext } from '@/app/_layout';
import { firebaseAuth, firebaseDb } from '@/config/firebase';
import { ThemeColors, accentPalette, darkPalette, lightPalette } from '@/constants/tamagui-theme';
import { BrandSpacing, BrandTypography } from '@/design-system';
import { withAlpha } from '@/utils/color';
import { usePermissions } from '@/hooks/use-permissions';

export default function AvatarScreen() {
  const { themeName, setThemeName } = useContext(ThemePreferenceContext);
  const palette = ThemeColors[themeName];
  const basePalette = themeName === 'dark' ? darkPalette : lightPalette;
  const permissions = usePermissions();

  const [profileName, setProfileName] = useState<string>('');

  const colors = useMemo(() => {
    const accentSpectrum = accentPalette[themeName];
    return {
      background: palette.background,
      card: basePalette[themeName === 'dark' ? 3 : 1],
      border: basePalette[themeName === 'dark' ? 6 : 7],
      surface: basePalette[themeName === 'dark' ? 5 : 2],
      divider: basePalette[themeName === 'dark' ? 7 : 8],
      text: palette.text,
      secondary: basePalette[themeName === 'dark' ? 9 : 6],
      accent: palette.tint,
      avatarBackground: accentSpectrum[themeName === 'dark' ? 5 : 2],
      avatarText: palette.accentForeground,
      shadow: withAlpha(palette.tint, themeName === 'dark' ? 0.22 : 0.14),
      thumbBackground: basePalette[themeName === 'dark' ? 2 : 0],
      thumbIcon: themeName === 'dark' ? palette.accentForeground : palette.tint,
      thumbTrack: accentSpectrum[themeName === 'dark' ? 3 : 1],
    };
  }, [basePalette, palette, themeName]);

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
        paddingTop: BrandSpacing.stackGap + BrandSpacing.elementGap,
        paddingBottom: BrandSpacing.stackGap,
        gap: BrandSpacing.stackGap,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text fontFamily={BrandTypography.tagline.fontFamily} fontSize={22} fontWeight='700' color={colors.text}>
        My Profile
      </Text>
      <Card padding="$4" backgroundColor={colors.card} bordered borderColor={colors.border} gap="$3" shadowColor={colors.shadow} shadowRadius={12}>
        <XStack ai="center" gap="$3">
          <Avatar size="$5" circular bg={colors.avatarBackground} ai="center" jc="center">
            <Avatar.Image src={firebaseAuth?.currentUser?.photoURL ?? undefined} />
            <Avatar.Fallback ai="center" jc="center">
              <Text color={colors.avatarText} fontWeight="700">
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
            backgroundColor={colors.thumbTrack}
          >
            <Switch.Thumb
              backgroundColor={colors.thumbBackground}
              ai="center"
              jc="center"
            >
              {themeName === 'dark' ? (
                <Moon size={14} color={colors.thumbIcon} />
              ) : (
                <Sun size={14} color={colors.thumbIcon} />
              )}
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
            icon={Shield}
            backgroundColor={colors.surface}
            borderWidth={1}
            borderColor={colors.border}
            onPress={() => void permissions.requestPermissions()}
            pressTheme
          >
            <ListItem.Text numberOfLines={1} color={colors.text}>
              Permissions & Access
            </ListItem.Text>
            <ListItem.SubText numberOfLines={1} color={colors.secondary}>
              Camera {permissions.status.camera}, Mic {permissions.status.microphone}, Location {permissions.status.location}, Internet {permissions.status.internet}
            </ListItem.SubText>
          </ListItem>
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
