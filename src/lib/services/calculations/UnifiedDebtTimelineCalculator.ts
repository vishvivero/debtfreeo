
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

    // Always prioritize using the sum of individual amortization-based calculations
    // as it's more accurate and matches what users see in individual debt pages
    const baselineInterest = sumOfIndividualInterest + preIncludedInterest;
    
    // Calculate the ratio for accelerated interest
    const ratio = results.baselineInterest > 0 
      ? results.acceleratedInterest / results.baselineInterest 
      : 0.7; // Default to 30% savings if baseline is zero
    
    const acceleratedInterest = baselineInterest * ratio;
    const interestSaved = baselineInterest - acceleratedInterest;
    
    // Fix payoff date calculation to ensure it matches the Strategy page
    // The date should be current date + acceleratedMonths
    const today = new Date();
    const payoffDate = new Date(today.getFullYear(), today.getMonth() + results.acceleratedMonths, today.getDate());
    
    // Calculate expected end date based on baseline months for logging
    const baselineEndDate = new Date(today.getFullYear(), today.getMonth() + results.baselineMonths, today.getDate());
    
    // Log final interest values for debugging
    console.log('Final timeline calculation values:', {
      originalCalculated: {
        baselineInterest: results.baselineInterest,
        acceleratedInterest: results.acceleratedInterest,
        ratio: results.acceleratedInterest / results.baselineInterest
      },
      sumOfIndividualCalculation: sumOfIndividualInterest,
      preIncludedInterest,
      finalValues: {
        baselineInterest,
        acceleratedInterest,
        interestSaved,
        baselineMonths: results.baselineMonths,
        acceleratedMonths: results.acceleratedMonths,
        monthsSaved: results.monthsSaved,
        baselineEndDate: baselineEndDate.toISOString(),
        payoffDate: payoffDate.toISOString(),
        ratio
      }
    });

    return {
      baselineMonths: results.baselineMonths,
      acceleratedMonths: results.acceleratedMonths,
      baselineInterest: baselineInterest,
      acceleratedInterest: acceleratedInterest,
      monthsSaved: results.monthsSaved,
      interestSaved: interestSaved,
      payoffDate: payoffDate,
      monthlyPayments: results.monthlyPayments
    };
  }
}
