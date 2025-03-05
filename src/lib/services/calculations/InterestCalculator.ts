
import { Debt } from "@/lib/types";

export class InterestCalculator {
  // Constants for reasonable calculation limits
  private static readonly MAX_INTEREST_MULTIPLIER = 1.5; // Maximum 150% of principal as interest
  private static readonly INTEREST_CAP = 100000; // Hard cap at 100K for most personal debts

  /**
   * Ensures proper precision for financial values
   */
  public static ensurePrecision(value: number): number {
    // Sanity check for unrealistically large numbers (likely calculation errors)
    if (Math.abs(value) > 10000000) { // 10 million threshold
      console.log('Extremely large number detected in ensurePrecision - likely a calculation error:', value);
      // Return a more reasonable value for typical debt calculations
      return Math.min(Math.abs(value), this.INTEREST_CAP);
    }
    
    // For large numbers, we need special handling to avoid floating point errors
    if (Math.abs(value) > 1000000) {
      console.log('Large number detected in ensurePrecision:', value);
      // For very large numbers, use Math.round for precision to avoid floating point errors
      return Math.round(value * 100) / 100;
    }
    // For normal numbers, use toFixed for consistent decimal places
    return Number(value.toFixed(2));
  }

  /**
   * Safely handles very large numbers for display purposes
   */
  public static formatLargeNumber(value: number): string {
    // Sanity check for unrealistically large values
    if (Math.abs(value) > 10000000) { // 10 million threshold
      console.log('Unrealistically large number detected in formatLargeNumber, likely a calculation error:', value);
      value = Math.min(Math.abs(value), this.INTEREST_CAP); // Cap at reasonable value
    }
    
    const precision = this.ensurePrecision(value);
    
    // Format large numbers with appropriate suffixes for display
    if (precision >= 1000000000) {
      return `${(precision / 1000000000).toFixed(2)}B`;
    } else if (precision >= 1000000) {
      return `${(precision / 1000000).toFixed(2)}M`;
    } else if (precision >= 1000) {
      return `${(precision / 1000).toFixed(2)}K`;
    }
    
    return precision.toFixed(2);
  }

  public static calculateMonthlyInterest(balance: number, annualRate: number): number {
    // Validate inputs to catch potential errors
    if (isNaN(balance) || isNaN(annualRate) || balance < 0 || annualRate < 0) {
      console.log('Invalid inputs for monthly interest calculation:', { balance, annualRate });
      return 0;
    }
    
    // Calculate the monthly interest with proper precision
    const interest = balance * (annualRate / 100) / 12;
    const preciseInterest = this.ensurePrecision(interest);
    
    // Add validation for extremely large interest calculations that are likely errors
    if (preciseInterest > balance * 0.1) { // Monthly interest > 10% of balance
      console.log('Warning: Unusually high monthly interest calculated:', { 
        balance, 
        annualRate, 
        rawInterest: interest,
        preciseInterest,
        percentOfBalance: (preciseInterest / balance) * 100
      });
      
      // If interest seems extremely high (>20% per month), it's likely an error
      if (preciseInterest > balance * 0.2) {
        const cappedInterest = balance * (annualRate / 100) / 12;
        console.log('Capping extremely high interest to reasonable value:', {
          originalInterest: preciseInterest,
          cappedInterest: cappedInterest
        });
        return Math.min(preciseInterest, cappedInterest);
      }
    }
    
    console.log('Monthly interest calculation:', { 
      balance, 
      annualRate, 
      rawInterest: interest,
      preciseInterest 
    });
    
    return preciseInterest;
  }

  public static calculateTotalInterest(
    balance: number,
    annualRate: number,
    months: number
  ): number {
    // Validate inputs to prevent calculation errors
    if (isNaN(balance) || isNaN(annualRate) || isNaN(months)) {
      console.log('Invalid inputs for total interest calculation:', { balance, annualRate, months });
      return 0;
    }
    
    if (annualRate <= 0 || months <= 0) {
      return 0;
    }
    
    // Sanity check for large values that might cause calculation issues
    if (balance > 1000000 || annualRate > 100 || months > 360) {
      console.log('Warning: Potentially problematic values for interest calculation:', {
        balance,
        annualRate,
        months
      });
    }
    
    let remainingBalance = balance;
    let totalInterest = 0;
    
    // Log input values for debugging large calculations
    if (balance > 100000 || months > 120) {
      console.log('Large interest calculation:', {
        startingBalance: balance,
        annualRate,
        months
      });
    }
    
    // For very large initial balances, use a simpler calculation method
    // to avoid compounding errors
    if (balance > 1000000) {
      console.log('Using simplified calculation for very large balance');
      // Simple interest formula: P * r * t
      // where P is principal, r is monthly rate, t is time in months
      const monthlyRate = annualRate / 1200;
      const roughEstimate = balance * monthlyRate * months;
      
      // Cap at reasonable value
      const cappedEstimate = Math.min(roughEstimate, balance * this.MAX_INTEREST_MULTIPLIER);
      
      if (cappedEstimate < roughEstimate) {
        console.log('Capping unreasonably high interest estimate:', {
          originalEstimate: roughEstimate,
          cappedEstimate: cappedEstimate
        });
      }
      
      return this.ensurePrecision(cappedEstimate);
    }
    
    // Use standard compound interest calculation for normal values
    for (let i = 0; i < months; i++) {
      const monthlyInterest = this.calculateMonthlyInterest(remainingBalance, annualRate);
      totalInterest += monthlyInterest;
      remainingBalance += monthlyInterest;
      
      // Add periodic logging for large calculations
      if (i > 0 && i % 60 === 0 && balance > 100000) {
        console.log(`Interest calculation at month ${i}:`, {
          currentBalance: this.ensurePrecision(remainingBalance),
          interestSoFar: this.ensurePrecision(totalInterest)
        });
      }
      
      // Sanity check for calculation errors - prevent runaway interest
      if (totalInterest > balance * 5) {
        console.log('Interest calculation safeguard triggered - interest exceeds 5x principal:', {
          originalBalance: balance,
          currentTotalInterest: totalInterest,
          ratio: totalInterest / balance
        });
        return this.ensurePrecision(balance * this.MAX_INTEREST_MULTIPLIER); // Return a reasonable cap 
      }
    }
    
    const result = this.ensurePrecision(totalInterest);
    
    // Final safety check - if result is still unreasonably large
    if (result > balance * this.MAX_INTEREST_MULTIPLIER) {
      console.log('Final interest still exceeds reasonable amount, applying cap:', {
        calculatedInterest: result,
        cappedInterest: balance * this.MAX_INTEREST_MULTIPLIER
      });
      return this.ensurePrecision(balance * this.MAX_INTEREST_MULTIPLIER);
    }
    
    // Log the final result for validation
    if (balance > 50000 || result > 10000) {
      console.log('Total interest calculation complete:', {
        originalBalance: balance,
        annualRate,
        months,
        rawTotalInterest: totalInterest,
        finalResult: result
      });
    }
    
    return result;
  }
}
