
import { Payment } from "@/lib/types/payment";

export interface RedistributionEvent {
  fromDebtId: string;
  amount: number;
  month: number;
}

export interface PayoffDetails {
  months: number;
  payoffDate: Date;
  totalInterest: number;
  payments: Payment[];
  redistributionHistory: RedistributionEvent[];
}

export interface PaymentAllocation {
  debtId: string;
  amount: number;
  isExtra: boolean;
}
