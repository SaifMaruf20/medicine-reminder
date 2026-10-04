import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../src/constants/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen
        name="otp"
        options={{
          headerShown: true,
          title: 'OTP যাচাইকরণ',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          headerShown: true,
          title: 'নিবন্ধন ও জরুরি প্রোফাইল',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack>
  );
}
