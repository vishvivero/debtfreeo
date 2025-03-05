
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
  // Reasonable limit for interest as a multiple of principal
  private static readonly MAX_INTEREST_MULTIPLIER = 1.5; // 150% of principal

  public static calculateTimeline(
    debts: Debt[],
    monthlyPayment: number,
    strategy: Strategy,
    oneTimeFundings: OneTimeFunding[] = []
  ): UnifiedTimelineResults {
    console.log('Starting unified timeline calculation:', {
      totalDebts: debts.length,
      totalBalance: debts.reduce((sum, debt) => sum + debt.balance, 0),
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

    // Safety check - verify the calculated interest is reasonable
    const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
    if (results.baselineInterest > totalBalance * this.MAX_INTEREST_MULTIPLIER) {
      console.log('Warning: Calculated interest exceeds reasonable limit, applying cap:', {
        calculatedInterest: results.baselineInterest,
        totalBalance,
        cappedInterest: totalBalance * this.MAX_INTEREST_MULTIPLIER
      });
      
      // Cap the interest at a reasonable percentage of the principal
      results.baselineInterest = Math.min(results.baselineInterest, totalBalance * this.MAX_INTEREST_MULTIPLIER);
      
      // Also cap accelerated interest accordingly
      results.acceleratedInterest = Math.min(results.acceleratedInterest, results.baselineInterest);
      
      // Recalculate interest saved
      results.interestSaved = results.baselineInterest - results.acceleratedInterest;
    }

    console.log('Unified calculation complete:', {
      baselineInterest: results.baselineInterest,
      acceleratedInterest: results.acceleratedInterest,
      interestSaved: results.interestSaved,
      monthsSaved: results.monthsSaved
    });

    return results;
  }
}
