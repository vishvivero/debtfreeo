
import { Debt } from "@/lib/types";
import { addMonths } from "date-fns";
import { InterestCalculator } from "@/lib/services/calculations/core/InterestCalculator";

export interface CalculationResult {
  date: Date;
  payment: number;
  principalPayment: number;
  interestPayment: number;
  remainingBalance: number;
}

/**
 * Calculate the amortization schedule for a single debt
 */
export function calculateAmortizationSchedule(
  debt: Debt,
  monthlyPayment: number
): CalculationResult[] {
  // If debt has no minimum payment, we can't calculate
  if (monthlyPayment <= 0) {
    return [];
  }

  // Check if this is a loan with interest included in the balance
  const isInterestIncluded = debt.metadata?.interest_included === true;
  const remainingMonths = debt.metadata?.remaining_months;
  
  // For loans with interest included, use the calculated principal as the starting balance
  let balance = debt.balance;
  if (isInterestIncluded && remainingMonths) {
    const calculatedPrincipal = InterestCalculator.calculatePrincipalFromTotal(
      debt.balance,
      debt.interest_rate,
      debt.minimum_payment,
      remainingMonths
    );
    
    if (calculatedPrincipal > 0) {
      balance = calculatedPrincipal;
      console.log("Using calculated principal for amortization:", balance);
    }
  }

  const results: CalculationResult[] = [];
  let currentDate = new Date();
  let currentBalance = balance;
  const monthlyInterestRate = debt.interest_rate / 1200; // Annual rate / (12 * 100)

  // Continue until the debt is fully paid
  while (currentBalance > 0) {
    // Calculate interest for this month
    const interestPayment = currentBalance * monthlyInterestRate;
    
    // Calculate payment for this month (don't pay more than remaining balance + interest)
    const payment = Math.min(monthlyPayment, currentBalance + interestPayment);
    
    // Calculate portion of payment going to principal
    const principalPayment = payment - interestPayment;
    
    // Calculate new balance
    currentBalance = Math.max(0, currentBalance - principalPayment);
    
    // Add this month's calculation to results
    results.push({
      date: currentDate,
      payment,
      principalPayment,
      interestPayment,
      remainingBalance: currentBalance,
    });
    
    // Advance to next month
    currentDate = addMonths(currentDate, 1);
    
    // If we've generated too many rows, break to prevent infinite loop
    if (results.length > 600) {
      break;
    }
  }

  return results;
}

/**
 * Calculate when a single debt will be paid off
 */
export function calculateSingleDebtPayoff(
  debt: Debt,
  monthlyPayment: number,
  strategy: any
): {
  monthsToPayoff: number;
  totalInterest: number;
  payoffDate: Date;
} {
  // If debt has no minimum payment, we can't calculate
  if (monthlyPayment <= 0) {
    return {
      monthsToPayoff: 0,
      totalInterest: 0,
      payoffDate: new Date(),
    };
  }

  // Check if this is a loan with interest included in the balance
  const isInterestIncluded = debt.metadata?.interest_included === true;
  const remainingMonths = debt.metadata?.remaining_months;
  
  // For loans with interest included, use the calculated principal as the starting balance
  let balance = debt.balance;
  if (isInterestIncluded && remainingMonths) {
    const calculatedPrincipal = InterestCalculator.calculatePrincipalFromTotal(
      debt.balance,
      debt.interest_rate,
      debt.minimum_payment,
      remainingMonths
    );
    
    if (calculatedPrincipal > 0) {
      balance = calculatedPrincipal;
      console.log("Using calculated principal for debt payoff:", balance);
    }
  }

  const monthlyInterestRate = debt.interest_rate / 1200; // Annual rate / (12 * 100)
  let currentBalance = balance;
  let months = 0;
  let totalInterest = 0;
  const payoffDate = new Date();

  // Zero interest special case
  if (debt.interest_rate === 0) {
    months = Math.ceil(currentBalance / monthlyPayment);
    payoffDate.setMonth(payoffDate.getMonth() + months);
    
    return {
      monthsToPayoff: months,
      totalInterest: 0,
      payoffDate,
    };
  }

  // For interest-bearing debts
  while (currentBalance > 0 && months < 600) {
    // Calculate interest for this month
    const interestForMonth = currentBalance * monthlyInterestRate;
    totalInterest += interestForMonth;
    
    // Calculate payment for this month (don't pay more than remaining balance + interest)
    const payment = Math.min(monthlyPayment, currentBalance + interestForMonth);
    
    // Calculate portion of payment going to principal
    const principalPayment = payment - interestForMonth;
    
    // Calculate new balance
    currentBalance = Math.max(0, currentBalance - principalPayment);
    
    months++;
  }

  // Set payoff date
  payoffDate.setMonth(payoffDate.getMonth() + months);

  return {
    monthsToPayoff: months,
    totalInterest,
    payoffDate,
  };
}

/**
 * Check if a debt can be paid off (minimum payment covers at least the interest)
 */
export function isDebtPayable(debt: Debt): boolean {
  if (debt.interest_rate === 0 || debt.minimum_payment === 0) {
    return true; // Zero interest debts are always payable
  }
  
  // Calculate monthly interest
  const monthlyInterestRate = debt.interest_rate / 1200;
  const monthlyInterest = debt.balance * monthlyInterestRate;
  
  // Debt is payable if minimum payment covers at least the monthly interest
  return debt.minimum_payment >= monthlyInterest;
}

/**
 * Calculate minimum viable payment that can make progress on a debt
 */
export function getMinimumViablePayment(debt: Debt): number {
  if (debt.interest_rate === 0) {
    return 1; // Any positive payment works for zero-interest debt
  }
  
  // Calculate monthly interest plus a small amount to make progress
  const monthlyInterestRate = debt.interest_rate / 1200;
  const monthlyInterest = debt.balance * monthlyInterestRate;
  
  // Return slightly more than the interest amount to ensure progress
  return Math.ceil(monthlyInterest * 1.1);
}
