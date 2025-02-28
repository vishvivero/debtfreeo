
import React, { createContext, useContext, useCallback, useMemo } from 'react';
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
  originalCurrency: string;
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

    const results = DebtTimelineCalculator.calculateTimeline(
      debts,
      monthlyPayment,
      strategy,
      oneTimeFundings
    );

    console.log('DebtCalculationContext: Calculation complete:', {
      baselineInterest: results.baselineInterest,
      acceleratedInterest: results.acceleratedInterest,
      interestSaved: results.interestSaved,
      monthsSaved: results.monthsSaved
    });

    return results;
  }, []);

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
