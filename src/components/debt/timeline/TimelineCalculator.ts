
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
    oneTimeFundings: oneTimeFundings.length
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

  const calculateMonthlyGoldLoanPayment = (debt: Debt): number => {
    return (debt.balance * debt.interest_rate) / 100 / 12;
  };

  const totalMinimumPayment = debts.reduce((sum, debt) => {
    if (debt.is_gold_loan) {
      return sum + calculateMonthlyGoldLoanPayment(debt);
    }
    return sum + debt.minimum_payment;
  }, 0);

  let month = 0;
  const maxMonths = 360; // 30 years cap

  while (month < maxMonths) {
    const currentDate = addMonths(startDate, month);
    const monthlyFundings = oneTimeFundings.filter(funding => {
      const fundingDate = new Date(funding.payment_date);
      return fundingDate.getMonth() === currentDate.getMonth() &&
             fundingDate.getFullYear() === currentDate.getFullYear();
    });
    
    const oneTimeFundingAmount = monthlyFundings.reduce((sum, funding) => sum + Number(funding.amount), 0);

    // Calculate baseline scenario
    let totalBaselineBalance = 0;
    let monthlyBaselineInterest = 0;
    let remainingBaselinePayment = totalMinimumPayment;

    debts.forEach(debt => {
      const baselineBalance = balances.get(debt.id) || 0;
      if (baselineBalance > 0) {
        const monthlyRate = debt.interest_rate / 1200;
        const baselineInterest = baselineBalance * monthlyRate;
        monthlyBaselineInterest += baselineInterest;

        if (debt.is_gold_loan) {
          const monthlyInterest = calculateMonthlyGoldLoanPayment(debt);
          const isLastMonth = debt.loan_term_months && month === debt.loan_term_months - 1;
          const payment = isLastMonth ? monthlyInterest + baselineBalance : monthlyInterest;
          const newBaselineBalance = isLastMonth ? 0 : baselineBalance;
          balances.set(debt.id, newBaselineBalance);
          totalBaselineBalance += newBaselineBalance;
        } else {
          const payment = Math.min(remainingBaselinePayment, debt.minimum_payment);
          const newBaselineBalance = Math.max(0, baselineBalance + baselineInterest - payment);
          remainingBaselinePayment = Math.max(0, remainingBaselinePayment - payment);
          balances.set(debt.id, newBaselineBalance);
          totalBaselineBalance += newBaselineBalance;
        }
      }
    });

    totalBaselineInterest += monthlyBaselineInterest;

    // Calculate accelerated scenario
    let totalAcceleratedBalance = 0;
    let monthlyAcceleratedInterest = 0;
    let remainingAcceleratedPayment = totalMonthlyPayment + oneTimeFundingAmount;

    // First handle gold loans
    debts.filter(d => d.is_gold_loan).forEach(debt => {
      const acceleratedBalance = acceleratedBalances.get(debt.id) || 0;
      if (acceleratedBalance > 0) {
        const monthlyInterest = calculateMonthlyGoldLoanPayment(debt);
        monthlyAcceleratedInterest += monthlyInterest;
        const isLastMonth = debt.loan_term_months && month === debt.loan_term_months - 1;
        const payment = isLastMonth ? monthlyInterest + acceleratedBalance : monthlyInterest;
        remainingAcceleratedPayment -= payment;
        const newBalance = isLastMonth ? 0 : acceleratedBalance;
        acceleratedBalances.set(debt.id, newBalance);
        totalAcceleratedBalance += newBalance;
      }
    });

    // Then handle regular loans
    debts.filter(d => !d.is_gold_loan).forEach(debt => {
      const acceleratedBalance = acceleratedBalances.get(debt.id) || 0;
      if (acceleratedBalance > 0) {
        const monthlyRate = debt.interest_rate / 1200;
        const acceleratedInterest = acceleratedBalance * monthlyRate;
        monthlyAcceleratedInterest += acceleratedInterest;
        const minPayment = Math.min(debt.minimum_payment, acceleratedBalance + acceleratedInterest);
        remainingAcceleratedPayment -= minPayment;
        
        let newBalance = acceleratedBalance + acceleratedInterest - minPayment;
        
        // Apply extra payment if available
        if (remainingAcceleratedPayment > 0 && strategy.calculate(debts)[0].id === debt.id) {
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

  console.log('Timeline calculation complete:', {
    totalMonths: month,
    dataPoints: data.length,
    finalBaselineBalance: data[data.length - 1].baselineBalance,
    finalAcceleratedBalance: data[data.length - 1].acceleratedBalance,
    totalBaselineInterest,
    totalAcceleratedInterest,
    interestSaved: totalBaselineInterest - totalAcceleratedInterest
  });

  return data;
};
