import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Colors } from '../constants/colors';
import { SpeechService } from '../services/speech';

interface VoiceReminderModalProps {
  visible: boolean;
  medicineName: string;
  dosage?: string;
  scheduledTime?: string;
  onClose: () => void;
}

export function VoiceReminderModal({
  visible,
  medicineName,
  dosage,
  scheduledTime,
  onClose,
}: VoiceReminderModalProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeMode, setActiveMode] = useState<'auto' | 'bn' | 'phonetic' | 'en'>('auto');

  // Trigger speech automatically when modal opens
  useEffect(() => {
    if (visible && medicineName) {
      handlePlay('auto');
    } else {
      SpeechService.stop();
      setIsSpeaking(false);
    }
    return () => {
      SpeechService.stop();
      setIsSpeaking(false);
    };
  }, [visible, medicineName]);

  const handlePlay = (mode: 'auto' | 'bn' | 'phonetic' | 'en') => {
    setActiveMode(mode);
    setIsSpeaking(true);
    SpeechService.speakMedicineReminder(medicineName, mode, {
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleStop = () => {
    SpeechService.stop();
    setIsSpeaking(false);
  };

  const handleClose = () => {
    SpeechService.stop();
    setIsSpeaking(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.headerIcon}>🔊</Text>
              <View>
                <Text style={styles.headerTitle}>ওষুধ ভয়েস রিমাইন্ডার</Text>
                <Text style={styles.headerSub}>Voice Medicine Alert</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Medicine Card */}
          <View style={styles.medCard}>
            <Text style={styles.medName}>💊 {medicineName}</Text>
            {(dosage || scheduledTime) && (
              <Text style={styles.medMeta}>
                {dosage ? `ডোজ: ${dosage}` : ''}
                {dosage && scheduledTime ? ' • ' : ''}
                {scheduledTime ? `সময়: ${scheduledTime}` : ''}
              </Text>
            )}
          </View>

          {/* Spoken Text Display */}
          <View style={styles.speechBox}>
            <Text style={styles.speechQuote}>“</Text>
            <Text style={styles.speechText}>
              আসসালামু আলাইকুম। এখন আপনার {medicineName} খাওয়ার সময় হয়েছে। দয়া করে ওষুধটি খেয়ে নিন।
            </Text>
          </View>

          {/* Status Indicator */}
          <View style={styles.statusRow}>
            {isSpeaking ? (
              <View style={styles.speakingBadge}>
                <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.speakingText}>ভয়েস বাজছে... (Playing)</Text>
              </View>
            ) : (
              <View style={styles.idleBadge}>
                <Text style={styles.idleText}>⏹ প্রস্তুত (Ready)</Text>
              </View>
            )}
          </View>

          {/* Sound Action Buttons */}
          <View style={styles.btnGrid}>
            <TouchableOpacity
              style={[
                styles.voiceBtn,
                activeMode === 'bn' && isSpeaking && styles.voiceBtnActive,
              ]}
              onPress={() => handlePlay('bn')}
              activeOpacity={0.7}
            >
              <Text style={styles.voiceBtnIcon}>🇧🇩</Text>
              <View>
                <Text style={styles.voiceBtnTitle}>বাংলা কণ্ঠ (Bangla)</Text>
                <Text style={styles.voiceBtnSub}>স্ট্যান্ডার্ড বাংলা কণ্ঠ</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.voiceBtn,
                activeMode === 'phonetic' && isSpeaking && styles.voiceBtnActive,
              ]}
              onPress={() => handlePlay('phonetic')}
              activeOpacity={0.7}
            >
              <Text style={styles.voiceBtnIcon}>🗣️</Text>
              <View>
                <Text style={styles.voiceBtnTitle}>ফোনেটিক বাংলা (Phonetic)</Text>
                <Text style={styles.voiceBtnSub}>প্রতিটি ফোনে নিশ্চিত সাউন্ড</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.voiceBtn,
                activeMode === 'en' && isSpeaking && styles.voiceBtnActive,
              ]}
              onPress={() => handlePlay('en')}
              activeOpacity={0.7}
            >
              <Text style={styles.voiceBtnIcon}>🌐</Text>
              <View>
                <Text style={styles.voiceBtnTitle}>English Voice</Text>
                <Text style={styles.voiceBtnSub}>English Translation</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Stop Button */}
          {isSpeaking && (
            <TouchableOpacity
              style={styles.stopBtn}
              onPress={handleStop}
              activeOpacity={0.8}
            >
              <Text style={styles.stopBtnText}>⏹ থামান (Stop)</Text>
            </TouchableOpacity>
          )}

          {/* Volume Notice Box */}
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>💡 আওয়াজ শুনতে না পেলে:</Text>
            <Text style={styles.tipText}>
              ১. আপনার ফোনের <Text style={{ fontWeight: 'bold' }}>Media Volume (মিডিয়া ভলিউম)</Text> বাড়িয়ে নিন।
            </Text>
            <Text style={styles.tipText}>
              ২. মোবাইলে বাংলা ভয়েস ডেটা না থাকলে <Text style={{ fontWeight: 'bold' }}>"ফোনেটিক বাংলা"</Text> বাটন চাপুন।
            </Text>
          </View>

          {/* Close button */}
          <TouchableOpacity
            style={styles.dismissBtn}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Text style={styles.dismissBtnText}>ঠিক আছে (Close)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  headerSub: {
    fontSize: 12,
    color: Colors.textLight,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  medCard: {
    backgroundColor: 'rgba(4, 120, 87, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(4, 120, 87, 0.2)',
  },
  medName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  medMeta: {
    fontSize: 12,
    color: Colors.textDark,
    marginTop: 3,
  },
  speechBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  speechQuote: {
    fontSize: 22,
    color: Colors.primary,
    lineHeight: 22,
    fontWeight: 'bold',
  },
  speechText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  statusRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  speakingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 120, 87, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  speakingText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  idleBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  idleText: {
    fontSize: 12,
    color: '#6B7280',
  },
  btnGrid: {
    gap: 8,
    marginBottom: 12,
  },
  voiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  voiceBtnActive: {
    backgroundColor: 'rgba(4, 120, 87, 0.1)',
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  voiceBtnIcon: {
    fontSize: 22,
  },
  voiceBtnTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  voiceBtnSub: {
    fontSize: 11,
    color: Colors.textLight,
  },
  stopBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  stopBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.danger,
  },
  tipBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#B45309',
    marginBottom: 3,
  },
  tipText: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  dismissBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  dismissBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
