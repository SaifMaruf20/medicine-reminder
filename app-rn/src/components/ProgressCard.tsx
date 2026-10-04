import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface ProgressCardProps {
  taken: number;
  total: number;
}

export function ProgressCard({ taken, total }: ProgressCardProps) {
  const progress = total > 0 ? taken / total : 0;
  const percentage = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={styles.pieIcon}>📊</Text>
          <Text style={styles.titleText}>আজকের ওষুধ গ্রহণের অগ্রগতি</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {taken}/{total} টি সম্পন্ন
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.track}>
        <View style={[styles.bar, { width: `${percentage}%` }]} />
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.percentageText}>{percentage}% সম্পন্ন</Text>
        <Text style={styles.statusMessage} numberOfLines={1}>
          {progress === 1 && total > 0
            ? '🎉 সব ওষুধ খাওয়া সম্পন্ন!'
            : 'নিয়মিত সময়মতো ওষুধ খান'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  pieIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  track: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  bar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  percentageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusMessage: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
});
