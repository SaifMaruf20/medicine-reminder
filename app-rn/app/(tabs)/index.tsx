import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useMedicineStore } from '../../src/store/useMedicineStore';
import { ProgressCard } from '../../src/components/ProgressCard';
import { DoseCard } from '../../src/components/DoseCard';
import { DoseLog } from '../../src/models';

export default function HomeDashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const {
    todayDoseLogs,
    userMedicines,
    loadInitialData,
    fetchUserMedicines,
    fetchTodayDoseLogs,
    markDoseStatus,
  } = useMedicineStore();

  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchUserMedicines(), fetchTodayDoseLogs()]);
    setRefreshing(false);
  }, [fetchUserMedicines, fetchTodayDoseLogs]);

  const totalDoses = todayDoseLogs.length;
  const takenDoses = todayDoseLogs.filter((d) => d.status === 'taken').length;

  const getTimeGroup = (scheduledTime: string) => {
    const t = scheduledTime.toLowerCase();
    if (t.includes('am') || t.includes('সকাল')) {
      const hour = parseInt(scheduledTime.split(':')[0], 10) || 8;
      if (hour < 12) return 'সকাল (Morning)';
    }
    if (t.includes('pm') || t.includes('দুপুর') || t.includes('বিকাল')) {
      const hour = parseInt(scheduledTime.split(':')[0], 10) || 1;
      if (hour < 5 || hour === 12) return 'দুপুর ও বিকাল (Afternoon)';
      return 'রাত (Night)';
    }
    return 'অন্যান্য সময় (Other)';
  };

  // Group doses
  const groupedDoses: Record<string, DoseLog[]> = {};
  for (const log of todayDoseLogs) {
    const group = getTimeGroup(log.scheduled_time);
    if (!groupedDoses[group]) {
      groupedDoses[group] = [];
    }
    groupedDoses[group].push(log);
  }

  // Refill alerts
  const refillAlertMedicines = userMedicines.filter(
    (m) =>
      m.remaining_quantity !== undefined &&
      m.remaining_quantity <= (m.refill_alert_days || 3) * 2
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Custom AppBar Header */}
      <View style={styles.appBar}>
        <View style={styles.greetingCol}>
          <Text style={styles.greetingSub}>আসসালামু আলাইকুম 👋</Text>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.name || 'ব্যবহারকারী'}
          </Text>
        </View>
        <View style={styles.appBarActions}>
          <TouchableOpacity
            style={styles.actionIconButton}
            onPress={() => router.push('/family-sharing')}
            activeOpacity={0.7}
          >
            <Text style={styles.headerEmoji}>👥</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionIconButton}
            onPress={() => router.push('/generic-finder')}
            activeOpacity={0.7}
          >
            <Text style={styles.headerEmoji}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionIconButton, { backgroundColor: 'rgba(239, 68, 68, 0.25)' }]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.headerEmoji}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Progress Card */}
        <ProgressCard taken={takenDoses} total={totalDoses} />

        {/* Refill Alerts */}
        {refillAlertMedicines.map((med) => (
          <View key={med.id} style={styles.refillBanner}>
            <View style={styles.refillIconContainer}>
              <Text style={{ fontSize: 20 }}>⚠️</Text>
            </View>
            <View style={styles.refillTextCol}>
              <Text style={styles.refillTitle}>
                রিফিল অ্যালার্ট: {med.brand_name || med.custom_name}
              </Text>
              <Text style={styles.refillSub}>
                আর মাত্র {med.remaining_quantity} টি ট্যাবলেট বাকি আছে! শীঘ্রই সংগ্রহ করুন।
              </Text>
            </View>
            <TouchableOpacity
              style={styles.refillButton}
              onPress={() =>
                Alert.alert(
                  'রিফিল রিকোয়েস্ট',
                  `${med.brand_name || med.custom_name} রিফিল রিকোয়েস্ট তৈরি করা হয়েছে`
                )
              }
              activeOpacity={0.8}
            >
              <Text style={styles.refillButtonText}>রিফিল</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Quick Action Grid */}
        <Text style={styles.sectionTitle}>দ্রুত সেবা</Text>
        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/appointments')}
            activeOpacity={0.7}
          >
            <View style={[styles.quickIconBg, { backgroundColor: 'rgba(2, 132, 199, 0.12)' }]}>
              <Text style={{ fontSize: 20 }}>📅</Text>
            </View>
            <View style={styles.quickTextCol}>
              <Text style={styles.quickTitle}>ডাক্তার ভিজিট</Text>
              <Text style={styles.quickSub}>শিডিউল ট্র্যাকার</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/generic-finder')}
            activeOpacity={0.7}
          >
            <View style={[styles.quickIconBg, { backgroundColor: 'rgba(5, 150, 105, 0.12)' }]}>
              <Text style={{ fontSize: 20 }}>💰</Text>
            </View>
            <View style={styles.quickTextCol}>
              <Text style={styles.quickTitle}>সস্তা বিকল্প</Text>
              <Text style={styles.quickSub}>খরচ কমান</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/family-sharing')}
            activeOpacity={0.7}
          >
            <View style={[styles.quickIconBg, { backgroundColor: 'rgba(124, 58, 237, 0.12)' }]}>
              <Text style={{ fontSize: 20 }}>👨‍👩‍👧</Text>
            </View>
            <View style={styles.quickTextCol}>
              <Text style={styles.quickTitle}>ফ্যামিলি কেয়ার</Text>
              <Text style={styles.quickSub}>স্বজনদের মনিটর</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/(tabs)/health')}
            activeOpacity={0.7}
          >
            <View style={[styles.quickIconBg, { backgroundColor: 'rgba(220, 38, 38, 0.12)' }]}>
              <Text style={{ fontSize: 20 }}>❤️</Text>
            </View>
            <View style={styles.quickTextCol}>
              <Text style={styles.quickTitle}>বিপি ও সুগার</Text>
              <Text style={styles.quickSub}>লগ করুন</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Today's Schedule Section */}
        <View style={styles.scheduleHeaderRow}>
          <Text style={styles.sectionTitle}>আজকের ওষুধ সময়সূচী</Text>
          <TouchableOpacity
            style={styles.addMedButton}
            onPress={() => router.push('/add-medicine')}
            activeOpacity={0.8}
          >
            <Text style={styles.addMedButtonText}>+ ওষুধ যোগ</Text>
          </TouchableOpacity>
        </View>

        {totalDoses === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>💊</Text>
            <Text style={styles.emptyTitle}>আজকের জন্য কোনো ওষুধ তালিকাভুক্ত নেই</Text>
            <Text style={styles.emptySubtitle}>
              নতুন ওষুধ যুক্ত করতে উপরে "+ ওষুধ যোগ" এ চাপুন
            </Text>
          </View>
        ) : (
          Object.entries(groupedDoses).map(([groupTitle, logs]) => (
            <View key={groupTitle} style={styles.groupContainer}>
              <Text style={styles.groupTitleText}>{groupTitle}</Text>
              {logs.map((log) => (
                <DoseCard
                  key={log.id}
                  dose={log}
                  onMarkStatus={(status) => markDoseStatus(log.id, status)}
                />
              ))}
            </View>
          ))
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
  appBar: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingCol: {
    flex: 1,
  },
  greetingSub: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  appBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 18,
  },
  scrollContent: {
    padding: 16,
  },
  refillBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.5)',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  refillIconContainer: {
    marginRight: 10,
  },
  refillTextCol: {
    flex: 1,
    marginRight: 8,
  },
  refillTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  refillSub: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  refillButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refillButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginTop: 20,
    marginBottom: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 1,
  },
  quickIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  quickTextCol: {
    flex: 1,
  },
  quickTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  quickSub: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 1,
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  addMedButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addMedButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 28,
    alignItems: 'center',
    marginTop: 8,
  },
  emptyEmoji: {
    fontSize: 44,
    opacity: 0.6,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.textDark,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  groupContainer: {
    marginBottom: 10,
  },
  groupTitleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primaryDark,
    marginVertical: 8,
  },
});
