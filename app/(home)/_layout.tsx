import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { useColorScheme } from 'nativewind';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';

export default function AuthLayout() {
  const { colorScheme } = useColorScheme();
  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      {/* <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} /> */}
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', headerTintColor: "#3B82F6", }}>
        <Stack.Screen
          name='homeLandingPage'
          options={{
            title: 'Home',
            headerShown: true,
            headerLeft: () => <DrawerToggleButton tintColor="#3B82F6"/>,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}