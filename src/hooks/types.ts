
export interface Profile {
  id: string;
  email: string | null;
  created_at: string;
  updated_at: string;
  monthly_payment: number | null;
  preferred_currency: string | null;
  is_admin: boolean | null;
  selected_strategy: string | null;
  show_extra_payments: boolean | null;
  show_lump_sum_payments: boolean | null;
  payment_reminders_enabled?: boolean;
  reminder_days_before?: number;
}
