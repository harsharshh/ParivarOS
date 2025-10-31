import { Stack } from 'expo-router';

export default function QuickStatsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerBackTitleVisible: false,
      }}
    />
  );
}
