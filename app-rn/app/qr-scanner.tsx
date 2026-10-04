import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors } from '../src/constants/colors';
import { useFamilyStore } from '../src/store/useFamilyStore';

export default function QrScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const { joinFamilyWithCode } = useFamilyStore();

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      await joinFamilyWithCode(data);
      Alert.alert('সাফল্য', `QR কোড স্ক্যান সফল হয়েছে: ${data}`, [
        { text: 'ঠিক আছে', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('ত্রুটি', 'কোড দিয়ে যুক্ত হওয়া যায়নি');
      setScanned(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) return;
    await joinFamilyWithCode(manualCode.trim());
    Alert.alert('সাফল্য', 'কোড সফলভাবে গৃহীত হয়েছে', [
      { text: 'ঠিক আছে', onPress: () => router.back() },
    ]);
  };

  if (!permission) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.text}>ক্যামেরা লোড হচ্ছে...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerBox}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>📷</Text>
          <Text style={styles.permissionTitle}>ক্যামেরা পারমিশন আবশ্যক</Text>
          <Text style={styles.permissionSub}>
            পরিবারের QR কোড স্ক্যান করতে ক্যামেরা অ্যাক্সেস চালু করুন
          </Text>
          <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
            <Text style={styles.permButtonText}>অনুমতি দিন</Text>
          </TouchableOpacity>

          <View style={styles.manualCard}>
            <Text style={styles.manualTitle}>অথবা কোড লিখে যুক্ত হোন:</Text>
            <TextInput
              style={styles.manualInput}
              placeholder="যেমন: OS-FAM-8821"
              value={manualCode}
              onChangeText={setManualCode}
            />
            <TouchableOpacity style={styles.permButton} onPress={handleManualSubmit}>
              <Text style={styles.permButtonText}>যুক্ত হোন</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Target Reticle Overlay */}
      <View style={styles.overlay}>
        <SafeAreaView style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>✕ বন্ধ করুন</Text>
          </TouchableOpacity>
        </SafeAreaView>

        <View style={styles.reticleContainer}>
          <View style={styles.reticleBox} />
          <Text style={styles.reticleText}>QR কোডটি ফ্রেমের ভেতরে রাখুন</Text>
        </View>

        <View style={styles.bottomBar}>
          {scanned && (
            <TouchableOpacity
              style={styles.rescanButton}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.rescanText}>আবার স্ক্যান করুন</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.background,
  },
  text: {
    color: Colors.textDark,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    textAlign: 'center',
  },
  permissionSub: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  permButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  permButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  manualCard: {
    marginTop: 32,
    width: '100%',
    alignItems: 'center',
  },
  manualTitle: {
    fontSize: 14,
    color: Colors.textDark,
    marginBottom: 8,
  },
  manualInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    width: '100%',
    marginBottom: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
  },
  topBar: {
    padding: 16,
    flexDirection: 'row',
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  reticleContainer: {
    alignItems: 'center',
  },
  reticleBox: {
    width: 220,
    height: 220,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  reticleText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bottomBar: {
    padding: 24,
    alignItems: 'center',
  },
  rescanButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  rescanText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
