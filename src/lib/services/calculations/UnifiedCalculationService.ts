
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import { supabase } from "@/integrations/supabase/client";

export interface UnifiedCalculationResult {
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

export class UnifiedCalculationService {
  private static calculateMonthlyInterest(balance: number, rate: number): number {
    return Number(((balance * (rate / 100)) / 12).toFixed(2));
  }

  public static async calculateUnifiedTimeline(
    debts: Debt[],
    monthlyPayment: number,
    strategy: Strategy,
    oneTimeFundings: OneTimeFunding[] = []
  ): Promise<UnifiedCalculationResult> {
    console.log('Starting unified calculation:', {
      totalDebts: debts.length,
      monthlyPayment,
      strategy: strategy.name,
      oneTimeFundings: oneTimeFundings.length
    });

    // Calculate baseline scenario (minimum payments only)
    const baselineResult = this.calculateScenario(
      debts,
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

    const monthsSaved = Math.max(0, baselineResult.months - acceleratedResult.months);
    const interestSaved = Number((baselineResult.totalInterest - acceleratedResult.totalInterest).toFixed(2));

    const result = {
      baselineMonths: baselineResult.months,
      acceleratedMonths: acceleratedResult.months,
      baselineInterest: baselineResult.totalInterest,
      acceleratedInterest: acceleratedResult.totalInterest,
      monthsSaved,
      interestSaved,
      payoffDate: acceleratedResult.finalPayoffDate,
      monthlyPayments: acceleratedResult.payments
    };

    // Store calculation results for debugging
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (userId) {
      await supabase.from('calculation_results').insert({
        user_id: userId,
        calculation_type: 'timeline',
        input_data: {
          debts,
          monthlyPayment,
          strategyName: strategy.name,
          oneTimeFundings
        },
        output_results: result,
        payoff_date: result.payoffDate,
        total_interest: result.acceleratedInterest,
        months_to_payoff: result.acceleratedMonths
      });
    }

    return result;
  }

  private static calculateScenario(
    debts: Debt[],
    monthlyPayment: number,
    oneTimeFundings: OneTimeFunding[],
    applyStrategy: boolean
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

    // Initialize tracking
    debts.forEach(debt => {
      balances.set(debt.id, debt.balance);
      minimumPayments.set(debt.id, debt.minimum_payment);
    });

    while (remainingDebts.length > 0 && currentMonth < maxMonths) {
      let availablePayment = monthlyPayment + releasedPayments;
      releasedPayments = 0;

      // Process one-time fundings for this month
      const currentDate = new Date(startDate);
      currentDate.setMonth(currentDate.getMonth() + currentMonth);
      
      const monthlyFundings = oneTimeFundings.filter(funding => {
        const fundingDate = new Date(funding.payment_date);
        return fundingDate.getMonth() === currentDate.getMonth() &&
               fundingDate.getFullYear() === currentDate.getFullYear();
      });

      availablePayment += monthlyFundings.reduce((sum, funding) => sum + funding.amount, 0);

      // Calculate interest and apply payments
      for (const debt of remainingDebts) {
        const currentBalance = balances.get(debt.id) || 0;
        const monthlyInterest = this.calculateMonthlyInterest(currentBalance, debt.interest_rate);
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
      if (availablePayment > 0 && remainingDebts.length > 0 && applyStrategy) {
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

    const finalPayoffDate = new Date(startDate);
    finalPayoffDate.setMonth(finalPayoffDate.getMonth() + currentMonth);

    return {
      months: currentMonth,
      totalInterest: Number(totalInterest.toFixed(2)),
      finalPayoffDate,
      payments
    };
  }
}
