import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";

export interface PaymentAllocation {
  debtId: string;
  amount: number;
  isMinimumPayment: boolean;
}

export class PaymentAllocator {
  public static calculateTotalMinimumPayments(debts: Debt[]): number {
    const total = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
    console.log('Total minimum payments:', total);
    return total;
  }

  public static allocatePayments(
    debts: Debt[],
    totalPayment: number,
    strategy: Strategy
  ): PaymentAllocation[] {
    console.log('Calculating payment allocations:', {
      totalDebts: debts.length,
      totalPayment,
      strategy: strategy.name
    });

    const sortedDebts = strategy.calculate([...debts]);
    const allocations: PaymentAllocation[] = [];
    let remainingPayment = totalPayment;

    // First allocate minimum payments
    sortedDebts.forEach(debt => {
      const minPayment = Math.min(debt.minimum_payment, debt.balance);
      allocations.push({
        debtId: debt.id,
        amount: minPayment,
        isMinimumPayment: true
      });
      remainingPayment -= minPayment;
    });

    // Allocate remaining payment to highest priority debt
    if (remainingPayment > 0 && sortedDebts.length > 0) {
      const highestPriorityDebt = sortedDebts[0];
      allocations.push({
        debtId: highestPriorityDebt.id,
        amount: remainingPayment,
        isMinimumPayment: false
      });
    }

    return allocations;
  }
}