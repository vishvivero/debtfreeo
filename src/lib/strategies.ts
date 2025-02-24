
import { Debt } from "./types/debt";

export type { Debt };

export interface Strategy {
  id: string;
  name: string;
  description: string;
  calculate: (debts: Debt[]) => Debt[];
}

export const calculatePayoffTime = (debt: Debt, monthlyPayment: number): number => {
  if (monthlyPayment <= 0) return Infinity;
  
  // For gold loans, return the months until maturity
  if (debt.is_gold_loan && debt.final_payment_date) {
    const today = new Date();
    const maturityDate = new Date(debt.final_payment_date);
    const monthsDiff = (maturityDate.getFullYear() - today.getFullYear()) * 12 + 
                      (maturityDate.getMonth() - today.getMonth());
    return Math.max(0, monthsDiff);
  }
  
  let balance = debt.balance;
  let months = 0;
  const monthlyInterestRate = debt.interest_rate / 1200;
  const EPSILON = 0.01;

  while (balance > EPSILON && months < 1200) {
    const monthlyInterest = Number((balance * monthlyInterestRate).toFixed(2));
    
    if (monthlyPayment <= monthlyInterest) {
      console.log(`Payment ${monthlyPayment} cannot cover monthly interest ${monthlyInterest} for ${debt.name}`);
      return Infinity;
    }

    const principalPayment = Math.min(monthlyPayment - monthlyInterest, balance);
    balance = Number((Math.max(0, balance - principalPayment)).toFixed(2));
    months++;

    if (balance <= EPSILON) {
      break;
    }
  }

  return months >= 1200 ? Infinity : months;
};

export const formatCurrency = (amount: number, currencySymbol: string = '£') => {
  return `${currencySymbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const separateGoldLoans = (debts: Debt[]): { goldLoans: Debt[]; regularLoans: Debt[] } => {
  const goldLoans = debts.filter(debt => debt.is_gold_loan);
  const regularLoans = debts.filter(debt => !debt.is_gold_loan);
  return { goldLoans, regularLoans };
};

const avalancheStrategy: Strategy = {
  id: 'avalanche',
  name: "Avalanche Method",
  description: "Pay off debts with highest interest rate first",
  calculate: (debts: Debt[]) => {
    const { goldLoans, regularLoans } = separateGoldLoans(debts);
    
    // Sort gold loans by interest rate (higher first)
    const sortedGoldLoans = [...goldLoans].sort((a, b) => b.interest_rate - a.interest_rate);
    
    // Sort regular loans by interest rate
    const sortedRegularLoans = [...regularLoans].sort((a, b) => b.interest_rate - a.interest_rate);
    
    // Combine the sorted arrays with gold loans first
    return [...sortedGoldLoans, ...sortedRegularLoans];
  },
};

const snowballStrategy: Strategy = {
  id: 'snowball',
  name: "Snowball Method",
  description: "Pay off smallest debts first",
  calculate: (debts: Debt[]) => {
    const { goldLoans, regularLoans } = separateGoldLoans(debts);
    
    // Sort gold loans by balance (smaller first)
    const sortedGoldLoans = [...goldLoans].sort((a, b) => a.balance - b.balance);
    
    // Sort regular loans by balance
    const sortedRegularLoans = [...regularLoans].sort((a, b) => a.balance - b.balance);
    
    // Combine the sorted arrays with gold loans first
    return [...sortedGoldLoans, ...sortedRegularLoans];
  },
};

const balanceRatioStrategy: Strategy = {
  id: 'balance-ratio',
  name: "Balance Ratio",
  description: "Balance between interest rate and debt size",
  calculate: (debts: Debt[]) => {
    const { goldLoans, regularLoans } = separateGoldLoans(debts);
    
    // For gold loans, prioritize by a combination of interest rate and remaining term
    const sortedGoldLoans = [...goldLoans].sort((a, b) => {
      const aRatio = a.interest_rate * (a.balance / a.minimum_payment);
      const bRatio = b.interest_rate * (b.balance / b.minimum_payment);
      return bRatio - aRatio;
    });
    
    // For regular loans, use the standard balance ratio calculation
    const sortedRegularLoans = [...regularLoans].sort((a, b) => {
      const ratioA = a.interest_rate / a.balance;
      const ratioB = b.interest_rate / b.balance;
      return ratioB - ratioA;
    });
    
    // Combine the sorted arrays with gold loans first
    return [...sortedGoldLoans, ...sortedRegularLoans];
  },
};

export const strategies: Strategy[] = [
  avalancheStrategy,
  snowballStrategy,
  balanceRatioStrategy,
];
