
import { Debt } from "@/lib/types";

export class InterestCalculator {
  /**
   * Ensures proper precision for financial values
   */
  private static ensurePrecision(value: number): number {
    // For large numbers, we need special handling to avoid floating point errors
    if (Math.abs(value) > 1000000) {
      return Math.round(value * 100) / 100;
    }
    return Number(value.toFixed(2));
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
        months
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
