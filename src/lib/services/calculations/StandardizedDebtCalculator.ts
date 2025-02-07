
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";

export interface CalculationResult {
  baselineMonths: number;
  acceleratedMonths: number;
  baselineInterest: number;
  acceleratedInterest: number;
  monthsSaved: number;
  interestSaved: number;
  payoffDate: Date;
  monthlyPayments: {
    debtId: string;
    amount: number;
  }[];
}

export class StandardizedDebtCalculator {
  private static readonly PRECISION = 2;
  private static readonly EPSILON = 0.01;

  /**
   * Calculates monthly interest with standardized precision
   */
  private static calculateMonthlyInterest(balance: number, annualRate: number): number {
    const monthlyRate = annualRate / 1200; // Convert annual percentage to monthly decimal
    return Number((balance * monthlyRate).toFixed(this.PRECISION));
  }

  /**
   * Processes monthly payments and returns new balance
   */
  private static processMonthlyPayment(
    currentBalance: number,
    payment: number,
    monthlyInterest: number
  ): number {
    // Ensure consistent precision in balance calculations
    const newBalance = currentBalance + monthlyInterest - payment;
    return Number(Math.max(0, newBalance).toFixed(this.PRECISION));
  }

  public static calculateTimeline(
    debts: Debt[],
    monthlyPayment: number,
    strategy: Strategy,
    oneTimeFundings: OneTimeFunding[] = []
  ): CalculationResult {
    console.log('Starting standardized calculation:', {
      totalDebts: debts.length,
      monthlyPayment,
      strategy: strategy.name,
      oneTimeFundings: oneTimeFundings.length
    });

    // Calculate baseline scenario (minimum payments only)
    const baselineResult = this.calculateScenario(
      [...debts],
      debts.reduce((sum, debt) => sum + debt.minimum_payment, 0),
      [],
      false
    );

    // Calculate accelerated scenario (with strategy and extra payments)
    const acceleratedResult = this.calculateScenario(
      strategy.calculate([...debts]),
      monthlyPayment,
      oneTimeFundings,
      true
    );

    // Ensure consistent precision in final calculations
    const monthsSaved = Math.max(0, baselineResult.months - acceleratedResult.months);
    const interestSaved = Number((baselineResult.totalInterest - acceleratedResult.totalInterest).toFixed(this.PRECISION));

    return {
      baselineMonths: baselineResult.months,
      acceleratedMonths: acceleratedResult.months,
      baselineInterest: Number(baselineResult.totalInterest.toFixed(this.PRECISION)),
      acceleratedInterest: Number(acceleratedResult.totalInterest.toFixed(this.PRECISION)),
      monthsSaved,
      interestSaved,
      payoffDate: acceleratedResult.finalPayoffDate,
      monthlyPayments: acceleratedResult.payments
    };
  }

  private static calculateScenario(
    debts: Debt[],
    monthlyPayment: number,
    oneTimeFundings: OneTimeFunding[],
    isAccelerated: boolean
  ) {
    const balances = new Map<string, number>();
    let remainingDebts = [...debts];
    let currentMonth = 0;
    let totalInterest = 0;
    const maxMonths = 1200;
    const startDate = new Date();
    let releasedPayments = 0;
    const payments: { debtId: string; amount: number; }[] = [];

    // Initialize balances with consistent precision
    debts.forEach(debt => {
      balances.set(debt.id, Number(debt.balance.toFixed(this.PRECISION)));
    });

    // Calculate total minimum payments
    const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);

    while (remainingDebts.length > 0 && currentMonth < maxMonths) {
      let availablePayment = monthlyPayment + releasedPayments;
      releasedPayments = 0;

      // Process one-time fundings for current month
      const currentDate = new Date(startDate.getTime());
      currentDate.setMonth(currentDate.getMonth() + currentMonth);
      
      if (isAccelerated) {
        const monthlyFundings = oneTimeFundings.filter(funding => {
          const fundingDate = new Date(funding.payment_date);
          return fundingDate.getMonth() === currentDate.getMonth() &&
                 fundingDate.getFullYear() === currentDate.getFullYear();
        });

        availablePayment += monthlyFundings.reduce((sum, funding) => sum + funding.amount, 0);
      }

      // First apply minimum payments
      for (const debt of remainingDebts) {
        const currentBalance = balances.get(debt.id) || 0;
        const monthlyInterest = this.calculateMonthlyInterest(currentBalance, debt.interest_rate);
        totalInterest += monthlyInterest;
        
        const minPayment = Math.min(debt.minimum_payment, currentBalance + monthlyInterest);
        
        if (availablePayment >= minPayment) {
          const newBalance = this.processMonthlyPayment(currentBalance, minPayment, monthlyInterest);
          balances.set(debt.id, newBalance);
          availablePayment -= minPayment;

          if (currentMonth === 0) {
            payments.push({ debtId: debt.id, amount: minPayment });
          }
        }
      }

      // Apply extra payment to highest priority debt
      if (isAccelerated && availablePayment > 0 && remainingDebts.length > 0) {
        const targetDebt = remainingDebts[0];
        const currentBalance = balances.get(targetDebt.id) || 0;
        const extraPayment = Math.min(availablePayment, currentBalance);
        
        if (extraPayment > 0) {
          const newBalance = Math.max(0, currentBalance - extraPayment);
          balances.set(targetDebt.id, Number(newBalance.toFixed(this.PRECISION)));
          
          if (currentMonth === 0) {
            const existingPayment = payments.find(p => p.debtId === targetDebt.id);
            if (existingPayment) {
              existingPayment.amount += extraPayment;
            } else {
              payments.push({ debtId: targetDebt.id, amount: extraPayment });
            }
          }
        }
      }

      // Check for paid off debts
      remainingDebts = remainingDebts.filter(debt => {
        const balance = balances.get(debt.id) || 0;
        if (balance <= this.EPSILON) {
          releasedPayments += debt.minimum_payment;
          return false;
        }
        return true;
      });

      currentMonth++;
    }

    return {
      months: currentMonth,
      totalInterest: Number(totalInterest.toFixed(this.PRECISION)),
      finalPayoffDate: new Date(startDate.setMonth(startDate.getMonth() + currentMonth)),
      payments
    };
  }
}
