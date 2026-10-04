import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/store/useAuthStore';
import { Colors } from '../src/constants/colors';

// Prevent splash screen from auto-hiding before state is ready
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const checkInitialAuth = useAuthStore((state) => state.checkInitialAuth);

  useEffect(() => {
    async function prepare() {
      try {
        await checkInitialAuth();
      } catch {
        // ignore error during bootstrap
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync().catch(() => {});
      }
    }

    prepare();
  }, [checkInitialAuth]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-medicine"
          options={{
            headerShown: true,
            title: 'নতুন ওষুধ যোগ করুন',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="generic-finder"
          options={{
            headerShown: true,
            title: 'বিকল্প জেনেরিক খুঁজুন',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="family-sharing"
          options={{
            headerShown: true,
            title: 'পরিবার শেয়ারিং',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="qr-scanner"
          options={{
            headerShown: true,
            title: 'QR কোড স্ক্যানার',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="appointments"
          options={{
            headerShown: true,
            title: 'ডাক্তারের সিরিয়াল ও অ্যাপয়েন্টমেন্ট',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="add-prescription"
          options={{
            headerShown: true,
            title: 'প্রেসক্রিপশন যোগ করুন',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
