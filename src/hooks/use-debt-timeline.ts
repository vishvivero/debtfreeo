
import { useCallback, useMemo } from 'react';
import { Debt } from '@/lib/types';
import { Strategy } from '@/lib/strategies';
import { OneTimeFunding } from '@/lib/types/payment';
import { useDebtCalculation } from '@/contexts/DebtCalculationContext';

export const useDebtTimeline = (
  debts: Debt[],
  monthlyPayment: number,
  strategy: Strategy,
  oneTimeFundings: OneTimeFunding[] = []
) => {
  const { calculateTimeline } = useDebtCalculation();

  const timelineResults = useMemo(() => {
    if (!debts.length) {
      console.log('useDebtTimeline: No debts provided, skipping calculation');
      return null;
    }

    if (!monthlyPayment || monthlyPayment <= 0) {
      console.log('useDebtTimeline: Invalid monthly payment, skipping calculation');
      return null;
    }

    console.log('useDebtTimeline: Starting calculation with params:', {
      debtsCount: debts.length,
      debtsTotal: debts.reduce((sum, debt) => sum + debt.balance, 0),
      monthlyPayment,
      strategy: strategy.name
    });

    try {
      const results = calculateTimeline(debts, monthlyPayment, strategy, oneTimeFundings);

      console.log('useDebtTimeline: Calculation complete:', {
        baselineInterest: results.baselineInterest,
        acceleratedInterest: results.acceleratedInterest,
        interestSaved: results.interestSaved,
        monthsSaved: results.monthsSaved
      });

      return results;
    } catch (error) {
      console.error('useDebtTimeline: Error in calculation:', error);
      return null;
    }
  }, [debts, monthlyPayment, strategy, oneTimeFundings, calculateTimeline]);

  return {
    timelineResults,
    isLoading: false,
    error: null
  };
};
