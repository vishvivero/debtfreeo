
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { convertCurrency } from "@/lib/utils/currencyConverter";

export interface PaymentAllocation {
  debtId: string;
  amount: number;
  isMinimumPayment: boolean;
}

export class PaymentAllocator {
  public static calculateTotalMinimumPayments(debts: Debt[], preferredCurrency?: string): number {
    // If no preferred currency is provided, simply add up the minimum payments
    if (!preferredCurrency) {
      const total = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
      console.log('Total minimum payments (no conversion):', total);
      return total;
    }
    
    // With preferred currency, convert each payment before summing
    const total = debts.reduce((sum, debt) => {
      const convertedAmount = convertCurrency(
        debt.minimum_payment,
        debt.currency_symbol,
        preferredCurrency
      );
      return sum + convertedAmount;
    }, 0);
    
    console.log('Total minimum payments with currency conversion:', {
      preferredCurrency,
      total,
      payments: debts.map(d => ({
        name: d.name,
        original: `${d.currency_symbol}${d.minimum_payment}`,
        converted: `${preferredCurrency}${convertCurrency(
          d.minimum_payment,
          d.currency_symbol,
          preferredCurrency
        )}`
      }))
    });
    
    return total;
  }

  public static allocatePayments(
    debts: Debt[],
    totalPayment: number,
    strategy: Strategy,
    preferredCurrency?: string
  ): PaymentAllocation[] {
    console.log('Calculating payment allocations:', {
      totalDebts: debts.length,
      totalPayment,
      strategy: strategy.name,
      preferredCurrency
    });

    const sortedDebts = strategy.calculate([...debts]);
    const allocations: PaymentAllocation[] = [];
    let remainingPayment = totalPayment;

    // First allocate minimum payments
    sortedDebts.forEach(debt => {
      // Convert minimum payment to preferred currency if needed
      const minPayment = preferredCurrency
        ? convertCurrency(
            Math.min(debt.minimum_payment, debt.balance),
            debt.currency_symbol, 
            preferredCurrency
          )
        : Math.min(debt.minimum_payment, debt.balance);
        
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
