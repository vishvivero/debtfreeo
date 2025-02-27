
import { Debt } from "@/lib/types";
import { OneTimeFunding } from "@/hooks/use-one-time-funding";
import { addMonths, parseISO } from "date-fns";
import { Strategy } from "@/lib/strategies";
import { formatDate, normalizeDate, isSameMonthAndYear, getMonthStart } from "@/lib/utils/dateUtils";

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
    isPrefundingPoint?: boolean;
    isPostfundingPoint?: boolean;
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
    fundingDates: oneTimeFundings.map(f => formatDate(f.payment_date, 'yyyy-MM-dd'))
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

  // Normalize all funding dates
  const normalizedFundings = oneTimeFundings.map(funding => ({
    ...funding,
    payment_date: normalizeDate(funding.payment_date) || new Date().toISOString(),
    amount: Number(funding.amount)
  }));

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
      totalMonthlyPayment,
      normalizedFundings
    });
  }

  // Create a map to track months where we've already generated "before funding" and "after funding" points
  const processedFundingMonths = new Map<string, boolean>();

  while (month < maxMonths) {
    const currentDate = addMonths(startDate, month);
    const currentDateStr = currentDate.toISOString();
    const monthKey = formatDate(currentDate, 'yyyy-MM');
    
    // Find any one-time fundings for this month
    const monthlyFundings = normalizedFundings.filter(funding =>
      isSameMonthAndYear(funding.payment_date, currentDate)
    );
    
    const oneTimeFundingAmount = monthlyFundings.reduce((sum, funding) => sum + funding.amount, 0);

    if (ENABLE_DETAILED_LOGGING && oneTimeFundingAmount > 0) {
      console.log(`[TIMELINE DEBUG] Month ${month} (${formatDate(currentDate)}) has one-time funding of ${oneTimeFundingAmount}`);
    }

    // For months with funding, we create 3 points: before funding, at funding, and after funding
    // Only do this if we haven't processed this month yet
    if (oneTimeFundingAmount > 0 && !processedFundingMonths.has(monthKey)) {
      processedFundingMonths.set(monthKey, true);
      
      // 1. Calculate "before funding" point (same month, but before funding is applied)
      // First process baseline scenario
      let totalBaselineBalance = 0;
      let monthlyBaselineInterest = 0;
      let remainingBaselinePayment = totalMinimumPayment;

      // Calculate baseline scenario (same code as regular calculation)
      debts.forEach(debt => {
        const baselineBalance = balances.get(debt.id) || 0;
        if (baselineBalance > 0) {
          const monthlyRate = debt.interest_rate / 1200;
          const baselineInterest = baselineBalance * monthlyRate;
          monthlyBaselineInterest += baselineInterest;
          const payment = Math.min(remainingBaselinePayment, debt.minimum_payment);
          const newBaselineBalance = Math.max(0, baselineBalance + baselineInterest - payment);
          
          balances.set(debt.id, newBaselineBalance);
          totalBaselineBalance += newBaselineBalance;
          remainingBaselinePayment = Math.max(0, remainingBaselinePayment - payment);
        }
      });

      totalBaselineInterest += monthlyBaselineInterest;

      // Process accelerated scenario for "before funding" point
      let totalAcceleratedBalance = 0;
      let monthlyAcceleratedInterest = 0;
      let remainingAcceleratedPayment = totalMonthlyPayment;

      // Calculate accelerated scenario - first regular payments only
      debts.forEach(debt => {
        const acceleratedBalance = acceleratedBalances.get(debt.id) || 0;
        if (acceleratedBalance > 0) {
          const monthlyRate = debt.interest_rate / 1200;
          const acceleratedInterest = acceleratedBalance * monthlyRate;
          monthlyAcceleratedInterest += acceleratedInterest;
          const minPayment = Math.min(debt.minimum_payment, acceleratedBalance + acceleratedInterest);
          
          const newBalance = acceleratedBalance + acceleratedInterest - minPayment;
          acceleratedBalances.set(debt.id, newBalance);
          remainingAcceleratedPayment -= minPayment;
        }
      });

      // Then apply extra payments according to strategy
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

      totalAcceleratedInterest += monthlyAcceleratedInterest;
      totalAcceleratedBalance = Array.from(acceleratedBalances.values())
        .reduce((sum, balance) => sum + balance, 0);
      
      // Save "before funding" data point
      data.push({
        date: currentDateStr,
        monthLabel: formatDate(currentDate, 'MMM yyyy'),
        month,
        baselineBalance: Number(totalBaselineBalance.toFixed(2)),
        acceleratedBalance: Number(totalAcceleratedBalance.toFixed(2)),
        baselineInterest: Number(totalBaselineInterest.toFixed(2)),
        acceleratedInterest: Number(totalAcceleratedInterest.toFixed(2)),
        currencySymbol: debts[0]?.currency_symbol || '£',
        paymentDetails: {
          hasOneTimePayment: false,
          oneTimeAmount: 0,
          regularPaymentAmount: totalMonthlyPayment,
          isPrefundingPoint: true
        }
      });
      
      if (ENABLE_DETAILED_LOGGING) {
        console.log(`[TIMELINE DEBUG] Added pre-funding point for month ${formatDate(currentDate)}:`, {
          acceleratedBalance: totalAcceleratedBalance.toFixed(2)
        });
      }

      // 2. Calculate "at funding" point (apply one-time payment)
      const prefundingAcceleratedBalance = totalAcceleratedBalance;
      
      // Apply one-time funding
      let oneTimePaymentRemaining = oneTimeFundingAmount;
      let oneTimePaymentApplied = 0;
      
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

      // Recalculate total accelerated balance after one-time payment
      totalAcceleratedBalance = Array.from(acceleratedBalances.values())
        .reduce((sum, balance) => sum + balance, 0);
        
      // Add the "at funding" data point
      data.push({
        date: currentDateStr,
        monthLabel: formatDate(currentDate, 'MMM yyyy'),
        month,
        baselineBalance: Number(totalBaselineBalance.toFixed(2)),
        acceleratedBalance: Number(totalAcceleratedBalance.toFixed(2)),
        baselineInterest: Number(totalBaselineInterest.toFixed(2)),
        acceleratedInterest: Number(totalAcceleratedInterest.toFixed(2)),
        oneTimePayment: oneTimeFundingAmount,
        currencySymbol: debts[0]?.currency_symbol || '£',
        paymentDetails: {
          hasOneTimePayment: true,
          oneTimeAmount: oneTimeFundingAmount,
          regularPaymentAmount: totalMonthlyPayment
        }
      });
      
      if (ENABLE_DETAILED_LOGGING) {
        console.log(`[TIMELINE DEBUG] Added funding point for month ${formatDate(currentDate)}:`, {
          prefundingBalance: prefundingAcceleratedBalance.toFixed(2),
          afterFundingBalance: totalAcceleratedBalance.toFixed(2),
          reduction: (prefundingAcceleratedBalance - totalAcceleratedBalance).toFixed(2),
          oneTimePayment: oneTimeFundingAmount
        });
      }
      
      // 3. Generate an "after funding" point to highlight the drop
      data.push({
        date: currentDateStr,
        monthLabel: formatDate(currentDate, 'MMM yyyy'),
        month,
        baselineBalance: Number(totalBaselineBalance.toFixed(2)),
        acceleratedBalance: Number(totalAcceleratedBalance.toFixed(2)),
        baselineInterest: Number(totalBaselineInterest.toFixed(2)),
        acceleratedInterest: Number(totalAcceleratedInterest.toFixed(2)),
        currencySymbol: debts[0]?.currency_symbol || '£',
        paymentDetails: {
          hasOneTimePayment: false,
          oneTimeAmount: 0,
          regularPaymentAmount: totalMonthlyPayment,
          isPostfundingPoint: true
        }
      });
      
      if (ENABLE_DETAILED_LOGGING) {
        console.log(`[TIMELINE DEBUG] Added post-funding point for month ${formatDate(currentDate)}:`, {
          acceleratedBalance: totalAcceleratedBalance.toFixed(2)
        });
      }
    } else {
      // Regular month without funding or already processed funding month
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

      // Then apply extra payments according to strategy
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

      totalAcceleratedBalance = Array.from(acceleratedBalances.values())
        .reduce((sum, balance) => sum + balance, 0);

      // Add regular data point
      data.push({
        date: currentDateStr,
        monthLabel: formatDate(currentDate, 'MMM yyyy'),
        month,
        baselineBalance: Number(totalBaselineBalance.toFixed(2)),
        acceleratedBalance: Number(totalAcceleratedBalance.toFixed(2)),
        baselineInterest: Number(totalBaselineInterest.toFixed(2)),
        acceleratedInterest: Number(totalAcceleratedInterest.toFixed(2)),
        currencySymbol: debts[0]?.currency_symbol || '£'
      });
    }

    // Break if both scenarios are paid off
    if (Array.from(balances.values()).reduce((sum, balance) => sum + balance, 0) <= 0.01 && 
        Array.from(acceleratedBalances.values()).reduce((sum, balance) => sum + balance, 0) <= 0.01) {
      break;
    }

    month++;
  }

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
