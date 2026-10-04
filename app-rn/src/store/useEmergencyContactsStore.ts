import { create } from 'zustand';
import { EmergencyContact } from '../models';
import { StorageService } from '../services/storage';

interface EmergencyContactsState {
  contacts: EmergencyContact[];

  loadContacts: () => Promise<void>;
  addContact: (contact: EmergencyContact) => Promise<void>;
  updateContact: (id: string, updated: EmergencyContact) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  setContacts: (contacts: EmergencyContact[]) => Promise<void>;
}

export const useEmergencyContactsStore = create<EmergencyContactsState>((set, get) => ({
  contacts: [],

  loadContacts: async () => {
    const local = await StorageService.getEmergencyContacts();
    if (local.length > 0) {
      set({ contacts: local });
    } else {
      // Default seed emergency contact if empty
      const defaultContacts: EmergencyContact[] = [
        {
          id: 'contact_seed_1',
          name: 'পারিবারিক অভিভাবক',
          phone: '01712345678',
          relation: 'পিতা / মাতা',
        },
      ];
      await StorageService.saveEmergencyContacts(defaultContacts);
      set({ contacts: defaultContacts });
    }
  },

  addContact: async (contact) => {
    const updated = [...get().contacts, contact];
    await StorageService.saveEmergencyContacts(updated);
    set({ contacts: updated });
  },

  updateContact: async (id, updatedContact) => {
    const updated = get().contacts.map((c) => (c.id === id ? updatedContact : c));
    await StorageService.saveEmergencyContacts(updated);
    set({ contacts: updated });
  },

  deleteContact: async (id) => {
    const updated = get().contacts.filter((c) => c.id !== id);
    await StorageService.saveEmergencyContacts(updated);
    set({ contacts: updated });
  },

  setContacts: async (contacts) => {
    await StorageService.saveEmergencyContacts(contacts);
    set({ contacts });
  },
}));
