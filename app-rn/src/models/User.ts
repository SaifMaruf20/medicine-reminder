export interface User {
  id: number;
  phone: string;
  name: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  blood_group?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies?: string;
  chronic_conditions?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  profile_image_url?: string;
}
