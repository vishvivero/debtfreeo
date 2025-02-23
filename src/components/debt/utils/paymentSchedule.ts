
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
    minimumPayment: debt.minimum_payment,
    isGoldLoan: debt.is_gold_loan
  });

  const schedule: Payment[] = [];
  let currentDate = debt.next_payment_date 
    ? new Date(debt.next_payment_date) 
    : new Date();
  
  let remainingBalance = Number(debt.balance);
  const monthlyRate = Number(debt.interest_rate) / 1200; // Convert annual rate to monthly decimal
  
  // For gold loans, we only pay interest until the final payment
  const isGoldLoan = debt.is_gold_loan && debt.loan_term_months;
  const finalPaymentDate = isGoldLoan ? debt.final_payment_date : undefined;
  
  for (let month = 0; month < payoffDetails.months && remainingBalance > 0.01; month++) {
    const monthlyInterest = Number((remainingBalance * monthlyRate).toFixed(2));
    let paymentAmount = monthlyAllocation;
    let principalPaid = 0;

    if (isGoldLoan) {
      // For gold loans, only pay interest until final payment
      const currentDateStr = currentDate.toISOString().split('T')[0];
      const isFinalPayment = finalPaymentDate && currentDateStr >= finalPaymentDate;
      
      if (isFinalPayment) {
        // On final payment date, pay remaining balance
        paymentAmount = remainingBalance + monthlyInterest;
        principalPaid = remainingBalance;
      } else {
        // Regular month - only pay interest
        paymentAmount = monthlyInterest;
        principalPaid = 0;
      }
    } else {
      // Regular loan payment calculation
      paymentAmount = Math.min(monthlyAllocation, remainingBalance + monthlyInterest);
      principalPaid = Number((paymentAmount - monthlyInterest).toFixed(2));
    }
    
    remainingBalance = Number((remainingBalance - principalPaid).toFixed(2));
    const isLastPayment = remainingBalance <= 0.01;
    
    if (isLastPayment) {
      remainingBalance = 0;
    }

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
