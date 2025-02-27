import { Debt } from "@/lib/types";
import { Payment } from "@/lib/types/payment";
import { addMonths } from "date-fns";

export const calculatePaymentSchedule = (
  debt: Debt,
  payoffDetails: { months: number },
  monthlyAllocation: number,
  isHighPriorityDebt: boolean
): Payment[] => {
  console.log('Starting payment calculation for', debt.name, {
    initialBalance: debt.balance,
    monthlyAllocation,
    isHighPriorityDebt,
    minimumPayment: debt.minimum_payment
  });

  const schedule: Payment[] = [];
  let currentDate = debt.next_payment_date 
    ? new Date(debt.next_payment_date) 
    : new Date();
  
  let remainingBalance = Number(debt.balance);
  const monthlyRate = Number(debt.interest_rate) / 1200; // Convert annual rate to monthly decimal
  
  for (let month = 0; month < payoffDetails.months && remainingBalance > 0.01; month++) {
    // Calculate this month's interest
    const monthlyInterest = Number((remainingBalance * monthlyRate).toFixed(2));
    
    // Determine payment amount - for non-high priority debts, use at least minimum payment
    // but allow for full monthly allocation if available
    let paymentAmount = monthlyAllocation;

    // Ensure we don't overpay
    const totalRequired = remainingBalance + monthlyInterest;
    if (paymentAmount > totalRequired) {
      paymentAmount = Number(totalRequired.toFixed(2));
    }

    // Calculate principal portion of payment
    const principalPaid = Number((paymentAmount - monthlyInterest).toFixed(2));
    
    // Update remaining balance
    remainingBalance = Number((remainingBalance - principalPaid).toFixed(2));
    
    const isLastPayment = remainingBalance <= 0.01;
    if (isLastPayment) {
      remainingBalance = 0;
    }

    console.log(`Month ${month + 1} calculation for ${debt.name}:`, {
      startingBalance: (remainingBalance + principalPaid).toFixed(2),
      monthlyInterest: monthlyInterest.toFixed(2),
      payment: paymentAmount.toFixed(2),
      principalPaid: principalPaid.toFixed(2),
      remainingBalance: remainingBalance.toFixed(2),
      isLastPayment,
      isFirstMonth: month === 0
    });

    schedule.push({
      date: new Date(currentDate),
      amount: paymentAmount,
      isLastPayment,
      remainingBalance,
      interestPaid: monthlyInterest,
      principalPaid
    });

    if (isLastPayment) break;
    currentDate = addMonths(currentDate, 1);
  }

  return schedule;
};