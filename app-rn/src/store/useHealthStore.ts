import { create } from 'zustand';
import { HealthLog, HealthLogType } from '../models';
import { StorageService } from '../services/storage';
import { apiClient } from '../services/api';
import { ENDPOINTS } from '../constants/api';
import { SyncQueueService } from '../services/syncQueue';

interface HealthState {
  isLoading: boolean;
  bpLogs: HealthLog[];
  sugarLogs: HealthLog[];
  weightLogs: HealthLog[];
  pulseLogs: HealthLog[];

  loadInitialData: () => Promise<void>;
  fetchLogs: (type: HealthLogType | 'pulse') => Promise<void>;
  addLog: (data: {
    type: HealthLogType | 'pulse';
    value_1: number;
    value_2?: number | null;
    unit?: string | null;
    meal_context?: string | null;
    notes?: string | null;
  }) => Promise<boolean>;
}

export const useHealthStore = create<HealthState>((set, get) => ({
  isLoading: false,
  bpLogs: [],
  sugarLogs: [],
  weightLogs: [],
  pulseLogs: [],

  loadInitialData: async () => {
    const bp = await StorageService.getHealthLogs('blood_pressure');
    const sugar = await StorageService.getHealthLogs('blood_sugar');
    const weight = await StorageService.getHealthLogs('weight');
    const pulse = await StorageService.getHealthLogs('pulse');

    // Default seed logs if empty
    if (bp.length === 0 && sugar.length === 0) {
      const now = new Date();
      const todayStr = now.toISOString();

      const seedBp: HealthLog[] = [
        {
          id: 1,
          user_id: 2,
          type: 'blood_pressure',
          value_1: 120,
          value_2: 80,
          unit: 'mmHg',
          recorded_at: todayStr,
          notes: 'স্বাভাবিক প্রেশার',
        },
        {
          id: 2,
          user_id: 2,
          type: 'blood_pressure',
          value_1: 128,
          value_2: 84,
          unit: 'mmHg',
          recorded_at: new Date(now.getTime() - 86400000).toISOString(),
          notes: 'বিকেলের রিডিং',
        },
      ];
      const seedSugar: HealthLog[] = [
        {
          id: 3,
          user_id: 2,
          type: 'blood_sugar',
          value_1: 5.8,
          unit: 'mmol/L',
          meal_context: 'fasting',
          recorded_at: todayStr,
          notes: 'সকালে খালি পেটে',
        },
      ];
      const seedWeight: HealthLog[] = [
        {
          id: 4,
          user_id: 2,
          type: 'weight',
          value_1: 68.5,
          unit: 'kg',
          recorded_at: todayStr,
        },
      ];

      await StorageService.saveHealthLogs('blood_pressure', seedBp);
      await StorageService.saveHealthLogs('blood_sugar', seedSugar);
      await StorageService.saveHealthLogs('weight', seedWeight);

      set({
        bpLogs: seedBp,
        sugarLogs: seedSugar,
        weightLogs: seedWeight,
        pulseLogs: [],
      });
    } else {
      set({
        bpLogs: bp,
        sugarLogs: sugar,
        weightLogs: weight,
        pulseLogs: pulse,
      });
    }
  },

  fetchLogs: async (type) => {
    const local = await StorageService.getHealthLogs(type);
    if (local.length > 0) {
      if (type === 'blood_pressure') set({ bpLogs: local });
      else if (type === 'blood_sugar') set({ sugarLogs: local });
      else if (type === 'weight') set({ weightLogs: local });
      else if (type === 'pulse') set({ pulseLogs: local });
    }

    try {
      const res = await apiClient.get(`${ENDPOINTS.healthLogs}?type=${type}&days=30`);
      if (res.data?.success === true && Array.isArray(res.data.data)) {
        const list: HealthLog[] = res.data.data;
        if (type === 'blood_pressure') set({ bpLogs: list });
        else if (type === 'blood_sugar') set({ sugarLogs: list });
        else if (type === 'weight') set({ weightLogs: list });
        else if (type === 'pulse') set({ pulseLogs: list });
        await StorageService.saveHealthLogs(type, list);
      }
    } catch {
      // offline fallback
    }
  },

  addLog: async (data) => {
    const newId = Math.floor(Date.now() % 100000);
    const newLog: HealthLog = {
      id: newId,
      user_id: 2,
      type: data.type as HealthLogType,
      value_1: data.value_1,
      value_2: data.value_2,
      unit: data.unit,
      meal_context: data.meal_context,
      notes: data.notes,
      recorded_at: new Date().toISOString(),
    };

    let updatedList: HealthLog[] = [];
    if (data.type === 'blood_pressure') {
      updatedList = [newLog, ...get().bpLogs];
      set({ bpLogs: updatedList });
    } else if (data.type === 'blood_sugar') {
      updatedList = [newLog, ...get().sugarLogs];
      set({ sugarLogs: updatedList });
    } else if (data.type === 'weight') {
      updatedList = [newLog, ...get().weightLogs];
      set({ weightLogs: updatedList });
    } else if (data.type === 'pulse') {
      updatedList = [newLog, ...get().pulseLogs];
      set({ pulseLogs: updatedList });
    }

    await StorageService.saveHealthLogs(data.type, updatedList);

    // Sync to API
    try {
      await apiClient.post(ENDPOINTS.healthLogs, data);
    } catch {
      await SyncQueueService.enqueue('POST', ENDPOINTS.healthLogs, data);
    }

    return true;
  },
}));
