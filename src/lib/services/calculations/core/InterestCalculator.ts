
export class InterestCalculator {
  private static readonly PRECISION = 2;

  /**
   * Calculate monthly interest for a debt balance based on annual interest rate
   */
  public static calculateMonthlyInterest(balance: number, annualRate: number): number {
    if (annualRate === 0) return 0;
    
    const monthlyRate = annualRate / 1200; // Convert to monthly decimal rate
    return this.ensurePrecision(balance * monthlyRate);
  }

  /**
   * Calculate total interest over a specified term
   */
  public static calculateTotalInterest(
    balance: number,
    annualRate: number,
    months: number
  ): number {
    if (annualRate === 0) return 0;
    
    const monthlyRate = annualRate / 1200;
    let remainingBalance = balance;
    let totalInterest = 0;
    
    for (let i = 0; i < months; i++) {
      const monthlyInterest = remainingBalance * monthlyRate;
      totalInterest += monthlyInterest;
      remainingBalance = remainingBalance * (1 + monthlyRate);
    }
    
    return this.ensurePrecision(totalInterest);
  }

  /**
   * Calculate months to pay off at a fixed payment amount
   */
  public static calculateMonthsToPayoff(
    balance: number,
    annualRate: number,
    monthlyPayment: number
  ): number {
    // For zero interest loans, use simple division
    if (annualRate === 0) {
      if (monthlyPayment <= 0) return Number.POSITIVE_INFINITY;
      return Math.ceil(balance / monthlyPayment);
    }
    
    const monthlyRate = annualRate / 1200;
    
    // Check if payment is enough to cover interest
    const monthlyInterest = balance * monthlyRate;
    if (monthlyPayment <= monthlyInterest) {
      return Number.POSITIVE_INFINITY; // Loan will never be paid off
    }
    
    // Standard formula for months to pay off with compound interest
    const term = Math.log(monthlyPayment / (monthlyPayment - monthlyInterest)) / Math.log(1 + monthlyRate);
    return Math.ceil(term);
  }

  /**
   * Ensure consistent precision in numerical calculations
   */
  public static ensurePrecision(value: number): number {
    return Number(value.toFixed(this.PRECISION));
  }
}
