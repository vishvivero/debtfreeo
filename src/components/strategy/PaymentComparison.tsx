
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/strategies";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import { useDebtTimeline, TimelineResults } from "@/hooks/use-debt-timeline";
import { convertCurrency } from "@/lib/utils/currencyConverter";

interface PaymentComparisonProps {
  debts: Debt[];
  monthlyPayment: number;
  extraPayment: number;
  selectedStrategy: Strategy;
  oneTimeFundings: OneTimeFunding[];
  currencySymbol?: string;
}

export const PaymentComparison = ({
  debts,
  monthlyPayment,
  extraPayment,
  selectedStrategy: strategy,
  oneTimeFundings,
  currencySymbol = '£'
}: PaymentComparisonProps) => {
  const { timelineResults } = useDebtTimeline(debts, monthlyPayment, strategy, oneTimeFundings);

  if (!timelineResults) {
    console.log('No timeline results available');
    return null;
  }

  // Get user's currency symbol from first debt if available
  const debtCurrencySymbol = timelineResults.originalCurrency || (debts.length > 0 ? debts[0].currency_symbol : '$');

  // Convert interest values if the currency symbols are different
  const baselineInterest = debtCurrencySymbol !== currencySymbol 
    ? convertCurrency(timelineResults.baselineInterest, debtCurrencySymbol, currencySymbol)
    : timelineResults.baselineInterest;
    
  const acceleratedInterest = debtCurrencySymbol !== currencySymbol 
    ? convertCurrency(timelineResults.acceleratedInterest, debtCurrencySymbol, currencySymbol)
    : timelineResults.acceleratedInterest;

  // Log detailed conversion information for debugging
  console.log('Payment comparison data:', {
    originalBaselineInterest: timelineResults.baselineInterest,
    originalAcceleratedInterest: timelineResults.acceleratedInterest,
    originalCurrency: debtCurrencySymbol,
    targetCurrency: currencySymbol,
    convertedBaselineInterest: baselineInterest,
    convertedAcceleratedInterest: acceleratedInterest,
    currencyConversionNeeded: debtCurrencySymbol !== currencySymbol,
    baselineMonths: timelineResults.baselineMonths,
    acceleratedMonths: timelineResults.acceleratedMonths
  });

  // Calculate total debt with potential currency conversion
  const totalDebt = debts.reduce((sum, debt) => {
    const convertedBalance = debt.currency_symbol !== currencySymbol 
      ? convertCurrency(debt.balance, debt.currency_symbol, currencySymbol)
      : debt.balance;
    return sum + convertedBalance;
  }, 0);

  // Monthly payment may also need conversion if displayed in a different currency
  const convertedMonthlyPayment = debtCurrencySymbol !== currencySymbol
    ? convertCurrency(monthlyPayment, debtCurrencySymbol, currencySymbol)
    : monthlyPayment;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 rounded-lg bg-gray-50">
        <h3 className="font-semibold mb-2">Original Timeline</h3>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Total Debt: {formatCurrency(totalDebt, currencySymbol)}
          </p>
          <p className="text-sm text-gray-600">
            Monthly Payment: {formatCurrency(convertedMonthlyPayment, currencySymbol)}
          </p>
          <p className="text-sm text-gray-600">
            Total Interest: {formatCurrency(baselineInterest, currencySymbol)}
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
            Total Debt: {formatCurrency(totalDebt, currencySymbol)}
          </p>
          <p className="text-sm text-emerald-600">
            Monthly Payment: {formatCurrency(convertedMonthlyPayment, currencySymbol)}
          </p>
          <p className="text-sm text-emerald-600">
            Total Interest: {formatCurrency(acceleratedInterest, currencySymbol)}
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
