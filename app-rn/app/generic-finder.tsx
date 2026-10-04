import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../src/constants/colors';
import { Medicine } from '../src/models';
import { OfflineMedicineDataset } from '../src/data/offlineMedicineDataset';
import { apiClient } from '../src/services/api';
import { ENDPOINTS } from '../src/constants/api';

const QUICK_SEARCHES = ['Napa', 'Seclo', 'Sergel', 'Metformin', 'Bipress'];

export default function GenericFinderScreen() {
  const [searchQuery, setSearchQuery] = useState('Napa');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMedicine, setCurrentMedicine] = useState<Medicine | null>(null);
  const [alternatives, setAlternatives] = useState<Medicine[]>([]);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);

    // 1. Instant offline search
    const offlineMatches = OfflineMedicineDataset.search(query);
    if (offlineMatches.length > 0) {
      const med = offlineMatches[0];
      setCurrentMedicine(med);
      const alts = OfflineMedicineDataset.getAlternatives(med.id);
      alts.sort((a, b) => (a.unit_price || 0) - (b.unit_price || 0));
      setAlternatives(alts);
    } else {
      setCurrentMedicine(null);
      setAlternatives([]);
    }

    // 2. Try online API fetch
    try {
      const res = await apiClient.get(`${ENDPOINTS.medicines}?q=${encodeURIComponent(query)}&limit=1`);
      if (res.data?.success === true && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const med: Medicine = res.data.data[0];
        setCurrentMedicine(med);

        const altRes = await apiClient.get(`${ENDPOINTS.medicines}/${med.id}/alternatives`);
        if (altRes.data?.success === true && Array.isArray(altRes.data.data)) {
          const list: Medicine[] = altRes.data.data;
          list.sort((a, b) => (a.unit_price || 0) - (b.unit_price || 0));
          setAlternatives(list);
        }
      }
    } catch {
      // offline fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    performSearch('Napa');
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          ব্র্যান্ডের ওষুধের নাম দিয়ে সার্চ করুন এবং একই কার্যকারিতার সাশ্রয়ী বিকল্প খুঁজে নিন
        </Text>

        {/* Search Input */}
        <View style={styles.searchWrapper}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="যেমন: Napa, Seclo, Comet, Sergel..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => performSearch(searchQuery)}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => performSearch(searchQuery)}
          >
            <Text style={{ fontSize: 18, color: Colors.primary }}>➔</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Search Chips */}
        <View style={styles.quickRow}>
          {QUICK_SEARCHES.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.quickChip}
              onPress={() => {
                setSearchQuery(item);
                performSearch(item);
              }}
            >
              <Text style={styles.quickChipText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={Colors.primary} size="large" />
          </View>
        ) : currentMedicine ? (
          <>
            {/* Current Brand Card */}
            <View style={styles.brandCard}>
              <View style={styles.brandRow}>
                <View style={styles.brandIconCircle}>
                  <Text style={{ fontSize: 24 }}>💊</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.brandTitle}>
                    {currentMedicine.brand_name} ({currentMedicine.strength || ''})
                  </Text>
                  <Text style={styles.brandGeneric}>
                    জেনেরিক: {currentMedicine.generic_name}
                  </Text>
                  <Text style={styles.brandMeta}>
                    MRP ৳{currentMedicine.unit_price || 0.0}/পিস • {currentMedicine.manufacturer}
                  </Text>
                </View>
              </View>

              {currentMedicine.indications_bn && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.indicationText}>
                    মূল প্রয়োগ: {currentMedicine.indications_bn}
                  </Text>
                </>
              )}
            </View>

            {/* Alternatives Header */}
            <View style={styles.altsHeaderRow}>
              <Text style={styles.altsHeading}>
                💡 সাশ্রয়ী জেনেরিক বিকল্প ({alternatives.length}টি)
              </Text>
              <Text style={styles.altsSub}>সর্বনিম্ন মূল্য প্রথম</Text>
            </View>

            {/* Alternatives List */}
            {alternatives.map((alt) => {
              const basePrice = currentMedicine.unit_price || 1.0;
              const altPrice = alt.unit_price || basePrice;
              const diff = basePrice - altPrice;
              const savingsPercent =
                basePrice > altPrice ? Math.round((diff / basePrice) * 100) : 0;

              return (
                <View key={alt.id} style={styles.altCard}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={styles.altBrand}>
                      {alt.brand_name} ({alt.strength || ''})
                    </Text>
                    <Text style={styles.altMfg}>{alt.manufacturer}</Text>
                    {alt.indications_bn && (
                      <Text style={styles.altIndication} numberOfLines={1}>
                        {alt.indications_bn}
                      </Text>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.altPrice}>৳{alt.unit_price || 0.0}/পিস</Text>
                    {savingsPercent > 0 && (
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsText}>
                          ৳{diff.toFixed(1)} সাশ্রয় ({savingsPercent}% কম)
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}

            {/* Disclaimer Banner */}
            <View style={styles.warningBanner}>
              <Text style={{ fontSize: 18, marginRight: 8 }}>⚠️</Text>
              <Text style={styles.warningText}>
                সতর্কতা: যেকোনো ওষুধ পরিবর্তনের পূর্বে নিবন্ধিত চিকিৎসকের সাথে পরামর্শ করুন।
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              '{searchQuery}' নামে কোনো ওষুধ ডাটাবেজে পাওয়া যায়নি
            </Text>
          </View>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 14,
    lineHeight: 18,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
  },
  searchButton: {
    padding: 6,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  quickChip: {
    backgroundColor: 'rgba(4, 120, 87, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
  },
  brandCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    padding: 16,
    marginBottom: 22,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(4, 120, 87, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  brandGeneric: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 2,
  },
  brandMeta: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  indicationText: {
    fontSize: 13,
    color: Colors.textDark,
    lineHeight: 18,
  },
  altsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  altsHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  altsSub: {
    fontSize: 12,
    color: Colors.textLight,
  },
  altCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
  },
  altBrand: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  altMfg: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  altIndication: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  altPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  savingsBadge: {
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  savingsText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.success,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
    padding: 14,
    marginTop: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#B45309',
    lineHeight: 16,
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
