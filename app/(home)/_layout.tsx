import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { useColorScheme } from 'nativewind';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider, DrawerActions, useNavigation } from '@react-navigation/native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import DrawerToggle from '@/components/DrawerToggle';

export default function AuthLayout() {
  const { colorScheme } = useColorScheme();
  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          headerTintColor: '#3B82F6',
        }}
      >
        <Stack.Screen
          name="homeLandingPage"
          options={{
            title: 'Home',
            headerShown: true,
            headerLeft: () => <DrawerToggle />,
          }}
        />
        <Stack.Screen
          name="chatWithTutor"
          options={{
            title: 'Chat with Tutor',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="cheatSheet"
          options={{
            title: 'Cheat Sheet',
            headerShown: true,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
