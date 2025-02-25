
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

    // Input validation with detailed error messages
    if (!Array.isArray(debts) || debts.length === 0) {
      console.error('Invalid or empty debts array:', debts);
      throw new Error('No valid debts provided for calculation');
    }

    if (typeof monthlyPayment !== 'number' || monthlyPayment <= 0) {
      console.error('Invalid monthly payment:', monthlyPayment);
      throw new Error(`Invalid monthly payment amount: ${monthlyPayment}`);
    }

    if (!strategy || !strategy.name) {
      console.error('Invalid strategy:', strategy);
      throw new Error('Invalid debt repayment strategy');
    }

    // Ensure we don't exceed memory limits
    const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
    if (totalBalance <= 0) {
      console.log('All debts are already paid off');
      return {
        baselineMonths: 0,
        acceleratedMonths: 0,
        baselineInterest: 0,
        acceleratedInterest: 0,
        monthsSaved: 0,
        interestSaved: 0,
        payoffDate: new Date(),
        monthlyPayments: []
      };
    }

    if (totalBalance > Number.MAX_SAFE_INTEGER) {
      console.error('Total balance exceeds safe calculation limits:', totalBalance);
      throw new Error('Total debt amount is too large for accurate calculations');
    }

    // Validate minimum payments
    const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
    if (monthlyPayment < totalMinimumPayment) {
      console.error('Monthly payment is less than total minimum payments required:', {
        provided: monthlyPayment,
        required: totalMinimumPayment
      });
      throw new Error(`Monthly payment (${monthlyPayment}) must be at least equal to total minimum payments (${totalMinimumPayment})`);
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
