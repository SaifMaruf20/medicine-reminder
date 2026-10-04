import { create } from 'zustand';
import { Medicine, UserMedicine, DoseLog } from '../models';
import { StorageService } from '../services/storage';
import { apiClient } from '../services/api';
import { ENDPOINTS } from '../constants/api';
import { OfflineMedicineDataset } from '../data/offlineMedicineDataset';
import { NotificationService } from '../services/notifications';
import { SpeechService } from '../services/speech';
import { SyncQueueService } from '../services/syncQueue';

interface MedicineState {
  isLoading: boolean;
  userMedicines: UserMedicine[];
  todayDoseLogs: DoseLog[];
  searchResults: Medicine[];
  errorMessage: string | null;

  loadInitialData: () => Promise<void>;
  fetchUserMedicines: () => Promise<void>;
  fetchTodayDoseLogs: () => Promise<void>;
  searchMedicines: (query: string) => Promise<void>;
  addUserMedicine: (data: Partial<UserMedicine> & { custom_name?: string }) => Promise<boolean>;
  markDoseStatus: (doseLogId: number, status: 'taken' | 'missed' | 'skipped') => Promise<boolean>;
}

export const useMedicineStore = create<MedicineState>((set, get) => ({
  isLoading: false,
  userMedicines: [],
  todayDoseLogs: [],
  searchResults: [],
  errorMessage: null,

  loadInitialData: async () => {
    const localMeds = await StorageService.getUserMedicines();
    const localDoses = await StorageService.getTodayDoseLogs();

    // Default seed medicines for fresh install if completely empty
    if (localMeds.length === 0) {
      const todayStr = new Date().toISOString().split('T')[0];

      const defaultSeedMeds: UserMedicine[] = [
        {
          id: 1,
          user_id: 2,
          custom_name: 'Napa 500mg',
          brand_name: 'Napa 500mg',
          generic_name: 'Paracetamol',
          dosage: '১টি ট্যাবলেট',
          frequency: 'twice_daily',
          times: ['08:00 AM', '10:00 PM'],
          meal_instruction: 'after_meal',
          start_date: todayStr,
          total_quantity: 30,
          remaining_quantity: 28,
          refill_alert_days: 3,
          is_active: true,
        },
        {
          id: 2,
          user_id: 2,
          custom_name: 'Seclo 20mg',
          brand_name: 'Seclo 20mg',
          generic_name: 'Omeprazole',
          dosage: '১টি ক্যাপসুল',
          frequency: 'twice_daily',
          times: ['07:30 AM', '09:30 PM'],
          meal_instruction: 'before_meal',
          start_date: todayStr,
          total_quantity: 30,
          remaining_quantity: 5, // Low stock demo
          refill_alert_days: 3,
          is_active: true,
        },
      ];
      await StorageService.saveUserMedicines(defaultSeedMeds);

      const defaultSeedDoses: DoseLog[] = [
        {
          id: 1,
          user_medicine_id: 1,
          user_id: 2,
          scheduled_time: '08:00 AM',
          status: 'taken',
          brand_name: 'Napa 500mg',
          dosage: '১টি ট্যাবলেট',
          meal_instruction: 'after_meal',
        },
        {
          id: 2,
          user_medicine_id: 2,
          user_id: 2,
          scheduled_time: '07:30 AM',
          status: 'taken',
          brand_name: 'Seclo 20mg',
          dosage: '১টি ক্যাপসুল',
          meal_instruction: 'before_meal',
        },
        {
          id: 3,
          user_medicine_id: 1,
          user_id: 2,
          scheduled_time: '10:00 PM',
          status: 'pending',
          brand_name: 'Napa 500mg',
          dosage: '১টি ট্যাবলেট',
          meal_instruction: 'after_meal',
        },
      ];
      await StorageService.saveTodayDoseLogs(defaultSeedDoses);

      set({
        userMedicines: defaultSeedMeds,
        todayDoseLogs: defaultSeedDoses,
      });
    } else {
      set({
        userMedicines: localMeds,
        todayDoseLogs: localDoses,
      });
    }
  },

  fetchUserMedicines: async () => {
    const localMeds = await StorageService.getUserMedicines();
    if (localMeds.length > 0) {
      set({ userMedicines: localMeds });
    }

    try {
      const res = await apiClient.get(ENDPOINTS.userMedicines);
      if (res.data?.success === true) {
        const list: UserMedicine[] = res.data.data;
        set({ userMedicines: list });
        await StorageService.saveUserMedicines(list);
      }
    } catch {
      // offline fallback
    }
  },

  fetchTodayDoseLogs: async () => {
    const localDoses = await StorageService.getTodayDoseLogs();
    if (localDoses.length > 0) {
      set({ todayDoseLogs: localDoses });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    try {
      const res = await apiClient.get(`${ENDPOINTS.doseLogs}?date=${todayStr}`);
      if (res.data?.success === true) {
        const list: DoseLog[] = res.data.data;
        set({ todayDoseLogs: list });
        await StorageService.saveTodayDoseLogs(list);
      }
    } catch {
      // offline fallback
    }
  },

  searchMedicines: async (query: string) => {
    if (!query || query.trim().length === 0) {
      set({ searchResults: [] });
      return;
    }

    // Instant local search
    const localResults = OfflineMedicineDataset.search(query);
    set({ searchResults: localResults });

    // Try online search
    try {
      const res = await apiClient.get(`${ENDPOINTS.medicines}?q=${encodeURIComponent(query)}&limit=15`);
      if (res.data?.success === true && Array.isArray(res.data.data) && res.data.data.length > 0) {
        set({ searchResults: res.data.data });
      }
    } catch {
      // offline fallback
    }
  },

  addUserMedicine: async (data) => {
    set({ isLoading: true });

    const newId = Math.floor(Date.now() % 100000);
    const name = data.brand_name || data.custom_name || 'নতুন ওষুধ';
    const times = data.times && data.times.length > 0 ? data.times : ['08:00 AM'];

    const newMed: UserMedicine = {
      id: newId,
      user_id: 2,
      medicine_id: data.medicine_id,
      custom_name: data.custom_name,
      brand_name: name,
      generic_name: data.generic_name,
      dosage: data.dosage || '১টি ট্যাবলেট',
      frequency: data.frequency || 'once_daily',
      times: times,
      meal_instruction: data.meal_instruction || 'after_meal',
      start_date: data.start_date || new Date().toISOString().split('T')[0],
      total_quantity: data.total_quantity || 30,
      remaining_quantity: data.total_quantity || 30,
      refill_alert_days: data.refill_alert_days || 3,
      is_active: true,
    };

    const currentMeds = get().userMedicines;
    const updatedMeds = [...currentMeds, newMed];
    await StorageService.saveUserMedicines(updatedMeds);

    // Generate today's dose logs
    const newLogs: DoseLog[] = [...get().todayDoseLogs];
    for (let i = 0; i < times.length; i++) {
      const doseId = newId * 10 + i;
      const timeStr = times[i];

      newLogs.push({
        id: doseId,
        user_medicine_id: newId,
        user_id: 2,
        scheduled_time: timeStr,
        status: 'pending',
        brand_name: name,
        dosage: newMed.dosage,
        meal_instruction: newMed.meal_instruction,
      });

      // Schedule notification and voice alert
      try {
        await NotificationService.scheduleMedicineReminder({
          id: doseId,
          medicineName: name,
          scheduledTimeStr: timeStr,
        });
      } catch {
        // ignore
      }
    }

    await StorageService.saveTodayDoseLogs(newLogs);
    set({ isLoading: false, userMedicines: updatedMeds, todayDoseLogs: newLogs });

    // Background sync
    try {
      await apiClient.post(ENDPOINTS.userMedicines, data);
    } catch {
      await SyncQueueService.enqueue('POST', ENDPOINTS.userMedicines, data);
    }

    return true;
  },

  markDoseStatus: async (doseLogId: number, status: 'taken' | 'missed' | 'skipped') => {
    let matchedMedId: number | undefined;

    const updatedLogs = get().todayDoseLogs.map((log) => {
      if (log.id === doseLogId) {
        matchedMedId = log.user_medicine_id;
        return {
          ...log,
          status,
          taken_at: new Date().toISOString(),
        };
      }
      return log;
    });

    let updatedMeds = get().userMedicines;
    if (status === 'taken' && matchedMedId !== undefined) {
      updatedMeds = updatedMeds.map((m) => {
        if (m.id === matchedMedId && m.remaining_quantity && m.remaining_quantity > 0) {
          return {
            ...m,
            remaining_quantity: m.remaining_quantity - 1,
          };
        }
        return m;
      });
      await StorageService.saveUserMedicines(updatedMeds);
    }

    await StorageService.saveTodayDoseLogs(updatedLogs);
    set({ todayDoseLogs: updatedLogs, userMedicines: updatedMeds });

    // Play voice alert if taken
    if (status === 'taken') {
      const target = updatedLogs.find((l) => l.id === doseLogId);
      if (target?.brand_name) {
        SpeechService.speakMedicineReminder(`${target.brand_name} খাওয়া সম্পন্ন হয়েছে`);
      }
    }

    // Sync to API
    try {
      await apiClient.post(`${ENDPOINTS.doseLogs}/${doseLogId}/${status}`);
    } catch {
      await SyncQueueService.enqueue('POST', `${ENDPOINTS.doseLogs}/${doseLogId}/${status}`, { status });
    }

    return true;
  },
}));
