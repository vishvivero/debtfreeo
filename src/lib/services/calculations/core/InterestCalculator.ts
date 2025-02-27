/**
 * Utilities for standard interest calculations
 */
export class InterestCalculator {
  /**
   * Calculates monthly interest based on the current balance and annual interest rate
   */
  static calculateMonthlyInterest(balance: number, annualInterestRate: number): number {
    // Convert annual rate to monthly rate (divide by 1200 to account for percentage)
    const monthlyInterestRate = annualInterestRate / 1200;
    return this.ensurePrecision(balance * monthlyInterestRate);
  }

  /**
   * Calculates the remaining loan balance after a payment
   */
  static calculateRemainingBalance(
    currentBalance: number,
    payment: number,
    interestAmount: number
  ): number {
    // If payment is less than interest, balance increases
    if (payment < interestAmount) {
      return this.ensurePrecision(currentBalance + (interestAmount - payment));
    }
    
    // Otherwise, reduce balance by payment minus interest
    return this.ensurePrecision(currentBalance - (payment - interestAmount));
  }

  /**
   * Calculate the principal amount from total loan amount (for loans with pre-calculated interest)
   */
  static calculatePrincipalFromTotal(
    totalLoanAmount: number,
    annualInterestRate: number,
    monthlyPayment: number,
    loanTermMonths: number
  ): number {
    // For zero interest loans or invalid parameters
    if (annualInterestRate <= 0 || loanTermMonths <= 0 || monthlyPayment <= 0) {
      return totalLoanAmount;
    }

    // Convert annual rate to monthly rate
    const monthlyRate = annualInterestRate / 1200;
    
    // Calculate present value (principal) from future value (total with interest)
    // Using the standard formula to solve for principal given payment, rate, and term
    const principalAmount = monthlyPayment * 
      (1 - Math.pow(1 + monthlyRate, -loanTermMonths)) / monthlyRate;
    
    return this.ensurePrecision(principalAmount);
  }

  /**
   * Ensures consistent decimal precision for monetary values
   */
  static ensurePrecision(value: number, precision: number = 2): number {
    return Number(value.toFixed(precision));
  }
}
