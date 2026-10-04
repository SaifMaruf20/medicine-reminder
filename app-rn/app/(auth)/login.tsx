import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [obscurePassword, setObscurePassword] = useState(true);

  const { login, isLoading, errorMessage } = useAuthStore();

  const handleFillDemo = () => {
    setPhone('01619504428');
    setPassword('Jovayer1234');
  };

  const handleLogin = async () => {
    const trimmedPhone = phone.trim();
    const trimmedPassword = password.trim();

    if (!trimmedPhone || !trimmedPassword) {
      Alert.alert('সতর্কতা', 'ফোন নম্বর এবং পাসওয়ার্ড দিন');
      return;
    }

    const success = await login(trimmedPhone, trimmedPassword);
    if (success) {
      router.replace('/(tabs)');
    } else if (errorMessage) {
      Alert.alert('লগইন ব্যর্থ', errorMessage);
    }
  };

  const handleRegister = () => {
    router.push({
      pathname: '/(auth)/otp',
      params: { purpose: 'registration' },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* App Branding */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>💊</Text>
          </View>
          <Text style={styles.appName}>ওষুধসাথী</Text>
          <Text style={styles.appTagline}>
            আপনার স্বাস্থ্য ও ওষুধ অনুস্মারকের সেরা সঙ্গী
          </Text>
        </View>

        {/* Demo Credentials Banner */}
        <View style={styles.demoBanner}>
          <View style={styles.demoHeader}>
            <Text style={styles.demoInfoIcon}>ℹ️</Text>
            <Text style={styles.demoTitle}>টেস্ট লগইন তথ্য (ডেমো)</Text>
            <TouchableOpacity
              style={styles.autoFillButton}
              onPress={handleFillDemo}
              activeOpacity={0.8}
            >
              <Text style={styles.autoFillText}>অটো-ফিল</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.demoDesc}>
            যেকোনো নিবন্ধিত ফোন ও পাসওয়ার্ড দিয়ে প্রবেশ করুন
          </Text>
        </View>

        <Text style={styles.sectionTitle}>লগইন করুন</Text>

        {/* Phone Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>ফোন নম্বর</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>📞</Text>
            <TextInput
              style={styles.textInput}
              placeholder="017XXXXXXXX"
              placeholderTextColor="#94A3B8"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>পাসওয়ার্ড</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.textInput}
              placeholder="পাসওয়ার্ড লিখুন"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={obscurePassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setObscurePassword(!obscurePassword)}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeIcon}>{obscurePassword ? '👁️' : '🙈'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>লগইন</Text>
          )}
        </TouchableOpacity>

        {/* Register Prompt */}
        <View style={styles.registerRow}>
          <Text style={styles.registerPrompt}>অ্যাকাউন্ট নেই? </Text>
          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.registerLink}>নতুন অ্যাকাউন্ট খুলুন</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(4, 120, 87, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 48,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  appTagline: {
    color: Colors.textLight,
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  demoBanner: {
    backgroundColor: 'rgba(4, 120, 87, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(4, 120, 87, 0.25)',
    padding: 14,
    marginBottom: 24,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  demoInfoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  demoTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primaryDark,
  },
  autoFillButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  autoFillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  demoDesc: {
    fontSize: 13,
    color: Colors.textDark,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textDark,
  },
  eyeButton: {
    padding: 6,
  },
  eyeIcon: {
    fontSize: 18,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerPrompt: {
    fontSize: 14,
    color: Colors.textLight,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});
