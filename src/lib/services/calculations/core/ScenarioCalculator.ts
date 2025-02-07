
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import { InterestCalculator } from "./InterestCalculator";
import { PaymentProcessor } from "./PaymentProcessor";

interface ScenarioResult {
  months: number;
  totalInterest: number;
  finalPayoffDate: Date;
  payments: {
    debtId: string;
    amount: number;
  }[];
}

export class ScenarioCalculator {
  private static readonly PRECISION = 2;

  public static calculateScenario(
    debts: Debt[],
    monthlyPayment: number,
    oneTimeFundings: OneTimeFunding[],
    isAccelerated: boolean
  ): ScenarioResult {
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
      balances.set(debt.id, InterestCalculator.ensurePrecision(debt.balance));
    });

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
        const monthlyInterest = InterestCalculator.calculateMonthlyInterest(currentBalance, debt.interest_rate);
        totalInterest += monthlyInterest;
        
        const minPayment = Math.min(debt.minimum_payment, currentBalance + monthlyInterest);
        
        if (availablePayment >= minPayment) {
          const newBalance = PaymentProcessor.processMonthlyPayment(currentBalance, minPayment, monthlyInterest);
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
          balances.set(targetDebt.id, InterestCalculator.ensurePrecision(newBalance));
          
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
        if (PaymentProcessor.isDebtPaidOff(balance)) {
          releasedPayments += debt.minimum_payment;
          return false;
        }
        return true;
      });

      currentMonth++;
    }

    return {
      months: currentMonth,
      totalInterest: InterestCalculator.ensurePrecision(totalInterest),
      finalPayoffDate: new Date(startDate.setMonth(startDate.getMonth() + currentMonth)),
      payments
    };
  }
}
