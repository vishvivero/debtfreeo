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

export interface OneTimeFunding {
  payment_date: string;
  amount: number;
  notes?: string | null;
  is_applied?: boolean;
  currency_symbol?: string;
  id?: string;
  user_id?: string;
}