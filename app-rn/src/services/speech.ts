import * as Speech from 'expo-speech';

export interface SpeechCallbacks {
  onStart?: () => void;
  onDone?: () => void;
  onError?: (error: any) => void;
}

export class SpeechService {
  private static isSpeaking = false;

  static async isSpeakingNow(): Promise<boolean> {
    try {
      return await Speech.isSpeakingAsync();
    } catch {
      return this.isSpeaking;
    }
  }

  static async stop(): Promise<void> {
    try {
      await Speech.stop();
      this.isSpeaking = false;
    } catch {
      this.isSpeaking = false;
    }
  }

  static async checkBengaliAvailable(): Promise<boolean> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices.some(
        (v) =>
          v.language &&
          (v.language.toLowerCase().startsWith('bn') ||
            v.language.toLowerCase().includes('ben') ||
            v.language.toLowerCase().includes('bangla'))
      );
    } catch {
      return false;
    }
  }

  /**
   * Speaks medicine reminder in Bengali script, English phonetics, or standard English.
   * If 'auto' or 'bn' fails or is silent, users can choose phonetic/English.
   */
  static async speakMedicineReminder(
    medicineName: string,
    mode: 'auto' | 'bn' | 'phonetic' | 'en' = 'auto',
    callbacks?: SpeechCallbacks
  ): Promise<void> {
    try {
      // 1. Stop ongoing speech safely
      try {
        const speaking = await Speech.isSpeakingAsync();
        if (speaking) {
          await Speech.stop();
          await new Promise((r) => setTimeout(r, 60));
        }
      } catch (_) {}

      this.isSpeaking = true;
      callbacks?.onStart?.();

      const bnScript = `আসসালামু আলাইকুম। এখন আপনার ${medicineName} খাওয়ার সময় হয়েছে। দয়া করে ওষুধটি খেয়ে নিন।`;
      // Latin phonetic Bengali: English TTS engines pronounce this as recognizable Bengali!
      const bnPhonetic = `Assalamu Alaikum. Ekhon aapnar ${medicineName} khawar shomoy hoyechhe. Doya kore oshudh kheye nin.`;
      const enScript = `Assalamu Alaikum. It is time to take your medicine: ${medicineName}. Please take your medicine now.`;

      let targetText = bnScript;
      let targetLang = 'bn';

      if (mode === 'phonetic') {
        targetText = bnPhonetic;
        targetLang = 'en';
      } else if (mode === 'en') {
        targetText = enScript;
        targetLang = 'en';
      } else if (mode === 'auto') {
        const hasBn = await this.checkBengaliAvailable();
        if (hasBn) {
          targetText = bnScript;
          targetLang = 'bn';
        } else {
          // If phone lacks Bengali voice pack, use phonetic which speaks loudly on 100% of devices
          targetText = bnPhonetic;
          targetLang = 'en';
        }
      }

      console.log(`🔊 [SpeechService] Speaking mode: ${mode} | Lang: ${targetLang} | Medicine: ${medicineName}`);

      Speech.speak(targetText, {
        language: targetLang,
        pitch: 1.0,
        rate: 0.85,
        volume: 1.0,
        onStart: () => {
          this.isSpeaking = true;
          callbacks?.onStart?.();
        },
        onDone: () => {
          this.isSpeaking = false;
          callbacks?.onDone?.();
        },
        onStopped: () => {
          this.isSpeaking = false;
          callbacks?.onDone?.();
        },
        onError: (err) => {
          console.warn('[SpeechService] Error during TTS playback:', err);
          this.isSpeaking = false;

          // If failed on 'bn', try universal phonetic fallback
          if (targetLang === 'bn') {
            console.log('[SpeechService] Retrying with phonetic English voice...');
            Speech.speak(bnPhonetic, {
              language: 'en',
              pitch: 1.0,
              rate: 0.85,
              volume: 1.0,
              onDone: () => {
                this.isSpeaking = false;
                callbacks?.onDone?.();
              },
              onError: (e) => {
                this.isSpeaking = false;
                callbacks?.onError?.(e);
              },
            });
          } else {
            callbacks?.onError?.(err);
          }
        },
      });
    } catch (err) {
      console.error('[SpeechService] speakMedicineReminder exception:', err);
      this.isSpeaking = false;
      callbacks?.onError?.(err);
    }
  }
}
