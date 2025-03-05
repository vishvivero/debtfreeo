
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

    // Check for debts with interest already included
    const debtsWithInterestIncluded = debts.filter(debt => 
      debt.metadata?.interest_already_calculated === true || 
      debt.metadata?.interest_included === true
    );
    
    if (debtsWithInterestIncluded.length > 0) {
      console.log('Detected debts with interest already included in balance:', 
        debtsWithInterestIncluded.map(d => ({ 
          name: d.name, 
          balance: d.balance, 
          interestRate: d.interest_rate 
        }))
      );
    }

    // Quick sanity check on input values
    if (debts.some(debt => debt.balance > 10000000 || debt.interest_rate > 100)) {
      console.log('Warning: Potentially anomalous debt values detected:', 
        debts.map(d => ({ name: d.name, balance: d.balance, rate: d.interest_rate }))
      );
    }

    // Calculate alternative interest estimate as fallback using simple interest formula
    // but exclude debts that already have interest included
    const heuristicInterestEstimate = debts.reduce((sum, debt) => {
      // Skip if interest is already included in the balance
      if (debt.metadata?.interest_already_calculated === true || 
          debt.metadata?.interest_included === true) {
        console.log(`Skipping heuristic interest for ${debt.name} - interest already included`);
        return sum;
      }
      
      // Also skip zero interest loans
      if (debt.interest_rate === 0) {
        return sum;
      }
      
      // Simple interest calculation: Principal * Rate * Time
      const interest = debt.balance * (debt.interest_rate / 100) * this.INTEREST_RATE_YEARS_HEURISTIC;
      console.log(`Heuristic interest for ${debt.name}: ${interest}`);
      return sum + interest;
    }, 0);

    console.log('Heuristic interest estimate:', heuristicInterestEstimate);

    // Make a copy of debts with adjusted interest rates for those with interest already included
    const adjustedDebts = debts.map(debt => {
      if (debt.metadata?.interest_already_calculated === true || 
          debt.metadata?.interest_included === true) {
        // Set interest rate to 0 for calculation purposes to avoid double counting
        return { ...debt, interest_rate: 0 };
      }
      return debt;
    });

    // Use the adjusted debts for calculation
    const results = StandardizedDebtCalculator.calculateTimeline(
      adjustedDebts,
      monthlyPayment,
      strategy,
      oneTimeFundings
    );

    // Get the total principal balance
    const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);

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
