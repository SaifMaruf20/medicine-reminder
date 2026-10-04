import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { usePrescriptionStore } from '../../src/store/usePrescriptionStore';
import { Prescription } from '../../src/models';

export default function PrescriptionsScreen() {
  const router = useRouter();
  const { prescriptions, isLoading, fetchPrescriptions, loadInitialData } =
    usePrescriptionStore();
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [zoomImageUri, setZoomImageUri] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
    fetchPrescriptions();
  }, [loadInitialData, fetchPrescriptions]);

  const renderItem = ({ item }: { item: Prescription }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setSelectedPrescription(item)}
        activeOpacity={0.7}
      >
        <View style={styles.iconCircle}>
          <Text style={{ fontSize: 24 }}>📋</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.doctorName} numberOfLines={1}>
            {item.doctor_name || 'ডাক্তার নির্দেশিত প্রেসক্রিপশন'}
          </Text>
          <Text style={styles.metaText}>
            {item.hospital_name || 'চেম্বার'} • {item.visit_date}
          </Text>
          {item.diagnosis && (
            <Text style={styles.diagnosisText} numberOfLines={1}>
              রোগ: {item.diagnosis}
            </Text>
          )}
        </View>
        <View style={styles.imageCountBadge}>
          <Text style={styles.imageCountText}>
            {item.images ? item.images.length : 0} টি ছবি
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 ডিজিটাল প্রেসক্রিপশন ভল্ট</Text>
      </View>

      {/* Main List */}
      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : prescriptions.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={{ fontSize: 60, opacity: 0.5, marginBottom: 12 }}>📋</Text>
          <Text style={styles.emptyTitle}>এখনও কোনো প্রেসক্রিপশন আপলোড করা হয়নি</Text>
          <Text style={styles.emptySub}>
            আপনার প্রেসক্রিপশনের ছবি তুলে নিরাপদে সংরক্ষণ করুন
          </Text>
        </View>
      ) : (
        <FlatList
          data={prescriptions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB to Add Prescription */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-prescription')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>📷</Text>
        <Text style={styles.fabText}>নতুন প্রেসক্রিপশন</Text>
      </TouchableOpacity>

      {/* Prescription Detail Modal */}
      <Modal visible={!!selectedPrescription} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>প্রেসক্রিপশন বিবরণ</Text>
              <TouchableOpacity onPress={() => setSelectedPrescription(null)}>
                <Text style={{ fontSize: 20, color: Colors.textLight }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.detailDocName}>
                {selectedPrescription?.doctor_name || 'ডাক্তার নির্দেশিত প্রেসক্রিপশন'}
              </Text>
              <Text style={styles.detailMeta}>
                হাসপাতাল: {selectedPrescription?.hospital_name || 'চেম্বার'}
              </Text>
              <Text style={styles.detailMeta}>
                ভিজিটের তারিখ: {selectedPrescription?.visit_date}
              </Text>
              {selectedPrescription?.next_visit_date && (
                <Text style={styles.detailMeta}>
                  পরবর্তী সাক্ষাৎ: {selectedPrescription.next_visit_date}
                </Text>
              )}

              {selectedPrescription?.diagnosis && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>রোগের বিবরণ / নোটস:</Text>
                  <Text style={styles.detailSectionContent}>
                    {selectedPrescription.diagnosis}
                  </Text>
                </View>
              )}

              {selectedPrescription?.images && selectedPrescription.images.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>সংযুক্ত ছবিসমূহ:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                    {selectedPrescription.images.map((img) => (
                      <TouchableOpacity
                        key={img.id}
                        onPress={() => setZoomImageUri(img.image_path)}
                        style={styles.thumbnailWrapper}
                      >
                        <Image
                          source={{ uri: img.image_path }}
                          style={styles.thumbnailImage}
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Image Zoom Modal */}
      <Modal visible={!!zoomImageUri} transparent animationType="fade">
        <View style={styles.zoomContainer}>
          <SafeAreaView style={styles.zoomHeader}>
            <TouchableOpacity onPress={() => setZoomImageUri(null)}>
              <Text style={styles.zoomClose}>✕ বন্ধ করুন</Text>
            </TouchableOpacity>
          </SafeAreaView>
          {zoomImageUri && (
            <Image
              source={{ uri: zoomImageUri }}
              style={styles.zoomedImage}
              resizeMode="contain"
            />
          )}
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
  },
  emptySub: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: 'rgba(4, 120, 87, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
    marginRight: 8,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 2,
  },
  diagnosisText: {
    fontSize: 12,
    color: Colors.primaryDark,
    marginTop: 2,
    fontWeight: '500',
  },
  imageCountBadge: {
    backgroundColor: 'rgba(4, 120, 87, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  imageCountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
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
    fontSize: 18,
    marginRight: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 15,
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
    maxHeight: '80%',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  detailDocName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  detailMeta: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 4,
  },
  detailSection: {
    marginTop: 16,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  detailSectionContent: {
    fontSize: 13,
    color: Colors.textDark,
    marginTop: 4,
    lineHeight: 18,
  },
  thumbnailWrapper: {
    width: 120,
    height: 140,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    overflow: 'hidden',
    marginRight: 10,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  zoomContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  zoomHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  zoomClose: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  zoomedImage: {
    flex: 1,
    width: '100%',
  },
});
