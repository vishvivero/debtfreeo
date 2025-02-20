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

// Add the missing calculateMonthlyInterest function
const calculateMonthlyInterest = (balance: number, annualRate: number): number => {
  return (balance * annualRate) / 1200;
};

export const isDebtPayable = (debt: Debt): boolean => {
  const monthlyInterest = calculateMonthlyInterest(debt.balance, debt.interest_rate);
  return debt.minimum_payment > monthlyInterest;
};

export const getMinimumViablePayment = (debt: Debt): number => {
  const monthlyInterest = calculateMonthlyInterest(debt.balance, debt.interest_rate);
  return Math.ceil(monthlyInterest + 1); // At least $1 more than monthly interest
};

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
  const minimumPayments = new Map<string, number>();
  let remainingDebts = [...debts];
  let currentMonth = 0;
  const maxMonths = 1200;
  const startDate = new Date();
  let releasedPayments = 0;

  // Initialize tracking
  debts.forEach(debt => {
    balances.set(debt.id, debt.balance);
    minimumPayments.set(debt.id, debt.minimum_payment);
    
    // Check if debt is payable
    if (!isDebtPayable(debt)) {
      console.log(`Debt ${debt.name} is not payable with current minimum payment`);
      results[debt.id] = {
        months: Infinity,
        totalInterest: Infinity,
        payoffDate: new Date(8640000000000000), // Max date
        redistributionHistory: [],
        isPayable: false,
        minimumViablePayment: getMinimumViablePayment(debt)
      };
      return;
    }

    results[debt.id] = {
      months: 0,
      totalInterest: 0,
      payoffDate: new Date(),
      redistributionHistory: [],
      isPayable: true,
      minimumViablePayment: debt.minimum_payment
    };
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
    let monthlyAvailable = monthlyPayment + releasedPayments;
    releasedPayments = 0;

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
        releasedPayments += releasedPayment;
        
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
