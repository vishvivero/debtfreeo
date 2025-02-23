
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
  console.log('Calculating timeline data:', {
    totalDebts: debts.length,
    totalMonthlyPayment,
    strategy: strategy.name,
    hasGoldLoans: debts.some(d => d.is_gold_loan),
    oneTimeFundings: oneTimeFundings.length
  });

  const data: TimelineData[] = [];
  const balances = new Map<string, number>();
  const acceleratedBalances = new Map<string, number>();
  const startDate = new Date();
  let totalBaselineInterest = 0;
  let totalAcceleratedInterest = 0;
  
  // Initialize balances and get maximum loan term for timeline length
  let maxLoanTerm = 0;
  debts.forEach(debt => {
    balances.set(debt.id, debt.balance);
    acceleratedBalances.set(debt.id, debt.balance);
    if (debt.is_gold_loan && debt.loan_term_months) {
      maxLoanTerm = Math.max(maxLoanTerm, debt.loan_term_months);
    }
  });

  const calculateMonthlyGoldLoanInterest = (debt: Debt): number => {
    return Number(((debt.balance * debt.interest_rate) / 100 / 12).toFixed(2));
  };

  const isGoldLoanDue = (debt: Debt, currentMonth: number): boolean => {
    if (!debt.is_gold_loan || !debt.loan_term_months) return false;
    if (debt.final_payment_date) {
      const finalDate = new Date(debt.final_payment_date);
      const currentDate = addMonths(startDate, currentMonth);
      return currentDate >= finalDate;
    }
    return currentMonth >= debt.loan_term_months - 1;
  };

  // Calculate total minimum payment including gold loan interest payments
  const totalMinimumPayment = debts.reduce((sum, debt) => {
    if (debt.is_gold_loan) {
      return sum + calculateMonthlyGoldLoanInterest(debt);
    }
    return sum + debt.minimum_payment;
  }, 0);

  let month = 0;
  const maxMonths = Math.max(360, maxLoanTerm); // Use the longer of 30 years or longest gold loan term

  while (month < maxMonths) {
    const currentDate = addMonths(startDate, month);
    
    // Process one-time funding for the current month
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

    // First process gold loans in baseline scenario
    debts.filter(d => d.is_gold_loan).forEach(debt => {
      const baselineBalance = balances.get(debt.id) || 0;
      if (baselineBalance > 0) {
        const monthlyInterest = calculateMonthlyGoldLoanInterest(debt);
        monthlyBaselineInterest += monthlyInterest;
        
        if (isGoldLoanDue(debt, month)) {
          // Final payment includes principal + interest
          const finalPayment = baselineBalance + monthlyInterest;
          balances.set(debt.id, 0);
          remainingBaselinePayment -= monthlyInterest;
        } else {
          // Regular monthly interest payment
          balances.set(debt.id, baselineBalance);
          remainingBaselinePayment -= monthlyInterest;
        }
        
        totalBaselineBalance += balances.get(debt.id) || 0;
      }
    });

    // Then process regular loans in baseline scenario
    debts.filter(d => !d.is_gold_loan).forEach(debt => {
      const baselineBalance = balances.get(debt.id) || 0;
      if (baselineBalance > 0) {
        const monthlyRate = debt.interest_rate / 1200;
        const baselineInterest = baselineBalance * monthlyRate;
        monthlyBaselineInterest += baselineInterest;

        const payment = Math.min(remainingBaselinePayment, debt.minimum_payment);
        const newBalance = Math.max(0, baselineBalance + baselineInterest - payment);
        remainingBaselinePayment = Math.max(0, remainingBaselinePayment - payment);
        balances.set(debt.id, newBalance);
        totalBaselineBalance += newBalance;
      }
    });

    totalBaselineInterest += monthlyBaselineInterest;

    // Calculate accelerated scenario
    let totalAcceleratedBalance = 0;
    let monthlyAcceleratedInterest = 0;
    let remainingAcceleratedPayment = totalMonthlyPayment + oneTimeFundingAmount;

    // First process gold loans in accelerated scenario
    debts.filter(d => d.is_gold_loan).forEach(debt => {
      const acceleratedBalance = acceleratedBalances.get(debt.id) || 0;
      if (acceleratedBalance > 0) {
        const monthlyInterest = calculateMonthlyGoldLoanInterest(debt);
        monthlyAcceleratedInterest += monthlyInterest;
        
        if (isGoldLoanDue(debt, month)) {
          // Final payment includes principal + interest
          const finalPayment = acceleratedBalance + monthlyInterest;
          acceleratedBalances.set(debt.id, 0);
          remainingAcceleratedPayment -= finalPayment;
        } else {
          // Regular monthly interest payment
          acceleratedBalances.set(debt.id, acceleratedBalance);
          remainingAcceleratedPayment -= monthlyInterest;
        }
        
        totalAcceleratedBalance += acceleratedBalances.get(debt.id) || 0;
      }
    });

    // Then process regular loans in accelerated scenario with strategy
    const regularDebts = debts.filter(d => !d.is_gold_loan);
    const prioritizedDebts = strategy.calculate(regularDebts);
    
    prioritizedDebts.forEach(debt => {
      const acceleratedBalance = acceleratedBalances.get(debt.id) || 0;
      if (acceleratedBalance > 0) {
        const monthlyRate = debt.interest_rate / 1200;
        const acceleratedInterest = acceleratedBalance * monthlyRate;
        monthlyAcceleratedInterest += acceleratedInterest;
        
        // Apply minimum payment
        const minPayment = Math.min(debt.minimum_payment, acceleratedBalance + acceleratedInterest);
        let newBalance = acceleratedBalance + acceleratedInterest - minPayment;
        remainingAcceleratedPayment -= minPayment;

        // Apply extra payment if this is the highest priority debt
        if (remainingAcceleratedPayment > 0 && prioritizedDebts[0].id === debt.id) {
          const extraPayment = Math.min(remainingAcceleratedPayment, newBalance);
          newBalance -= extraPayment;
          remainingAcceleratedPayment -= extraPayment;
        }

        acceleratedBalances.set(debt.id, Math.max(0, newBalance));
        totalAcceleratedBalance += Math.max(0, newBalance);
      }
    });

    totalAcceleratedInterest += monthlyAcceleratedInterest;

    // Add data point with rounded numbers
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

  console.log('Timeline calculation complete:', {
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
