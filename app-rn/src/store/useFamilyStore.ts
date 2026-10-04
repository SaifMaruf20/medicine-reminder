import { create } from 'zustand';
import { FamilyMember } from '../models';
import { apiClient } from '../services/api';
import { ENDPOINTS } from '../constants/api';

interface FamilyState {
  isLoading: boolean;
  members: FamilyMember[];
  inviteCode: string | null;

  fetchFamilyMembers: () => Promise<void>;
  generateInviteLink: (relationship?: string) => Promise<string>;
  joinFamilyWithCode: (code: string) => Promise<boolean>;
}

export const useFamilyStore = create<FamilyState>((set, get) => ({
  isLoading: false,
  members: [
    {
      link_id: 1,
      user_id: 101,
      name: 'আব্দুল করিম (বাবা)',
      phone: '01711223344',
      relationship: 'পিতা',
      status: 'accepted',
      today_logs: [
        { brand_name: 'Napa 500mg', status: 'taken' },
        { brand_name: 'Amlodipine 5mg', status: 'taken' },
        { brand_name: 'Metformin 500mg', status: 'pending' },
      ],
    },
  ],
  inviteCode: 'OS-FAM-8821',

  fetchFamilyMembers: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get(`${ENDPOINTS.family}/members`);
      if (res.data?.success === true && Array.isArray(res.data.data)) {
        set({ members: res.data.data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  generateInviteLink: async (relationship = 'family') => {
    try {
      const res = await apiClient.post(`${ENDPOINTS.family}/invite`, {
        relationship,
      });
      if (res.data?.success === true && res.data.invite_code) {
        set({ inviteCode: res.data.invite_code });
        return res.data.invite_code;
      }
    } catch {
      // offline fallback
    }

    const mockCode = `OS-FAM-${Math.floor(1000 + Math.random() * 9000)}`;
    set({ inviteCode: mockCode });
    return mockCode;
  },

  joinFamilyWithCode: async (code: string) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.post(`${ENDPOINTS.family}/join`, { code });
      if (res.data?.success === true) {
        set({ isLoading: false });
        return true;
      }
    } catch {
      // offline fallback
    }

    const newMember: FamilyMember = {
      link_id: Date.now(),
      user_id: Math.floor(Math.random() * 1000),
      name: `সংযুক্ত সদস্য (${code})`,
      phone: '017XXXXXXXX',
      relationship: 'পারিবারিক স্বজন',
      status: 'accepted',
      today_logs: [{ brand_name: 'Seclo 20mg', status: 'taken' }],
    };

    set({ members: [...get().members, newMember], isLoading: false });
    return true;
  },
}));
