import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { Debt } from '@/lib/types';
import { Strategy } from '@/lib/strategies';
import { OneTimeFunding } from '@/lib/types/payment';
import { DebtTimelineCalculator } from '@/lib/services/calculations/DebtTimelineCalculator';
import { useCurrency } from '@/hooks/use-currency';

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

interface DebtCalculationContextType {
  calculateTimeline: (
    debts: Debt[],
    monthlyPayment: number,
    strategy: Strategy,
    oneTimeFundings: OneTimeFunding[]
  ) => TimelineResults;
  timelineResults: TimelineResults | null;
}

const DebtCalculationContext = createContext<DebtCalculationContextType | undefined>(undefined);

export const DebtCalculationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { convertToPreferredCurrency } = useCurrency();
  
  const calculateTimeline = useCallback((
    debts: Debt[],
    monthlyPayment: number,
    strategy: Strategy,
    oneTimeFundings: OneTimeFunding[]
  ) => {
    console.log('DebtCalculationContext: Starting calculation with:', {
      debtsCount: debts.length,
      monthlyPayment,
      strategy: strategy.name,
      oneTimeFundingsCount: oneTimeFundings.length
    });

    // Normalize all debts to the preferred currency for calculation
    const normalizedDebts = debts.map(debt => ({
      ...debt,
      // Keep original values but add normalized ones for calculation
      normalizedBalance: convertToPreferredCurrency(debt.balance, debt.currency_symbol),
      normalizedMinimumPayment: convertToPreferredCurrency(debt.minimum_payment, debt.currency_symbol)
    }));

    // Normalize one-time fundings if they have different currencies
    const normalizedFundings = oneTimeFundings.map(funding => {
      if (funding.currency_symbol && funding.currency_symbol !== debts[0]?.currency_symbol) {
        return {
          ...funding,
          amount: convertToPreferredCurrency(funding.amount, funding.currency_symbol || '$')
        };
      }
      return funding;
    });

    const results = DebtTimelineCalculator.calculateTimeline(
      debts,
      monthlyPayment,
      strategy,
      normalizedFundings
    );

    console.log('DebtCalculationContext: Calculation complete:', {
      baselineInterest: results.baselineInterest,
      acceleratedInterest: results.acceleratedInterest,
      interestSaved: results.interestSaved,
      monthsSaved: results.monthsSaved
    });

    return results;
  }, [convertToPreferredCurrency]);

  const value = useMemo(() => ({
    calculateTimeline,
    timelineResults: null
  }), [calculateTimeline]);

  return (
    <DebtCalculationContext.Provider value={value}>
      {children}
    </DebtCalculationContext.Provider>
  );
};

export const useDebtCalculation = () => {
  const context = useContext(DebtCalculationContext);
  if (context === undefined) {
    throw new Error('useDebtCalculation must be used within a DebtCalculationProvider');
  }
  return context;
};
