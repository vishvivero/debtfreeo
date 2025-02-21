
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { addMonths } from "date-fns";
import { InterestCalculator } from "./calculations/InterestCalculator";
import { PaymentAllocator } from "./calculations/PaymentAllocator";
import { FundingManager, OneTimeFunding } from "./calculations/FundingManager";

export interface UnifiedTimelineResult {
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

export interface PayoffDetails {
  months: number;
  totalInterest: number;
  payoffDate: Date;
  monthlyPayment: number;
  redistributionHistory?: {
    fromDebtId: string;
    amount: number;
    month: number;
  }[];
}

export class UnifiedDebtCalculationService {
  private static instance: UnifiedDebtCalculationService;
  
  private constructor() {
    console.log('Initializing UnifiedDebtCalculationService');
  }

  public static getInstance(): UnifiedDebtCalculationService {
    if (!UnifiedDebtCalculationService.instance) {
      UnifiedDebtCalculationService.instance = new UnifiedDebtCalculationService();
    }
    return UnifiedDebtCalculationService.instance;
  }

  public calculateTotalMinimumPayments(debts: Debt[]): number {
    console.log('Calculating total minimum payments for debts:', debts.length);
    return debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  }

  public calculatePayoffDetails(
    debts: Debt[],
    monthlyPayment: number,
    strategy: Strategy,
    oneTimeFundings: OneTimeFunding[] = []
  ): { [key: string]: PayoffDetails } {
    console.log('Starting payoff calculation:', {
      totalDebts: debts.length,
      monthlyPayment,
      strategy: strategy.name,
      oneTimeFundings: oneTimeFundings.length
    });

    const sortedFundings = FundingManager.sortFundingsByDate(oneTimeFundings);
    const results: { [key: string]: PayoffDetails } = {};
    const balances = new Map<string, number>();
    let remainingDebts = [...debts];
    let currentMonth = 0;
    const maxMonths = 1200;
    const startDate = new Date();

    // Initialize tracking
    debts.forEach(debt => {
      balances.set(debt.id, debt.balance);
      results[debt.id] = {
        months: 0,
        totalInterest: 0,
        payoffDate: new Date(),
        monthlyPayment: debt.minimum_payment,
        redistributionHistory: []
      };
    });

    while (remainingDebts.length > 0 && currentMonth < maxMonths) {
      const currentDate = addMonths(startDate, currentMonth);
      const monthlyFundings = FundingManager.getMonthlyFundings(sortedFundings, currentDate);
      let availablePayment = monthlyPayment + FundingManager.calculateTotalFunding(monthlyFundings);

      console.log('Monthly calculation status:', {
        month: currentMonth,
        availablePayment,
        oneTimeFundingAmount: availablePayment - monthlyPayment,
        remainingDebts: remainingDebts.length
      });

      const allocations = PaymentAllocator.allocatePayments(
        remainingDebts,
        availablePayment,
        strategy
      );

      // Process payments and interest
      for (const debt of remainingDebts) {
        const currentBalance = balances.get(debt.id) || 0;
        const monthlyInterest = InterestCalculator.calculateMonthlyInterest(
          currentBalance,
          debt.interest_rate
        );
        
        results[debt.id].totalInterest += monthlyInterest;
        
        const totalAllocation = allocations
          .filter(a => a.debtId === debt.id)
          .reduce((sum, a) => sum + a.amount, 0);
        
        const newBalance = Math.max(0, currentBalance + monthlyInterest - totalAllocation);
        balances.set(debt.id, newBalance);

        console.log(`Debt ${debt.name} monthly update:`, {
          currentBalance,
          monthlyInterest,
          payment: totalAllocation,
          newBalance
        });
      }

      // Check for paid off debts
      remainingDebts = remainingDebts.filter(debt => {
        const currentBalance = balances.get(debt.id) || 0;
        if (currentBalance <= 0.01) {
          results[debt.id].months = currentMonth + 1;
          results[debt.id].payoffDate = addMonths(startDate, currentMonth + 1);
          return false;
        }
        return true;
      });

      currentMonth++;
    }

    // Handle unpaid debts
    remainingDebts.forEach(debt => {
      if (results[debt.id].months === 0) {
        results[debt.id].months = maxMonths;
        results[debt.id].payoffDate = addMonths(startDate, maxMonths);
      }
    });

    console.log('Final calculation results:', {
      totalMonths: currentMonth,
      finalBalances: Object.fromEntries(balances),
      payoffDates: Object.entries(results).map(([id, detail]) => ({
        debtId: id,
        months: detail.months,
        payoffDate: detail.payoffDate
      }))
    });

    return results;
  }
}

export const unifiedDebtCalculationService = UnifiedDebtCalculationService.getInstance();
