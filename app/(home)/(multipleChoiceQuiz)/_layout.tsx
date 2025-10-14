import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          headerTintColor: '#3B82F6',
        }}
      >
        <Stack.Screen
          name="main"
          options={{
            title: 'Quizzes',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="quiz"
          options={{
            title: 'Goodluck!!!',
            headerShown: true,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
