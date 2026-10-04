import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/colors';
import { useHealthStore } from '../../src/store/useHealthStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useMedicineStore } from '../../src/store/useMedicineStore';
import { PdfService } from '../../src/services/pdf';
import { HealthLog } from '../../src/models';

type TabType = 'blood_pressure' | 'blood_sugar' | 'weight' | 'pulse';

export default function HealthTrackerScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('blood_pressure');
  const [modalVisible, setModalVisible] = useState(false);

  // Form inputs
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  const [mealContext, setMealContext] = useState('fasting');
  const [notes, setNotes] = useState('');

  const { bpLogs, sugarLogs, weightLogs, pulseLogs, loadInitialData, addLog } =
    useHealthStore();
  const user = useAuthStore((state) => state.user);
  const userMedicines = useMedicineStore((state) => state.userMedicines);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleExportPdf = async () => {
    try {
      await PdfService.generateAndShareReport({
        userName: user?.name || 'ব্যবহারকারী',
        userPhone: user?.phone || '',
        bpLogs,
        sugarLogs,
        weightLogs,
        pulseLogs,
        medicines: userMedicines,
      });
    } catch {
      Alert.alert('ত্রুটি', 'রিপোর্ট তৈরি করতে সমস্যা হয়েছে');
    }
  };

  const handleSaveLog = async () => {
    const v1 = parseFloat(val1);
    if (isNaN(v1)) {
      Alert.alert('সতর্কতা', 'সঠিক মান লিখুন');
      return;
    }

    let v2: number | undefined;
    let unit = '';

    if (activeTab === 'blood_pressure') {
      v2 = parseFloat(val2);
      if (isNaN(v2)) {
        Alert.alert('সতর্কতা', 'ডায়াস্টোলিক প্রেশার লিখুন');
        return;
      }
      unit = 'mmHg';
    } else if (activeTab === 'blood_sugar') {
      unit = 'mmol/L';
    } else if (activeTab === 'weight') {
      unit = 'kg';
    } else if (activeTab === 'pulse') {
      unit = 'bpm';
    }

    await addLog({
      type: activeTab,
      value_1: v1,
      value_2: v2,
      unit,
      meal_context: activeTab === 'blood_sugar' ? mealContext : undefined,
      notes: notes.trim() || undefined,
    });

    setModalVisible(false);
    setVal1('');
    setVal2('');
    setNotes('');
  };

  const currentLogs: HealthLog[] =
    activeTab === 'blood_pressure'
      ? bpLogs
      : activeTab === 'blood_sugar'
      ? sugarLogs
      : activeTab === 'weight'
      ? weightLogs
      : pulseLogs;

  const getStatusBadge = (log: HealthLog) => {
    if (log.type === 'blood_pressure') {
      const sys = log.value_1;
      const dia = log.value_2 || 80;
      if (sys < 120 && dia < 80) {
        return { text: 'স্বাভাবিক', color: Colors.success, bg: 'rgba(22, 163, 74, 0.12)' };
      }
      if (sys <= 139 || dia <= 89) {
        return { text: 'প্রি-হাইপারটেনশন', color: Colors.accent, bg: 'rgba(245, 158, 11, 0.15)' };
      }
      return { text: 'উচ্চ রক্তচাপ', color: Colors.danger, bg: 'rgba(220, 38, 38, 0.12)' };
    }
    if (log.type === 'blood_sugar') {
      const val = log.value_1;
      if (val >= 4.0 && val <= 7.0) {
        return { text: 'স্বাভাবিক', color: Colors.success, bg: 'rgba(22, 163, 74, 0.12)' };
      }
      return { text: val > 7.0 ? 'উচ্চ মাত্রা' : 'নিম্ন মাত্রা', color: Colors.danger, bg: 'rgba(220, 38, 38, 0.12)' };
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>স্বাস্থ্য ট্র্যাকার</Text>
        <TouchableOpacity style={styles.pdfButton} onPress={handleExportPdf} activeOpacity={0.8}>
          <Text style={styles.pdfButtonText}>📄 ডাক্তার রিপোর্ট</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs Row */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'blood_pressure' && styles.tabItemActive]}
          onPress={() => setActiveTab('blood_pressure')}
        >
          <Text style={[styles.tabText, activeTab === 'blood_pressure' && styles.tabTextActive]}>
            রক্তচাপ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'blood_sugar' && styles.tabItemActive]}
          onPress={() => setActiveTab('blood_sugar')}
        >
          <Text style={[styles.tabText, activeTab === 'blood_sugar' && styles.tabTextActive]}>
            সুগার
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'weight' && styles.tabItemActive]}
          onPress={() => setActiveTab('weight')}
        >
          <Text style={[styles.tabText, activeTab === 'weight' && styles.tabTextActive]}>
            ওজন
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'pulse' && styles.tabItemActive]}
          onPress={() => setActiveTab('pulse')}
        >
          <Text style={[styles.tabText, activeTab === 'pulse' && styles.tabTextActive]}>
            পালস
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick Add Banner */}
        <View style={styles.addBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.addBannerTitle}>
              নতুন {activeTab === 'blood_pressure' ? 'রক্তচাপ' : activeTab === 'blood_sugar' ? 'সুগার' : activeTab === 'weight' ? 'ওজন' : 'পালস'} রিডিং
            </Text>
            <Text style={styles.addBannerSub}>প্রতিদিনের স্বাস্থ্য লগ সংরক্ষণ করুন</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>＋ লগ করুন</Text>
          </TouchableOpacity>
        </View>

        {/* History List */}
        <Text style={styles.sectionHeading}>সাম্প্রতিক রেকর্ডসমূহ ({currentLogs.length}টি)</Text>

        {currentLogs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 36, opacity: 0.5, marginBottom: 8 }}>📊</Text>
            <Text style={styles.emptyText}>কোনো রেকর্ড পাওয়া যায়নি</Text>
            <Text style={styles.emptySub}>নতুন রিডিং লিখতে উপরে "লগ করুন" এ চাপুন</Text>
          </View>
        ) : (
          currentLogs.map((log) => {
            const status = getStatusBadge(log);
            const dateStr = new Date(log.recorded_at).toLocaleDateString('bn-BD', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logLeft}>
                  <Text style={styles.logValue}>
                    {log.type === 'blood_pressure'
                      ? `${log.value_1}/${log.value_2 || 80}`
                      : log.value_1}
                    <Text style={styles.logUnit}> {log.unit}</Text>
                  </Text>
                  <Text style={styles.logDate}>{dateStr}</Text>
                  {log.notes && <Text style={styles.logNotes}>{log.notes}</Text>}
                </View>

                {status && (
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>
                      {status.text}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Log Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {activeTab === 'blood_pressure'
                ? 'রক্তচাপ পরিমাপ যোগ করুন'
                : activeTab === 'blood_sugar'
                ? 'রক্তে সুগার রিডিং যোগ করুন'
                : activeTab === 'weight'
                ? 'ওজন পরিমাপ যোগ করুন'
                : 'পালস রেট যোগ করুন'}
            </Text>

            {activeTab === 'blood_pressure' ? (
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>সিস্টোলিক (mmHg)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="১২০"
                    keyboardType="numeric"
                    value={val1}
                    onChangeText={setVal1}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.inputLabel}>ডায়াস্টোলিক (mmHg)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="৮০"
                    keyboardType="numeric"
                    value={val2}
                    onChangeText={setVal2}
                  />
                </View>
              </View>
            ) : activeTab === 'blood_sugar' ? (
              <>
                <Text style={styles.inputLabel}>সুগার লেভেল (mmol/L)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="যেমন: ৫.৮"
                  keyboardType="decimal-pad"
                  value={val1}
                  onChangeText={setVal1}
                />
                <Text style={styles.inputLabel}>গ্রহণের অবস্থা</Text>
                <View style={styles.chipsRow}>
                  <TouchableOpacity
                    style={[styles.modalChip, mealContext === 'fasting' && styles.modalChipActive]}
                    onPress={() => setMealContext('fasting')}
                  >
                    <Text style={[styles.modalChipText, mealContext === 'fasting' && styles.modalChipTextActive]}>
                      খালি পেটে
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalChip, mealContext === 'after_meal' && styles.modalChipActive]}
                    onPress={() => setMealContext('after_meal')}
                  >
                    <Text style={[styles.modalChipText, mealContext === 'after_meal' && styles.modalChipTextActive]}>
                      খাওয়ার পরে
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.inputLabel}>
                  {activeTab === 'weight' ? 'ওজন (kg)' : 'হার্ট রেট (bpm)'}
                </Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder={activeTab === 'weight' ? 'যেমন: ৬৮.৫' : 'যেমন: ৭২'}
                  keyboardType="decimal-pad"
                  value={val1}
                  onChangeText={setVal1}
                />
              </>
            )}

            <Text style={styles.inputLabel}>নোট / মন্তব্য (ঐচ্ছিক)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="যেমন: বিকেলের পরিমাপ"
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>বাতিল</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveLog}>
                <Text style={styles.saveButtonText}>সংরক্ষণ করুন</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pdfButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pdfButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#FFFFFF',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  addBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    elevation: 1,
  },
  addBannerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  addBannerSub: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 4,
  },
  logCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
  },
  logLeft: {
    flex: 1,
  },
  logValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  logUnit: {
    fontSize: 13,
    fontWeight: 'normal',
    color: Colors.textLight,
  },
  logDate: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  logNotes: {
    fontSize: 12,
    color: Colors.primaryDark,
    marginTop: 4,
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modalChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalChipActive: {
    backgroundColor: 'rgba(4, 120, 87, 0.12)',
    borderColor: Colors.primary,
  },
  modalChipText: {
    fontSize: 12,
    color: Colors.textDark,
  },
  modalChipTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: Colors.textLight,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
