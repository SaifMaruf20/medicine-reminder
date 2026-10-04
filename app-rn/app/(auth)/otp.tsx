import React, { useState, useEffect, useRef } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const purpose = (params.purpose as string) || 'registration';

  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);

  const timerRef = useRef<any>(null);
  const { sendOtp, verifyOtp, isLoading, errorMessage } = useAuthStore();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerSeconds(60);
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleFillDemoOtp = () => {
    setOtpCode('123456');
  };

  const handleSendOtp = async () => {
    const trimmed = phone.trim();
    if (trimmed.length < 11) {
      Alert.alert('সতর্কতা', 'সঠিক ১১ ডিজিটের ফোন নম্বর দিন');
      return;
    }

    const ok = await sendOtp(trimmed, purpose);
    if (ok) {
      setOtpSent(true);
      startTimer();
      Alert.alert('সাফল্য', 'OTP কোড (১২৩৪৫৬) আপনার মোবাইলে পাঠানো হয়েছে');
    } else {
      Alert.alert('ত্রুটি', errorMessage || 'OTP পাঠাতে ব্যর্থ হয়েছে');
    }
  };

  const handleVerifyOtp = async () => {
    const trimmedPhone = phone.trim();
    const trimmedCode = otpCode.trim();

    if (trimmedCode.length !== 6) {
      Alert.alert('সতর্কতা', '৬ সংখ্যার সঠিক OTP দিন');
      return;
    }

    const ok = await verifyOtp(trimmedPhone, trimmedCode, purpose);
    if (ok) {
      router.push({
        pathname: '/(auth)/register',
        params: { phone: trimmedPhone },
      });
    } else {
      Alert.alert('ত্রুটি', errorMessage || 'OTP যাচাই ব্যর্থ হয়েছে');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>ফোন নম্বর যাচাইকরণ</Text>
        <Text style={styles.subtitle}>
          {otpSent
            ? `আপনার ${phone} নম্বরে পাঠানো ৬ সংখ্যার OTP লিখুন`
            : 'রেজিস্ট্রেশনের জন্য আপনার চালু থাকা মোবাইল নম্বরটি লিখুন'}
        </Text>

        {/* Phone Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>ফোন নম্বর (01XXXXXXXXX)</Text>
          <View style={[styles.inputWrapper, otpSent && styles.inputDisabled]}>
            <Text style={styles.inputIcon}>📱</Text>
            <TextInput
              style={styles.textInput}
              placeholder="01712345678"
              placeholderTextColor="#94A3B8"
              value={phone}
              onChangeText={setPhone}
              editable={!otpSent}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {otpSent ? (
          <>
            {/* Demo OTP Helper Banner */}
            <View style={styles.demoBanner}>
              <Text style={styles.demoIcon}>🔢</Text>
              <Text style={styles.demoText}>ডেমো OTP কোড: 123456</Text>
              <TouchableOpacity
                style={styles.autoFillButton}
                onPress={handleFillDemoOtp}
                activeOpacity={0.8}
              >
                <Text style={styles.autoFillText}>অটো-ফিল</Text>
              </TouchableOpacity>
            </View>

            {/* OTP Code Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>৬ সংখ্যার OTP কোড</Text>
              <TextInput
                style={styles.otpInput}
                value={otpCode}
                onChangeText={setOtpCode}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="------"
                placeholderTextColor="#CBD5E1"
                textAlign="center"
              />
            </View>

            {/* Resend row */}
            <View style={styles.resendRow}>
              <Text style={styles.timerText}>
                {timerSeconds > 0
                  ? `পুনরায় পাঠান (${timerSeconds}s)`
                  : 'কোড পাননি?'}
              </Text>
              <TouchableOpacity
                disabled={timerSeconds > 0}
                onPress={handleSendOtp}
              >
                <Text
                  style={[
                    styles.resendButtonText,
                    timerSeconds > 0 && styles.resendDisabled,
                  ]}
                >
                  পুনরায় OTP পাঠান
                </Text>
              </TouchableOpacity>
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={handleVerifyOtp}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>OTP যাচাই করুন</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          /* Send OTP Button */
          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleSendOtp}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>OTP পাঠান</Text>
            )}
          </TouchableOpacity>
        )}
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 18,
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
  inputDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
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
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 120, 87, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(4, 120, 87, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  demoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  demoText: {
    flex: 1,
    fontSize: 13,
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
  otpInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    height: 60,
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 10,
    color: Colors.textDark,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 13,
    color: Colors.textLight,
  },
  resendButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  resendDisabled: {
    color: '#94A3B8',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
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
});
