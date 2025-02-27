
import { Debt } from "@/lib/types";
import { OneTimeFunding } from "@/hooks/use-one-time-funding";
import { format, addMonths, parseISO } from "date-fns";
import { Strategy } from "@/lib/strategies";

export interface TimelineData {
  date: string;
  monthLabel: string;
  month: number;
  baselineBalance: number;
  acceleratedBalance: number;
  baselineInterest: number;
  acceleratedInterest: number;
  oneTimePayment?: number;
  currencySymbol: string;
  paymentDetails?: {
    hasOneTimePayment: boolean;
    oneTimeAmount: number;
    regularPaymentAmount: number;
  };
}

// Flag to enable/disable detailed logging
const ENABLE_DETAILED_LOGGING = true;

export const calculateTimelineData = (
  debts: Debt[],
  totalMonthlyPayment: number,
  strategy: Strategy,
  oneTimeFundings: OneTimeFunding[] = []
): TimelineData[] => {
  console.log('Calculating timeline data:', {
    totalDebts: debts.length,
    totalMonthlyPayment,
    strategy: strategy.name,
    oneTimeFundings: oneTimeFundings.length,
    fundingDates: oneTimeFundings.map(f => f.payment_date)
  });

  const data: TimelineData[] = [];
  const balances = new Map<string, number>();
  const acceleratedBalances = new Map<string, number>();
  const startDate = new Date();
  let totalBaselineInterest = 0;
  let totalAcceleratedInterest = 0;
  
  // Initialize balances
  debts.forEach(debt => {
    balances.set(debt.id, debt.balance);
    acceleratedBalances.set(debt.id, debt.balance);
  });

  const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  let month = 0;
  const maxMonths = 360; // 30 years cap

  if (ENABLE_DETAILED_LOGGING) {
    console.log('[TIMELINE DEBUG] Starting calculation with initial balances:', {
      baseline: Array.from(balances.entries()).map(([id, balance]) => ({
        id,
        balance
      })),
      accelerated: Array.from(acceleratedBalances.entries()).map(([id, balance]) => ({
        id,
        balance
      })),
      totalMinimumPayment,
      totalMonthlyPayment
    });

    console.log('[TIMELINE DEBUG] One-time fundings to process:', oneTimeFundings.map(funding => ({
      date: funding.payment_date,
      amount: funding.amount,
      parsedDate: new Date(String(funding.payment_date))
    })));
  }

  while (month < maxMonths) {
    const currentDate = addMonths(startDate, month);
    const currentDateStr = currentDate.toISOString();
    
    // Find any one-time fundings for this month
    const monthlyFundings = oneTimeFundings.filter(funding => {
      try {
        const fundingDate = typeof funding.payment_date === 'string' 
          ? new Date(funding.payment_date) 
          : new Date(String(funding.payment_date)); // Convert to string first
          
        const isSameMonth = fundingDate.getMonth() === currentDate.getMonth() &&
              fundingDate.getFullYear() === currentDate.getFullYear();
        
        if (ENABLE_DETAILED_LOGGING && isSameMonth) {
          console.log(`[TIMELINE DEBUG] Found one-time funding for month ${format(currentDate, 'MMM yyyy')}:`, {
            fundingDate: format(fundingDate, 'yyyy-MM-dd'),
            amount: funding.amount,
            notes: funding.notes
          });
        }
        
        return isSameMonth;
      } catch (error) {
        console.error('Error comparing funding date:', error);
        return false;
      }
    });
    
    const oneTimeFundingAmount = monthlyFundings.reduce((sum, funding) => sum + Number(funding.amount), 0);

    if (ENABLE_DETAILED_LOGGING && oneTimeFundingAmount > 0) {
      console.log(`[TIMELINE DEBUG] Month ${month} (${format(currentDate, 'MMM yyyy')}) has one-time funding of ${oneTimeFundingAmount}`);
    }

    // Calculate baseline scenario
    let totalBaselineBalance = 0;
    let monthlyBaselineInterest = 0;
    let remainingBaselinePayment = totalMinimumPayment;

    debts.forEach(debt => {
      const baselineBalance = balances.get(debt.id) || 0;
      if (baselineBalance > 0) {
        const monthlyRate = debt.interest_rate / 1200;
        const baselineInterest = baselineBalance * monthlyRate;
        monthlyBaselineInterest += baselineInterest;
        const payment = Math.min(remainingBaselinePayment, debt.minimum_payment);
        const newBaselineBalance = Math.max(0, baselineBalance + baselineInterest - payment);
        
        remainingBaselinePayment = Math.max(0, remainingBaselinePayment - payment);
        balances.set(debt.id, newBaselineBalance);
        totalBaselineBalance += newBaselineBalance;
      }
    });

    totalBaselineInterest += monthlyBaselineInterest;

    // Calculate accelerated scenario
    let totalAcceleratedBalance = 0;
    let monthlyAcceleratedInterest = 0;
    let remainingAcceleratedPayment = totalMonthlyPayment;
    let oneTimePaymentApplied = 0;

    if (ENABLE_DETAILED_LOGGING && oneTimeFundingAmount > 0) {
      console.log(`[TIMELINE DEBUG] Before applying one-time funding:`, {
        month: month,
        date: format(currentDate, 'MMM yyyy'),
        acceleratedBalances: Array.from(acceleratedBalances.entries()).map(([id, balance]) => ({
          id,
          balance
        })),
        totalAcceleratedBalance: Array.from(acceleratedBalances.values()).reduce((sum, balance) => sum + balance, 0)
      });
    }

    // First apply minimum payments
    debts.forEach(debt => {
      const acceleratedBalance = acceleratedBalances.get(debt.id) || 0;
      if (acceleratedBalance > 0) {
        const monthlyRate = debt.interest_rate / 1200;
        const acceleratedInterest = acceleratedBalance * monthlyRate;
        monthlyAcceleratedInterest += acceleratedInterest;
        const minPayment = Math.min(debt.minimum_payment, acceleratedBalance + acceleratedInterest);
        remainingAcceleratedPayment -= minPayment;
        
        const newBalance = acceleratedBalance + acceleratedInterest - minPayment;
        acceleratedBalances.set(debt.id, newBalance);
      }
    });

    totalAcceleratedInterest += monthlyAcceleratedInterest;

    // Then apply extra payments according to strategy (regular extra payment)
    if (remainingAcceleratedPayment > 0) {
      const sortedDebts = strategy.calculate(debts);
      for (const debt of sortedDebts) {
        const currentBalance = acceleratedBalances.get(debt.id) || 0;
        if (currentBalance > 0) {
          const extraPayment = Math.min(remainingAcceleratedPayment, currentBalance);
          const newBalance = Math.max(0, currentBalance - extraPayment);
          acceleratedBalances.set(debt.id, newBalance);
          remainingAcceleratedPayment = Math.max(0, remainingAcceleratedPayment - extraPayment);
          
          if (remainingAcceleratedPayment <= 0) break;
        }
      }
    }

    // Apply one-time funding specifically after regular payments
    let oneTimePaymentRemaining = oneTimeFundingAmount;
    if (oneTimePaymentRemaining > 0) {
      const sortedDebts = strategy.calculate(debts);
      for (const debt of sortedDebts) {
        const currentBalance = acceleratedBalances.get(debt.id) || 0;
        if (currentBalance > 0) {
          const oneTimePayment = Math.min(oneTimePaymentRemaining, currentBalance);
          const newBalance = Math.max(0, currentBalance - oneTimePayment);
          
          if (ENABLE_DETAILED_LOGGING) {
            console.log(`[TIMELINE DEBUG] Applying one-time payment to debt ${debt.name}:`, {
              debtId: debt.id,
              previousBalance: currentBalance,
              oneTimePayment,
              newBalance
            });
          }
          
          acceleratedBalances.set(debt.id, newBalance);
          oneTimePaymentRemaining = Math.max(0, oneTimePaymentRemaining - oneTimePayment);
          oneTimePaymentApplied += oneTimePayment;
          
          if (oneTimePaymentRemaining <= 0) break;
        }
      }
    }

    totalAcceleratedBalance = Array.from(acceleratedBalances.values())
      .reduce((sum, balance) => sum + balance, 0);

    if (ENABLE_DETAILED_LOGGING && oneTimeFundingAmount > 0) {
      console.log(`[TIMELINE DEBUG] After applying one-time funding:`, {
        month: month,
        date: format(currentDate, 'MMM yyyy'),
        oneTimeFundingAmount,
        oneTimePaymentApplied,
        acceleratedBalances: Array.from(acceleratedBalances.entries()).map(([id, balance]) => ({
          id,
          balance
        })),
        totalAcceleratedBalance
      });
    }

    // Add data point
    data.push({
      date: currentDateStr,
      monthLabel: format(currentDate, 'MMM yyyy'),
      month,
      baselineBalance: Number(totalBaselineBalance.toFixed(2)),
      acceleratedBalance: Number(totalAcceleratedBalance.toFixed(2)),
      baselineInterest: Number(totalBaselineInterest.toFixed(2)),
      acceleratedInterest: Number(totalAcceleratedInterest.toFixed(2)),
      oneTimePayment: oneTimeFundingAmount > 0 ? oneTimeFundingAmount : undefined,
      currencySymbol: debts[0]?.currency_symbol || '£',
      paymentDetails: oneTimeFundingAmount > 0 ? {
        hasOneTimePayment: true,
        oneTimeAmount: oneTimeFundingAmount,
        regularPaymentAmount: totalMonthlyPayment
      } : undefined
    });

    // Break if both scenarios are paid off
    if (totalBaselineBalance <= 0.01 && totalAcceleratedBalance <= 0.01) {
      break;
    }

    month++;
  }

  // Add explicit data points for one-time funding dates to ensure they're recognized in the chart
  oneTimeFundings.forEach(funding => {
    const fundingDate = typeof funding.payment_date === 'string' 
      ? funding.payment_date 
      : String(funding.payment_date);

    const parsedDate = new Date(fundingDate);
    
    // Log detailed funding information
    if (ENABLE_DETAILED_LOGGING) {
      console.log('[TIMELINE DEBUG] Processing one-time funding for chart visualization:', {
        rawDate: funding.payment_date,
        fundingDate,
        parsedDate: format(parsedDate, 'yyyy-MM-dd'),
        amount: funding.amount
      });
    }

    // Check if this funding date is already in our data
    const existingDataIndex = data.findIndex(d => {
      try {
        const dataDate = new Date(d.date);
        const isSameMonth = dataDate.getMonth() === parsedDate.getMonth() && 
                            dataDate.getFullYear() === parsedDate.getFullYear();
        return isSameMonth;
      } catch (error) {
        console.error('Error comparing dates:', error);
        return false;
      }
    });
    
    if (existingDataIndex === -1) {
      console.log(`[TIMELINE DEBUG] Funding date ${format(parsedDate, 'yyyy-MM-dd')} not found in timeline data points`);
    } else if (ENABLE_DETAILED_LOGGING) {
      console.log(`[TIMELINE DEBUG] Found matching data point for funding:`, {
        fundingDate: format(parsedDate, 'yyyy-MM-dd'),
        matchingDataPointDate: data[existingDataIndex].date,
        matchingDataPointMonth: data[existingDataIndex].monthLabel,
        baselineBalance: data[existingDataIndex].baselineBalance,
        acceleratedBalance: data[existingDataIndex].acceleratedBalance,
        oneTimePayment: data[existingDataIndex].oneTimePayment
      });
    }
  });

  console.log('Timeline calculation complete:', {
    totalMonths: month,
    dataPoints: data.length,
    finalBaselineBalance: data[data.length - 1]?.baselineBalance,
    finalAcceleratedBalance: data[data.length - 1]?.acceleratedBalance,
    totalBaselineInterest,
    totalAcceleratedInterest,
    interestSaved: totalBaselineInterest - totalAcceleratedInterest,
    oneTimeFundings: oneTimeFundings.length
  });

  return data;
};
