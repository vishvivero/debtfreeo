import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";

export interface InterestCalculationResult {
  baselineInterest: number;
  acceleratedInterest: number;
  interestSaved: number;
  monthsSaved: number;
  payoffDate: Date;
  monthlyPayments: {
    debtId: string;
    amount: number;
  }[];
}

export class UnifiedInterestCalculator {
  static calculateInterest(
    debts: Debt[],
    monthlyPayment: number,
    strategy: Strategy,
    oneTimeFundings: OneTimeFunding[] = []
  ): InterestCalculationResult {
    console.log('UnifiedInterestCalculator: Starting calculation with:', {
      totalDebts: debts.length,
      monthlyPayment,
      strategy: strategy.name,
      oneTimeFundings: oneTimeFundings.length
    });

    const sortedDebts = strategy.calculate([...debts]);
    const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);

    // Calculate baseline scenario (minimum payments only)
    const baselineResult = this.calculateScenario(
      sortedDebts,
      totalMinimumPayment,
      [],
      false
    );

    // Calculate accelerated scenario (with extra payments)
    const acceleratedResult = this.calculateScenario(
      sortedDebts,
      monthlyPayment,
      oneTimeFundings,
      true
    );

    const result = {
      baselineInterest: baselineResult.totalInterest,
      acceleratedInterest: acceleratedResult.totalInterest,
      interestSaved: baselineResult.totalInterest - acceleratedResult.totalInterest,
      monthsSaved: Math.max(0, baselineResult.months - acceleratedResult.months),
      payoffDate: acceleratedResult.finalPayoffDate,
      monthlyPayments: acceleratedResult.payments
    };

    console.log('UnifiedInterestCalculator: Calculation complete:', {
      baselineScenario: {
        months: baselineResult.months,
        totalInterest: baselineResult.totalInterest,
        payoffDate: baselineResult.finalPayoffDate
      },
      acceleratedScenario: {
        months: acceleratedResult.months,
        totalInterest: acceleratedResult.totalInterest,
        payoffDate: acceleratedResult.finalPayoffDate
      },
      savings: {
        interestSaved: result.interestSaved,
        monthsSaved: result.monthsSaved
      }
    });

    return result;
  }

  private static calculateScenario(
    debts: Debt[],
    monthlyPayment: number,
    oneTimeFundings: OneTimeFunding[],
    isAccelerated: boolean
  ) {
    const balances = new Map<string, number>();
    const minimumPayments = new Map<string, number>();
    let remainingDebts = [...debts];
    let currentMonth = 0;
    let totalInterest = 0;
    const maxMonths = 1200; // 100 years cap
    const startDate = new Date();
    let releasedPayments = 0;
    const payments: { debtId: string; amount: number; }[] = [];

    // Initialize balances and minimum payments
    debts.forEach(debt => {
      balances.set(debt.id, debt.balance);
      minimumPayments.set(debt.id, debt.minimum_payment);
    });

    while (remainingDebts.length > 0 && currentMonth < maxMonths) {
      let availablePayment = monthlyPayment + releasedPayments;
      releasedPayments = 0;

      // Process one-time fundings for this month
      if (isAccelerated) {
        const currentDate = new Date(startDate);
        currentDate.setMonth(currentDate.getMonth() + currentMonth);
        
        const monthlyFundings = oneTimeFundings.filter(funding => {
          const fundingDate = new Date(funding.payment_date);
          return fundingDate.getMonth() === currentDate.getMonth() &&
                 fundingDate.getFullYear() === currentDate.getFullYear();
        });

        availablePayment += monthlyFundings.reduce((sum, funding) => sum + funding.amount, 0);
      }

      // Calculate interest and apply payments
      for (const debt of remainingDebts) {
        const currentBalance = balances.get(debt.id) || 0;
        const monthlyInterest = (currentBalance * (debt.interest_rate / 100)) / 12;
        totalInterest += monthlyInterest;
        
        balances.set(debt.id, currentBalance + monthlyInterest);
        
        const minPayment = Math.min(
          minimumPayments.get(debt.id) || 0,
          currentBalance + monthlyInterest
        );

        if (availablePayment >= minPayment) {
          balances.set(debt.id, (balances.get(debt.id) || 0) - minPayment);
          availablePayment -= minPayment;
          
          if (currentMonth === 0) {
            payments.push({ debtId: debt.id, amount: minPayment });
          }
        }
      }

      // Apply extra payments according to strategy
      if (availablePayment > 0 && remainingDebts.length > 0) {
        const targetDebt = remainingDebts[0];
        const currentBalance = balances.get(targetDebt.id) || 0;
        const extraPayment = Math.min(availablePayment, currentBalance);
        
        if (extraPayment > 0) {
          balances.set(targetDebt.id, currentBalance - extraPayment);
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
        const currentBalance = balances.get(debt.id) || 0;
        if (currentBalance <= 0.01) {
          releasedPayments += minimumPayments.get(debt.id) || 0;
          return false;
        }
        return true;
      });

      currentMonth++;
    }

    return {
      months: currentMonth,
      totalInterest: Number(totalInterest.toFixed(2)),
      finalPayoffDate: new Date(startDate.setMonth(startDate.getMonth() + currentMonth)),
      payments
    };
  }
}