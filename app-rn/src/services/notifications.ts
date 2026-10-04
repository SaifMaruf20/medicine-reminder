import { Platform } from 'react-native';
import { SpeechService } from './speech';

// Safe lazy reference to expo-notifications to prevent crashes in Expo Go (SDK 53+)
let Notifications: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Notifications = require('expo-notifications');
  if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
} catch {
  // Expo Go on Android removed remote notifications in SDK 53+. Gracefully fall back.
}

export class NotificationService {
  private static initialized = false;

  static async init(): Promise<void> {
    if (this.initialized || !Notifications) return;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (Platform.OS === 'android' && Notifications.setNotificationChannelAsync) {
        await Notifications.setNotificationChannelAsync('medicine_reminder_channel', {
          name: 'মেডিসিন রিমাইন্ডার',
          description: 'ওষুধ খাওয়ার সময় অনুস্মারক',
          importance: Notifications.AndroidImportance?.MAX || 5,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#047857',
          sound: 'default',
        });
      }

      // Add listener for user interaction with notification
      if (Notifications.addNotificationResponseReceivedListener) {
        Notifications.addNotificationResponseReceivedListener((response: any) => {
          const payload = response?.notification?.request?.content?.data as Record<string, any>;
          if (payload?.medicineName && typeof payload.medicineName === 'string') {
            SpeechService.speakMedicineReminder(payload.medicineName);
          }
        });
      }

      this.initialized = true;
    } catch {
      // ignore
    }
  }

  static async scheduleMedicineReminder(params: {
    id: number;
    medicineName: string;
    scheduledTimeStr: string; // e.g. "08:00" or "08:00 AM"
  }): Promise<void> {
    try {
      if (!Notifications) {
        // Fall back to Bangla voice announcement in Expo Go
        SpeechService.speakMedicineReminder(params.medicineName);
        return;
      }

      await this.init();

      // Parse time string
      const timeParts = params.scheduledTimeStr.split(' ')[0].split(':');
      if (timeParts.length < 2) return;

      let hour = parseInt(timeParts[0], 10);
      const minute = parseInt(timeParts[1], 10);

      const isPM = params.scheduledTimeStr.toUpperCase().includes('PM');
      const isAM = params.scheduledTimeStr.toUpperCase().includes('AM');

      if (isPM && hour < 12) hour += 12;
      if (isAM && hour === 12) hour = 0;

      const now = new Date();
      let scheduledDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hour,
        minute,
        0
      );

      // If scheduled time already passed today, schedule for tomorrow
      if (scheduledDate.getTime() <= now.getTime()) {
        scheduledDate.setDate(scheduledDate.getDate() + 1);
      }

      const secondsUntil = Math.max(
        1,
        Math.floor((scheduledDate.getTime() - now.getTime()) / 1000)
      );

      // Schedule notification
      if (Notifications.scheduleNotificationAsync) {
        await Notifications.scheduleNotificationAsync({
          identifier: `med_reminder_${params.id}`,
          content: {
            title: '💊 ওষুধ খাওয়ার সময় হয়েছে!',
            body: `এখন আপনার ${params.medicineName} খাওয়ার সময়। দয়া করে ওষুধটি খেয়ে নিন।`,
            sound: 'default',
            data: {
              medicineName: params.medicineName,
              doseLogId: params.id,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes?.TIME_INTERVAL || 'timeInterval',
            seconds: secondsUntil,
          },
        });

        // Show instant confirmation toast/notification
        await Notifications.scheduleNotificationAsync({
          identifier: `med_confirm_${params.id}`,
          content: {
            title: '⏰ মেডিসিন অ্যালার্ম সেট করা হয়েছে',
            body: `${params.medicineName} খাওয়ার সময়: ${params.scheduledTimeStr}`,
            sound: 'default',
          },
          trigger: null, // immediate
        });
      }
    } catch {
      // ignore
    }
  }

  static async cancelReminder(id: number): Promise<void> {
    try {
      if (Notifications && Notifications.cancelScheduledNotificationAsync) {
        await Notifications.cancelScheduledNotificationAsync(`med_reminder_${id}`);
      }
    } catch {
      // ignore
    }
  }
}
