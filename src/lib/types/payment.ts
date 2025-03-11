
export interface Payment {
  date: Date;
  amount: number;
  isLastPayment: boolean;
  remainingBalance: number;
  interestPaid: number;
  principalPaid: number;
  redistributedAmount?: number;
}

export interface PaymentAllocation {
  [debtId: string]: number;
}

export interface AllocationResult {
  allocations: PaymentAllocation;
  remainingPayment: number;
}

// Define one-time funding entry
export interface OneTimeFunding {
  id: string;
  user_id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
  is_applied: boolean;
  currency_symbol: string; // Changed from optional to required
  created_at?: string;
}
