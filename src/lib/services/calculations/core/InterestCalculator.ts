
/**
 * Handles all interest-related calculations for debts
 */
export class InterestCalculator {
  /**
   * Ensures that financial values are properly rounded to 2 decimal places
   */
  static ensurePrecision(value: number): number {
    // Handle very large numbers to prevent floating point errors
    if (value > 1000000) {
      console.log('Large number detected in ensurePrecision:', value);
      // For very large numbers, we need to be careful about floating point precision
      return Math.round(value * 100) / 100;
    }
    return Number(value.toFixed(2));
  }

  /**
   * Calculates the monthly interest amount
   */
  static calculateMonthlyInterest(balance: number, annualInterestRate: number): number {
    const monthlyRate = annualInterestRate / 1200; // Annual rate / (12 * 100)
    const interest = balance * monthlyRate;
    
    console.log('Monthly interest calculation:', {
      balance,
      annualRate: annualInterestRate,
      interest: this.ensurePrecision(interest)
    });
    
    return this.ensurePrecision(interest);
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
    if (annualInterestRate === 0) return 0;
    
    const monthlyRate = annualInterestRate / 1200;
    let balance = principal;
    let totalInterest = 0;
    let months = 0;
    
    // Add debug logging for large amounts
    if (principal > 1000000) {
      console.log('Large principal in calculateTotalInterest:', principal);
    }
    
    while (balance > 0 && months < 600) { // 50 years max
      const monthlyInterest = balance * monthlyRate;
      totalInterest += monthlyInterest;
      
      const effectivePayment = Math.min(monthlyPayment, balance + monthlyInterest);
      balance = Math.max(0, balance + monthlyInterest - effectivePayment);
      
      months++;
      
      // Add extra debugging for very large interest accumulation
      if (totalInterest > 1000000 && months % 10 === 0) {
        console.log(`Interest accumulation high at month ${months}:`, {
          totalInterest,
          currentBalance: balance,
          monthlyInterest,
          payment: effectivePayment
        });
      }
    }
    
    // Add final logging
    if (totalInterest > 100000) {
      console.log('Final high interest calculation:', {
        principal,
        annualRate: annualInterestRate,
        months,
        totalInterest,
        result: this.ensurePrecision(totalInterest)
      });
    }
    
    return this.ensurePrecision(totalInterest);
  }
}
