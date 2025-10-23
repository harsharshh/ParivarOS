import { Tabs } from 'expo-router';
import React, { useContext } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemePreferenceContext } from '@/app/_layout';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const systemScheme = useColorScheme();
  const { themeName } = useContext(ThemePreferenceContext);
  const activeScheme = themeName ?? systemScheme ?? 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[activeScheme].tint,
        tabBarInactiveTintColor: Colors[activeScheme].icon,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Ionicons name="paper-plane" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
