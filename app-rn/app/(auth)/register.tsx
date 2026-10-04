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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { useAuthStore } from '../../src/store/useAuthStore';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const phone = (params.phone as string) || '';

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [obscurePassword, setObscurePassword] = useState(true);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('B+');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [allergies, setAllergies] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');

  const { register, isLoading, errorMessage } = useAuthStore();

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName || !trimmedPassword) {
      Alert.alert('সতর্কতা', 'নাম এবং পাসওয়ার্ড অবশ্যই দিন');
      return;
    }

    const ok = await register({
      name: trimmedName,
      password: trimmedPassword,
      bloodGroup: selectedBloodGroup,
      emergencyContactName: emergencyName.trim(),
      emergencyContactPhone: emergencyPhone.trim(),
      allergies: allergies.trim(),
      chronicConditions: chronicConditions.trim(),
    });

    if (ok) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('ত্রুটি', errorMessage || 'নিবন্ধন সম্পন্ন করা যায়নি');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Verified Phone Card */}
        <View style={styles.verifiedCard}>
          <Text style={styles.checkIcon}>✅</Text>
          <View style={styles.verifiedTextContainer}>
            <Text style={styles.verifiedSub}>যাচাইকৃত ফোন নম্বর</Text>
            <Text style={styles.verifiedPhone}>{phone || '01700000000'}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeading}>ব্যক্তিগত ও জরুরি তথ্য দিন</Text>
        <Text style={styles.sectionSubtitle}>
          এই তথ্যগুলো আপনার জরুরি এসওএস এবং মেডিকেল আইডি কার্ডে প্রদর্শিত হবে।
        </Text>

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>আপনার পূর্ণ নাম *</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.textInput}
              placeholder="মো: আব্দুর রহমান"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>পাসওয়ার্ড *</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.textInput}
              placeholder="পাসওয়ার্ড লিখুন"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={obscurePassword}
            />
            <TouchableOpacity
              onPress={() => setObscurePassword(!obscurePassword)}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeIcon}>{obscurePassword ? '👁️' : '🙈'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Blood Group Selector */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>রক্তের গ্রুপ</Text>
          <View style={styles.bloodGroupRow}>
            {BLOOD_GROUPS.map((bg) => {
              const isSelected = selectedBloodGroup === bg;
              return (
                <TouchableOpacity
                  key={bg}
                  style={[
                    styles.bloodChip,
                    isSelected && styles.bloodChipSelected,
                  ]}
                  onPress={() => setSelectedBloodGroup(bg)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.bloodChipText,
                      isSelected && styles.bloodChipTextSelected,
                    ]}
                  >
                    {bg}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Emergency Contact Section */}
        <Text style={styles.subHeading}>জরুরি কন্টাক্ট ইনফরমেশন</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>জরুরি ব্যক্তির নাম (যেমন: সন্তান/অভিভাবক)</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>👥</Text>
            <TextInput
              style={styles.textInput}
              placeholder="জরুরি ব্যক্তির নাম"
              placeholderTextColor="#94A3B8"
              value={emergencyName}
              onChangeText={setEmergencyName}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>জরুরি কন্টাক্ট নম্বর</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>📞</Text>
            <TextInput
              style={styles.textInput}
              placeholder="01XXXXXXXXX"
              placeholderTextColor="#94A3B8"
              value={emergencyPhone}
              onChangeText={setEmergencyPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Medical Info Section */}
        <Text style={styles.subHeading}>চিকিৎসা সংক্রান্ত তথ্য (ঐচ্ছিক)</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>এলার্জি (যেমন: পেনিসিলিন, ধুলোবালি)</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>⚠️</Text>
            <TextInput
              style={styles.textInput}
              placeholder="যদি কোনো এলার্জি থাকে লিখুন"
              placeholderTextColor="#94A3B8"
              value={allergies}
              onChangeText={setAllergies}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>ক্রনিক কন্ডিশন (যেমন: ডায়াবেটিস, উচ্চ রক্তচাপ)</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>❤️</Text>
            <TextInput
              style={styles.textInput}
              placeholder="ডায়াবেটিস, অ্যাজমা, উচ্চ রক্তচাপ"
              placeholderTextColor="#94A3B8"
              value={chronicConditions}
              onChangeText={setChronicConditions}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>নিবন্ধন সম্পন্ন করুন</Text>
          )}
        </TouchableOpacity>
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
    paddingVertical: 20,
  },
  verifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 120, 87, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(4, 120, 87, 0.2)',
    padding: 14,
    marginBottom: 20,
  },
  checkIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  verifiedTextContainer: {
    flex: 1,
  },
  verifiedSub: {
    fontSize: 12,
    color: Colors.textLight,
  },
  verifiedPhone: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primaryDark,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 20,
    lineHeight: 18,
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
  bloodGroupRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  bloodChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bloodChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  bloodChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
  },
  bloodChipTextSelected: {
    color: '#FFFFFF',
  },
  subHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primaryDark,
    marginTop: 8,
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
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
