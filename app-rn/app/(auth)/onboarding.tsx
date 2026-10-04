import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { StorageService } from '../../src/services/storage';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: '⏰',
    title: 'ওষুধ খেতে আর ভুলবেন না',
    subtitle: 'সহজ রিমাইন্ডার এবং ভয়েস নোটিফিকেশনের মাধ্যমে সঠিক সময়ে ওষুধ গ্রহণ করুন।',
  },
  {
    id: '2',
    icon: '👨‍👩‍👧',
    title: 'পরিবারকে জানান আপনি সুস্থ আছেন',
    subtitle: 'আপনার পরিবারের সদস্যরা আপনার ওষুধ খাওয়ার আপডেট জানতে পারবেন।',
  },
  {
    id: '3',
    icon: '🆘',
    title: 'জরুরি SOS ও স্বজন সাপোর্ট',
    subtitle: 'জরুরি অবস্থায় ১-ক্লিকে স্বজন এবং হেল্পলাইনে সরাসরি কল করুন।',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      await StorageService.setOnboardingComplete();
      router.replace('/(auth)/login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfig}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Pagination Dots */}
      <View style={styles.paginationRow}>
        {slides.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              currentIndex === idx ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'শুরু করুন' : 'পরবর্তী'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 88,
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#CBD5E1',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
