
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

    const baselineMonths = Math.ceil(totalDebt / (monthlyPayment || 1));
    const baselineYears = Math.floor(baselineMonths / 12);
    const remainingMonths = baselineMonths % 12;

    const interestPercentage = (totalMonthlyInterest * baselineMonths / totalDebt) * 100;
    const principalPercentage = 100 - interestPercentage;

    return {
      totalDebts: debts.length,
      totalDebt,
      monthlyPayment,
      totalMonthlyInterest,
      baselineYears,
      baselineMonths: remainingMonths,
      interestPercentage,
      principalPercentage,
    };
  }, [debts, monthlyPayment]);

  return metrics;
};
