
import { Debt } from "./types/debt";

export type { Debt };

export interface Strategy {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  calculate: (debts: Debt[]) => Debt[];
}

export const calculatePayoffTime = (debt: Debt, monthlyPayment: number): number => {
  if (monthlyPayment <= 0) return Infinity;
  
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

const avalancheStrategy: Strategy = {
  id: 'avalanche',
  name: "Avalanche Method",
  description: "Pay off debts with highest interest rate first",
  benefits: [
    "Minimizes total interest paid over time",
    "Mathematically optimal for saving money",
    "Accelerates overall debt payoff timeline"
  ],
  calculate: (debts: Debt[]) => {
    return [...debts].sort((a, b) => b.interest_rate - a.interest_rate);
  },
};

const snowballStrategy: Strategy = {
  id: 'snowball',
  name: "Snowball Method",
  description: "Pay off smallest debts first",
  benefits: [
    "Creates psychological wins by clearing debts faster",
    "Reduces number of monthly payments quicker",
    "Builds momentum and motivation"
  ],
  calculate: (debts: Debt[]) => {
    return [...debts].sort((a, b) => a.balance - b.balance);
  },
};

const balanceRatioStrategy: Strategy = {
  id: 'balance-ratio',
  name: "Balance Ratio",
  description: "Balance between interest rate and debt size",
  benefits: [
    "Optimizes between mathematical savings and psychological wins",
    "Prioritizes high-interest small debts for quick impact",
    "Balanced approach for most people's situations"
  ],
  calculate: (debts: Debt[]) => {
    return [...debts].sort((a, b) => {
      const ratioA = a.interest_rate / a.balance;
      const ratioB = b.interest_rate / b.balance;
      return ratioB - ratioA;
    });
  },
};

export const strategies: Strategy[] = [
  avalancheStrategy,
  snowballStrategy,
  balanceRatioStrategy,
];
