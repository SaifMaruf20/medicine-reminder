export type Frequency = 'once_daily' | 'twice_daily' | 'thrice_daily' | 'weekly' | 'as_needed';
export type MealInstruction = 'before_meal' | 'after_meal' | 'any';

export interface UserMedicine {
  id: number;
  user_id: number;
  medicine_id?: number;
  custom_name?: string;
  dosage?: string;
  frequency: Frequency;
  times: string[];
  meal_instruction: MealInstruction;
  start_date: string;
  end_date?: string;
  total_quantity?: number;
  remaining_quantity?: number;
  refill_alert_days: number;
  notes?: string;
  is_active: boolean;
  // Joined from medicines table
  brand_name?: string;
  generic_name?: string;
  dosage_form?: string;
}

/** Display name helper matching Flutter's computed getter */
export function getDisplayName(med: UserMedicine): string {
  return med.brand_name || med.custom_name || 'ওষুধ';
}
