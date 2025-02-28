
import { useCallback, useMemo } from 'react';
import { Debt } from '@/lib/types';
import { Strategy } from '@/lib/strategies';
import { OneTimeFunding } from '@/lib/types/payment';
import { useDebtCalculation } from '@/contexts/DebtCalculationContext';

export interface TimelineResults {
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
  originalCurrency: string;
}

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

    console.log('useDebtTimeline: Starting calculation with params:', {
      debtsTotal: debts.reduce((sum, debt) => sum + debt.balance, 0),
      debtsCurrencies: debts.map(d => d.currency_symbol),
      monthlyPayment,
      strategy: strategy.name,
      zeroInterestDebts: debts.filter(d => d.interest_rate === 0).map(d => ({
        name: d.name,
        balance: d.balance,
        minPayment: d.minimum_payment,
        monthsToPayoff: d.minimum_payment > 0 ? Math.ceil(d.balance / d.minimum_payment) : 'unknown'
      }))
    });

    const results = calculateTimeline(debts, monthlyPayment, strategy, oneTimeFundings);

    console.log('useDebtTimeline: Calculation complete:', {
      baselineInterest: results.baselineInterest,
      acceleratedInterest: results.acceleratedInterest,
      interestSaved: results.interestSaved,
      monthsSaved: results.monthsSaved,
      currenciesInvolved: debts.map(d => d.currency_symbol).filter((v, i, a) => a.indexOf(v) === i)
    });

    return results;
  }, [debts, monthlyPayment, strategy, oneTimeFundings, calculateTimeline]);

  return {
    timelineResults,
    isLoading: false,
    error: null
  };
};
