import { useCallback, useMemo } from 'react';
import { Debt } from '@/lib/types';
import { Strategy } from '@/lib/strategies';
import { OneTimeFunding } from '@/lib/types/payment';
import { DebtTimelineCalculator } from '@/lib/services/calculations/DebtTimelineCalculator';

interface TimelineResults {
  baselineMonths: number;
  acceleratedMonths: number;
  baselineInterest: number;
  acceleratedInterest: number;
  monthsSaved: number;
  interestSaved: number;
  payoffDate: Date;
  monthlyPayments: {
    debtId: string;
    amount: number;
  }[];
}

export const useDebtTimeline = (
  debts: Debt[],
  monthlyPayment: number,
  strategy: Strategy,
  oneTimeFundings: OneTimeFunding[] = []
) => {
  console.log('useDebtTimeline: Initializing with:', {
    debtsCount: debts.length,
    monthlyPayment,
    strategyName: strategy.name,
    oneTimeFundingsCount: oneTimeFundings.length
  });

  const calculateTimeline = useCallback(() => {
    if (!debts.length) {
      console.log('useDebtTimeline: No debts provided, skipping calculation');
      return null;
    }

    console.log('useDebtTimeline: Starting calculation with params:', {
      debtsTotal: debts.reduce((sum, debt) => sum + debt.balance, 0),
      monthlyPayment,
      strategy: strategy.name
    });

    const results = DebtTimelineCalculator.calculateTimeline(
      debts,
      monthlyPayment,
      strategy,
      oneTimeFundings
    );

    console.log('useDebtTimeline: Calculation complete:', {
      baselineInterest: results.baselineInterest,
      acceleratedInterest: results.acceleratedInterest,
      interestSaved: results.interestSaved,
      monthsSaved: results.monthsSaved
    });

    return results;
  }, [debts, monthlyPayment, strategy, oneTimeFundings]);

  const timelineResults = useMemo<TimelineResults | null>(() => {
    return calculateTimeline();
  }, [calculateTimeline]);

  return {
    timelineResults,
    isLoading: false,
    error: null
  };
};