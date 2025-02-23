
import { Debt } from "@/lib/types";
import { OneTimeFunding } from "@/hooks/use-one-time-funding";
import { format, addMonths } from "date-fns";
import { Strategy } from "@/lib/strategies";

export interface TimelineData {
  date: string;
  monthLabel: string;
  month: number;
  baselineBalance: number;
  acceleratedBalance: number;
  baselineInterest: number;
  acceleratedInterest: number;
  oneTimePayment?: number;
  currencySymbol: string;
}

export const calculateTimelineData = (
  debts: Debt[],
  totalMonthlyPayment: number,
  strategy: Strategy,
  oneTimeFundings: OneTimeFunding[] = []
): TimelineData[] => {
  console.log('Phase 1 - Starting timeline calculation:', {
    totalDebts: debts.length,
    goldLoans: debts.filter(d => d.is_gold_loan).length,
    regularLoans: debts.filter(d => !d.is_gold_loan).length,
    totalMonthlyPayment,
    strategy: strategy.name
  });

  const data: TimelineData[] = [];
  const balances = new Map<string, number>();
  const acceleratedBalances = new Map<string, number>();
  const startDate = new Date();
  let totalBaselineInterest = 0;
  let totalAcceleratedInterest = 0;
  
  // Initialize balances
  debts.forEach(debt => {
    balances.set(debt.id, debt.balance);
    acceleratedBalances.set(debt.id, debt.balance);
  });

  // Calculate monthly interest for gold loans
  const getGoldLoanMonthlyInterest = (balance: number, interestRate: number): number => {
    return Number(((balance * interestRate) / 100 / 12).toFixed(2));
  };

  // Check if a gold loan is due for balloon payment
  const isGoldLoanMatured = (debt: Debt, currentMonth: number): boolean => {
    if (!debt.loan_term_months) return false;
    return currentMonth >= debt.loan_term_months - 1;
  };

  // Calculate minimum payments considering gold loans
  const totalMinimumPayment = debts.reduce((sum, debt) => {
    if (debt.is_gold_loan) {
      return sum + getGoldLoanMonthlyInterest(debt.balance, debt.interest_rate);
    }
    return sum + debt.minimum_payment;
  }, 0);

  let month = 0;
  const maxMonths = 360; // 30 years cap

  while (month < maxMonths) {
    const currentDate = addMonths(startDate, month);
    
    // Get one-time fundings for current month
    const monthlyFundings = oneTimeFundings.filter(funding => {
      const fundingDate = new Date(funding.payment_date);
      return fundingDate.getMonth() === currentDate.getMonth() &&
             fundingDate.getFullYear() === currentDate.getFullYear();
    });
    
    const oneTimeFundingAmount = monthlyFundings.reduce((sum, funding) => 
      sum + Number(funding.amount), 0);

    // Calculate baseline scenario
    let totalBaselineBalance = 0;
    let monthlyBaselineInterest = 0;
    let remainingBaselinePayment = totalMinimumPayment;

    // Process gold loans first in baseline scenario
    debts.filter(d => d.is_gold_loan).forEach(debt => {
      const currentBalance = balances.get(debt.id) || 0;
      if (currentBalance > 0) {
        const monthlyInterest = getGoldLoanMonthlyInterest(currentBalance, debt.interest_rate);
        monthlyBaselineInterest += monthlyInterest;

        if (isGoldLoanMatured(debt, month)) {
          // Balloon payment due - clear the balance
          balances.set(debt.id, 0);
        } else {
          // Interest-only payment - balance stays the same
          balances.set(debt.id, currentBalance);
        }

        remainingBaselinePayment -= monthlyInterest;
        totalBaselineBalance += balances.get(debt.id) || 0;
      }
    });

    // Process regular loans in baseline scenario
    debts.filter(d => !d.is_gold_loan).forEach(debt => {
      const currentBalance = balances.get(debt.id) || 0;
      if (currentBalance > 0) {
        const monthlyRate = debt.interest_rate / 1200;
        const monthlyInterest = currentBalance * monthlyRate;
        monthlyBaselineInterest += monthlyInterest;

        const payment = Math.min(remainingBaselinePayment, debt.minimum_payment);
        const newBalance = Math.max(0, currentBalance + monthlyInterest - payment);
        
        remainingBaselinePayment -= payment;
        balances.set(debt.id, newBalance);
        totalBaselineBalance += newBalance;
      }
    });

    totalBaselineInterest += monthlyBaselineInterest;

    // Calculate accelerated scenario
    let totalAcceleratedBalance = 0;
    let monthlyAcceleratedInterest = 0;
    let remainingAcceleratedPayment = totalMonthlyPayment + oneTimeFundingAmount;

    // Process gold loans first in accelerated scenario
    debts.filter(d => d.is_gold_loan).forEach(debt => {
      const currentBalance = acceleratedBalances.get(debt.id) || 0;
      if (currentBalance > 0) {
        const monthlyInterest = getGoldLoanMonthlyInterest(currentBalance, debt.interest_rate);
        monthlyAcceleratedInterest += monthlyInterest;

        if (isGoldLoanMatured(debt, month)) {
          // Balloon payment due - clear the balance
          acceleratedBalances.set(debt.id, 0);
          remainingAcceleratedPayment -= currentBalance + monthlyInterest;
        } else {
          // Interest-only payment - balance stays the same
          acceleratedBalances.set(debt.id, currentBalance);
          remainingAcceleratedPayment -= monthlyInterest;
        }

        totalAcceleratedBalance += acceleratedBalances.get(debt.id) || 0;
      }
    });

    // Process regular loans in accelerated scenario
    const regularDebts = debts.filter(d => !d.is_gold_loan);
    const prioritizedDebts = strategy.calculate(regularDebts);

    // Apply minimum payments first
    prioritizedDebts.forEach(debt => {
      const currentBalance = acceleratedBalances.get(debt.id) || 0;
      if (currentBalance > 0) {
        const monthlyRate = debt.interest_rate / 1200;
        const monthlyInterest = currentBalance * monthlyRate;
        monthlyAcceleratedInterest += monthlyInterest;
        
        const minPayment = Math.min(debt.minimum_payment, currentBalance + monthlyInterest);
        let newBalance = currentBalance + monthlyInterest - minPayment;
        remainingAcceleratedPayment -= minPayment;
        
        // Apply extra payment if available
        if (remainingAcceleratedPayment > 0 && debt.id === prioritizedDebts[0].id) {
          const extraPayment = Math.min(remainingAcceleratedPayment, newBalance);
          newBalance -= extraPayment;
          remainingAcceleratedPayment -= extraPayment;
        }

        acceleratedBalances.set(debt.id, Math.max(0, newBalance));
        totalAcceleratedBalance += Math.max(0, newBalance);
      }
    });

    totalAcceleratedInterest += monthlyAcceleratedInterest;

    // Add data point
    data.push({
      date: currentDate.toISOString(),
      monthLabel: format(currentDate, 'MMM yyyy'),
      month,
      baselineBalance: Number(totalBaselineBalance.toFixed(2)),
      acceleratedBalance: Number(totalAcceleratedBalance.toFixed(2)),
      baselineInterest: Number(totalBaselineInterest.toFixed(2)),
      acceleratedInterest: Number(totalAcceleratedInterest.toFixed(2)),
      oneTimePayment: oneTimeFundingAmount || undefined,
      currencySymbol: debts[0].currency_symbol
    });

    // Break if both scenarios are paid off
    if (totalBaselineBalance <= 0.01 && totalAcceleratedBalance <= 0.01) {
      break;
    }

    month++;
  }

  console.log('Phase 1 - Timeline calculation complete:', {
    totalMonths: month,
    dataPoints: data.length,
    finalBaselineBalance: data[data.length - 1].baselineBalance,
    finalAcceleratedBalance: data[data.length - 1].acceleratedBalance,
    totalBaselineInterest: Number(totalBaselineInterest.toFixed(2)),
    totalAcceleratedInterest: Number(totalAcceleratedInterest.toFixed(2)),
    interestSaved: Number((totalBaselineInterest - totalAcceleratedInterest).toFixed(2))
  });

  return data;
};
