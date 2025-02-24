
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { PayoffDetails, PaymentAllocation } from "../types/payoff";
import { calculateTimelineData } from "@/components/debt/timeline/TimelineCalculator";
import { calculatePaymentSchedule } from "@/components/debt/utils/paymentSchedule";

export class PaymentCalculationService {
  static calculatePaymentAllocations(
    sortedDebts: Debt[],
    totalMonthlyPayment: number
  ): Map<string, number> {
    const allocations = new Map<string, number>();
    const totalMinPayments = sortedDebts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
    const extraPayment = Math.max(0, totalMonthlyPayment - totalMinPayments);

    // Initialize with minimum payments
    sortedDebts.forEach(debt => {
      allocations.set(debt.id, debt.minimum_payment);
    });

    // Handle gold loans first
    const goldLoans = sortedDebts.filter(d => d.is_gold_loan);
    const regularLoans = sortedDebts.filter(d => !d.is_gold_loan);

    // Allocate extra payments to gold loans (20% of extra payment)
    if (goldLoans.length > 0) {
      const goldLoanExtraPayment = extraPayment * 0.2;
      const extraPerGoldLoan = goldLoanExtraPayment / goldLoans.length;
      
      goldLoans.forEach(debt => {
        allocations.set(
          debt.id,
          (allocations.get(debt.id) || 0) + extraPerGoldLoan
        );
      });
    }

    // Allocate remaining extra payment to regular loans
    const remainingExtra = goldLoans.length > 0 ? extraPayment * 0.8 : extraPayment;
    if (remainingExtra > 0 && regularLoans.length > 0) {
      const highestPriorityRegularDebt = regularLoans[0];
      allocations.set(
        highestPriorityRegularDebt.id,
        (allocations.get(highestPriorityRegularDebt.id) || 0) + remainingExtra
      );
    }

    return allocations;
  }

  static calculatePayoffDetails(
    sortedDebts: Debt[],
    timelineData: any[],
    allocations: Map<string, number>
  ): { [key: string]: PayoffDetails } {
    const redistributionHistory = this.trackRedistributions(sortedDebts, timelineData);
    
    return sortedDebts.reduce((acc, debt) => {
      const payoffMonth = this.findPayoffMonth(timelineData, debt);
      const months = payoffMonth !== -1 ? payoffMonth + 1 : timelineData.length;
      const payoffDate = new Date();
      payoffDate.setMonth(payoffDate.getMonth() + months);
      const totalInterest = timelineData[months - 1]?.acceleratedInterest || 0;

      // Create a complete PayoffDetails object
      const details: PayoffDetails = {
        months,
        payoffDate,
        totalInterest,
        payments: calculatePaymentSchedule(
          debt,
          { months }, // Only pass the required months property
          allocations.get(debt.id) || debt.minimum_payment,
          sortedDebts.indexOf(debt) === 0
        ),
        redistributionHistory: redistributionHistory.get(debt.id) || []
      };

      acc[debt.id] = details;
      return acc;
    }, {} as { [key: string]: PayoffDetails });
  }

  private static trackRedistributions(sortedDebts: Debt[], timelineData: any[]) {
    const redistributionHistory = new Map<string, { fromDebtId: string; amount: number; month: number; }[]>();
    const paidOffDebts = new Set<string>();

    timelineData.forEach((data, monthIndex) => {
      sortedDebts.forEach((debt, debtIndex) => {
        const prevMonth = monthIndex > 0 ? timelineData[monthIndex - 1] : null;
        const wasActive = prevMonth && prevMonth.acceleratedBalance > 0;
        const isPaidOff = data.acceleratedBalance === 0;

        if (wasActive && isPaidOff && !paidOffDebts.has(debt.id)) {
          this.handleDebtPayoff(
            debt,
            debtIndex,
            monthIndex,
            sortedDebts,
            paidOffDebts,
            redistributionHistory
          );
        }
      });
    });

    return redistributionHistory;
  }

  private static handleDebtPayoff(
    debt: Debt,
    debtIndex: number,
    monthIndex: number,
    sortedDebts: Debt[],
    paidOffDebts: Set<string>,
    redistributionHistory: Map<string, { fromDebtId: string; amount: number; month: number; }[]>
  ) {
    paidOffDebts.add(debt.id);
    const releasedAmount = debt.minimum_payment;

    const nextUnpaidDebt = sortedDebts.find((d, idx) => 
      idx > debtIndex && !paidOffDebts.has(d.id)
    );

    if (nextUnpaidDebt) {
      const currentRedistributions = redistributionHistory.get(nextUnpaidDebt.id) || [];
      redistributionHistory.set(nextUnpaidDebt.id, [
        ...currentRedistributions,
        {
          fromDebtId: debt.id,
          amount: releasedAmount,
          month: monthIndex + 1
        }
      ]);
    }
  }

  private static findPayoffMonth(timelineData: any[], debt: Debt): number {
    return timelineData.findIndex((data, index) => {
      const prevMonth = index > 0 ? timelineData[index - 1] : null;
      return prevMonth?.acceleratedBalance > 0 && data.acceleratedBalance === 0;
    });
  }
}
