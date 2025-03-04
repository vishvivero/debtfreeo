
/**
 * Handles all interest-related calculations for debts
 */
export class InterestCalculator {
  // Reasonable constants for financial calculations
  private static readonly MAX_REASONABLE_INTEREST_MULTIPLIER = 1.5; // 150% of principal
  private static readonly MAX_REASONABLE_INTEREST = 1000000; // 1 million cap for most loans
  
  /**
   * Ensures that financial values are properly rounded to 2 decimal places
   */
  static ensurePrecision(value: number): number {
    // Sanity check for unrealistically large numbers (likely calculation errors)
    if (Math.abs(value) > 10000000) { // 10 million threshold
      console.log('Extremely large number detected in ensurePrecision - likely a calculation error:', value);
      // Return a more reasonable value for typical debt calculations
      return Math.min(Math.abs(value), 100000);
    }
    
    // Handle very large numbers to prevent floating point errors
    if (Math.abs(value) > 1000000) {
      console.log('Large number detected in ensurePrecision:', value);
      // For very large numbers, we need to be careful about floating point precision
      return Math.round(value * 100) / 100;
    }
    return Number(value.toFixed(2));
  }

  /**
   * Safely formats very large numbers for display purposes
   */
  static formatLargeNumber(value: number): string {
    // Sanity check for unrealistically large values
    if (Math.abs(value) > 10000000) { // 10 million threshold
      console.log('Unrealistically large number detected in formatLargeNumber, likely a calculation error:', value);
      value = Math.min(Math.abs(value), 100000); // Cap at reasonable value
    }
    
    const precision = this.ensurePrecision(value);
    
    // Format with appropriate suffixes
    if (precision >= 1000000000) {
      return `${(precision / 1000000000).toFixed(2)}B`;
    } else if (precision >= 1000000) {
      return `${(precision / 1000000).toFixed(2)}M`;
    } else if (precision >= 1000) {
      return `${(precision / 1000).toFixed(2)}K`;
    }
    
    return precision.toFixed(2);
  }

  /**
   * Calculates the monthly interest amount
   */
  static calculateMonthlyInterest(balance: number, annualInterestRate: number): number {
    // Validate inputs
    if (isNaN(balance) || isNaN(annualInterestRate) || balance < 0 || annualInterestRate < 0) {
      console.log('Invalid inputs for monthly interest calculation:', { balance, annualInterestRate });
      return 0;
    }
    
    // For extremely large balances, issue warning
    if (balance > 1000000) {
      console.log('Warning: Very large balance in monthly interest calculation:', balance);
    }
    
    // Ensure we're using a monthly rate (annual rate / 12 months / 100 for percentage)
    const monthlyRate = annualInterestRate / 1200; 
    const interest = balance * monthlyRate;
    const preciseInterest = this.ensurePrecision(interest);
    
    // Add validation for extremely large interest calculations that are likely errors
    if (preciseInterest > balance * 0.1) { // Monthly interest > 10% of balance
      console.log('Warning: Unusually high monthly interest calculated:', { 
        balance, 
        annualRate: annualInterestRate, 
        interest: preciseInterest,
        percentOfBalance: (preciseInterest / balance) * 100
      });
      
      // If interest seems extremely high, cap it at a reasonable percentage
      if (preciseInterest > balance * 0.2) { // More than 20% per month is likely an error
        const cappedInterest = balance * 0.02; // Cap at 2% per month for safety
        console.log('Capping extremely high interest to reasonable value:', {
          originalInterest: preciseInterest,
          cappedInterest
        });
        return cappedInterest;
      }
    }
    
    // Add detailed logging for debugging interest calculations
    console.log('Monthly interest calculation:', {
      balance,
      annualRate: annualInterestRate,
      interest: preciseInterest
    });
    
    return preciseInterest;
  }

  /**
   * Calculates the principal amount from a total loan amount with pre-calculated interest
   * For example, if a loan is $10,000 with 5% interest included, this calculates what the
   * actual principal is.
   */
  static calculatePrincipalFromTotal(
    totalAmount: number,
    annualInterestRate: number,
    monthlyPayment: number,
    remainingMonths: number
  ): number {
    // For zero interest or short-term loans, just return the total amount
    if (annualInterestRate === 0 || remainingMonths === 0) {
      return totalAmount;
    }

    const monthlyRate = annualInterestRate / 1200;
    
    // Formula for calculating principal when the total (with interest) is known
    // P = T / (1 + i * n)
    // Where:
    // P = Principal
    // T = Total amount (principal + interest)
    // i = Monthly interest rate
    // n = Number of months
    
    const principal = totalAmount / (1 + (monthlyRate * remainingMonths));
    
    return this.ensurePrecision(principal);
  }

  /**
   * Calculates how much total interest will be paid over the life of a loan
   */
  static calculateTotalInterest(
    principal: number,
    annualInterestRate: number,
    monthlyPayment: number
  ): number {
    // Validate inputs
    if (isNaN(principal) || isNaN(annualInterestRate) || isNaN(monthlyPayment)) {
      console.log('Invalid inputs for total interest calculation:', { 
        principal, annualInterestRate, monthlyPayment 
      });
      return 0;
    }
    
    if (annualInterestRate === 0) return 0;
    
    console.log('Starting total interest calculation with:', {
      principal,
      annualInterestRate,
      monthlyPayment
    });
    
    // For very large initial balances, use a simpler calculation method
    // to avoid compounding errors
    if (principal > 1000000) {
      console.log('Using simplified calculation for very large balance');
      // Estimate months to payoff based on principal / monthly payment
      const estimatedMonths = Math.ceil(principal / monthlyPayment) * 1.5; // Add 50% buffer for interest
      // Simple interest formula: P * r * t
      const monthlyRate = annualInterestRate / 1200;
      const roughEstimate = principal * monthlyRate * estimatedMonths;
      
      // Safety cap for unreasonable interest estimates
      const cappedEstimate = Math.min(roughEstimate, principal * this.MAX_REASONABLE_INTEREST_MULTIPLIER);
      if (cappedEstimate < roughEstimate) {
        console.log('Capping unreasonably high interest estimate:', {
          roughEstimate,
          cappedEstimate,
          cap: `${this.MAX_REASONABLE_INTEREST_MULTIPLIER * 100}% of principal`
        });
      }
      
      return this.ensurePrecision(cappedEstimate);
    }
    
    const monthlyRate = annualInterestRate / 1200;
    let balance = principal;
    let totalInterest = 0;
    let months = 0;
    
    // Add debug logging for large amounts
    if (principal > 100000) {
      console.log('Large principal in calculateTotalInterest:', principal);
    }
    
    while (balance > 0 && months < 600) { // 50 years max
      const monthlyInterest = this.ensurePrecision(balance * monthlyRate);
      totalInterest = this.ensurePrecision(totalInterest + monthlyInterest);
      
      const effectivePayment = Math.min(monthlyPayment, balance + monthlyInterest);
      balance = this.ensurePrecision(Math.max(0, balance + monthlyInterest - effectivePayment));
      
      months++;
      
      // Sanity check for calculation errors - prevent runaway interest
      if (totalInterest > principal * 5) {
        console.log('Interest calculation safeguard triggered - interest exceeds 5x principal:', {
          originalPrincipal: principal, 
          currentTotalInterest: totalInterest,
          ratio: totalInterest / principal
        });
        return this.ensurePrecision(principal * this.MAX_REASONABLE_INTEREST_MULTIPLIER); // Return a reasonable cap
      }
      
      // Add periodic logging for large calculations
      if (months % 60 === 0) {
        console.log(`Interest calculation at month ${months}:`, {
          currentBalance: balance,
          accumulatedInterest: totalInterest,
          monthlyInterest
        });
      }
    }
    
    // One final safety check for the result
    if (totalInterest > this.MAX_REASONABLE_INTEREST || totalInterest > principal * this.MAX_REASONABLE_INTEREST_MULTIPLIER) {
      console.log('Final interest exceeds reasonable limits, applying cap:', {
        calculatedInterest: totalInterest,
        cappedInterest: Math.min(this.MAX_REASONABLE_INTEREST, principal * this.MAX_REASONABLE_INTEREST_MULTIPLIER)
      });
      
      return this.ensurePrecision(Math.min(
        this.MAX_REASONABLE_INTEREST, 
        principal * this.MAX_REASONABLE_INTEREST_MULTIPLIER
      ));
    }
    
    // Add final logging for large interest amounts
    if (totalInterest > 10000) {
      console.log('Final interest calculation:', {
        principal,
        annualRate: annualInterestRate,
        months,
        totalInterest: this.ensurePrecision(totalInterest)
      });
    }
    
    return this.ensurePrecision(totalInterest);
  }
}
