import { Debt } from "@/lib/types";
import { OneTimeFunding } from "@/lib/types/payment";
import { format, addMonths } from "date-fns";
import { Strategy } from "@/lib/strategies";
import { UnifiedInterestCalculator } from "@/lib/services/calculations/UnifiedInterestCalculator";

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
}

export const calculateTimelineData = (
  debts: Debt[],
  totalMonthlyPayment: number,
  strategy: Strategy,
  oneTimeFundings: OneTimeFunding[] = []
): TimelineData[] => {
  console.log('TimelineCalculator: Starting calculation with:', {
    totalDebts: debts.length,
    totalMonthlyPayment,
    strategy: strategy.name,
    oneTimeFundings: oneTimeFundings.length
  });

  const results = UnifiedInterestCalculator.calculateInterest(
    debts,
    totalMonthlyPayment,
    strategy,
    oneTimeFundings
  );

  console.log('TimelineCalculator: Using unified calculator results:', {
    baselineInterest: results.baselineInterest,
    acceleratedInterest: results.acceleratedInterest,
    interestSaved: results.interestSaved,
    monthsSaved: results.monthsSaved
  });

  // Convert the results into timeline data points
  const data: TimelineData[] = [];
  const startDate = new Date();
  const maxMonths = Math.max(
    Math.ceil(results.monthsSaved),
    12 // Show at least 12 months
  );

  for (let month = 0; month <= maxMonths; month++) {
    const currentDate = addMonths(startDate, month);
    const monthlyFundings = oneTimeFundings.filter(funding => {
      const fundingDate = new Date(funding.payment_date);
      return fundingDate.getMonth() === currentDate.getMonth() &&
             fundingDate.getFullYear() === currentDate.getFullYear();
    });
    
    const oneTimeFundingAmount = monthlyFundings.reduce((sum, funding) => sum + Number(funding.amount), 0);

    // Calculate proportional values for this month
    const progress = month / maxMonths;
    const baselineInterest = results.baselineInterest * progress;
    const acceleratedInterest = results.acceleratedInterest * progress;

    data.push({
      date: currentDate.toISOString(),
      monthLabel: format(currentDate, 'MMM yyyy'),
      month,
      baselineBalance: Number((results.baselineInterest * (1 - progress)).toFixed(2)),
      acceleratedBalance: Number((results.acceleratedInterest * (1 - progress)).toFixed(2)),
      baselineInterest: Number(baselineInterest.toFixed(2)),
      acceleratedInterest: Number(acceleratedInterest.toFixed(2)),
      oneTimePayment: oneTimeFundingAmount || undefined,
      currencySymbol: debts[0]?.currency_symbol || '£'
    });
  }

  return data;
};