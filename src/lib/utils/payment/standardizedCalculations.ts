
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { addMonths, differenceInMonths } from "date-fns";
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
  isOneTimePayment?: boolean;
}

export const validateGoldLoan = (debt: Debt): boolean => {
  if (!debt.is_gold_loan) return true;
  
  const isValid = 
    debt.loan_term_months !== undefined &&
    debt.loan_term_months > 0 &&
    debt.final_payment_date !== undefined;

  console.log('Validating gold loan:', {
    debtName: debt.name,
    isValid,
    termMonths: debt.loan_term_months,
    finalDate: debt.final_payment_date
  });

  return isValid;
};

export const calculateGoldLoanSchedule = (
  debt: Debt,
  monthlyPayment: number,
  oneTimeFundings: { date: Date; amount: number }[] = []
): AmortizationEntry[] => {
  if (!debt.is_gold_loan || !validateGoldLoan(debt)) {
    throw new Error(`Invalid gold loan configuration for debt: ${debt.name}`);
  }

  const schedule: AmortizationEntry[] = [];
  let currentDate = debt.next_payment_date ? new Date(debt.next_payment_date) : new Date();
  let currentBalance = debt.balance;
  const maturityDate = new Date(debt.final_payment_date!);

  console.log('Starting gold loan schedule calculation:', {
    debtName: debt.name,
    initialBalance: currentBalance,
    monthlyPayment,
    oneTimeFundings: oneTimeFundings.length
  });

  while (currentDate <= maturityDate) {
    const monthlyInterest = (currentBalance * debt.interest_rate) / 100 / 12;
    const isMaturityMonth = currentDate.getMonth() === maturityDate.getMonth() &&
                           currentDate.getFullYear() === maturityDate.getFullYear();

    // Check for one-time payments in this month
    const oneTimePayment = oneTimeFundings.find(funding => 
      funding.date.getMonth() === currentDate.getMonth() &&
      funding.date.getFullYear() === currentDate.getFullYear()
    );

    let payment = isMaturityMonth ? currentBalance + monthlyInterest : monthlyInterest;
    let principal = isMaturityMonth ? currentBalance : 0;
    let endingBalance = currentBalance;

    // Apply one-time payment if available
    if (oneTimePayment) {
      const extraPrincipalPayment = Math.min(oneTimePayment.amount, currentBalance);
      principal += extraPrincipalPayment;
      payment += extraPrincipalPayment;
      endingBalance = Math.max(0, currentBalance - extraPrincipalPayment);

      console.log('Applying one-time payment to gold loan:', {
        debtName: debt.name,
        date: currentDate,
        amount: extraPrincipalPayment,
        newBalance: endingBalance
      });
    }

    const entry: AmortizationEntry = {
      date: new Date(currentDate),
      startingBalance: currentBalance,
      payment,
      principal,
      interest: monthlyInterest,
      endingBalance,
      remainingBalance: endingBalance,
      isOneTimePayment: !!oneTimePayment
    };

    schedule.push(entry);
    currentBalance = endingBalance;
    
    if (currentBalance === 0) {
      console.log('Gold loan paid off early:', {
        debtName: debt.name,
        finalPaymentDate: currentDate
      });
      break;
    }

    currentDate = addMonths(currentDate, 1);
  }

  return schedule;
};

export const calculateMonthlyInterest = (balance: number, annualRate: number): number => {
  return InterestCalculator.calculateMonthlyInterest(balance, annualRate);
};

export const isDebtPayable = (debt: Debt): boolean => {
  if (debt.is_gold_loan) return true; // Gold loans are always payable as they're interest-only
  const monthlyInterest = calculateMonthlyInterest(debt.balance, debt.interest_rate);
  return debt.minimum_payment > monthlyInterest;
};

export const getMinimumViablePayment = (debt: Debt): number => {
  if (debt.is_gold_loan) {
    return calculateMonthlyInterest(debt.balance, debt.interest_rate);
  }
  const monthlyInterest = calculateMonthlyInterest(debt.balance, debt.interest_rate);
  return Math.ceil(monthlyInterest + 1);
};

export const calculateAmortizationSchedule = (
  debt: Debt,
  monthlyPayment: number,
  oneTimeFundings: { date: Date; amount: number }[] = []
): AmortizationEntry[] => {
  console.log('Calculating amortization schedule for:', {
    debtName: debt.name,
    initialBalance: debt.balance,
    monthlyPayment,
    oneTimeFundings: oneTimeFundings.length
  });

  if (debt.is_gold_loan) {
    return calculateGoldLoanSchedule(debt, monthlyPayment, oneTimeFundings);
  }

  const schedule: AmortizationEntry[] = [];
  let currentBalance = debt.balance;
  let currentDate = debt.next_payment_date ? new Date(debt.next_payment_date) : new Date();
  const monthlyRate = debt.interest_rate / 1200;

  while (currentBalance > 0.01) {
    const monthlyInterest = Number((currentBalance * monthlyRate).toFixed(2));
    
    // Check for one-time payments
    const oneTimePayment = oneTimeFundings.find(funding => 
      funding.date.getMonth() === currentDate.getMonth() &&
      funding.date.getFullYear() === currentDate.getFullYear()
    );

    let payment = Math.min(monthlyPayment, currentBalance + monthlyInterest);
    if (oneTimePayment) {
      payment += oneTimePayment.amount;
    }

    const principal = Number((payment - monthlyInterest).toFixed(2));
    const endingBalance = Math.max(0, Number((currentBalance - principal).toFixed(2)));

    schedule.push({
      date: new Date(currentDate),
      startingBalance: currentBalance,
      payment,
      principal,
      interest: monthlyInterest,
      endingBalance,
      remainingBalance: endingBalance,
      isOneTimePayment: !!oneTimePayment
    });

    if (endingBalance === 0) break;
    currentBalance = endingBalance;
    currentDate = addMonths(currentDate, 1);
  }

  return schedule;
};

export const calculateSingleDebtPayoff = (
  debt: Debt,
  monthlyPayment: number,
  strategy: Strategy,
  oneTimeFundings: { date: Date; amount: number }[] = []
): PayoffDetails => {
  console.log('Calculating single debt payoff:', {
    debtName: debt.name,
    isGoldLoan: debt.is_gold_loan,
    monthlyPayment,
    oneTimeFundings: oneTimeFundings.length
  });

  if (debt.is_gold_loan && debt.final_payment_date) {
    const schedule = calculateGoldLoanSchedule(debt, monthlyPayment, oneTimeFundings);
    const lastEntry = schedule[schedule.length - 1];
    const totalInterest = schedule.reduce((sum, entry) => sum + entry.interest, 0);

    return {
      months: schedule.length,
      totalInterest,
      payoffDate: lastEntry.date,
      redistributionHistory: []
    };
  }

  const result = StandardizedDebtCalculator.calculateTimeline(
    [debt], 
    monthlyPayment, 
    strategy, 
    oneTimeFundings.map(f => ({ amount: f.amount, payment_date: f.date }))
  );

  return {
    months: result.acceleratedMonths,
    totalInterest: result.acceleratedInterest,
    payoffDate: result.payoffDate,
    redistributionHistory: []
  };
};

export const calculateMultiDebtPayoff = (
  debts: Debt[],
  totalMonthlyPayment: number,
  strategy: Strategy,
  oneTimeFundings: { date: Date; amount: number }[] = []
): { [key: string]: PayoffDetails } => {
  console.log('Calculating multi-debt payoff:', {
    totalDebts: debts.length,
    goldLoans: debts.filter(d => d.is_gold_loan).length,
    totalMonthlyPayment,
    oneTimeFundings: oneTimeFundings.length
  });

  const payoffDetails: { [key: string]: PayoffDetails } = {};

  const goldLoans = debts.filter(d => d.is_gold_loan);
  const regularLoans = debts.filter(d => !d.is_gold_loan);

  // Handle gold loans first
  goldLoans.forEach(debt => {
    payoffDetails[debt.id] = calculateSingleDebtPayoff(
      debt, 
      debt.minimum_payment, 
      strategy,
      oneTimeFundings
    );
  });

  // Calculate remaining payment for regular loans
  const goldLoanPayments = goldLoans.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  const remainingPayment = totalMonthlyPayment - goldLoanPayments;

  if (regularLoans.length > 0) {
    const result = StandardizedDebtCalculator.calculateTimeline(
      regularLoans, 
      remainingPayment, 
      strategy,
      oneTimeFundings.map(f => ({ amount: f.amount, payment_date: f.date }))
    );
    
    regularLoans.forEach(debt => {
      payoffDetails[debt.id] = {
        months: result.acceleratedMonths,
        totalInterest: result.acceleratedInterest,
        payoffDate: result.payoffDate,
        redistributionHistory: []
      };
    });
  }

  return payoffDetails;
};
