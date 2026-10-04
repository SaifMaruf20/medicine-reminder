import React from 'react';
import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { Colors } from '../../src/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'হোম',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '🏠' : '🏡'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="medicines"
        options={{
          title: 'ওষুধ',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>💊</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: 'স্বাস্থ্য',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>📈</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="prescriptions"
        options={{
          title: 'প্রেসক্রিপশন',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>📋</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="emergency"
        options={{
          title: 'জরুরি ID',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>🆘</Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: Colors.border,
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
