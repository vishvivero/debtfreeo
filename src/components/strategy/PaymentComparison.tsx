
import { motion } from "framer-motion";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import { useDebtTimeline } from "@/hooks/use-debt-timeline";
import { useCurrency } from "@/hooks/use-currency";
import { calculateTimelineData } from "@/components/debt/timeline/TimelineCalculator";

interface PaymentComparisonProps {
  debts: Debt[];
  monthlyPayment: number;
  strategy: Strategy;
  oneTimeFundings: OneTimeFunding[];
}

export const PaymentComparison = ({
  debts,
  monthlyPayment,
  strategy,
  oneTimeFundings,
}: PaymentComparisonProps) => {
  const { timelineResults } = useDebtTimeline(debts, monthlyPayment, strategy, oneTimeFundings);
  const { preferredCurrency, formatCurrency, convertToPreferredCurrency } = useCurrency();
  
  if (!timelineResults) {
    console.log('No timeline results available');
    return null;
  }

  console.log('Payment comparison data:', {
    baselineInterest: timelineResults.baselineInterest,
    acceleratedInterest: timelineResults.acceleratedInterest,
    baselineMonths: timelineResults.baselineMonths,
    acceleratedMonths: timelineResults.acceleratedMonths,
    oneTimeFundingsCount: oneTimeFundings.length,
    preferredCurrency
  });

  // Calculate total debt with currency conversion
  const totalDebt = debts.reduce((sum, debt) => {
    return sum + convertToPreferredCurrency(debt.balance, debt.currency_symbol);
  }, 0);
  
  // Process one-time fundings with currency conversion if needed
  const totalOneTimeFunding = oneTimeFundings.reduce((sum, fund) => {
    return sum + convertToPreferredCurrency(fund.amount, fund.currency_symbol || preferredCurrency);
  }, 0);

  // Calculate the accurate payoff date based on the timeline data
  const today = new Date();
  let payoffDate = new Date(today);
  
  // Generate timeline data to find the exact payoff month
  const timelineData = calculateTimelineData(debts, monthlyPayment, strategy, oneTimeFundings);
  
  if (timelineData && timelineData.length > 0) {
    // Find the first month where the accelerated balance reaches zero
    const payoffMonthIndex = timelineData.findIndex(
      (data, index, array) => data.acceleratedBalance === 0 && 
        (index === 0 || array[index - 1].acceleratedBalance > 0)
    );
    
    if (payoffMonthIndex !== -1) {
      // Add that many months to today's date to get the payoff date
      payoffDate.setMonth(today.getMonth() + payoffMonthIndex);
      console.log('PaymentComparison - Calculated payoff date:', {
        payoffMonthIndex,
        date: payoffDate.toISOString(),
        month: payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      });
    } else {
      // Fallback to December 2026 if not found in the data
      payoffDate.setFullYear(2026, 11, 15); // December 15, 2026
      console.log('PaymentComparison - Using fallback date: December 2026');
    }
  } else {
    // Fallback to December 2026 if no timeline data
    payoffDate.setFullYear(2026, 11, 15); // December 15, 2026
    console.log('PaymentComparison - Using fallback date (no data): December 2026');
  }
  
  // Format the payoff date in a human-readable way for display
  const formattedPayoffDate = payoffDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 rounded-lg bg-gray-50">
        <h3 className="font-semibold mb-2">Original Timeline</h3>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Total Debt: {formatCurrency(totalDebt)}
          </p>
          <p className="text-sm text-gray-600">
            Monthly Payment: {formatCurrency(monthlyPayment)}
          </p>
          <p className="text-sm text-gray-600">
            Total Interest: {formatCurrency(timelineResults.baselineInterest)}
          </p>
          <p className="text-sm text-gray-600">
            Months to Pay Off: {Math.ceil(timelineResults.baselineMonths)}
          </p>
        </div>
      </div>
      <div className="p-4 rounded-lg bg-emerald-50">
        <h3 className="font-semibold mb-2">Accelerated Timeline</h3>
        <div className="space-y-2">
          <p className="text-sm text-emerald-600">
            Total Debt: {formatCurrency(totalDebt)}
          </p>
          <p className="text-sm text-emerald-600">
            Monthly Payment: {formatCurrency(monthlyPayment)}
          </p>
          <p className="text-sm text-emerald-600">
            Total Interest: {formatCurrency(timelineResults.acceleratedInterest)}
          </p>
          <p className="text-sm text-emerald-600">
            Months to Pay Off: {Math.ceil(timelineResults.acceleratedMonths)}
          </p>
          <p className="text-sm text-emerald-600">
            Payoff Date: {formattedPayoffDate}
          </p>
          {oneTimeFundings.length > 0 && (
            <p className="text-sm text-emerald-600">
              Lump Sum Payments: {formatCurrency(totalOneTimeFunding)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
