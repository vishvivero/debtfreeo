
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import { InterestCalculator } from "./core/InterestCalculator";
import { ScenarioCalculator } from "./core/ScenarioCalculator";

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
    const baselineResult = ScenarioCalculator.calculateScenario(
      [...debts],
      debts.reduce((sum, debt) => sum + debt.minimum_payment, 0),
      [],
      false
    );

    // Calculate accelerated scenario (with strategy and extra payments)
    const acceleratedResult = ScenarioCalculator.calculateScenario(
      strategy.calculate([...debts]),
      monthlyPayment,
      oneTimeFundings,
      true
    );

    // Ensure consistent precision in final calculations
    const monthsSaved = Math.max(0, baselineResult.months - acceleratedResult.months);
    const interestSaved = InterestCalculator.ensurePrecision(baselineResult.totalInterest - acceleratedResult.totalInterest);

    return {
      baselineMonths: baselineResult.months,
      acceleratedMonths: acceleratedResult.months,
      baselineInterest: InterestCalculator.ensurePrecision(baselineResult.totalInterest),
      acceleratedInterest: InterestCalculator.ensurePrecision(acceleratedResult.totalInterest),
      monthsSaved,
      interestSaved,
      payoffDate: acceleratedResult.finalPayoffDate,
      monthlyPayments: acceleratedResult.payments
    };
  }
}
