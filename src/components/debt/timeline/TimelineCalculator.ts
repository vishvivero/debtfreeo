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

  const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
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
        const payment = Math.min(remainingBaselinePayment, debt.minimum_payment);
        const newBaselineBalance = Math.max(0, baselineBalance + baselineInterest - payment);
        
        remainingBaselinePayment = Math.max(0, remainingBaselinePayment - payment);
        balances.set(debt.id, newBaselineBalance);
        totalBaselineBalance += newBaselineBalance;
      }
    });

    totalBaselineInterest += monthlyBaselineInterest;

    // Calculate accelerated scenario
    let totalAcceleratedBalance = 0;
    let monthlyAcceleratedInterest = 0;
    let remainingAcceleratedPayment = totalMonthlyPayment + oneTimeFundingAmount;

    // First apply minimum payments
    debts.forEach(debt => {
      const acceleratedBalance = acceleratedBalances.get(debt.id) || 0;
      if (acceleratedBalance > 0) {
        const monthlyRate = debt.interest_rate / 1200;
        const acceleratedInterest = acceleratedBalance * monthlyRate;
        monthlyAcceleratedInterest += acceleratedInterest;
        const minPayment = Math.min(debt.minimum_payment, acceleratedBalance + acceleratedInterest);
        remainingAcceleratedPayment -= minPayment;
        
        const newBalance = acceleratedBalance + acceleratedInterest - minPayment;
        acceleratedBalances.set(debt.id, newBalance);
      }
    });

    totalAcceleratedInterest += monthlyAcceleratedInterest;

    // Then apply extra payments according to strategy
    if (remainingAcceleratedPayment > 0) {
      const sortedDebts = strategy.calculate(debts);
      for (const debt of sortedDebts) {
        const currentBalance = acceleratedBalances.get(debt.id) || 0;
        if (currentBalance > 0) {
          const extraPayment = Math.min(remainingAcceleratedPayment, currentBalance);
          const newBalance = Math.max(0, currentBalance - extraPayment);
          acceleratedBalances.set(debt.id, newBalance);
          remainingAcceleratedPayment = Math.max(0, remainingAcceleratedPayment - extraPayment);
          
          if (remainingAcceleratedPayment <= 0) break;
        }
      }
    }

    totalAcceleratedBalance = Array.from(acceleratedBalances.values())
      .reduce((sum, balance) => sum + balance, 0);

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