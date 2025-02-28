
// Define one-time funding entry
export interface OneTimeFunding {
  id: string;
  user_id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
  is_applied: boolean;
  currency_symbol?: string;
}
