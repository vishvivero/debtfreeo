
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { addMonths } from "date-fns";
import { InterestCalculator } from "@/lib/services/calculations/core/InterestCalculator";

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
  // For zero interest debt, it's payable if there's any minimum payment
  if (debt.interest_rate === 0) {
    return debt.minimum_payment > 0;
  }
  
  const monthlyInterest = calculateMonthlyInterest(debt.balance, debt.interest_rate);
  return debt.minimum_payment > monthlyInterest;
};

export const getMinimumViablePayment = (debt: Debt): number => {
  // For zero interest debt, any positive payment will work
  if (debt.interest_rate === 0) {
    return Math.max(debt.minimum_payment, 1);
  }
  
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
    monthlyPayment,
    interestRate: debt.interest_rate,
    metadata: debt.metadata
  });

  const schedule: AmortizationEntry[] = [];
  
  // Check if this is a debt with interest included
  const isInterestIncluded = debt.metadata?.interest_included === true;
  const remainingMonths = debt.metadata?.remaining_months || 0;
  const originalRate = debt.metadata?.original_rate || debt.interest_rate;
  
  let effectiveBalance = debt.balance;
  let effectiveRate = debt.interest_rate;
  
  // If interest is included, use the back-calculated principal
  if (isInterestIncluded && remainingMonths > 0) {
    effectiveBalance = InterestCalculator.calculatePrincipalFromTotal(
      debt.balance,
      originalRate,
      debt.minimum_payment,
      remainingMonths
    );
    
    // Keep using the original interest rate
    effectiveRate = originalRate;
    
    console.log('Back-calculated values for included-interest debt:', {
      totalOutstanding: debt.balance,
      calculatedPrincipal: effectiveBalance,
      effectiveRate,
      remainingMonths
    });
  }
  
  let currentBalance = effectiveBalance;
  let currentDate = debt.next_payment_date ? new Date(debt.next_payment_date) : new Date();
  const monthlyRate = effectiveRate / 1200;
  
  // For zero interest loans, calculate based on simple division
  if (effectiveRate === 0) {
    const payment = Math.min(monthlyPayment, currentBalance);
    const totalMonths = Math.ceil(currentBalance / payment);
    
    for (let month = 0; month < totalMonths; month++) {
      const remainingPayment = Math.min(payment, currentBalance);
      const newBalance = Math.max(0, currentBalance - remainingPayment);
      
      schedule.push({
        date: new Date(currentDate),
        startingBalance: currentBalance,
        payment: remainingPayment,
        principal: remainingPayment,
        interest: 0,
        endingBalance: newBalance,
        remainingBalance: newBalance
      });
      
      if (newBalance === 0) break;
      currentBalance = newBalance;
      currentDate = addMonths(currentDate, 1);
    }
    
    return schedule;
  }

  // For interest-bearing loans
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
    finalBalance: schedule[schedule.length - 1].endingBalance,
    isInterestIncluded,
    effectiveRate
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
    strategy: strategy.name,
    isZeroInterest: debt.interest_rate === 0,
    isInterestIncluded: debt.metadata?.interest_included === true
  });

  // Handle interest included case
  if (debt.metadata?.interest_included === true && debt.metadata?.remaining_months) {
    const originalRate = debt.metadata.original_rate || debt.interest_rate;
    const originalPrincipal = InterestCalculator.calculatePrincipalFromTotal(
      debt.balance,
      originalRate,
      debt.minimum_payment,
      debt.metadata.remaining_months
    );

    return {
      months: debt.metadata.remaining_months,
      totalInterest: debt.balance - originalPrincipal,
      payoffDate: addMonths(new Date(), debt.metadata.remaining_months),
      redistributionHistory: []
    };
  }

  // For zero interest loans, use simple division
  if (debt.interest_rate === 0) {
    const payment = Math.max(monthlyPayment, 1); // Avoid division by zero
    const months = Math.ceil(debt.balance / payment);
    const payoffDate = addMonths(new Date(), months);
    
    return {
      months,
      totalInterest: 0,
      payoffDate,
      redistributionHistory: []
    };
  }

  // For interest-bearing loans
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
    strategy: strategy.name,
    zeroInterestDebts: debts.filter(d => d.interest_rate === 0).length
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
    // Handle interest-included debts
    if (debt.metadata?.interest_included === true && debt.metadata?.remaining_months) {
      const originalRate = debt.metadata.original_rate || debt.interest_rate;
      const originalPrincipal = InterestCalculator.calculatePrincipalFromTotal(
        debt.balance,
        originalRate,
        debt.minimum_payment,
        debt.metadata.remaining_months
      );

      results[debt.id] = {
        months: debt.metadata.remaining_months,
        totalInterest: debt.balance - originalPrincipal,
        payoffDate: addMonths(new Date(), debt.metadata.remaining_months),
        redistributionHistory: []
      };
      // We might need to adjust the balance for calculations, but for now we'll use the full balance
      balances.set(debt.id, debt.balance);
    }
    // Handle zero-interest debts with special calculation
    else if (debt.interest_rate === 0) {
      const payment = Math.max(debt.minimum_payment, 1); // Avoid division by zero
      const months = Math.ceil(debt.balance / payment);
      const payoffDate = addMonths(new Date(), months);
      
      results[debt.id] = {
        months: months,
        totalInterest: 0,
        payoffDate: payoffDate,
        redistributionHistory: []
      };
      balances.set(debt.id, debt.balance);
    }
    else {
      results[debt.id] = {
        months: 0,
        totalInterest: 0,
        payoffDate: new Date(),
        redistributionHistory: []
      };
      balances.set(debt.id, debt.balance);
    }
  });

  // Filter out debts with interest already included from the main calculation
  remainingDebts = remainingDebts.filter(debt => 
    !(debt.metadata?.interest_included === true && debt.metadata?.remaining_months)
  );

  // Also filter out zero-interest debts from the main calculation
  remainingDebts = remainingDebts.filter(debt => debt.interest_rate !== 0);

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

  console.log('Multi-debt payoff calculation complete:', {
    totalCalculatedMonths: currentMonth,
    remainingDebtsCount: remainingDebts.length,
    zeroInterestResults: Object.entries(results)
      .filter(([id, _]) => debts.find(d => d.id === id)?.interest_rate === 0)
      .map(([id, detail]) => ({
        debtId: id,
        debtName: debts.find(d => d.id === id)?.name,
        months: detail.months
      }))
  });

  return results;
};
