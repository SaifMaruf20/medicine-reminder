import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { Colors } from '../src/constants/colors';
import { useAppointmentStore } from '../src/store/useAppointmentStore';

const REMINDER_OPTIONS = [
  { label: '১ দিন আগে', days: 1 },
  { label: '৩ দিন আগে', days: 3 },
  { label: '৭ দিন আগে', days: 7 },
];

export default function AppointmentsScreen() {
  const { appointments, loadInitialData, addAppointment, isLoading } =
    useAppointmentStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [phone, setPhone] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('2026-10-20');
  const [reminderDays, setReminderDays] = useState(3);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleCall = (num: string) => {
    Linking.openURL(`tel:${num}`);
  };

  const handleSave = async () => {
    if (!doctorName.trim() || !appointmentDate.trim()) {
      Alert.alert('সতর্কতা', 'ডাক্তারের নাম এবং অ্যাপয়েন্টমেন্ট তারিখ অবশ্যই দিন');
      return;
    }

    await addAppointment({
      doctorName: doctorName.trim(),
      hospitalName: hospitalName.trim() || undefined,
      phone: phone.trim() || undefined,
      appointmentDate: appointmentDate.trim(),
      reminderDays,
      notes: notes.trim() || undefined,
    });

    setModalVisible(false);
    setDoctorName('');
    setHospitalName('');
    setPhone('');
    setNotes('');
    Alert.alert('সাফল্য', 'অ্যাপয়েন্টমেন্ট সফলভাবে যোগ করা হয়েছে');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          পরবর্তী ডাক্তারের সাক্ষাতের তারিখ মনে রাখুন এবং সময়মতো অ্যালার্ট পান
        </Text>

        {/* Add Appointment Banner */}
        <TouchableOpacity
          style={styles.addBanner}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.addIconCircle}>
            <Text style={{ fontSize: 20 }}>➕</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.addTitle}>নতুন ডাক্তারের সিরিয়াল যুক্ত করুন</Text>
            <Text style={styles.addSub}>সাক্ষাতের তারিখ, ফোন ও রিমাইন্ডার সেট করুন</Text>
          </View>
        </TouchableOpacity>

        {/* Appointments List */}
        <Text style={styles.sectionHeading}>আসন্ন সিরিয়ালসমূহ ({appointments.length}টি)</Text>

        {appointments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 40, opacity: 0.5, marginBottom: 8 }}>📅</Text>
            <Text style={styles.emptyTitle}>কোনো অ্যাপয়েন্টমেন্ট শিডিউল নেই</Text>
            <Text style={styles.emptySub}>নতুন সিরিয়াল যোগ করতে উপরে ট্যাপ করুন</Text>
          </View>
        ) : (
          appointments.map((appt) => (
            <View key={appt.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.doctorAvatar}>
                  <Text style={{ fontSize: 22 }}>🩺</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.doctorName}>{appt.doctor_name}</Text>
                  <Text style={styles.hospitalName}>
                    {appt.hospital_name || 'হাসপাতাল / চেম্বার'}
                  </Text>
                </View>
                <View style={styles.reminderBadge}>
                  <Text style={styles.reminderText}>
                    🔔 {appt.reminder_days} দিন আগে
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.dateRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, marginRight: 6 }}>📅</Text>
                  <Text style={styles.dateText}>তারিখ: {appt.appointment_date}</Text>
                </View>

                {appt.phone && (
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCall(appt.phone!)}
                  >
                    <Text style={styles.callButtonText}>📞 {appt.phone}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {appt.notes && (
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>নোট: {appt.notes}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Appointment Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeading}>নতুন ডাক্তারের অ্যাপয়েন্টমেন্ট</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>ডাক্তারের নাম *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="যেমন: ডা: তৌহিদ হোসাইন"
                value={doctorName}
                onChangeText={setDoctorName}
              />

              <Text style={styles.fieldLabel}>হাসপাতাল বা চেম্বার</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="যেমন: স্কয়ার হাসপাতাল, ঢাকা"
                value={hospitalName}
                onChangeText={setHospitalName}
              />

              <Text style={styles.fieldLabel}>সিরিয়াল ফোন নম্বর</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="01XXXXXXXXX"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <Text style={styles.fieldLabel}>অ্যাপয়েন্টমেন্ট তারিখ (YYYY-MM-DD) *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="YYYY-MM-DD"
                value={appointmentDate}
                onChangeText={setAppointmentDate}
              />

              <Text style={styles.fieldLabel}>কত দিন আগে মনে করিয়ে দেব?</Text>
              <View style={styles.chipsRow}>
                {REMINDER_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.days}
                    style={[
                      styles.chip,
                      reminderDays === opt.days && styles.chipActive,
                    ]}
                    onPress={() => setReminderDays(opt.days)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        reminderDays === opt.days && styles.chipTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>নোটস বা প্রয়োজনীয় টেস্ট</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="যেমন: ব্লাড টেস্ট রিপোর্ট দেখাতে হবে"
                value={notes}
                onChangeText={setNotes}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>বাতিল</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={isLoading}
              >
                <Text style={styles.saveBtnText}>সংরক্ষণ করুন</Text>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 16,
    lineHeight: 18,
  },
  addBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(4, 120, 87, 0.4)',
    borderStyle: 'dashed',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  addIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(4, 120, 87, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  addSub: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
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
  emptyTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(4, 120, 87, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  hospitalName: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  reminderBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reminderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
  },
  callButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notesBox: {
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
  },
  notesText: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: 10,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: Colors.textDark,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cancelBtnText: {
    color: Colors.textLight,
    fontWeight: 'bold',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
