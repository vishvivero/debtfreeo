import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { DebtStatus, OneTimeFunding } from "./calculations/types";
import { calculatePayoffSchedule, calculatePayoffSummary } from "./calculations/payoffCalculator";
import { addMonths } from "date-fns";
import { trackRedistribution } from "./redistributionTracking";
import { calculateMonthlyInterest } from "./calculations/interestCalculator";

export const isDebtPayable = (debt: Debt): boolean => {
  const monthlyInterest = (debt.balance * debt.interest_rate) / 1200;
  return debt.minimum_payment > monthlyInterest;
};

export const getMinimumViablePayment = (debt: Debt): number => {
  const monthlyInterest = (debt.balance * debt.interest_rate) / 1200;
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
    strategy: strategy.name,
    totalMinimumPayments: debts.reduce((sum, d) => sum + d.minimum_payment, 0)
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

  // Filter out unpayable debts from calculation
  remainingDebts = remainingDebts.filter(debt => isDebtPayable(debt));

  // Calculate total minimum payments required for payable debts
  const totalMinimumPayments = remainingDebts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  
  if (monthlyPayment < totalMinimumPayments) {
    console.warn('Monthly payment insufficient to cover minimum payments');
    remainingDebts.forEach(debt => {
      results[debt.id].months = maxMonths;
      results[debt.id].payoffDate = addMonths(startDate, maxMonths);
    });
    return results;
  }

  while (remainingDebts.length > 0 && currentMonth < maxMonths) {
    remainingDebts = strategy.calculate([...remainingDebts]);
    let availablePayment = monthlyPayment + releasedPayments;
    releasedPayments = 0;

    const currentDate = addMonths(startDate, currentMonth);
    
    // Process one-time fundings for this month
    const monthlyFundings = oneTimeFundings.filter(funding => {
      const fundingDate = new Date(funding.payment_date);
      return fundingDate.getMonth() === currentDate.getMonth() &&
             fundingDate.getFullYear() === currentDate.getFullYear();
    });

    availablePayment += monthlyFundings.reduce((sum, funding) => sum + funding.amount, 0);

    // First handle minimum payments and calculate interest
    for (const debt of remainingDebts) {
      const currentBalance = balances.get(debt.id) || 0;
      const monthlyInterest = calculateMonthlyInterest(currentBalance, debt.interest_rate);
      results[debt.id].totalInterest += monthlyInterest;
      
      // Update balance with interest
      balances.set(debt.id, currentBalance + monthlyInterest);
      
      // Apply minimum payment if possible
      const minPayment = Math.min(minimumPayments.get(debt.id) || 0, currentBalance + monthlyInterest);
      if (availablePayment >= minPayment) {
        balances.set(debt.id, (balances.get(debt.id) || 0) - minPayment);
        availablePayment -= minPayment;
      }
    }

    // Then apply extra payments according to strategy
    if (availablePayment > 0 && remainingDebts.length > 0) {
      const targetDebt = remainingDebts[0];
      const currentBalance = balances.get(targetDebt.id) || 0;
      const extraPayment = Math.min(availablePayment, currentBalance);
      
      if (extraPayment > 0) {
        balances.set(targetDebt.id, currentBalance - extraPayment);
        console.log(`Applied extra payment to ${targetDebt.name}:`, {
          amount: extraPayment,
          newBalance: currentBalance - extraPayment
        });
      }
    }

    // Check for paid off debts and handle redistributions
    remainingDebts = remainingDebts.filter(debt => {
      const currentBalance = balances.get(debt.id) || 0;
      
      if (currentBalance <= 0.01) {
        results[debt.id].months = currentMonth + 1;
        results[debt.id].payoffDate = addMonths(startDate, currentMonth + 1);
        
        // Release minimum payment for redistribution
        const releasedPayment = minimumPayments.get(debt.id) || 0;
        releasedPayments += releasedPayment;

        // Track redistribution if there are remaining debts
        const nextDebt = remainingDebts.find(d => d.id !== debt.id && (balances.get(d.id) || 0) > 0);
        if (nextDebt && results[nextDebt.id].redistributionHistory) {
          results[nextDebt.id].redistributionHistory?.push({
            fromDebtId: debt.id,
            amount: releasedPayment,
            month: currentMonth + 1
          });
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

  console.log('Payoff calculation completed:', {
    totalMonths: currentMonth,
    finalBalances: Object.fromEntries(balances),
    payoffDates: Object.fromEntries(
      Object.entries(results).map(([id, detail]) => [
        id,
        detail.payoffDate.toISOString()
      ])
    )
  });

  return results;
};

export { calculatePayoffSchedule } from './calculations/payoffCalculator';
export type { DebtStatus, OneTimeFunding } from './calculations/types';
