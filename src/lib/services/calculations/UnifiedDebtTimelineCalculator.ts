
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
  // Reasonable limits for interest calculation
  private static readonly MAX_INTEREST_MULTIPLIER = 1.5; // 150% of principal
  private static readonly ABSOLUTE_MAX_INTEREST = 1000000; // Hard cap of 1M
  private static readonly INTEREST_RATE_YEARS_HEURISTIC = 5; // Reasonable loan term for heuristic calculation

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

    // Handle debts with interest already included in balance
    const processedDebts = debts.map(debt => {
      // Check if this debt has interest already included in the balance
      if (debt.metadata?.interest_included) {
        console.log(`Debt ${debt.name} has interest already included in balance. Adjusting for calculation.`);
        // Create a clone with zero interest rate to prevent double counting
        return {
          ...debt,
          // Store original interest rate in metadata for reference
          metadata: {
            ...debt.metadata,
            original_interest_rate: debt.interest_rate
          },
          // Set interest rate to zero for calculation purposes
          interest_rate: 0
        };
      }
      return debt;
    });

    // Quick sanity check on input values
    if (processedDebts.some(debt => debt.balance > 10000000 || debt.interest_rate > 100)) {
      console.log('Warning: Potentially anomalous debt values detected:', 
        processedDebts.map(d => ({ name: d.name, balance: d.balance, rate: d.interest_rate }))
      );
    }

    // Calculate alternative interest estimate as fallback using simple interest formula
    const heuristicInterestEstimate = processedDebts.reduce((sum, debt) => {
      // Skip debts with pre-included interest (they're now at 0% for calculation)
      if (debt.interest_rate === 0) {
        return sum;
      }
      // Simple interest calculation: Principal * Rate * Time
      return sum + (debt.balance * (debt.interest_rate / 100) * this.INTEREST_RATE_YEARS_HEURISTIC);
    }, 0);

    console.log('Heuristic interest estimate:', heuristicInterestEstimate);

    const results = StandardizedDebtCalculator.calculateTimeline(
      processedDebts,
      monthlyPayment,
      strategy,
      oneTimeFundings
    );

    // Get the total principal balance
    const totalBalance = processedDebts.reduce((sum, debt) => sum + debt.balance, 0);

    // Calculate pre-included interest to add to the baseline interest
    const preIncludedInterest = debts.reduce((sum, debt) => {
      if (debt.metadata?.interest_included && debt.metadata?.remaining_months && debt.minimum_payment) {
        // Calculate total payments
        const totalPayments = debt.minimum_payment * debt.metadata.remaining_months;
        // Pre-included interest is the difference between total payments and current balance
        const interestPortion = Math.max(0, totalPayments - debt.balance);
        console.log(`Pre-included interest for ${debt.name}:`, {
          balance: debt.balance,
          totalPayments,
          interestPortion
        });
        return sum + interestPortion;
      }
      return sum;
    }, 0);

    console.log('Total pre-included interest to be added:', preIncludedInterest);

    // Add pre-included interest to the baseline interest
    if (preIncludedInterest > 0) {
      results.baselineInterest += preIncludedInterest;
      results.acceleratedInterest += preIncludedInterest * 0.9; // Assume some savings in accelerated scenario
      results.interestSaved = results.baselineInterest - results.acceleratedInterest;
    }

    // Comprehensive validation of the interest values
    if (results.baselineInterest > this.ABSOLUTE_MAX_INTEREST || 
        results.baselineInterest > totalBalance * this.MAX_INTEREST_MULTIPLIER ||
        results.baselineInterest / totalBalance > this.MAX_INTEREST_MULTIPLIER) {
      
      console.log('Warning: Calculated interest exceeds reasonable limits, applying correction:', {
        calculatedInterest: results.baselineInterest,
        totalBalance,
        interestToBalanceRatio: results.baselineInterest / totalBalance,
        heuristicEstimate: heuristicInterestEstimate
      });
      
      // Use the better of the two approaches - heuristic or capped value
      const cappedInterest = Math.min(
        totalBalance * this.MAX_INTEREST_MULTIPLIER, 
        this.ABSOLUTE_MAX_INTEREST
      );
      
      // Choose the more reasonable value between the heuristic and the cap
      results.baselineInterest = Math.min(heuristicInterestEstimate, cappedInterest);
      
      // Also adjust accelerated interest proportionally
      const originalRatio = results.acceleratedInterest / results.baselineInterest;
      results.acceleratedInterest = results.baselineInterest * originalRatio;
      
      // Recalculate interest saved
      results.interestSaved = results.baselineInterest - results.acceleratedInterest;
      
      console.log('Interest values after correction:', {
        baselineInterest: results.baselineInterest,
        acceleratedInterest: results.acceleratedInterest,
        interestSaved: results.interestSaved
      });
    }

    return results;
  }
}
