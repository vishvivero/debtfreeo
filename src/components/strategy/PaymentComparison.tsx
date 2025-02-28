import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/strategies";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import { useDebtTimeline } from "@/hooks/use-debt-timeline";

interface PaymentComparisonProps {
  debts: Debt[];
  monthlyPayment: number;
  strategy: Strategy;
  oneTimeFundings: OneTimeFunding[];
  currencySymbol?: string;
}

export const PaymentComparison = ({
  debts,
  monthlyPayment,
  strategy,
  oneTimeFundings,
  currencySymbol = '£'
}: PaymentComparisonProps) => {
  const { timelineResults } = useDebtTimeline(debts, monthlyPayment, strategy, oneTimeFundings);

  if (!timelineResults) {
    console.log('No timeline results available');
    return null;
  }

  console.log('Payment comparison data:', {
    baselineInterest: timelineResults.baselineInterest,
    acceleratedInterest: timelineResults.acceleratedInterest,
    baselineMonths: timelineResults.baselineMonths,
    acceleratedMonths: timelineResults.acceleratedMonths,
    oneTimeFundingsCount: oneTimeFundings.length
  });

  // Keep original debts currency for baseline values
  const totalDebtInOriginalCurrency = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const baselineInterestInOriginalCurrency = timelineResults.baselineInterest;
  
  // For display purposes, use the first debt's currency symbol as the original currency
  const originalCurrencySymbol = debts.length > 0 ? debts[0].currency_symbol : '£';

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 rounded-lg bg-gray-50">
        <h3 className="font-semibold mb-2">Original Timeline</h3>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Total Debt: {formatCurrency(totalDebtInOriginalCurrency, originalCurrencySymbol)}
          </p>
          <p className="text-sm text-gray-600">
            Monthly Payment: {formatCurrency(monthlyPayment, originalCurrencySymbol)}
          </p>
          <p className="text-sm text-gray-600">
            Total Interest: {formatCurrency(baselineInterestInOriginalCurrency, originalCurrencySymbol)}
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
            Total Debt: {formatCurrency(debts.reduce((sum, debt) => sum + debt.balance, 0), currencySymbol)}
          </p>
          <p className="text-sm text-emerald-600">
            Monthly Payment: {formatCurrency(monthlyPayment, currencySymbol)}
          </p>
          <p className="text-sm text-emerald-600">
            Total Interest: {formatCurrency(timelineResults.acceleratedInterest, currencySymbol)}
          </p>
          <p className="text-sm text-emerald-600">
            Months to Pay Off: {Math.ceil(timelineResults.acceleratedMonths)}
          </p>
          {oneTimeFundings.length > 0 && (
            <p className="text-sm text-emerald-600">
              Lump Sum Payments: {formatCurrency(
                oneTimeFundings.reduce((sum, fund) => sum + Number(fund.amount), 0), 
                currencySymbol
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
