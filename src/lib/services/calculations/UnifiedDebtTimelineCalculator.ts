
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

    const results = StandardizedDebtCalculator.calculateTimeline(
      debts,
      monthlyPayment,
      strategy,
      oneTimeFundings
    );

    // Add logging to trace the payoff date calculation
    console.log('Unified calculation payoff date:', {
      payoffDate: results.payoffDate,
      baselineMonths: results.baselineMonths,
      acceleratedMonths: results.acceleratedMonths
    });

    // Ensure we're using current date as starting point
    const today = new Date();
    const payoffDate = new Date(today.getFullYear(), today.getMonth() + results.acceleratedMonths);

    return {
      ...results,
      payoffDate // Use the correctly calculated payoff date
    };
  }
}
