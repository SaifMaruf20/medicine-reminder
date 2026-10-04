export interface PrescriptionImage {
  id: number;
  prescription_id: number;
  image_path: string;
}

export interface Prescription {
  id: number;
  user_id: number;
  doctor_name?: string | null;
  hospital_name?: string | null;
  diagnosis?: string | null;
  visit_date: string;
  next_visit_date?: string | null;
  notes?: string | null;
  images: PrescriptionImage[];
}
