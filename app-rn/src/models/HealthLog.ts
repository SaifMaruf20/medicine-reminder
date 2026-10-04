export type HealthLogType = 'blood_pressure' | 'blood_sugar' | 'weight';

export interface HealthLog {
  id: number;
  user_id: number;
  type: HealthLogType;
  value_1: number;
  value_2?: number | null;
  unit?: string | null;
  meal_context?: string | null;
  notes?: string | null;
  recorded_at: string;
}
