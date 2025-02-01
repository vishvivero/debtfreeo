import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";

export interface TimelineCalculationResult {
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

export class DebtTimelineCalculator {
  static calculateTimeline(
    debts: Debt[],
    monthlyPayment: number,
    strategy: Strategy,
    oneTimeFundings: OneTimeFunding[] = []
  ): TimelineCalculationResult {
    console.log('Starting timeline calculation:', {
      totalDebts: debts.length,
      monthlyPayment,
      strategy: strategy.name,
      oneTimeFundings: oneTimeFundings.length
    });

    // Sort debts according to strategy
    const sortedDebts = strategy.calculate([...debts]);
    
    // Calculate baseline scenario (minimum payments only)
    const baselineResult = this.calculateScenario(
      sortedDebts,
      sortedDebts.reduce((sum, debt) => sum + debt.minimum_payment, 0),
      [],
      false
    );

    // Calculate accelerated scenario (with extra payments and one-time funding)
    const acceleratedResult = this.calculateScenario(
      sortedDebts,
      monthlyPayment,
      oneTimeFundings,
      true
    );

    const monthsSaved = Math.max(0, baselineResult.months - acceleratedResult.months);
    const interestSaved = Math.max(0, baselineResult.totalInterest - acceleratedResult.totalInterest);

    console.log('Timeline calculation complete:', {
      baselineMonths: baselineResult.months,
      acceleratedMonths: acceleratedResult.months,
      baselineInterest: baselineResult.totalInterest,
      acceleratedInterest: acceleratedResult.totalInterest,
      monthsSaved,
      interestSaved
    });

    return {
      baselineMonths: baselineResult.months,
      acceleratedMonths: acceleratedResult.months,
      baselineInterest: baselineResult.totalInterest,
      acceleratedInterest: acceleratedResult.totalInterest,
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
    const minimumPayments = new Map<string, number>();
    let remainingDebts = [...debts];
    let currentMonth = 0;
    let totalInterest = 0;
    const maxMonths = 1200;
    const startDate = new Date();
    let releasedPayments = 0;
    const payments: { debtId: string; amount: number; }[] = [];

    // Initialize tracking
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
        const monthlyInterest = Number(((currentBalance * (debt.interest_rate / 100)) / 12).toFixed(2));
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

      // Apply extra payments
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