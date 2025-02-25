
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import { StandardizedDebtCalculator } from "./StandardizedDebtCalculator";

export interface TimelineCalculationResult {
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

export class DebtTimelineCalculator {
  private static readonly MAX_ITERATIONS = 1200; // 100 years cap
  private static readonly MINIMUM_PAYMENT = 0.01;

  static calculateTimeline(
    debts: Debt[],
    monthlyPayment: number,
    strategy: Strategy,
    oneTimeFundings: OneTimeFunding[] = []
  ): TimelineCalculationResult {
    console.log('Starting timeline calculation:', {
      totalDebts: debts.length,
      monthlyPayment,
      strategy: strategy.name,
      oneTimeFundings: oneTimeFundings.length
    });

    // Input validation
    if (!debts.length || !monthlyPayment || monthlyPayment < this.MINIMUM_PAYMENT) {
      console.error('Invalid calculation inputs');
      throw new Error('Invalid calculation inputs');
    }

    try {
      // Deep clone debts to prevent mutations
      const debtsCopy = debts.map(debt => ({ ...debt }));
      
      const results = StandardizedDebtCalculator.calculateTimeline(
        debtsCopy,
        monthlyPayment,
        strategy,
        oneTimeFundings
      );

      // Ensure we're using current date as starting point
      const today = new Date();
      const payoffDate = new Date(today.getFullYear(), today.getMonth() + results.acceleratedMonths);

      console.log('Timeline calculation complete:', {
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
}
