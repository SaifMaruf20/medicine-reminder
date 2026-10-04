export type DoseStatus = 'taken' | 'missed' | 'skipped' | 'pending';

export interface DoseLog {
  id: number;
  user_medicine_id: number;
  user_id: number;
  scheduled_time: string;
  status: DoseStatus;
  taken_at?: string;
  brand_name?: string;
  custom_name?: string;
  dosage?: string;
  meal_instruction?: string;
}

/** Display name helper matching Flutter's computed getter */
export function getDoseDisplayName(log: DoseLog): string {
  return log.brand_name || log.custom_name || 'মেডিসিন';
}
