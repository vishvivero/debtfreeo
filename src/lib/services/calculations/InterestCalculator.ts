
import { Debt } from "@/lib/types";

export class InterestCalculator {
  /**
   * Ensures proper precision for financial values
   */
  private static ensurePrecision(value: number): number {
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
    // Calculate the monthly interest with proper precision
    const interest = balance * (annualRate / 100) / 12;
    const preciseInterest = this.ensurePrecision(interest);
    
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
    if (annualRate <= 0 || months <= 0) {
      return 0;
    }
    
    let remainingBalance = balance;
    let totalInterest = 0;
    
    // Log input values for debugging large calculations
    if (balance > 100000 || months > 120) {
      console.log('Large interest calculation:', {
        startingBalance: balance,
        annualRate,
        months,
        useExactPrecision: true
      });
    }
    
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
    }
    
    const result = this.ensurePrecision(totalInterest);
    
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
