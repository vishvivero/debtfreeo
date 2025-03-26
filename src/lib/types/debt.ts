
export interface Debt {
  id: string;
  user_id?: string;
  name: string;
  banker_name: string;
  balance: number;
  interest_rate: number;
  minimum_payment: number;
  created_at?: string;
  updated_at?: string;
  currency_symbol: string;
  next_payment_date?: string;
  category?: string;
  closed_date?: string;
  status: 'active' | 'paid';
  metadata?: {
    interest_included?: boolean;
    remaining_months?: number | null;
    [key: string]: any;
  } | null;
}

export interface PaymentHistory {
  id: string;
  user_id?: string;
  total_payment: number;
  payment_date: string;
  created_at?: string;
  currency_symbol: string;
  redistributed_from?: string;
  is_redistributed?: boolean;
}

export interface Profile {
  id: string;
  email: string | null;
  created_at: string;
  updated_at: string;
  monthly_payment: number | null;
  preferred_currency: string | null;
  is_admin: boolean | null;
  selected_strategy?: string;
  show_extra_payments: boolean | null;
  show_lump_sum_payments: boolean | null;
  payment_reminders_enabled?: boolean;
  reminder_days_before?: number;
}
