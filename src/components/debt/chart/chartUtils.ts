import { Debt } from "@/lib/types";
import { OneTimeFunding } from "@/hooks/use-one-time-funding";
import { calculatePayoffDetails } from "@/lib/utils/payment/paymentCalculations";
import { strategies } from "@/lib/strategies";
import { ChartData } from "./types";
import { format } from "date-fns";

export const formatMonthYear = (date: Date) => {
  return format(date, 'MMM yyyy');
};

export const formatCurrency = (value: number, currencySymbol: string) => {
  if (value >= 1000000) {
    return `${currencySymbol}${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${currencySymbol}${(value / 1000).toFixed(1)}k`;
  }
  return `${currencySymbol}${value.toFixed(0)}`;
};

const calculateLogarithmicBalance = (
  initialBalance: number,
  currentMonth: number,
  totalMonths: number
): number => {
  if (currentMonth >= totalMonths) return 0;
  if (currentMonth === 0) return initialBalance;
  
  const ratio = 1 - (Math.log(1 + currentMonth) / Math.log(totalMonths + 1));
  return Math.max(initialBalance * ratio, 0);
};

export const generateChartData = (
  debts: Debt[], 
  monthlyPayment: number,
  oneTimeFundings: OneTimeFunding[] = []
): ChartData[] => {
  if (!debts || debts.length === 0) {
    console.log('No debts provided for chart data generation');
    return [];
  }

  console.log('Generating chart data with:', {
    numberOfDebts: debts.length,
    monthlyPayment,
    oneTimeFundings: oneTimeFundings.map(f => ({
      date: f.payment_date,
      amount: f.amount
    }))
  });

  // Convert string dates to Date objects
  const formattedFundings = oneTimeFundings.map(funding => ({
    ...funding,
    payment_date: new Date(funding.payment_date)
  }));

  const payoffDetails = calculatePayoffDetails(
    debts,
    monthlyPayment,
    strategies.find(s => s.id === 'avalanche') || strategies[0],
    formattedFundings
  );

  const data: ChartData[] = [];
  const maxMonths = Math.max(...Object.values(payoffDetails).map(detail => detail.months));
  const startDate = new Date();

  for (let month = 0; month <= maxMonths; month++) {
    const currentDate = new Date(startDate);
    currentDate.setMonth(currentDate.getMonth() + month);
    
    const point: ChartData = {
      date: currentDate.toISOString(),
      monthLabel: formatMonthYear(currentDate),
      month,
      Total: 0,
      oneTimeFunding: 0
    };

    let totalBalance = 0;
    
    // Calculate balances for each debt
    debts.forEach(debt => {
      const detail = payoffDetails[debt.id];
      const initialBalance = debt.balance;
      const monthsToPayoff = detail.months;
      
      const logarithmicBalance = calculateLogarithmicBalance(
        initialBalance,
        month,
        monthsToPayoff
      );
      
      point[debt.name] = logarithmicBalance;
      totalBalance += logarithmicBalance;
    });

    point.Total = totalBalance;
    
    // Add one-time funding data if present
    const extraPayment = oneTimeFundings.find(f => {
      const fundingDate = new Date(f.payment_date);
      return fundingDate.getMonth() === currentDate.getMonth() &&
             fundingDate.getFullYear() === currentDate.getFullYear();
    });
    
    if (extraPayment) {
      point.oneTimeFunding = Number(extraPayment.amount);
    }
    
    data.push(point);
    
    if (totalBalance <= 0) break;
  }

  console.log('Chart data generated:', {
    totalPoints: data.length,
    monthsToPayoff: maxMonths,
    finalBalance: data[data.length - 1]?.Total || 0
  });

  return data;
};