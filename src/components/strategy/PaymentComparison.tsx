
import { motion } from "framer-motion";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import { useDebtTimeline } from "@/hooks/use-debt-timeline";
import { useCurrency } from "@/hooks/use-currency";

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
