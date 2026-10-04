export interface DoctorAppointment {
  id: number;
  user_id: number;
  doctor_name: string;
  hospital_name?: string | null;
  phone?: string | null;
  appointment_date: string;
  reminder_days: number;
  notes?: string | null;
}
