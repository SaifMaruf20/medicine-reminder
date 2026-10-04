import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../src/constants/colors';
import { useMedicineStore } from '../src/store/useMedicineStore';
import { Medicine } from '../src/models';

const DOSAGE_FORMS = ['ট্যাবলেট', 'ক্যাপসুল', 'সিরাপ', 'ইনজেকশন', 'ড্রপস', 'মলম'];

export default function AddMedicineScreen() {
  const router = useRouter();
  const { searchResults, searchMedicines, addUserMedicine, isLoading } = useMedicineStore();

  const [isCustom, setIsCustom] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [customName, setCustomName] = useState('');
  const [selectedForm, setSelectedForm] = useState('ট্যাবলেট');
  const [dosage, setDosage] = useState('১টা');
  const [frequency, setFrequency] = useState<'once_daily' | 'twice_daily' | 'thrice_daily'>('twice_daily');
  const [mealInstruction, setMealInstruction] = useState<'before_meal' | 'after_meal' | 'any'>('after_meal');
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['08:00 AM', '10:00 PM']);
  const [totalQuantity, setTotalQuantity] = useState('৩০');
  const [refillDays, setRefillDays] = useState('৩');
  const [enableVoiceReminder, setEnableVoiceReminder] = useState(true);

  const handleFrequencyChange = (freq: 'once_daily' | 'twice_daily' | 'thrice_daily') => {
    setFrequency(freq);
    if (freq === 'once_daily') {
      setSelectedTimes(['08:00 AM']);
    } else if (freq === 'twice_daily') {
      setSelectedTimes(['08:00 AM', '10:00 PM']);
    } else if (freq === 'thrice_daily') {
      setSelectedTimes(['08:00 AM', '02:00 PM', '10:00 PM']);
    }
  };

  const handleSelectMedicine = (med: Medicine) => {
    setSelectedMedicine(med);
    setSearchQuery(`${med.brand_name} (${med.strength || ''})`);
    searchMedicines('');
  };

  const handleSubmit = async () => {
    if (!isCustom && !selectedMedicine) {
      Alert.alert('সতর্কতা', 'ওষুধের নাম নির্বাচন করুন অথবা "নিজে লিখুন" বোতাম চাপুন');
      return;
    }
    if (isCustom && !customName.trim()) {
      Alert.alert('সতর্কতা', 'ওষুধের নাম লিখুন');
      return;
    }

    const dosageText = `${dosage.trim()} ${selectedForm}`;
    const brandName = isCustom
      ? customName.trim()
      : `${selectedMedicine!.brand_name} ${selectedMedicine!.strength || ''}`.trim();

    const data = {
      ...(selectedMedicine && !isCustom
        ? {
            medicine_id: selectedMedicine.id,
            brand_name: brandName,
            generic_name: selectedMedicine.generic_name,
          }
        : {
            custom_name: customName.trim(),
            brand_name: brandName,
          }),
      dosage: dosageText,
      frequency,
      times: selectedTimes,
      meal_instruction: mealInstruction,
      start_date: new Date().toISOString().split('T')[0],
      total_quantity: parseInt(totalQuantity.trim(), 10) || 30,
      refill_alert_days: parseInt(refillDays.trim(), 10) || 3,
    };

    const success = await addUserMedicine(data);
    if (success) {
      Alert.alert('সাফল্য', 'ওষুধ সফলভাবে যোগ করা হয়েছে', [
        {
          text: 'ঠিক আছে',
          onPress: () => router.back(),
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Search / Custom Toggle Header */}
        <View style={styles.toggleRow}>
          <Text style={styles.sectionHeading}>
            {isCustom ? 'নিজে ওষুধের নাম লিখুন' : '🔍 DGDA ওষুধ খুঁজুন'}
          </Text>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => {
              setIsCustom(!isCustom);
              setSelectedMedicine(null);
            }}
          >
            <Text style={styles.toggleButtonText}>
              {isCustom ? '🔍 খুঁজুন' : '✏️ নিজে লিখুন'}
            </Text>
          </TouchableOpacity>
        </View>

        {!isCustom ? (
          <View>
            <View style={styles.inputWrapper}>
              <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
              <TextInput
                style={styles.textInput}
                placeholder="যেমন: Napa, Metformin, Seclo, Sergel..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  searchMedicines(text);
                }}
              />
            </View>

            {/* Autocomplete Dropdown */}
            {searchResults.length > 0 && (
              <View style={styles.resultsBox}>
                {searchResults.slice(0, 5).map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.resultItem}
                    onPress={() => handleSelectMedicine(item)}
                  >
                    <Text style={{ fontSize: 18, marginRight: 10 }}>💊</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resultBrand}>
                        {item.brand_name} ({item.strength || ''})
                      </Text>
                      <Text style={styles.resultGen}>
                        {item.generic_name} • {item.manufacturer}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.inputWrapper}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>💊</Text>
            <TextInput
              style={styles.textInput}
              placeholder="ওষুধের নাম লিখুন (যেমন: গ্যাস্ট্রিকের ওষুধ)"
              placeholderTextColor="#94A3B8"
              value={customName}
              onChangeText={setCustomName}
            />
          </View>
        )}

        {/* Dosage Forms */}
        <Text style={styles.label}>ওষুধের ধরন (Form)</Text>
        <View style={styles.chipsRow}>
          {DOSAGE_FORMS.map((form) => {
            const isSelected = selectedForm === form;
            return (
              <TouchableOpacity
                key={form}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setSelectedForm(form)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {form}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Dosage Amount */}
        <Text style={styles.label}>পরিমাণ / মাত্রা</Text>
        <View style={styles.inputWrapper}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔢</Text>
          <TextInput
            style={styles.textInput}
            placeholder="১টা"
            placeholderTextColor="#94A3B8"
            value={dosage}
            onChangeText={setDosage}
          />
        </View>

        {/* Frequency */}
        <Text style={styles.label}>কতবার খাবেন?</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.freqCard, frequency === 'once_daily' && styles.freqCardSelected]}
            onPress={() => handleFrequencyChange('once_daily')}
          >
            <Text
              style={[
                styles.freqText,
                frequency === 'once_daily' && styles.freqTextSelected,
              ]}
            >
              দিনে ১ বার
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.freqCard, frequency === 'twice_daily' && styles.freqCardSelected]}
            onPress={() => handleFrequencyChange('twice_daily')}
          >
            <Text
              style={[
                styles.freqText,
                frequency === 'twice_daily' && styles.freqTextSelected,
              ]}
            >
              দিনে ২ বার
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.freqCard, frequency === 'thrice_daily' && styles.freqCardSelected]}
            onPress={() => handleFrequencyChange('thrice_daily')}
          >
            <Text
              style={[
                styles.freqText,
                frequency === 'thrice_daily' && styles.freqTextSelected,
              ]}
            >
              দিনে ৩ বার
            </Text>
          </TouchableOpacity>
        </View>

        {/* Time Slots */}
        <Text style={styles.label}>গ্রহণের সময়</Text>
        <View style={styles.chipsRow}>
          {selectedTimes.map((time, idx) => (
            <View key={idx} style={styles.timeBadge}>
              <Text style={{ fontSize: 13, marginRight: 6 }}>⏰</Text>
              <Text style={styles.timeBadgeText}>
                সময় {idx + 1}: {time}
              </Text>
            </View>
          ))}
        </View>

        {/* Meal Instruction */}
        <Text style={styles.label}>খাবারের নিয়ম</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.freqCard, mealInstruction === 'before_meal' && styles.freqCardSelected]}
            onPress={() => setMealInstruction('before_meal')}
          >
            <Text
              style={[
                styles.freqText,
                mealInstruction === 'before_meal' && styles.freqTextSelected,
              ]}
            >
              খাওয়ার আগে
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.freqCard, mealInstruction === 'after_meal' && styles.freqCardSelected]}
            onPress={() => setMealInstruction('after_meal')}
          >
            <Text
              style={[
                styles.freqText,
                mealInstruction === 'after_meal' && styles.freqTextSelected,
              ]}
            >
              খাওয়ার পরে
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.freqCard, mealInstruction === 'any' && styles.freqCardSelected]}
            onPress={() => setMealInstruction('any')}
          >
            <Text
              style={[
                styles.freqText,
                mealInstruction === 'any' && styles.freqTextSelected,
              ]}
            >
              যেকোনো সময়
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quantity & Refill Alert */}
        <View style={[styles.row, { marginTop: 14 }]}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>মোট কেনা পরিমাণ</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={totalQuantity}
                onChangeText={setTotalQuantity}
              />
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>রিফিল নোটিফিকেশন দিন</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={refillDays}
                onChangeText={setRefillDays}
              />
            </View>
          </View>
        </View>

        {/* Bengali Voice Toggle */}
        <View style={styles.voiceCard}>
          <View style={styles.voiceTextRow}>
            <Text style={{ fontSize: 20, marginRight: 8 }}>🗣️</Text>
            <Text style={styles.voiceTitle}>বাংলা ভয়েস অনুস্মারক</Text>
          </View>
          <Switch
            value={enableVoiceReminder}
            onValueChange={setEnableVoiceReminder}
            thumbColor={Colors.primary}
            trackColor={{ true: 'rgba(4, 120, 87, 0.4)', false: '#E2E8F0' }}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>💊 ওষুধ যোগ করুন</Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(4, 120, 87, 0.08)',
  },
  toggleButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
  },
  resultsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultBrand: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  resultGen: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: 'rgba(4, 120, 87, 0.12)',
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: Colors.textDark,
  },
  chipTextSelected: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  freqCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  freqCardSelected: {
    backgroundColor: 'rgba(4, 120, 87, 0.12)',
    borderColor: Colors.primary,
  },
  freqText: {
    fontSize: 12,
    color: Colors.textDark,
    fontWeight: '600',
  },
  freqTextSelected: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 120, 87, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  timeBadgeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  voiceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginTop: 20,
  },
  voiceTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
