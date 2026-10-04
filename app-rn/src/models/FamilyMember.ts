export interface FamilyMember {
  link_id: number;
  user_id: number;
  name: string;
  phone: string;
  relationship?: string | null;
  status: string; // 'pending' | 'accepted' | etc.
  today_logs?: any[] | null;
}
