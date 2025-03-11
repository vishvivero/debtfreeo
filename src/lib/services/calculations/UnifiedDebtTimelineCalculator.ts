
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

    // Calculate more accurate interest estimates for individual debts
    const individualInterestEstimates = processedDebts.map(debt => {
      if (debt.interest_rate === 0) {
        return { debtId: debt.id, interest: 0 };
      }
      
      // Basic amortization calculation for each debt
      let balance = debt.balance;
      let totalInterest = 0;
      const monthlyRate = debt.interest_rate / 1200;
      let payment = Math.max(debt.minimum_payment, balance * monthlyRate * 1.1); // Ensure payment is enough
      
      let monthCount = 0;
      const MAX_MONTHS = 600; // Safety limit
      
      while (balance > 0.01 && monthCount < MAX_MONTHS) {
        const interestPayment = balance * monthlyRate;
        totalInterest += interestPayment;
        
        const principalPayment = Math.min(payment - interestPayment, balance);
        balance -= principalPayment;
        
        monthCount++;
      }
      
      console.log(`Amortization-based interest estimate for ${debt.name}: ${totalInterest.toFixed(2)}`);
      return { debtId: debt.id, interest: totalInterest };
    });
    
    // Calculate total individual interest (sum of individual amortization)
    const sumOfIndividualInterest = individualInterestEstimates.reduce(
      (sum, item) => sum + item.interest, 0
    );
    
    console.log('Sum of individual debt interest calculations:', sumOfIndividualInterest.toFixed(2));

    // Use the StandardizedDebtCalculator for timeline values
    const results = StandardizedDebtCalculator.calculateTimeline(
      processedDebts,
      monthlyPayment,
      strategy,
      oneTimeFundings
    );

    // Add pre-included interest to the baseline interest if needed
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

    // Decide which interest value to use
    // 1. If the sum of individual interest estimates is reasonable, use that
    // 2. Otherwise, use the calculator result with sanity checks
    let baselineInterest;
    let acceleratedInterest;
    
    // Use the sum of individual interest calculations if it's reasonable
    if (sumOfIndividualInterest > 0 && sumOfIndividualInterest < results.baselineInterest * 1.5) {
      console.log('Using sum of individual amortization interest as it appears more accurate');
      baselineInterest = sumOfIndividualInterest + preIncludedInterest;
      // Adjust accelerated interest proportionally
      const ratio = results.acceleratedInterest / results.baselineInterest;
      acceleratedInterest = baselineInterest * ratio;
    } else {
      // Use calculator results but with sanity checks
      baselineInterest = results.baselineInterest + preIncludedInterest;
      acceleratedInterest = results.acceleratedInterest + (preIncludedInterest * 0.9); // Assume some savings
      
      // Apply sanity checks if needed
      const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
      if (baselineInterest > totalBalance * this.MAX_INTEREST_MULTIPLIER || 
          baselineInterest > this.ABSOLUTE_MAX_INTEREST) {
        console.log('Adjusting unreasonably high interest calculation');
        baselineInterest = Math.min(totalBalance * this.MAX_INTEREST_MULTIPLIER, this.ABSOLUTE_MAX_INTEREST);
        acceleratedInterest = baselineInterest * 0.8; // Assume 20% savings
      }
    }

    // Log final interest values for debugging
    console.log('Final interest values:', {
      originalCalculated: results.baselineInterest,
      sumOfIndividualCalculation: sumOfIndividualInterest,
      preIncludedInterest,
      finalBaselineInterest: baselineInterest,
      finalAcceleratedInterest: acceleratedInterest
    });

    return {
      baselineMonths: results.baselineMonths,
      acceleratedMonths: results.acceleratedMonths,
      baselineInterest: baselineInterest,
      acceleratedInterest: acceleratedInterest,
      monthsSaved: results.monthsSaved,
      interestSaved: baselineInterest - acceleratedInterest,
      payoffDate: results.payoffDate,
      monthlyPayments: results.monthlyPayments
    };
  }
}
