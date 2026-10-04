import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { useMedicineStore } from '../../src/store/useMedicineStore';
import { UserMedicine } from '../../src/models';
import { VoiceReminderModal } from '../../src/components/VoiceReminderModal';

const CATEGORIES = ['সব', 'গ্যাস্ট্রিক', 'ডায়াবেটিস', 'প্রেসার', 'ভিটামিন', 'অন্যান্য'];

export default function MedicinesScreen() {
  const router = useRouter();
  const { userMedicines, isLoading, fetchUserMedicines } = useMedicineStore();

  const [selectedCategory, setSelectedCategory] = useState('সব');
  const [searchQuery, setSearchQuery] = useState('');
  const [voiceModalMed, setVoiceModalMed] = useState<{
    name: string;
    dosage?: string;
    time?: string;
  } | null>(null);

  useEffect(() => {
    fetchUserMedicines();
  }, [fetchUserMedicines]);

  const getMealInstructionText = (instruction?: string) => {
    if (instruction === 'before_meal') return 'খাওয়ার আগে';
    if (instruction === 'after_meal') return 'খাওয়ার পরে';
    if (instruction === 'with_meal') return 'খাবারের সাথে';
    return 'প্রয়োজনে';
  };

  const getFrequencyText = (freq?: string) => {
    if (freq === 'once_daily') return 'দিনে ১ বার';
    if (freq === 'twice_daily') return 'দিনে ২ বার';
    if (freq === 'thrice_daily') return 'দিনে ৩ বার';
    return 'প্রয়োজনে';
  };

  const filteredMedicines = userMedicines.filter((med) => {
    const displayName = med.brand_name || med.custom_name || '';
    const nameMatches = displayName.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedCategory === 'সব') return nameMatches;

    const lower = displayName.toLowerCase();
    if (selectedCategory === 'গ্যাস্ট্রিক') {
      return (
        nameMatches &&
        (lower.includes('seclo') ||
          lower.includes('pantonic') ||
          lower.includes('sergel') ||
          lower.includes('omeprazole') ||
          lower.includes('esomeprazole') ||
          lower.includes('গ্যাস্ট্রিক'))
      );
    }
    if (selectedCategory === 'ডায়াবেটিস') {
      return (
        nameMatches &&
        (lower.includes('metformin') ||
          lower.includes('comet') ||
          lower.includes('gdm') ||
          lower.includes('ডায়াবেটিস'))
      );
    }
    if (selectedCategory === 'প্রেসার') {
      return (
        nameMatches &&
        (lower.includes('bipress') ||
          lower.includes('amlodipine') ||
          lower.includes('losartan') ||
          lower.includes('প্রেসার'))
      );
    }
    if (selectedCategory === 'ভিটামিন') {
      return (
        nameMatches &&
        (lower.includes('d-rise') ||
          lower.includes('vitamin') ||
          lower.includes('b-50') ||
          lower.includes('ভিটামিন'))
      );
    }
    return nameMatches;
  });

  const handlePlayVoiceReminder = (item: UserMedicine) => {
    try {
      Vibration.vibrate(40);
    } catch (_) {}
    const displayName = item.brand_name || item.custom_name || 'ওষুধ';
    setVoiceModalMed({
      name: displayName,
      dosage: item.dosage,
      time: item.times ? item.times.join(', ') : undefined,
    });
  };

  const renderMedicineItem = ({ item }: { item: UserMedicine }) => {
    const displayName = item.brand_name || item.custom_name || 'ওষুধ';
    const isLowStock =
      item.remaining_quantity !== undefined &&
      item.remaining_quantity <= (item.refill_alert_days || 3) * 2;

    return (
      <View style={[styles.card, isLowStock && styles.cardLowStock]}>
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 24 }}>💊</Text>
          </View>
          <View style={styles.cardHeaderInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.medName} numberOfLines={1}>
                {displayName}
              </Text>
              <TouchableOpacity
                onPress={() => handlePlayVoiceReminder(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.6}
                style={{ padding: 2 }}
              >
                <Text style={{ fontSize: 16 }}>🔊</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.medSubtitle}>
              {item.dosage || '১টি'} • {getMealInstructionText(item.meal_instruction)}
            </Text>
          </View>
          <View style={styles.freqBadge}>
            <Text style={styles.freqBadgeText}>{getFrequencyText(item.frequency)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <View style={styles.timeRow}>
            <Text style={{ fontSize: 14 }}>⏰</Text>
            <Text style={styles.timeText}>
              সময়: {item.times ? item.times.join(', ') : '08:00 AM'}
            </Text>
          </View>
          {item.remaining_quantity !== undefined && (
            <View
              style={[
                styles.stockBadge,
                isLowStock ? styles.stockLow : styles.stockOk,
              ]}
            >
              <Text
                style={[
                  styles.stockBadgeText,
                  isLowStock ? styles.stockLowText : styles.stockOkText,
                ]}
              >
                বাকি: {item.remaining_quantity} টি
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>আমার ওষুধের তালিকা</Text>
      </View>

      {/* Search & Category Filter Section */}
      <View style={styles.filterSection}>
        <View style={styles.searchBox}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="আপনার ওষুধের তালিকা খুঁজুন..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.categoriesRow}>
          <FlatList
            data={CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(cat) => cat}
            renderItem={({ item: cat }) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  style={[
                    styles.chip,
                    isSelected ? styles.chipSelected : styles.chipUnselected,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>

      {/* Main Content */}
      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : filteredMedicines.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={{ fontSize: 56, opacity: 0.5, marginBottom: 12 }}>💊</Text>
          <Text style={styles.emptyTitle}>
            {searchQuery || selectedCategory !== 'সব'
              ? 'কোনো ওষুধ পাওয়া যায়নি'
              : 'এখনও কোনো ওষুধ যোগ করা হয়নি'}
          </Text>
          <Text style={styles.emptySub}>
            নিচের "+ ওষুধ যোগ করুন" বোতাম চেপে নতুন ওষুধ যুক্ত করুন
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMedicines}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMedicineItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-medicine')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>＋</Text>
        <Text style={styles.fabText}>ওষুধ যোগ করুন</Text>
      </TouchableOpacity>

      {/* Voice Reminder Modal */}
      <VoiceReminderModal
        visible={!!voiceModalMed}
        medicineName={voiceModalMed?.name || ''}
        dosage={voiceModalMed?.dosage}
        scheduledTime={voiceModalMed?.time}
        onClose={() => setVoiceModalMed(null)}
      />
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
  filterSection: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
  },
  categoriesRow: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#FFFFFF',
  },
  chipUnselected: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  chipText: {
    fontSize: 13,
  },
  chipTextSelected: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  chipTextUnselected: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  cardLowStock: {
    borderColor: Colors.accent,
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(4, 120, 87, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderInfo: {
    flex: 1,
    marginRight: 8,
  },
  medName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  medSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 4,
  },
  freqBadge: {
    backgroundColor: 'rgba(4, 120, 87, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  freqBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 13,
    color: Colors.textDark,
    fontWeight: '500',
    marginLeft: 6,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockOk: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
  },
  stockLow: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  stockBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  stockOkText: {
    color: Colors.success,
  },
  stockLowText: {
    color: Colors.accent,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 28,
    elevation: 5,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
