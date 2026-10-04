import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import {
  User,
  UserMedicine,
  DoseLog,
  HealthLog,
  Prescription,
  DoctorAppointment,
  EmergencyContact,
} from '../models';

const KEY_TOKEN = 'jwt_token';
const KEY_USER = 'user_data';
const KEY_ONBOARDING = 'onboarding_complete';
const KEY_MEDICINES = 'local_user_medicines';
const KEY_DOSE_LOGS = 'local_today_dose_logs';
const KEY_HEALTH_LOGS_PREFIX = 'local_health_logs_';
const KEY_PRESCRIPTIONS = 'local_prescriptions';
const KEY_APPOINTMENTS = 'local_appointments';
const KEY_EMERGENCY_CONTACTS = 'local_emergency_contacts';

export class StorageService {
  // Token (SecureStore with AsyncStorage fallback for web)
  static async saveToken(token: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(KEY_TOKEN, token);
      } else {
        await SecureStore.setItemAsync(KEY_TOKEN, token);
      }
    } catch {
      await AsyncStorage.setItem(KEY_TOKEN, token);
    }
  }

  static async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(KEY_TOKEN);
      }
      return await SecureStore.getItemAsync(KEY_TOKEN);
    } catch {
      return await AsyncStorage.getItem(KEY_TOKEN);
    }
  }

  // User
  static async saveUser(user: User): Promise<void> {
    await AsyncStorage.setItem(KEY_USER, JSON.stringify(user));
  }

  static async getUser(): Promise<User | null> {
    const raw = await AsyncStorage.getItem(KEY_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  static async clearAuth(): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(KEY_TOKEN);
      }
    } catch {
      // ignore
    }
    await AsyncStorage.removeItem(KEY_TOKEN);
    await AsyncStorage.removeItem(KEY_USER);
  }

  // Onboarding
  static async setOnboardingComplete(): Promise<void> {
    await AsyncStorage.setItem(KEY_ONBOARDING, 'true');
  }

  static async isOnboardingComplete(): Promise<boolean> {
    const val = await AsyncStorage.getItem(KEY_ONBOARDING);
    return val === 'true';
  }

  // User Medicines
  static async saveUserMedicines(medicines: UserMedicine[]): Promise<void> {
    await AsyncStorage.setItem(KEY_MEDICINES, JSON.stringify(medicines));
  }

  static async getUserMedicines(): Promise<UserMedicine[]> {
    const raw = await AsyncStorage.getItem(KEY_MEDICINES);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  // Today Dose Logs
  static async saveTodayDoseLogs(logs: DoseLog[]): Promise<void> {
    await AsyncStorage.setItem(KEY_DOSE_LOGS, JSON.stringify(logs));
  }

  static async getTodayDoseLogs(): Promise<DoseLog[]> {
    const raw = await AsyncStorage.getItem(KEY_DOSE_LOGS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  // Health Logs
  static async saveHealthLogs(type: string, logs: HealthLog[]): Promise<void> {
    await AsyncStorage.setItem(`${KEY_HEALTH_LOGS_PREFIX}${type}`, JSON.stringify(logs));
  }

  static async getHealthLogs(type: string): Promise<HealthLog[]> {
    const raw = await AsyncStorage.getItem(`${KEY_HEALTH_LOGS_PREFIX}${type}`);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  // Prescriptions
  static async savePrescriptions(list: Prescription[]): Promise<void> {
    await AsyncStorage.setItem(KEY_PRESCRIPTIONS, JSON.stringify(list));
  }

  static async getPrescriptions(): Promise<Prescription[]> {
    const raw = await AsyncStorage.getItem(KEY_PRESCRIPTIONS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  // Appointments
  static async saveAppointments(list: DoctorAppointment[]): Promise<void> {
    await AsyncStorage.setItem(KEY_APPOINTMENTS, JSON.stringify(list));
  }

  static async getAppointments(): Promise<DoctorAppointment[]> {
    const raw = await AsyncStorage.getItem(KEY_APPOINTMENTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  // Emergency Contacts
  static async saveEmergencyContacts(contacts: EmergencyContact[]): Promise<void> {
    await AsyncStorage.setItem(KEY_EMERGENCY_CONTACTS, JSON.stringify(contacts));
  }

  static async getEmergencyContacts(): Promise<EmergencyContact[]> {
    const raw = await AsyncStorage.getItem(KEY_EMERGENCY_CONTACTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
}
