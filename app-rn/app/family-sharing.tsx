import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '../src/constants/colors';
import { useFamilyStore } from '../src/store/useFamilyStore';

export default function FamilySharingScreen() {
  const router = useRouter();
  const { members, inviteCode, generateInviteLink, joinFamilyWithCode } =
    useFamilyStore();

  const [inputCode, setInputCode] = useState('');

  const handleGenerateNewCode = async () => {
    const code = await generateInviteLink();
    Alert.alert('নতুন ইনভাইট কোড', `আপনার নতুন পারিবারিক কোড: ${code}`);
  };

  const handleJoin = async () => {
    if (!inputCode.trim()) {
      Alert.alert('সতর্কতা', 'কোড লিখুন');
      return;
    }
    await joinFamilyWithCode(inputCode.trim().toUpperCase());
    setInputCode('');
    Alert.alert('সাফল্য', 'পারিবারিক সদস্য সফলভাবে সংযুক্ত হয়েছে');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          বয়োজ্যেষ্ঠ পিতা-মাতা বা পরিবারের সদস্যদের ওষুধ গ্রহণের অগ্রগতি সরাসরি মনিটর করুন
        </Text>

        {/* QR Invite Card */}
        <View style={styles.qrCard}>
          <Text style={styles.qrTitle}>পারিবারিক লিংক ইনভাইটেশন</Text>
          <Text style={styles.qrDesc}>
            নিচের QR কোড স্ক্যান করে পরিবারের সদস্যকে এই অ্যাপের সাথে যুক্ত করুন
          </Text>

          <View style={styles.qrWrapper}>
            <QRCode value={inviteCode || 'OS-FAM-8821'} size={150} color={Colors.primaryDark} />
          </View>

          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{inviteCode || 'OS-FAM-8821'}</Text>
          </View>

          <View style={styles.qrButtonsRow}>
            <TouchableOpacity
              style={styles.refreshCodeBtn}
              onPress={handleGenerateNewCode}
            >
              <Text style={styles.refreshCodeBtnText}>🔄 নতুন কোড তৈরি</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.scanQrBtn}
              onPress={() => router.push('/qr-scanner')}
            >
              <Text style={styles.scanQrBtnText}>📷 কোড স্ক্যান করুন</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Manual Code Join Section */}
        <View style={styles.joinCard}>
          <Text style={styles.joinTitle}>অন্য পরিবারের সাথে যুক্ত হোন</Text>
          <View style={styles.joinInputRow}>
            <TextInput
              style={styles.joinInput}
              placeholder="ইনভাইট কোড লিখুন..."
              placeholderTextColor="#94A3B8"
              value={inputCode}
              onChangeText={setInputCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
              <Text style={styles.joinButtonText}>যুক্ত হোন</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Linked Members List */}
        <Text style={styles.sectionHeading}>সংযুক্ত পরিবারের সদস্যবৃন্দ ({members.length}জন)</Text>

        {members.map((member) => {
          const logs = member.today_logs || [];
          const taken = logs.filter((l: any) => l.status === 'taken').length;
          const total = logs.length;

          return (
            <View key={member.link_id} style={styles.memberCard}>
              <View style={styles.memberHeader}>
                <View style={styles.memberAvatar}>
                  <Text style={{ fontSize: 24 }}>👴</Text>
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberPhone}>{member.phone}</Text>
                </View>
                <View style={styles.relationBadge}>
                  <Text style={styles.relationBadgeText}>{member.relationship || 'স্বজন'}</Text>
                </View>
              </View>

              <View style={styles.memberDivider} />

              <View style={styles.adherenceRow}>
                <Text style={styles.adherenceTitle}>আজকের ওষুধ গ্রহণ অগ্রগতি:</Text>
                <Text style={styles.adherenceStats}>
                  {taken}/{total} টি সম্পন্ন
                </Text>
              </View>

              <View style={styles.chipsRow}>
                {logs.map((log: any, idx: number) => {
                  const isTaken = log.status === 'taken';
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.doseChip,
                        isTaken ? styles.doseChipTaken : styles.doseChipPending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.doseChipText,
                          isTaken ? styles.doseChipTextTaken : styles.doseChipTextPending,
                        ]}
                      >
                        {isTaken ? '✓' : '⏰'} {log.brand_name}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
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
    padding: 16,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 16,
    lineHeight: 18,
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  qrTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  qrDesc: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  qrWrapper: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  codeBadge: {
    backgroundColor: 'rgba(4, 120, 87, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 14,
  },
  codeText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: Colors.primary,
  },
  qrButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    width: '100%',
  },
  refreshCodeBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  refreshCodeBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  scanQrBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  scanQrBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  joinCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 20,
  },
  joinTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 10,
  },
  joinInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  joinInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
    fontWeight: 'bold',
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 12,
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(4, 120, 87, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  memberPhone: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 1,
  },
  relationBadge: {
    backgroundColor: 'rgba(4, 120, 87, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  relationBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  memberDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  adherenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  adherenceTitle: {
    fontSize: 13,
    color: Colors.textDark,
    fontWeight: '600',
  },
  adherenceStats: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  doseChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  doseChipTaken: {
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
  },
  doseChipPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  doseChipText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  doseChipTextTaken: {
    color: Colors.success,
  },
  doseChipTextPending: {
    color: Colors.accent,
  },
});
