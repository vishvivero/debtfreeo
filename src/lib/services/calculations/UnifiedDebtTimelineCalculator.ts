
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import { StandardizedDebtCalculator } from "./StandardizedDebtCalculator";

export interface UnifiedTimelineResults {
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

export class UnifiedDebtTimelineCalculator {
  private static readonly MAX_CALCULATION_MONTHS = 1200; // 100 years cap
  private static readonly PRECISION = 2;

  public static calculateTimeline(
    debts: Debt[],
    monthlyPayment: number,
    strategy: Strategy,
    oneTimeFundings: OneTimeFunding[] = []
  ): UnifiedTimelineResults {
    console.log('Starting unified timeline calculation:', {
      totalDebts: debts.length,
      monthlyPayment,
      strategy: strategy.name,
      oneTimeFundings: oneTimeFundings.length
    });

    // Input validation
    if (!debts.length || monthlyPayment <= 0) {
      console.error('Invalid calculation inputs:', { debts: debts.length, monthlyPayment });
      throw new Error('Invalid calculation inputs');
    }

    // Ensure we don't exceed memory limits
    const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
    if (totalBalance <= 0 || totalBalance > Number.MAX_SAFE_INTEGER) {
      console.error('Invalid total balance:', totalBalance);
      throw new Error('Invalid total balance');
    }

    try {
      const results = StandardizedDebtCalculator.calculateTimeline(
        debts,
        monthlyPayment,
        strategy,
        oneTimeFundings
      );

      // Validate results
      if (!results || typeof results.acceleratedMonths !== 'number') {
        console.error('Invalid calculation results');
        throw new Error('Invalid calculation results');
      }

      // Ensure we're using current date as starting point
      const today = new Date();
      const payoffDate = new Date(today.getFullYear(), today.getMonth() + results.acceleratedMonths);

      console.log('Unified calculation complete:', {
        baselineMonths: results.baselineMonths,
        acceleratedMonths: results.acceleratedMonths,
        payoffDate: payoffDate.toISOString()
      });

      return {
        ...results,
        payoffDate
      };
    } catch (error) {
      console.error('Error in timeline calculation:', error);
      throw error;
    }
  }

  private static validateResults(results: UnifiedTimelineResults): boolean {
    return (
      results &&
      typeof results.baselineMonths === 'number' &&
      typeof results.acceleratedMonths === 'number' &&
      typeof results.baselineInterest === 'number' &&
      typeof results.acceleratedInterest === 'number' &&
      results.monthlyPayments?.length > 0
    );
  }
}
