
import AlertPersonalization from '@/components/AlertPersonalization';
import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { checkIfKeyExists } from '@/util/checkIfNewUser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { useNavigationContainerRef } from 'expo-router';
import Drawer from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { KeyboardProvider } from "react-native-keyboard-controller";

export {
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { setColorScheme, colorScheme } = useColorScheme();
  const [ready, setReady] = useState(false);
  const navigationRef = useNavigationContainerRef();

  const [openPersonalizationAlert, setOpenPersonalizationAlert] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = navigationRef.addListener('state', async () => {
      const exists = await checkIfKeyExists('name');
      setOpenPersonalizationAlert(!exists);
    });

    return unsubscribe;
  }, [navigationRef]);

  useEffect(() => {
    const initTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("theme");
        if (storedTheme === "light" || storedTheme === "dark") {
          setColorScheme(storedTheme);
        } else {
          setColorScheme("system");
        }
      } catch (err) {
        console.error("Error loading theme:", err);
        setColorScheme("system");
      } finally {
        setReady(true);
      }
    };

    initTheme();
  }, []);

  return (

    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <KeyboardProvider>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <AlertPersonalization open={openPersonalizationAlert} onOpenChange={setOpenPersonalizationAlert} />
        <Drawer screenOptions={{
          headerTintColor: "#3B82F6",
          drawerActiveTintColor: "#3B82F6",
          drawerInactiveTintColor: "#9CA3AF",
          drawerActiveBackgroundColor: "#E0F2FE",
        }}>
          <Drawer.Screen name="(home)" options={{
            headerShown: false, drawerLabel: "Home",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }} />
          <Drawer.Screen name="(settings)" options={{
            headerShown: false, drawerLabel: "Settings", title: "Settings",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }} />
        </Drawer>
        <PortalHost />
      </KeyboardProvider>
    </ThemeProvider>
  );
}