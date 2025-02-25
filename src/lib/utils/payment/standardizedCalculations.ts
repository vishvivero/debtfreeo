
import { addMonths } from "date-fns";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";

export interface AmortizationEntry {
  date: Date;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

const MAX_SCHEDULE_LENGTH = 360; // 30 years maximum

export const calculateAmortizationSchedule = (debt: Debt, monthlyPayment: number): AmortizationEntry[] => {
  console.log('Starting amortization calculation for:', {
    debtName: debt.name,
    balance: debt.balance,
    monthlyPayment
  });

  if (!debt || !monthlyPayment || monthlyPayment <= 0) {
    console.error('Invalid inputs for amortization calculation');
    return [];
  }

  const schedule: AmortizationEntry[] = [];
  let balance = debt.balance;
  let currentDate = debt.next_payment_date ? new Date(debt.next_payment_date) : new Date();
  const monthlyRate = debt.interest_rate / 1200; // Convert annual rate to monthly decimal

  while (balance > 0.01 && schedule.length < MAX_SCHEDULE_LENGTH) {
    const monthlyInterest = balance * monthlyRate;
    const principalPayment = Math.min(monthlyPayment - monthlyInterest, balance);
    balance = Math.max(0, balance - principalPayment);

    schedule.push({
      date: new Date(currentDate),
      payment: monthlyPayment,
      principal: principalPayment,
      interest: monthlyInterest,
      remainingBalance: balance
    });

    currentDate = addMonths(currentDate, 1);
  }

  console.log('Amortization schedule calculated:', {
    totalPayments: schedule.length,
    finalBalance: schedule[schedule.length - 1].remainingBalance
  });

  return schedule;
};

export const calculateSingleDebtPayoff = (
  debt: Debt, 
  monthlyPayment: number, 
  strategy: Strategy
) => {
  console.log('Calculating single debt payoff:', {
    debtName: debt.name,
    monthlyPayment,
    strategy: strategy.name
  });

  if (!debt || !monthlyPayment || monthlyPayment <= 0) {
    console.error('Invalid inputs for payoff calculation');
    return {
      months: 0,
      payoffDate: new Date()
    };
  }

  const schedule = calculateAmortizationSchedule(debt, monthlyPayment);
  const months = Math.min(schedule.length, MAX_SCHEDULE_LENGTH);
  const payoffDate = addMonths(new Date(), months);

  return {
    months,
    payoffDate
  };
};

export const isDebtPayable = (debt: Debt): boolean => {
  const monthlyInterest = (debt.balance * debt.interest_rate) / 1200;
  return debt.minimum_payment > monthlyInterest;
};

export const getMinimumViablePayment = (debt: Debt): number => {
  const monthlyInterest = (debt.balance * debt.interest_rate) / 1200;
  return Math.ceil(monthlyInterest * 100) / 100 + 0.01;
};
