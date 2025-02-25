
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { addMonths } from "date-fns";
import { InterestCalculator } from "@/lib/services/calculations/core/InterestCalculator";
import { PaymentProcessor } from "@/lib/services/calculations/core/PaymentProcessor";
import { StandardizedDebtCalculator } from "@/lib/services/calculations/StandardizedDebtCalculator";

export interface PayoffDetails {
  months: number;
  totalInterest: number;
  payoffDate: Date;
  redistributionHistory?: {
    fromDebtId: string;
    amount: number;
    month: number;
  }[];
}

export interface AmortizationEntry {
  date: Date;
  startingBalance: number;
  payment: number;
  principal: number;
  interest: number;
  endingBalance: number;
  remainingBalance: number;
}

// Calculate monthly interest for a given balance and annual rate
export const calculateMonthlyInterest = (balance: number, annualRate: number): number => {
  return InterestCalculator.calculateMonthlyInterest(balance, annualRate);
};

// Add the new utility functions
export const isDebtPayable = (debt: Debt): boolean => {
  const monthlyInterest = calculateMonthlyInterest(debt.balance, debt.interest_rate);
  return debt.minimum_payment > monthlyInterest;
};

export const getMinimumViablePayment = (debt: Debt): number => {
  const monthlyInterest = calculateMonthlyInterest(debt.balance, debt.interest_rate);
  return Math.ceil(monthlyInterest + 1);
};

// Calculate amortization schedule for a single debt
export const calculateAmortizationSchedule = (
  debt: Debt,
  monthlyPayment: number
): AmortizationEntry[] => {
  console.log('Calculating amortization schedule for:', {
    debtName: debt.name,
    initialBalance: debt.balance,
    monthlyPayment
  });

  const schedule: AmortizationEntry[] = [];
  let currentBalance = debt.balance;
  let currentDate = debt.next_payment_date ? new Date(debt.next_payment_date) : new Date();
  const monthlyRate = debt.interest_rate / 1200;

  while (currentBalance > 0.01) {
    const monthlyInterest = Number((currentBalance * monthlyRate).toFixed(2));
    const payment = Math.min(monthlyPayment, currentBalance + monthlyInterest);
    const principal = Number((payment - monthlyInterest).toFixed(2));
    const endingBalance = Math.max(0, Number((currentBalance - principal).toFixed(2)));

    schedule.push({
      date: new Date(currentDate),
      startingBalance: currentBalance,
      payment,
      principal,
      interest: monthlyInterest,
      endingBalance,
      remainingBalance: endingBalance
    });

    if (endingBalance === 0) break;
    currentBalance = endingBalance;
    currentDate = addMonths(currentDate, 1);
  }

  console.log('Amortization schedule calculated:', {
    debtName: debt.name,
    totalMonths: schedule.length,
    finalBalance: schedule[schedule.length - 1].endingBalance
  });

  return schedule;
};

// Calculate payoff details using the new StandardizedDebtCalculator
export const calculateSingleDebtPayoff = (
  debt: Debt,
  monthlyPayment: number,
  strategy: Strategy
): PayoffDetails => {
  const result = StandardizedDebtCalculator.calculateTimeline([debt], monthlyPayment, strategy);
  return {
    months: result.acceleratedMonths,
    totalInterest: result.acceleratedInterest,
    payoffDate: result.payoffDate,
    redistributionHistory: []
  };
};

// Calculate payoff details for multiple debts using the new calculator
export const calculateMultiDebtPayoff = (
  debts: Debt[],
  totalMonthlyPayment: number,
  strategy: Strategy
): { [key: string]: PayoffDetails } => {
  const result = StandardizedDebtCalculator.calculateTimeline(debts, totalMonthlyPayment, strategy);
  
  const payoffDetails: { [key: string]: PayoffDetails } = {};
  debts.forEach(debt => {
    const payment = result.monthlyPayments.find(p => p.debtId === debt.id);
    payoffDetails[debt.id] = {
      months: result.acceleratedMonths,
      totalInterest: result.acceleratedInterest,
      payoffDate: result.payoffDate,
      redistributionHistory: []
    };
  });

  return payoffDetails;
};
