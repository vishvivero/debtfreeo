
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
   * Calculate actual principal from a balance that includes interest
   */
  public static calculatePrincipalFromTotal(
    totalBalance: number,
    annualRate: number,
    monthlyPayment: number,
    totalMonths: number
  ): number {
    if (annualRate === 0 || totalMonths <= 0 || monthlyPayment <= 0) {
      return totalBalance;
    }

    const monthlyRate = annualRate / 1200;
    
    // Using the standard loan formula:
    // totalBalance = principal * (1 + monthlyRate)^totalMonths - (monthlyPayment * ((1 + monthlyRate)^totalMonths - 1) / monthlyRate)
    const rateFactorPow = Math.pow(1 + monthlyRate, totalMonths);
    const paymentFactor = (rateFactorPow - 1) / monthlyRate;
    
    // Solve for principal
    const principal = (totalBalance + (monthlyPayment * paymentFactor)) / rateFactorPow;
    
    console.log('Back-calculating principal:', {
      totalBalance,
      annualRate,
      monthlyPayment,
      totalMonths,
      calculatedPrincipal: this.ensurePrecision(principal)
    });

    return this.ensurePrecision(principal);
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
