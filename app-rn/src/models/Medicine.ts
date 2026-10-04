export interface Medicine {
  id: number;
  brand_name: string;
  brand_name_bn?: string;
  generic_name: string;
  generic_name_bn?: string;
  manufacturer?: string;
  dosage_form?: string;
  strength?: string;
  unit_price?: number;
  category?: string;
  indications?: string;
  indications_bn?: string;
  composition?: string;
  composition_bn?: string;
  side_effects?: string;
  instructions?: string;
  // Populated by API variant query
  variants?: Medicine[];
  // Populated by alternatives endpoint
  savings_per_unit?: number;
  savings_percent?: number;
}
