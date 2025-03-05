
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

    // Important: The debts passed to this function should already be normalized
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

    console.log('DebtTimelineCalculator: Calculation complete:', {
      baselineInterest: results.baselineInterest,
      acceleratedInterest: results.acceleratedInterest,
      interestSaved: results.interestSaved,
      monthsSaved: results.monthsSaved
    });

    return results;
  }
}
