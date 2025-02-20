import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { addMonths } from "date-fns";
import { OneTimeFunding } from "@/lib/types/payment";

export interface DebtStatus {
  months: number;
  totalInterest: number;
  payoffDate: Date;
  redistributionHistory: {
    fromDebtId: string;
    amount: number;
    month: number;
  }[];
  minimumViablePayment: number;
  isPayable: boolean;
}

// Calculate payoff details for a single debt
export const calculatePayoffDetails = (
  debts: Debt[],
  monthlyPayment: number,
  strategy: Strategy,
  oneTimeFundings: OneTimeFunding[] = []
): { [key: string]: DebtStatus } => {
  console.log('🔄 Starting payoff calculation:', {
    totalDebts: debts.length,
    monthlyPayment,
    strategy: strategy.name
  });

  const results: { [key: string]: DebtStatus } = {};
  const balances = new Map<string, number>();
  let remainingDebts = [...debts];
  let currentMonth = 0;
  const maxMonths = 1200;
  const startDate = new Date();
  let availableExtraPayment = 0;

  // Initialize tracking
  debts.forEach(debt => {
    results[debt.id] = {
      months: 0,
      totalInterest: 0,
      payoffDate: new Date(),
      redistributionHistory: [],
      minimumViablePayment: 0,
      isPayable: false
    };
    balances.set(debt.id, debt.balance);
  });

  // Calculate total minimum payments
  const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  
  if (monthlyPayment < totalMinimumPayments) {
    console.warn('Monthly payment insufficient for minimum payments');
    debts.forEach(debt => {
      results[debt.id].months = maxMonths;
      results[debt.id].payoffDate = addMonths(startDate, maxMonths);
    });
    return results;
  }

  while (remainingDebts.length > 0 && currentMonth < maxMonths) {
    remainingDebts = strategy.calculate([...remainingDebts]);
    let monthlyAvailable = monthlyPayment + availableExtraPayment;
    availableExtraPayment = 0;

    // Process minimum payments
    for (const debt of remainingDebts) {
      const currentBalance = balances.get(debt.id) || 0;
      const minPayment = Math.min(debt.minimum_payment, currentBalance);
      
      if (monthlyAvailable >= minPayment) {
        const monthlyInterest = calculateMonthlyInterest(currentBalance, debt.interest_rate);
        results[debt.id].totalInterest += monthlyInterest;
        
        const newBalance = Math.max(0, currentBalance + monthlyInterest - minPayment);
        balances.set(debt.id, newBalance);
        monthlyAvailable -= minPayment;
      }
    }

    // Apply extra payment to highest priority debt
    if (monthlyAvailable > 0 && remainingDebts.length > 0) {
      const targetDebt = remainingDebts[0];
      const currentBalance = balances.get(targetDebt.id) || 0;
      const extraPayment = Math.min(monthlyAvailable, currentBalance);
      
      if (extraPayment > 0) {
        const newBalance = Math.max(0, currentBalance - extraPayment);
        balances.set(targetDebt.id, newBalance);
        monthlyAvailable -= extraPayment;
      }
    }

    // Check for paid off debts
    remainingDebts = remainingDebts.filter(debt => {
      const currentBalance = balances.get(debt.id) || 0;
      
      if (currentBalance <= 0.01) {
        const releasedPayment = debt.minimum_payment;
        availableExtraPayment += releasedPayment;
        
        results[debt.id].months = currentMonth + 1;
        results[debt.id].payoffDate = addMonths(startDate, currentMonth + 1);
        results[debt.id].isPayable = true; // Mark as payable

        // Track redistribution if there are remaining debts
        if (remainingDebts.length > 1) {
          const nextDebt = remainingDebts.find(d => d.id !== debt.id);
          if (nextDebt && results[nextDebt.id].redistributionHistory) {
            results[nextDebt.id].redistributionHistory?.push({
              fromDebtId: debt.id,
              amount: releasedPayment,
              month: currentMonth + 1
            });
          }
        }
        
        return false;
      }
      return true;
    });

    currentMonth++;
  }

  // Handle debts that couldn't be paid off
  remainingDebts.forEach(debt => {
    if (results[debt.id].months === 0) {
      results[debt.id].months = maxMonths;
      results[debt.id].payoffDate = addMonths(startDate, maxMonths);
    }
  });

  return results;
};
