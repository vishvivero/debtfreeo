
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import { StandardizedDebtCalculator } from "./StandardizedDebtCalculator";

export interface TimelineResult {
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
  /**
   * Calculate debt timeline with detailed metrics
   */
  public static calculateTimeline(
    debts: Debt[],
    monthlyPayment: number,
    strategy: Strategy,
    oneTimeFundings: OneTimeFunding[] = []
  ): TimelineResult {
    console.log('UnifiedDebtTimelineCalculator: Starting calculation with:', {
      debtsCount: debts.length,
      monthlyPayment,
      strategy: strategy.name,
      oneTimeFundingsCount: oneTimeFundings.length
    });

    return StandardizedDebtCalculator.calculateTimeline(
      debts,
      monthlyPayment,
      strategy,
      oneTimeFundings
    );
  }
}
