
export class InterestCalculator {
  private static readonly PRECISION = 2;

  public static calculateMonthlyInterest(balance: number, annualRate: number): number {
    const monthlyRate = annualRate / 1200;
    return Number((balance * monthlyRate).toFixed(this.PRECISION));
  }

  public static ensurePrecision(value: number): number {
    return Number(value.toFixed(this.PRECISION));
  }
}
