import { create } from 'zustand';
import { DoctorAppointment } from '../models';
import { StorageService } from '../services/storage';
import { apiClient } from '../services/api';
import { ENDPOINTS } from '../constants/api';

interface AppointmentState {
  isLoading: boolean;
  appointments: DoctorAppointment[];

  loadInitialData: () => Promise<void>;
  fetchAppointments: () => Promise<void>;
  addAppointment: (data: {
    doctorName: string;
    hospitalName?: string;
    phone?: string;
    appointmentDate: string;
    reminderDays?: number;
    notes?: string;
  }) => Promise<boolean>;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  isLoading: false,
  appointments: [],

  loadInitialData: async () => {
    const local = await StorageService.getAppointments();
    if (local.length > 0) {
      set({ appointments: local });
    } else {
      const defaultSeed: DoctorAppointment[] = [
        {
          id: 1,
          user_id: 2,
          doctor_name: 'ডাঃ তৌহিদ হোসাইন',
          hospital_name: 'স্কয়ার হাসপাতাল, ঢাকা',
          phone: '01711223344',
          appointment_date: '2026-10-15',
          reminder_days: 3,
          notes: 'নিয়মিত ফলোআপ ভিজিট ও ডায়াবেটিস টেস্ট রিপোর্ট দেখানো',
        },
      ];
      await StorageService.saveAppointments(defaultSeed);
      set({ appointments: defaultSeed });
    }
  },

  fetchAppointments: async () => {
    const local = await StorageService.getAppointments();
    set({ isLoading: false, appointments: local });

    try {
      const res = await apiClient.get(ENDPOINTS.appointments);
      if (res.data?.success === true && Array.isArray(res.data.data)) {
        const list: DoctorAppointment[] = res.data.data;
        set({ appointments: list });
        await StorageService.saveAppointments(list);
      }
    } catch {
      // offline fallback
    }
  },

  addAppointment: async (data) => {
    set({ isLoading: true });

    const newId = Math.floor(Date.now() % 100000);
    const newAppt: DoctorAppointment = {
      id: newId,
      user_id: 2,
      doctor_name: data.doctorName,
      hospital_name: data.hospitalName,
      phone: data.phone,
      appointment_date: data.appointmentDate,
      reminder_days: data.reminderDays || 3,
      notes: data.notes,
    };

    const updated = [newAppt, ...get().appointments];
    await StorageService.saveAppointments(updated);
    set({ isLoading: false, appointments: updated });

    // Sync to API
    try {
      await apiClient.post(ENDPOINTS.appointments, {
        doctor_name: data.doctorName,
        hospital_name: data.hospitalName,
        phone: data.phone,
        appointment_date: data.appointmentDate,
        reminder_days: data.reminderDays || 3,
        notes: data.notes,
      });
    } catch {
      // offline fallback
    }

    return true;
  },
}));
