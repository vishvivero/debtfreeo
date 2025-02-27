
export class PaymentProcessor {
  private static readonly PRECISION = 2;
  private static readonly EPSILON = 0.01;

  public static processMonthlyPayment(
    currentBalance: number,
    payment: number,
    monthlyInterest: number
  ): number {
    const newBalance = currentBalance + monthlyInterest - payment;
    return Number(Math.max(0, newBalance).toFixed(this.PRECISION));
  }

  public static isDebtPaidOff(balance: number): boolean {
    return balance <= this.EPSILON;
  }
}
