import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { addMonths } from "date-fns";

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
  remainingBalance: number; // Added for compatibility
}

// Calculate monthly interest for a given balance and annual rate
export const calculateMonthlyInterest = (balance: number, annualRate: number): number => {
  const monthlyRate = annualRate / 1200;
  return Number((balance * monthlyRate).toFixed(2));
};

// Add the new utility functions
export const isDebtPayable = (debt: Debt): boolean => {
  const monthlyInterest = calculateMonthlyInterest(debt.balance, debt.interest_rate);
  return debt.minimum_payment > monthlyInterest;
};

export const getMinimumViablePayment = (debt: Debt): number => {
  const monthlyInterest = calculateMonthlyInterest(debt.balance, debt.interest_rate);
  return Math.ceil(monthlyInterest + 1); // At least $1 more than monthly interest
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
      remainingBalance: endingBalance // Added for compatibility
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

// Calculate payoff details for a single debt
export const calculateSingleDebtPayoff = (
  debt: Debt,
  monthlyPayment: number,
  strategy: Strategy
): PayoffDetails => {
  console.log('Calculating single debt payoff:', {
    debtName: debt.name,
    monthlyPayment,
    strategy: strategy.name
  });

  let totalInterest = 0;
  let months = 0;
  let currentBalance = debt.balance;
  const monthlyRate = debt.interest_rate / 1200;
  const startDate = new Date();

  while (currentBalance > 0.01 && months < 1200) {
    const monthlyInterest = calculateMonthlyInterest(currentBalance, debt.interest_rate);
    totalInterest += monthlyInterest;

    const payment = Math.min(monthlyPayment, currentBalance + monthlyInterest);
    const principal = payment - monthlyInterest;
    currentBalance = Math.max(0, currentBalance - principal);

    months++;
    if (currentBalance === 0) break;
  }

  return {
    months,
    totalInterest: Number(totalInterest.toFixed(2)),
    payoffDate: addMonths(startDate, months),
    redistributionHistory: []
  };
};

// Calculate payoff details for multiple debts
export const calculateMultiDebtPayoff = (
  debts: Debt[],
  totalMonthlyPayment: number,
  strategy: Strategy
): { [key: string]: PayoffDetails } => {
  console.log('🔄 Starting multi-debt payoff calculation:', {
    totalDebts: debts.length,
    totalMonthlyPayment,
    strategy: strategy.name
  });

  const results: { [key: string]: PayoffDetails } = {};
  const balances = new Map<string, number>();
  let remainingDebts = [...debts];
  let currentMonth = 0;
  const maxMonths = 1200;
  const startDate = new Date();
  let availableExtraPayment = 0;

  // Initialize tracking
  debts.forEach(debt => {
    results[debt.id] = {
      months: 0,
      totalInterest: 0,
      payoffDate: new Date(),
      redistributionHistory: []
    };
    balances.set(debt.id, debt.balance);
  });

  // Calculate total minimum payments
  const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  
  if (totalMonthlyPayment < totalMinimumPayments) {
    console.warn('Monthly payment insufficient for minimum payments');
    debts.forEach(debt => {
      results[debt.id].months = maxMonths;
      results[debt.id].payoffDate = addMonths(startDate, maxMonths);
    });
    return results;
  }

  while (remainingDebts.length > 0 && currentMonth < maxMonths) {
    remainingDebts = strategy.calculate([...remainingDebts]);
    let monthlyAvailable = totalMonthlyPayment + availableExtraPayment;
    availableExtraPayment = 0;

    // Process minimum payments
    for (const debt of remainingDebts) {
      const currentBalance = balances.get(debt.id) || 0;
      const minPayment = Math.min(debt.minimum_payment, currentBalance);
      
      if (monthlyAvailable >= minPayment) {
        const monthlyInterest = calculateMonthlyInterest(currentBalance, debt.interest_rate);
        results[debt.id].totalInterest += monthlyInterest;
        
        const newBalance = Math.max(0, currentBalance + monthlyInterest - minPayment);
        balances.set(debt.id, newBalance);
        monthlyAvailable -= minPayment;
      }
    }

    // Apply extra payment to highest priority debt
    if (monthlyAvailable > 0 && remainingDebts.length > 0) {
      const targetDebt = remainingDebts[0];
      const currentBalance = balances.get(targetDebt.id) || 0;
      const extraPayment = Math.min(monthlyAvailable, currentBalance);
      
      if (extraPayment > 0) {
        const newBalance = Math.max(0, currentBalance - extraPayment);
        balances.set(targetDebt.id, newBalance);
        monthlyAvailable -= extraPayment;
      }
    }

    // Check for paid off debts
    remainingDebts = remainingDebts.filter(debt => {
      const currentBalance = balances.get(debt.id) || 0;
      
      if (currentBalance <= 0.01) {
        const releasedPayment = debt.minimum_payment;
        availableExtraPayment += releasedPayment;
        
        results[debt.id].months = currentMonth + 1;
        results[debt.id].payoffDate = addMonths(startDate, currentMonth + 1);

        // Track redistribution if there are remaining debts
        if (remainingDebts.length > 1) {
          const nextDebt = remainingDebts.find(d => d.id !== debt.id);
          if (nextDebt && results[nextDebt.id].redistributionHistory) {
            results[nextDebt.id].redistributionHistory?.push({
              fromDebtId: debt.id,
              amount: releasedPayment,
              month: currentMonth + 1
            });
          }
        }
        
        return false;
      }
      return true;
    });

    currentMonth++;
  }

  // Handle debts that couldn't be paid off
  remainingDebts.forEach(debt => {
    if (results[debt.id].months === 0) {
      results[debt.id].months = maxMonths;
      results[debt.id].payoffDate = addMonths(startDate, maxMonths);
    }
  });

  return results;
};
