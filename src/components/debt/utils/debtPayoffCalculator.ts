
import { Debt } from "@/lib/types/debt";
import { InterestCalculator } from "@/lib/services/calculations/core/InterestCalculator";

/**
 * Calculates details about debt payoff including months to payoff, 
 * formatted time string, and progress percentage
 */
export const calculatePayoffDetails = (
  debt: Debt, 
  totalPaid: number
): { 
  months: number; 
  formattedTime: string; 
  progressPercentage: number 
} => {
  console.log('Calculating payoff details for debt:', {
    name: debt.name,
    balance: debt.balance,
    rate: debt.interest_rate,
    payment: debt.minimum_payment,
    totalPaid,
    metadata: debt.metadata
  });

  // Check if this is a debt with interest already included
  const isInterestIncluded = debt.metadata?.interest_included === true;
  
  let months = 0;
  let effectiveBalance = debt.balance;

  if (isInterestIncluded) {
    // For loans with interest included, simply divide total by monthly payment
    months = Math.ceil(debt.balance / debt.minimum_payment);
    console.log('Interest included calculation:', {
      totalBalance: debt.balance,
      monthlyPayment: debt.minimum_payment,
      months
    });
  } else if (debt.interest_rate === 0) {
    // For zero-interest debts, use simple division
    if (debt.minimum_payment <= 0) {
      console.log('Zero interest debt with no minimum payment');
      return { months: 0, formattedTime: "Never", progressPercentage: 0 };
    }
    
    months = Math.ceil(debt.balance / debt.minimum_payment);
    
    console.log('Zero interest calculation:', {
      balance: debt.balance,
      payment: debt.minimum_payment,
      months
    });
  } else {
    // For standard interest-bearing debts, use the compound interest formula
    const monthlyRate = debt.interest_rate / 1200;
    const monthlyPayment = debt.minimum_payment;
    
    // If payment is too low to cover interest, debt can't be paid off
    const monthlyInterestAmount = debt.balance * monthlyRate;
    if (monthlyPayment <= monthlyInterestAmount) {
      console.log('Payment cannot cover interest:', {
        payment: monthlyPayment,
        monthlyInterest: monthlyInterestAmount
      });
      return { months: 0, formattedTime: "Never", progressPercentage: 0 };
    }

    // Calculate using the standard formula for number of payments
    months = Math.ceil(
      Math.log(monthlyPayment / (monthlyPayment - debt.balance * monthlyRate)) / 
      Math.log(1 + monthlyRate)
    );
    
    console.log('Interest-bearing calculation:', {
      balance: debt.balance,
      payment: monthlyPayment,
      monthlyRate,
      months
    });
  }

  // For progress calculation, use the appropriate balance
  if (isInterestIncluded) {
    // For loans with interest included, use the calculated principal for progress
    const calculatedPrincipal = InterestCalculator.calculatePrincipalFromTotal(
      debt.balance,
      debt.interest_rate,
      debt.minimum_payment,
      months
    );
    effectiveBalance = calculatedPrincipal > 0 ? calculatedPrincipal : debt.balance;
  }

  // Calculate progress percentage
  const originalBalance = effectiveBalance + totalPaid;
  const progressPercentage = originalBalance > 0 ? (totalPaid / originalBalance) * 100 : 0;
  
  console.log('Progress calculation:', {
    originalBalance,
    currentBalance: effectiveBalance,
    totalPaid,
    months,
    progressPercentage
  });
  
  // Format the time string
  const years = Math.floor(months / 12);
  const remainingMonths = Math.ceil(months % 12);
  
  let formattedTime = "";
  if (years === 0) {
    formattedTime = `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  } else {
    formattedTime = `${years} year${years !== 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }

  return { 
    months, 
    formattedTime, 
    progressPercentage: Number(progressPercentage.toFixed(1))
  };
};

/**
 * Calculates the principal amount from a debt with pre-included interest
 */
export const calculatePrincipal = (debt: Debt): number | null => {
  if (debt.metadata?.interest_included) {
    // Calculate remaining months if not already provided
    const remainingMonths = debt.metadata.remaining_months || 
      Math.ceil(debt.balance / debt.minimum_payment);
      
    return InterestCalculator.calculatePrincipalFromTotal(
      debt.balance,
      debt.interest_rate,
      debt.minimum_payment,
      remainingMonths
    );
  }
  return null;
};
