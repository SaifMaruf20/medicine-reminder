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
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '../../src/constants/colors';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useMedicineStore } from '../../src/store/useMedicineStore';
import { useEmergencyContactsStore } from '../../src/store/useEmergencyContactsStore';
import { ContactPickerService } from '../../src/services/contacts';
import { EmergencyContact } from '../../src/models';

const BD_HELPLINES = [
  {
    number: '999',
    title: 'জাতীয় জরুরি সেবা',
    desc: 'পুলিশ, অ্যাম্বুলেন্স, ফায়ার সার্ভিস (২৪ ঘণ্টা)',
    color: '#DC2626',
    icon: '🚨',
  },
  {
    number: '16263',
    title: 'স্বাস্থ্য বাতায়ন',
    desc: 'সরকারি স্বাস্থ্য পরামর্শ ও ডাক্তার সহায়তা',
    color: '#047857',
    icon: '🏥',
  },
  {
    number: '333',
    title: 'জাতীয় তথ্য ও সেবা',
    desc: 'সরকারি সেবা ও ত্রাণ বিষয়ক কল সেন্টার',
    color: '#0284C7',
    icon: '📞',
  },
  {
    number: '16163',
    title: 'নারী ও শিশু হেল্পলাইন',
    desc: 'নির্যাতন প্রতিরোধ ও জরুরি সহায়তা',
    color: '#7C3AED',
    icon: '🛡️',
  },
  {
    number: '199',
    title: 'দুর্যোগের আগাম বার্তা',
    desc: 'বন্যা, ঘূর্ণিঝড় ও আবহাওয়া পূর্বাভাস',
    color: '#D97706',
    icon: '⛈️',
  },
  {
    number: '01713007700',
    title: 'পয়জন ইনফরমেশন সেন্টার',
    desc: 'ডিএমসিএইচ বিষক্রিয়া নিয়ন্ত্রণ ও জরুরি নির্দেশিকা',
    color: '#B91C1C',
    icon: '🧪',
  },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function EmergencyScreen() {
  const [activeTab, setActiveTab] = useState<'id' | 'contacts'>('id');
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [addContactVisible, setAddContactVisible] = useState(false);

  const router = useRouter();
  const { user, updateEmergencyInfo, logout } = useAuthStore();
  const { userMedicines } = useMedicineStore();
  const { contacts, loadContacts, addContact, deleteContact } =
    useEmergencyContactsStore();

  const handleLogout = () => {
    Alert.alert(
      'লগআউট নিশ্চিতকরণ',
      'আপনি কি আপনার অ্যাকাউন্ট থেকে লগআউট করতে চান?',
      [
        { text: 'বাতিল', style: 'cancel' },
        {
          text: 'লগআউট',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  // Profile Edit fields
  const [editName, setEditName] = useState(user?.name || '');
  const [editBloodGroup, setEditBloodGroup] = useState<string>(user?.blood_group || 'B+');
  const [editEmergencyName, setEditEmergencyName] = useState(user?.emergency_contact_name || '');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState(user?.emergency_contact_phone || '');
  const [editAllergies, setEditAllergies] = useState(user?.allergies || '');
  const [editChronic, setEditChronic] = useState(user?.chronic_conditions || '');

  // Add Contact fields
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('পারিবারিক স্বজন');

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditBloodGroup(user.blood_group || 'B+');
      setEditEmergencyName(user.emergency_contact_name || '');
      setEditEmergencyPhone(user.emergency_contact_phone || '');
      setEditAllergies(user.allergies || '');
      setEditChronic(user.chronic_conditions || '');
    }
  }, [user]);

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  const handleSaveProfile = async () => {
    await updateEmergencyInfo({
      name: editName,
      bloodGroup: editBloodGroup,
      emergencyContactName: editEmergencyName,
      emergencyContactPhone: editEmergencyPhone,
      allergies: editAllergies,
      chronicConditions: editChronic,
    });
    setEditProfileVisible(false);
    Alert.alert('সাফল্য', 'মেডিকেল আইডি তথ্য আপডেট করা হয়েছে');
  };

  const handleAddManualContact = async () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      Alert.alert('সতর্কতা', 'নাম এবং ফোন নম্বর উভয়ই দিন');
      return;
    }

    const contact: EmergencyContact = {
      id: `contact_${Date.now()}`,
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relation: newContactRelation.trim() || 'স্বজন',
    };

    await addContact(contact);
    setAddContactVisible(false);
    setNewContactName('');
    setNewContactPhone('');
  };

  const handleImportFromPhonebook = async () => {
    const picked = await ContactPickerService.pickContact();
    if (picked) {
      await addContact(picked);
      Alert.alert('সাফল্য', `${picked.name} কন্টাক্ট হিসেবে যুক্ত হয়েছে`);
    } else {
      Alert.alert('তথ্য', 'কোনো নম্বর নির্বাচন করা হয়নি');
    }
  };

  // Generate QR Payload
  const qrData = JSON.stringify({
    name: user?.name,
    blood: user?.blood_group,
    emergency_contact: `${user?.emergency_contact_name}: ${user?.emergency_contact_phone}`,
    allergies: user?.allergies,
    conditions: user?.chronic_conditions,
    medications: userMedicines.map((m) => m.brand_name || m.custom_name).join(', '),
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🆘 জরুরি সহায়তা ও মেডিকেল ID</Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'id' && styles.tabButtonActive]}
          onPress={() => setActiveTab('id')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'id' && styles.tabButtonTextActive]}>
            মেডিক্যাল আইডি
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'contacts' && styles.tabButtonActive]}
          onPress={() => setActiveTab('contacts')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'contacts' && styles.tabButtonTextActive]}>
            জরুরি কন্টাক্ট ও হেল্পলাইন
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'id' ? (
          <>
            {/* Digital Medical ID Card */}
            <View style={styles.idCard}>
              <View style={styles.idCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.idCardTitle}>বাংলাদেশ ডিজিটাল মেডিকেল আইডি</Text>
                  <Text style={styles.idCardName}>{user?.name || 'ব্যবহারকারী'}</Text>
                  <Text style={styles.idCardPhone}>ফোন: {user?.phone || '০১৭XXXXXXXX'}</Text>
                </View>
                <View style={styles.bloodBadge}>
                  <Text style={styles.bloodBadgeText}>{user?.blood_group || 'B+'}</Text>
                </View>
              </View>

              <View style={styles.idDivider} />

              <View style={styles.idInfoRow}>
                <Text style={styles.idInfoLabel}>জরুরি যোগাযোগ:</Text>
                <Text style={styles.idInfoValue}>
                  {user?.emergency_contact_name || 'অভিভাবক'} ({user?.emergency_contact_phone || 'N/A'})
                </Text>
                {user?.emergency_contact_phone && (
                  <TouchableOpacity
                    style={styles.callSmallButton}
                    onPress={() => handleCall(user.emergency_contact_phone!)}
                  >
                    <Text style={styles.callSmallText}>📞 কল</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.idInfoRow}>
                <Text style={styles.idInfoLabel}>এলার্জি:</Text>
                <Text style={styles.idInfoValue}>{user?.allergies || 'কোনো এলার্জি নেই'}</Text>
              </View>

              <View style={styles.idInfoRow}>
                <Text style={styles.idInfoLabel}>ক্রনিক সমস্যা:</Text>
                <Text style={styles.idInfoValue}>
                  {user?.chronic_conditions || 'ডায়াবেটিস, উচ্চ রক্তচাপ'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.editProfileBtn}
                onPress={() => setEditProfileVisible(true)}
              >
                <Text style={styles.editProfileBtnText}>✏️ প্রোফাইল তথ্য পরিবর্তন করুন</Text>
              </TouchableOpacity>
            </View>

            {/* Offline QR Code Section */}
            <View style={styles.qrCard}>
              <Text style={styles.qrTitle}>জরুরি রেসপন্ডার QR কোড</Text>
              <Text style={styles.qrSub}>
                জরুরি পরিস্থিতিতে চিকিৎসক বা উদ্ধারকারী স্ক্যান করে আপনার স্বাস্থ্য তথ্য দেখতে পারবেন
              </Text>
              <View style={styles.qrWrapper}>
                <QRCode value={qrData} size={160} color={Colors.primaryDark} />
              </View>
              <Text style={styles.qrFootnote}>* এটি সম্পূর্ণ অফলাইনে কাজ করে</Text>
            </View>

            {/* Active Medications Preview */}
            <View style={styles.medsCard}>
              <Text style={styles.medsCardTitle}>💊 নিয়মিত সেবনযোগ্য ওষুধসমূহ</Text>
              {userMedicines.length === 0 ? (
                <Text style={styles.medsEmpty}>কোনো সক্রিয় ওষুধ নেই</Text>
              ) : (
                userMedicines.map((m) => (
                  <View key={m.id} style={styles.medRow}>
                    <Text style={styles.medBullet}>•</Text>
                    <Text style={styles.medText}>
                      {m.brand_name || m.custom_name} ({m.dosage || '১টি'}) — {m.times ? m.times.join(', ') : '08:00 AM'}
                    </Text>
                  </View>
                ))
              )}
            </View>

            {/* Account & Profile Settings Card */}
            <View style={styles.accountCard}>
              <View style={styles.accountCardHeader}>
                <View style={styles.accountAvatar}>
                  <Text style={{ fontSize: 24 }}>👤</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.accountName}>{user?.name || 'ব্যবহারকারী'}</Text>
                  <Text style={styles.accountPhone}>{user?.phone || '০১৭XXXXXXXX'}</Text>
                  <Text style={styles.accountStatus}>লগইন স্ট্যাটাস: সক্রিয় ✅</Text>
                </View>
              </View>

              <View style={styles.accountDivider} />

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutButtonText}>🚪 অ্যাকাউন্ট থেকে লগআউট করুন</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Government Helplines */}
            <Text style={styles.sectionHeader}>🇧🇩 জাতীয় জরুরি হেল্পলাইন (টোল ফ্রি)</Text>
            <View style={styles.helplineGrid}>
              {BD_HELPLINES.map((h) => (
                <TouchableOpacity
                  key={h.number}
                  style={styles.helplineCard}
                  onPress={() => handleCall(h.number)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.helplineIconBox, { backgroundColor: `${h.color}15` }]}>
                    <Text style={{ fontSize: 24 }}>{h.icon}</Text>
                  </View>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.helplineTitle}>{h.title}</Text>
                    <Text style={styles.helplineDesc} numberOfLines={2}>
                      {h.desc}
                    </Text>
                  </View>
                  <View style={[styles.helplineCallBadge, { backgroundColor: h.color }]}>
                    <Text style={styles.helplineNumber}>{h.number}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Personal Emergency Contacts */}
            <View style={styles.personalHeaderRow}>
              <Text style={styles.sectionHeader}>পারিবারিক জরুরি কন্টাক্ট</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity
                  style={styles.actionPill}
                  onPress={handleImportFromPhonebook}
                >
                  <Text style={styles.actionPillText}>📖 ফোনবুক</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionPill, { backgroundColor: Colors.primary }]}
                  onPress={() => setAddContactVisible(true)}
                >
                  <Text style={[styles.actionPillText, { color: '#FFFFFF' }]}>＋ যোগ</Text>
                </TouchableOpacity>
              </View>
            </View>

            {contacts.length === 0 ? (
              <View style={styles.emptyContactsBox}>
                <Text style={{ fontSize: 40, opacity: 0.5, marginBottom: 6 }}>👥</Text>
                <Text style={styles.emptyTitle}>কোনো পারিবারিক কন্টাক্ট যুক্ত নেই</Text>
                <Text style={styles.emptySub}>
                  জরুরি সহায়তার জন্য ফোনবুক থেকে নিকটাত্মীয়ের নম্বর যুক্ত করুন
                </Text>
              </View>
            ) : (
              contacts.map((c) => (
                <View key={c.id} style={styles.contactItem}>
                  <View style={styles.contactAvatar}>
                    <Text style={{ fontSize: 20 }}>👤</Text>
                  </View>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.contactName}>{c.name}</Text>
                    <Text style={styles.contactPhone}>{c.phone}</Text>
                    <Text style={styles.contactRelation}>{c.relation}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.contactCallBtn}
                    onPress={() => handleCall(c.phone)}
                  >
                    <Text style={styles.contactCallText}>📞 কল</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.contactDeleteBtn}
                    onPress={() => deleteContact(c.id)}
                  >
                    <Text style={styles.contactDeleteText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editProfileVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeading}>মেডিকেল আইডি তথ্য সম্পাদন</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>পূর্ণ নাম</Text>
              <TextInput style={styles.modalInput} value={editName} onChangeText={setEditName} />

              <Text style={styles.fieldLabel}>রক্তের গ্রুপ</Text>
              <View style={styles.bloodRow}>
                {BLOOD_GROUPS.map((bg) => (
                  <TouchableOpacity
                    key={bg}
                    style={[styles.bloodChip, editBloodGroup === bg && styles.bloodChipActive]}
                    onPress={() => setEditBloodGroup(bg)}
                  >
                    <Text style={[styles.bloodChipText, editBloodGroup === bg && styles.bloodChipTextActive]}>
                      {bg}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>জরুরি কন্টাক্ট ব্যক্তির নাম</Text>
              <TextInput
                style={styles.modalInput}
                value={editEmergencyName}
                onChangeText={setEditEmergencyName}
              />

              <Text style={styles.fieldLabel}>জরুরি কন্টাক্ট নম্বর</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="phone-pad"
                value={editEmergencyPhone}
                onChangeText={setEditEmergencyPhone}
              />

              <Text style={styles.fieldLabel}>এলার্জি</Text>
              <TextInput
                style={styles.modalInput}
                value={editAllergies}
                onChangeText={setEditAllergies}
              />

              <Text style={styles.fieldLabel}>ক্রনিক কন্ডিশন</Text>
              <TextInput
                style={styles.modalInput}
                value={editChronic}
                onChangeText={setEditChronic}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditProfileVisible(false)}
              >
                <Text style={styles.cancelBtnText}>বাতিল</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
                <Text style={styles.saveBtnText}>সংরক্ষণ করুন</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Contact Modal */}
      <Modal visible={addContactVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeading}>নতুন জরুরি কন্টাক্ট যোগ করুন</Text>
            <Text style={styles.fieldLabel}>কন্টাক্টের নাম</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="যেমন: পিতা / মাতা / ভাই"
              value={newContactName}
              onChangeText={setNewContactName}
            />

            <Text style={styles.fieldLabel}>ফোন নম্বর</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="01XXXXXXXXX"
              keyboardType="phone-pad"
              value={newContactPhone}
              onChangeText={setNewContactPhone}
            />

            <Text style={styles.fieldLabel}>সম্পর্ক</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="যেমন: পারিবারিক স্বজন"
              value={newContactRelation}
              onChangeText={setNewContactRelation}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setAddContactVisible(false)}
              >
                <Text style={styles.cancelBtnText}>বাতিল</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddManualContact}>
                <Text style={styles.saveBtnText}>যোগ করুন</Text>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#FFFFFF',
  },
  tabButtonText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  idCard: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    elevation: 3,
  },
  idCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  idCardTitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  idCardName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  idCardPhone: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    marginTop: 2,
  },
  bloodBadge: {
    backgroundColor: Colors.danger,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bloodBadgeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  idDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 14,
  },
  idInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  idInfoLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    width: 110,
  },
  idInfoValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  callSmallButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 6,
  },
  callSmallText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  editProfileBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  editProfileBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    alignItems: 'center',
    marginBottom: 18,
    elevation: 1,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  qrSub: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  qrWrapper: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qrFootnote: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 12,
    fontStyle: 'italic',
  },
  medsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  medsCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 10,
  },
  medsEmpty: {
    fontSize: 13,
    color: Colors.textLight,
  },
  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  medBullet: {
    color: Colors.primary,
    fontSize: 18,
    marginRight: 8,
  },
  medText: {
    fontSize: 13,
    color: Colors.textDark,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginVertical: 12,
  },
  helplineGrid: {
    gap: 10,
    marginBottom: 20,
  },
  helplineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  helplineIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  helplineTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  helplineDesc: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  helplineCallBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  helplineNumber: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  personalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionPill: {
    backgroundColor: 'rgba(4, 120, 87, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  actionPillText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  emptyContactsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 4,
  },
  contactItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(4, 120, 87, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  contactPhone: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 1,
  },
  contactRelation: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  contactCallBtn: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
  },
  contactCallText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contactDeleteBtn: {
    padding: 6,
  },
  contactDeleteText: {
    color: Colors.danger,
    fontSize: 16,
    fontWeight: 'bold',
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
    marginBottom: 14,
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
  bloodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  bloodChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
  },
  bloodChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  bloodChipText: {
    fontSize: 13,
    color: Colors.textDark,
    fontWeight: '600',
  },
  bloodChipTextActive: {
    color: '#FFFFFF',
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
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  accountCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(4, 120, 87, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  accountPhone: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 2,
  },
  accountStatus: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  accountDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 14,
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
