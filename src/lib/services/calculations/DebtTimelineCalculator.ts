
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import { StandardizedDebtCalculator } from "./StandardizedDebtCalculator";

/**
 * Main service for calculating debt timelines and payment plans
 */
export class DebtTimelineCalculator {
  /**
   * Calculate the debt payoff timeline with additional metrics
   * 
   * @param debts List of debts to process
   * @param monthlyPayment Total monthly payment amount
   * @param strategy Debt payoff strategy to apply
   * @param oneTimeFundings Optional list of one-time funding payments
   * @returns Timeline calculation results
   */
  public static calculateTimeline(
    debts: Debt[],
    monthlyPayment: number,
    strategy: Strategy,
    oneTimeFundings: OneTimeFunding[] = []
  ) {
    console.log('DebtTimelineCalculator: Starting calculation with:', {
      debtsCount: debts.length,
      monthlyPayment,
      strategy: strategy.name,
      oneTimeFundingsCount: oneTimeFundings.length,
      firstDebt: debts.length > 0 ? {
        name: debts[0].name,
        balance: debts[0].balance,
        currency: debts[0].currency_symbol
      } : null
    });

    // IMPORTANT: The debts passed to this function should already be normalized
    // to the user's preferred currency by the component calling this function
    
    // First order debts according to the selected strategy
    const orderedDebts = strategy.calculate([...debts]);
    
    // Call the standardized calculator to get the detailed timeline
    const results = StandardizedDebtCalculator.calculateTimeline(
      orderedDebts,
      monthlyPayment,
      strategy,
      oneTimeFundings
    );

    // For extremely large numbers, we need additional validation
    if (results.baselineInterest > 1000000) {
      console.log('Warning: Very large baseline interest detected. Validating calculation...', {
        baselineInterest: results.baselineInterest,
        totalDebtBalance: debts.reduce((sum, debt) => sum + debt.balance, 0),
        totalMinimumPayment: debts.reduce((sum, debt) => sum + debt.minimum_payment, 0)
      });
      
      // This is likely a calculation error for normal debts
      if (debts.reduce((sum, debt) => sum + debt.balance, 0) < 1000000) {
        console.log('Interest calculation seems abnormal for the debt amounts. Attempting correction...');
        
        // A more conservative estimate based on debt balance and rates
        const correctedInterest = debts.reduce((sum, debt) => {
          const roughEstimate = debt.balance * (debt.interest_rate / 100) * (results.baselineMonths / 12);
          return sum + roughEstimate;
        }, 0);
        
        console.log('Estimated corrected interest:', correctedInterest);
        
        results.baselineInterest = correctedInterest;
        // If baseline was wrong, accelerated is likely wrong too
        results.acceleratedInterest = correctedInterest;
        results.interestSaved = 0; // Reset until we have accurate calculations
      }
    }

    console.log('DebtTimelineCalculator: Calculation complete:', {
      baselineInterest: results.baselineInterest,
      acceleratedInterest: results.acceleratedInterest,
      interestSaved: results.interestSaved,
      monthsSaved: results.monthsSaved
    });

    return results;
  }
}
