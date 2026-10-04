import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';
import { StorageService } from '../src/services/storage';
import { Colors } from '../src/constants/colors';

export default function IndexScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function determineRoute() {
      try {
        const onboarded = await StorageService.isOnboardingComplete();
        if (!onboarded) {
          router.replace('/(auth)/onboarding');
          return;
        }

        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      } catch {
        router.replace('/(auth)/login');
      } finally {
        setChecking(false);
      }
    }

    determineRoute();
  }, [isAuthenticated, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
