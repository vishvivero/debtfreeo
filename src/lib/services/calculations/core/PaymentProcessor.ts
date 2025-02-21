
export class PaymentProcessor {
  private static readonly EPSILON = 0.01;

  public static processMonthlyPayment(
    currentBalance: number,
    payment: number,
    monthlyInterest: number
  ): number {
    return Math.max(0, currentBalance + monthlyInterest - payment);
  }

  public static isDebtPaidOff(balance: number): boolean {
    return balance <= this.EPSILON;
  }
}
