import * as Contacts from 'expo-contacts';
import { EmergencyContact } from '../models';

export class ContactPickerService {
  static async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }

  static async pickContact(): Promise<EmergencyContact | null> {
    const granted = await this.requestPermission();
    if (!granted) return null;

    try {
      const contact = await Contacts.presentContactPickerAsync();
      if (!contact || !contact.phoneNumbers || contact.phoneNumbers.length === 0) {
        return null;
      }

      const rawPhone = contact.phoneNumbers[0].number || '';
      const cleanPhone = rawPhone.replace(/[^0-9+]/g, '');

      return {
        id: `contact_${Date.now()}_${contact.id}`,
        name: contact.name || 'স্বজন',
        phone: cleanPhone,
        relation: 'পারিবারিক স্বজন',
        is_auto_imported: true,
      };
    } catch {
      return null;
    }
  }
}
