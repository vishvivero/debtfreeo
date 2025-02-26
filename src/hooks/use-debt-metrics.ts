
import { useMemo } from 'react';
import { Debt } from '@/lib/types';
import { InterestCalculator } from '@/lib/services/calculations/InterestCalculator';

export const useDebtMetrics = (debts: Debt[] | null, monthlyPayment: number = 0) => {
  const metrics = useMemo(() => {
    if (!debts || debts.length === 0) {
      return {
        totalDebts: 0,
        totalDebt: 0,
        monthlyPayment: 0,
        totalMonthlyInterest: 0,
        baselineYears: 0,
        baselineMonths: 0,
        interestPercentage: 0,
        principalPercentage: 100,
      };
    }

    const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
    const totalMonthlyInterest = debts.reduce((total, debt) => {
      if (debt.status === 'active') {
        const monthlyInterest = InterestCalculator.calculateMonthlyInterest(debt.balance, debt.interest_rate);
        return total + monthlyInterest;
      }
      return total;
    }, 0);

    // Calculate months to payoff including interest
    let remainingDebt = totalDebt;
    let months = 0;
    while (remainingDebt > 0 && months < 1200) { // 100 years max
      const monthlyInterest = (remainingDebt * (debts[0].interest_rate / 100)) / 12;
      remainingDebt = remainingDebt + monthlyInterest - (monthlyPayment || 1);
      months++;
    }

    const baselineYears = Math.floor(months / 12);
    const baselineMonths = months % 12;

    // Calculate total interest paid over the loan term
    const totalInterest = totalMonthlyInterest * months;
    const interestPercentage = (totalInterest / totalDebt) * 100;
    const principalPercentage = 100 - interestPercentage;

    return {
      totalDebts: debts.length,
      totalDebt,
      monthlyPayment,
      totalMonthlyInterest,
      baselineYears,
      baselineMonths,
      interestPercentage,
      principalPercentage,
    };
  }, [debts, monthlyPayment]);

  return metrics;
};
