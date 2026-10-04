import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from 'react-native';
import { DoseLog } from '../models';
import { Colors } from '../constants/colors';
import { VoiceReminderModal } from './VoiceReminderModal';

interface DoseCardProps {
  dose: DoseLog;
  onMarkStatus: (status: 'taken' | 'missed' | 'skipped') => void;
}

export function DoseCard({ dose, onMarkStatus }: DoseCardProps) {
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const isTaken = dose.status === 'taken';
  const isMissed = dose.status === 'missed';

  const getMealInstructionText = (instruction?: string) => {
    if (instruction === 'before_meal') return 'খাওয়ার আগে';
    if (instruction === 'after_meal') return 'খাওয়ার পরে';
    if (instruction === 'with_meal') return 'খাবারের সাথে';
    return 'প্রয়োজনে';
  };

  const displayName = dose.brand_name || dose.custom_name || 'ওষুধ';

  const handlePlayVoiceReminder = () => {
    try {
      Vibration.vibrate(40);
    } catch (_) {}
    setShowVoiceModal(true);
  };

  return (
    <View
      style={[
        styles.card,
        isTaken && styles.cardTaken,
        isMissed && styles.cardMissed,
      ]}
    >
      {/* Time Badge */}
      <View
        style={[
          styles.timeBadge,
          isTaken && styles.timeBadgeTaken,
          isMissed && styles.timeBadgeMissed,
        ]}
      >
        <Text
          style={[
            styles.timeText,
            isTaken && styles.timeTextTaken,
            isMissed && styles.timeTextMissed,
          ]}
        >
          {dose.scheduled_time}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.infoCol}>
        <View style={styles.titleRow}>
          <Text style={styles.nameText} numberOfLines={1}>
            {displayName}
          </Text>
          <TouchableOpacity
            style={styles.speakerButton}
            onPress={handlePlayVoiceReminder}
            activeOpacity={0.6}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={{ fontSize: 16 }}>🔊</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.dosageText}>
          {dose.dosage || '১টি'} • {getMealInstructionText(dose.meal_instruction)}
        </Text>
      </View>

      {/* Action / Status */}
      {isTaken ? (
        <View style={styles.statusBadgeTaken}>
          <Text style={styles.statusTextTaken}>✓ খেয়েছি</Text>
        </View>
      ) : isMissed ? (
        <View style={styles.statusBadgeMissed}>
          <Text style={styles.statusTextMissed}>✕ মিসড</Text>
        </View>
      ) : (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButtonCheck}
            onPress={() => onMarkStatus('taken')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIconCheck}>✓</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButtonCancel}
            onPress={() => onMarkStatus('missed')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIconCancel}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Voice Reminder Modal */}
      <VoiceReminderModal
        visible={showVoiceModal}
        medicineName={displayName}
        dosage={dose.dosage}
        scheduledTime={dose.scheduled_time}
        onClose={() => setShowVoiceModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTaken: {
    borderColor: Colors.success,
    borderWidth: 1.5,
  },
  cardMissed: {
    borderColor: Colors.danger,
    borderWidth: 1.5,
  },
  timeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(4, 120, 87, 0.08)',
    marginRight: 12,
  },
  timeBadgeTaken: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
  },
  timeBadgeMissed: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  timeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  timeTextTaken: {
    color: Colors.success,
  },
  timeTextMissed: {
    color: Colors.danger,
  },
  infoCol: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  speakerButton: {
    padding: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(4, 120, 87, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.textDark,
    flexShrink: 1,
  },
  dosageText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  statusBadgeTaken: {
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusTextTaken: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadgeMissed: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusTextMissed: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonCheck: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.3)',
  },
  actionIconCheck: {
    fontSize: 18,
    color: Colors.success,
    fontWeight: 'bold',
  },
  actionButtonCancel: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.25)',
  },
  actionIconCancel: {
    fontSize: 16,
    color: Colors.danger,
    fontWeight: 'bold',
  },
});
