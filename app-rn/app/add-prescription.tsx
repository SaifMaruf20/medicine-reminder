import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../src/constants/colors';
import { usePrescriptionStore } from '../src/store/usePrescriptionStore';
import { OcrService } from '../src/services/ocr';

export default function AddPrescriptionScreen() {
  const router = useRouter();
  const { addPrescription, isLoading } = usePrescriptionStore();

  const [images, setImages] = useState<string[]>([]);
  const [doctorName, setDoctorName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [visitDate, setVisitDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [nextVisitDate, setNextVisitDate] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [detectedMedicines, setDetectedMedicines] = useState<string[]>([]);
  const [ocrScanning, setOcrScanning] = useState(false);

  const pickImage = async (useCamera: boolean) => {
    try {
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            quality: 0.8,
            allowsEditing: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            quality: 0.8,
            allowsMultipleSelection: true,
          });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uris = result.assets.map((a) => a.uri);
        setImages((prev) => [...prev, ...uris]);

        // Run OCR auto-parser
        runOcrSimulation();
      }
    } catch {
      Alert.alert('অনুমতি ত্রুটি', 'ক্যামেরা বা ফটো গ্যালারির অনুমতি দিন');
    }
  };

  const runOcrSimulation = () => {
    setOcrScanning(true);
    setTimeout(() => {
      // Simulate/Parse sample OCR extracted text
      const sampleText = `
        Dr. Md. Rafiqul Islam, MBBS, FCPS
        Popular Diagnostic Centre, Dhanmondi
        Date: ${new Date().toISOString().split('T')[0]}
        Diagnosis: Gastric Ulcer, Hypertension
        Rx
        Tab. Seclo 20mg  1+0+1
        Tab. Napa Extra  1+1+1
      `;
      const res = OcrService.parseRawText(sampleText);
      if (res.doctorName && !doctorName) setDoctorName(res.doctorName);
      if (res.hospitalName && !hospitalName) setHospitalName(res.hospitalName);
      if (res.diagnosisNotes && !diagnosis) setDiagnosis(res.diagnosisNotes);
      if (res.detectedMedicines.length > 0) setDetectedMedicines(res.detectedMedicines);
      setOcrScanning(false);
    }, 1200);
  };

  const handleSave = async () => {
    if (!visitDate.trim()) {
      Alert.alert('সতর্কতা', 'ভিজিটের তারিখ অবশ্যই দিন');
      return;
    }

    const success = await addPrescription({
      doctorName: doctorName.trim() || undefined,
      hospitalName: hospitalName.trim() || undefined,
      diagnosis: diagnosis.trim() || undefined,
      visitDate: visitDate.trim(),
      nextVisitDate: nextVisitDate.trim() || undefined,
      notes: notes.trim() || undefined,
      imageUris: images,
    });

    if (success) {
      Alert.alert('সাফল্য', 'প্রেসক্রিপশন সফলভাবে যোগ করা হয়েছে', [
        { text: 'ঠিক আছে', onPress: () => router.back() },
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
        <Text style={styles.title}>প্রেসক্রিপশনের ছবি যুক্ত করুন</Text>
        <Text style={styles.subtitle}>
          ক্যামেরা দিয়ে ছবি তুলুন বা গ্যালারি থেকে প্রেসক্রিপশন সিলেক্ট করুন। OCR ইঞ্জিন স্বয়ংক্রিয়ভাবে তথ্য সনাক্ত করবে।
        </Text>

        {/* Image Picker Buttons */}
        <View style={styles.pickerRow}>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => pickImage(true)}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 24, marginBottom: 4 }}>📷</Text>
            <Text style={styles.pickerButtonText}>ক্যামেরা</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => pickImage(false)}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 24, marginBottom: 4 }}>🖼️</Text>
            <Text style={styles.pickerButtonText}>গ্যালারি</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Images Preview */}
        {images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesRow}>
            {images.map((uri, idx) => (
              <View key={idx} style={styles.previewImageWrapper}>
                <Image source={{ uri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageBadge}
                  onPress={() => setImages(images.filter((_, i) => i !== idx))}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {ocrScanning && (
          <View style={styles.ocrScanningBox}>
            <ActivityIndicator color={Colors.primary} size="small" />
            <Text style={styles.ocrScanningText}>
              প্রেসক্রিপশন থেকে তথ্য স্ক্যান ও পার্স করা হচ্ছে...
            </Text>
          </View>
        )}

        {/* Detected Medicines preview from OCR */}
        {detectedMedicines.length > 0 && (
          <View style={styles.ocrMedicinesBox}>
            <Text style={styles.ocrMedicinesTitle}>
              🔍 OCR দ্বারা সনাক্তকৃত ওষুধ ({detectedMedicines.length}টি):
            </Text>
            {detectedMedicines.map((m, idx) => (
              <Text key={idx} style={styles.ocrMedicineItem}>
                • {m}
              </Text>
            ))}
          </View>
        )}

        {/* Form Fields */}
        <Text style={styles.label}>ডাক্তারের নাম</Text>
        <TextInput
          style={styles.input}
          placeholder="যেমন: ডা: মো: রফিকুল ইসলাম"
          placeholderTextColor="#94A3B8"
          value={doctorName}
          onChangeText={setDoctorName}
        />

        <Text style={styles.label}>হাসপাতাল / চেম্বার</Text>
        <TextInput
          style={styles.input}
          placeholder="যেমন: পপুলার ডায়াগনস্টিক সেন্টার"
          placeholderTextColor="#94A3B8"
          value={hospitalName}
          onChangeText={setHospitalName}
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>ভিজিটের তারিখ</Text>
            <TextInput
              style={styles.input}
              value={visitDate}
              onChangeText={setVisitDate}
              placeholder="YYYY-MM-DD"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>পরবর্তী সাক্ষাৎ (ঐচ্ছিক)</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={nextVisitDate}
              onChangeText={setNextVisitDate}
            />
          </View>
        </View>

        <Text style={styles.label}>রোগের বিবরণ / ডায়াগনোসিস</Text>
        <TextInput
          style={styles.input}
          placeholder="যেমন: গ্যাস্ট্রিক আলসার, উচ্চ রক্তচাপ"
          placeholderTextColor="#94A3B8"
          value={diagnosis}
          onChangeText={setDiagnosis}
        />

        <Text style={styles.label}>অতিরিক্ত মন্তব্য বা ডাক্তারের নির্দেশ</Text>
        <TextInput
          style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
          placeholder="ডোজের বিশেষ নিয়ম..."
          placeholderTextColor="#94A3B8"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>💾 প্রেসক্রিপশন সংরক্ষণ করুন</Text>
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  pickerButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(4, 120, 87, 0.3)',
    borderStyle: 'dashed',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  imagesRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  previewImageWrapper: {
    width: 90,
    height: 110,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(220, 38, 38, 0.85)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ocrScanningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 120, 87, 0.08)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(4, 120, 87, 0.25)',
  },
  ocrScanningText: {
    fontSize: 12,
    color: Colors.primaryDark,
    fontWeight: '600',
    marginLeft: 10,
  },
  ocrMedicinesBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  ocrMedicinesTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primaryDark,
    marginBottom: 4,
  },
  ocrMedicineItem: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 4,
    marginTop: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 14,
    color: Colors.textDark,
  },
  row: {
    flexDirection: 'row',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 52,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
});
