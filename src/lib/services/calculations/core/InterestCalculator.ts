
export class InterestCalculator {
  private static readonly PRECISION = 2;

  public static calculateMonthlyInterest(balance: number, annualRate: number): number {
    const monthlyRate = annualRate / 1200;
    // Use higher precision during calculation, round only at the end
    return Number((balance * monthlyRate).toFixed(this.PRECISION));
  }

  public static ensurePrecision(value: number): number {
    // Standardize precision for final values
    return Number(value.toFixed(this.PRECISION));
  }
}
