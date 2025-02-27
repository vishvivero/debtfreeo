
import { Debt } from "../types/debt";

interface PayoffDetails {
  months: number;
  totalInterest: number;
  proposedPayment: number;
  payoffDate: Date;
}

export const calculatePayoffDetails = (
  debts: Debt[],
  monthlyPayment: number
): { [key: string]: PayoffDetails } => {
  console.log('Starting payoff calculation with:', {
    totalDebts: debts.length,
    monthlyPayment
  });

  const results: { [key: string]: PayoffDetails } = {};
  let remainingDebts = [...debts];
  let currentMonth = 0;
  const maxMonths = 1200; // 100 years cap
  
  // Initialize balances and results
  const balances = new Map<string, number>();
  debts.forEach(debt => {
    balances.set(debt.id, debt.balance);
    
    // For zero-interest debts, calculate direct months to pay off
    if (debt.interest_rate === 0 && debt.minimum_payment > 0) {
      const monthsToPayoff = Math.ceil(debt.balance / debt.minimum_payment);
      const payoffDate = new Date();
      payoffDate.setMonth(payoffDate.getMonth() + monthsToPayoff);
      
      results[debt.id] = {
        months: monthsToPayoff,
        totalInterest: 0,
        proposedPayment: debt.minimum_payment,
        payoffDate: payoffDate
      };
    } else {
      // Initialize with default values for debts with interest
      results[debt.id] = {
        months: 0,
        totalInterest: 0,
        proposedPayment: debt.minimum_payment,
        payoffDate: new Date()
      };
    }
  });

  // Filter out zero-interest debts that we've already calculated
  remainingDebts = remainingDebts.filter(debt => !(debt.interest_rate === 0 && debt.minimum_payment > 0));
  
  // Continue until all debts are paid or we hit the cap
  while (remainingDebts.length > 0 && currentMonth < maxMonths) {
    let availablePayment = monthlyPayment;
    
    // First, allocate minimum payments
    remainingDebts.forEach(debt => {
      const minPayment = Math.min(debt.minimum_payment, balances.get(debt.id) || 0);
      if (availablePayment >= minPayment) {
        availablePayment -= minPayment;
        results[debt.id].proposedPayment = minPayment;
      }
    });

    // Then, allocate extra payment to the first debt
    if (availablePayment > 0 && remainingDebts.length > 0) {
      const firstDebt = remainingDebts[0];
      results[firstDebt.id].proposedPayment += availablePayment;
    }

    // Process payments and update balances
    remainingDebts = remainingDebts.filter(debt => {
      const currentBalance = balances.get(debt.id) || 0;
      const monthlyRate = debt.interest_rate / 1200;
      const payment = results[debt.id].proposedPayment;
      
      const monthlyInterest = currentBalance * monthlyRate;
      results[debt.id].totalInterest += monthlyInterest;
      
      const newBalance = currentBalance + monthlyInterest - payment;
      balances.set(debt.id, Math.max(0, newBalance));

      // If debt is paid off, calculate its final details
      if (newBalance <= 0) {
        const payoffDate = new Date();
        payoffDate.setMonth(payoffDate.getMonth() + currentMonth + 1);
        results[debt.id].months = currentMonth + 1;
        results[debt.id].payoffDate = payoffDate;
        return false; // Remove from remaining debts
      }
      return true;
    });

    currentMonth++;
  }

  console.log('Payoff calculation results:', results);
  return results;
};
