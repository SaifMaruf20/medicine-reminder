import { create } from 'zustand';
import { Prescription, PrescriptionImage } from '../models';
import { StorageService } from '../services/storage';
import { apiClient } from '../services/api';
import { ENDPOINTS } from '../constants/api';

interface PrescriptionState {
  isLoading: boolean;
  prescriptions: Prescription[];

  loadInitialData: () => Promise<void>;
  fetchPrescriptions: () => Promise<void>;
  addPrescription: (data: {
    doctorName?: string;
    hospitalName?: string;
    diagnosis?: string;
    visitDate: string;
    nextVisitDate?: string;
    notes?: string;
    imageUris?: string[];
  }) => Promise<boolean>;
}

export const usePrescriptionStore = create<PrescriptionState>((set, get) => ({
  isLoading: false,
  prescriptions: [],

  loadInitialData: async () => {
    const local = await StorageService.getPrescriptions();
    if (local.length > 0) {
      set({ prescriptions: local });
    }
  },

  fetchPrescriptions: async () => {
    const local = await StorageService.getPrescriptions();
    set({ isLoading: false, prescriptions: local });

    try {
      const res = await apiClient.get(ENDPOINTS.prescriptions);
      if (res.data?.success === true && Array.isArray(res.data.data)) {
        const list: Prescription[] = res.data.data;
        set({ prescriptions: list });
        await StorageService.savePrescriptions(list);
      }
    } catch {
      // offline fallback
    }
  },

  addPrescription: async (data) => {
    set({ isLoading: true });

    const newId = Math.floor(Date.now() % 100000);
    const images: PrescriptionImage[] = (data.imageUris || []).map((uri, idx) => ({
      id: newId * 10 + idx,
      prescription_id: newId,
      image_path: uri,
    }));

    const newPrescription: Prescription = {
      id: newId,
      user_id: 2,
      doctor_name: data.doctorName || 'ডাক্তার নির্দেশিত প্রেসক্রিপশন',
      hospital_name: data.hospitalName || 'হাসপাতাল / চেম্বার',
      diagnosis: data.diagnosis,
      visit_date: data.visitDate,
      next_visit_date: data.nextVisitDate,
      notes: data.notes,
      images,
    };

    const updated = [newPrescription, ...get().prescriptions];
    await StorageService.savePrescriptions(updated);
    set({ isLoading: false, prescriptions: updated });

    // Background sync attempt
    try {
      const formData = new FormData();
      if (data.doctorName) formData.append('doctor_name', data.doctorName);
      if (data.hospitalName) formData.append('hospital_name', data.hospitalName);
      if (data.diagnosis) formData.append('diagnosis', data.diagnosis);
      formData.append('visit_date', data.visitDate);
      if (data.nextVisitDate) formData.append('next_visit_date', data.nextVisitDate);
      if (data.notes) formData.append('notes', data.notes);

      await apiClient.post(ENDPOINTS.prescriptions, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch {
      // offline fallback
    }

    return true;
  },
}));
