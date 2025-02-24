import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { addMonths, differenceInMonths } from "date-fns";
import { InterestCalculator } from "@/lib/services/calculations/core/InterestCalculator";
import { PaymentProcessor } from "@/lib/services/calculations/core/PaymentProcessor";
import { StandardizedDebtCalculator } from "@/lib/services/calculations/StandardizedDebtCalculator";
import { OneTimeFunding } from "@/lib/types/payment";

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

const convertToOneTimeFunding = (
  funding: { date: Date; amount: number },
  userId: string,
  currencySymbol: string
): OneTimeFunding => ({
  id: `temp-${Date.now()}-${Math.random()}`,
  user_id: userId,
  amount: funding.amount,
  payment_date: funding.date.toISOString(),
  notes: null,
  is_applied: false,
  currency_symbol: currencySymbol
});

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

    const oneTimePayment = oneTimeFundings.find(funding => 
      funding.date.getMonth() === currentDate.getMonth() &&
      funding.date.getFullYear() === currentDate.getFullYear()
    );

    let payment = isMaturityMonth ? currentBalance + monthlyInterest : monthlyInterest;
    let principal = isMaturityMonth ? currentBalance : 0;
    let endingBalance = currentBalance;

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

  const formattedFundings: OneTimeFunding[] = oneTimeFundings.map(funding =>
    convertToOneTimeFunding(funding, debt.user_id, debt.currency_symbol)
  );

  const result = StandardizedDebtCalculator.calculateTimeline(
    [debt], 
    monthlyPayment, 
    strategy,
    formattedFundings
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

  const referenceDebt = debts[0];
  
  const formattedFundings: OneTimeFunding[] = oneTimeFundings.map(funding =>
    convertToOneTimeFunding(
      funding,
      referenceDebt.user_id,
      referenceDebt.currency_symbol
    )
  );

  goldLoans.forEach(debt => {
    payoffDetails[debt.id] = calculateSingleDebtPayoff(
      debt, 
      debt.minimum_payment, 
      strategy,
      oneTimeFundings
    );
  });

  const goldLoanPayments = goldLoans.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  const remainingPayment = totalMonthlyPayment - goldLoanPayments;

  if (regularLoans.length > 0) {
    const result = StandardizedDebtCalculator.calculateTimeline(
      regularLoans, 
      remainingPayment, 
      strategy,
      formattedFundings
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
