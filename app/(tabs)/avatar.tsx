import { Edit3, LogOut, Moon, Settings, Shield, Sun, UsersRound } from '@tamagui/lucide-icons';
import { doc, getDoc } from 'firebase/firestore';
import { useContext, useEffect, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { Avatar, Button, Card, ListItem, Separator, Switch, Text, XStack, YStack } from 'tamagui';

import { ThemePreferenceContext } from '@/app/_layout';
import { firebaseAuth, firebaseDb } from '@/config/firebase';
import { ThemeColors, accentPalette } from '@/constants/tamagui-theme';
import { BrandSpacing, BrandTypography } from '@/design-system';
import { withAlpha } from '@/utils/color';
import { usePermissions } from '@/hooks/use-permissions';

export default function AvatarScreen() {
  const { themeName, setThemeName } = useContext(ThemePreferenceContext);
  const palette = ThemeColors[themeName];
  const permissions = usePermissions();

  const [profileName, setProfileName] = useState<string>('');

  const colors = useMemo(() => {
    const accentSpectrum = accentPalette[themeName];
    return {
      background: palette.surface,
      card: palette.surface,
      surface: palette.surfaceMuted,
      divider: palette.border,
      text: palette.text,
      secondary: palette.subtleText,
      accent: palette.accent,
      avatarBackground: palette.accent,
      avatarText: palette.accentForeground,
      shadow: palette.elevatedShadow,
      thumbBackground: themeName === 'dark' ? palette.surfaceAlt : palette.surface,
      thumbIcon: themeName === 'dark' ? palette.text : palette.accent,
      thumbTrack: withAlpha(accentSpectrum[themeName === 'dark' ? 6 : 4], themeName === 'dark' ? 0.4 : 0.32),
      buttonBackground: palette.surface,
    };
  }, [palette, themeName]);

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
      <Card padding="$4" backgroundColor={colors.card} gap="$3" shadowColor={colors.shadow} shadowRadius={18}>
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
          <Button
            size="$2"
            circular
            icon={<Edit3 color={colors.text} size={16} />}
            backgroundColor={colors.buttonBackground}
            pressStyle={{ scale: 0.96 }}
          />
        </XStack>

        <XStack ai="center" jc="space-between" mt="$3">
          <Text fontWeight="600" color={colors.text}>
            Theme
          </Text>
          <Switch
            checked={themeName === 'dark'}
            onCheckedChange={(value) => setThemeName(value ? 'dark' : 'light')}
            backgroundColor={colors.thumbTrack}
            checkedStyle={{ backgroundColor: palette.accent }}
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

      <Card padding="$3" backgroundColor={colors.card} shadowColor={colors.shadow} shadowRadius={16}>
        <YStack gap="$3">
          {[
            { icon: UsersRound, label: 'Parivar Hub' },
            { icon: UsersRound, label: 'Invite Member' },
          ].map((item) => (
            <ListItem
              key={item.label}
              borderRadius="$6"
              backgroundColor={colors.surface}
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

      <Card padding="$3" backgroundColor={colors.card} shadowColor={colors.shadow} shadowRadius={16}>
        <YStack gap="$2">
          <ListItem
            borderRadius="$6"
            icon={Shield}
            backgroundColor={colors.surface}
            onPress={() => void permissions.requestPermissions()}
            pressTheme
          >
            <YStack gap="$1">
              <ListItem.Text numberOfLines={1} color={colors.text}>
                Permissions & Access
              </ListItem.Text>
              <Text color={colors.secondary} fontSize={12}>
                Camera {permissions.status.camera}, Mic {permissions.status.microphone}, Location {permissions.status.location}, Internet {permissions.status.internet}
              </Text>
            </YStack>
          </ListItem>
          <ListItem
            borderRadius="$6"
            icon={Settings}
            backgroundColor={colors.surface}
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
