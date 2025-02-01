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
  console.log('PaymentComparison: Rendering with:', {
    totalDebts: debts.length,
    monthlyPayment,
    strategy: strategy.name,
    oneTimeFundings: oneTimeFundings.length,
    currencySymbol
  });

  const { timelineResults } = useDebtTimeline(
    debts,
    monthlyPayment,
    strategy,
    oneTimeFundings
  );

  if (!timelineResults) {
    console.log('PaymentComparison: No timeline results available');
    return null;
  }

  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMinPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  const avgInterestRate = debts.reduce((sum, debt) => sum + debt.interest_rate, 0) / debts.length;

  console.log('PaymentComparison: Calculation details:', {
    totalDebt,
    totalMinPayment,
    avgInterestRate,
    baselineInterest: timelineResults.baselineInterest,
    acceleratedInterest: timelineResults.acceleratedInterest,
    interestSaved: timelineResults.interestSaved,
    monthsSaved: timelineResults.monthsSaved,
    baselineMonths: timelineResults.baselineMonths,
    acceleratedMonths: timelineResults.acceleratedMonths
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 rounded-lg bg-gray-50">
        <h3 className="font-semibold mb-2">Without DebtFreeo</h3>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Total Debt: {formatCurrency(totalDebt, currencySymbol)}
          </p>
          <p className="text-sm text-gray-600">
            Monthly Payment: {formatCurrency(totalMinPayment, currencySymbol)}
          </p>
          <p className="text-sm text-gray-600">
            Avg Interest Rate: {avgInterestRate.toFixed(2)}%
          </p>
          <p className="text-sm text-gray-600">
            Total Interest: {formatCurrency(timelineResults.baselineInterest, currencySymbol)}
          </p>
          <p className="text-sm text-gray-600">
            Months to Pay Off: {timelineResults.baselineMonths}
          </p>
        </div>
      </div>
      <div className="p-4 rounded-lg bg-emerald-50">
        <h3 className="font-semibold mb-2">With DebtFreeo</h3>
        <div className="space-y-2">
          <p className="text-sm text-emerald-600">
            Total Debt: {formatCurrency(totalDebt, currencySymbol)}
          </p>
          <p className="text-sm text-emerald-600">
            Monthly Payment: {formatCurrency(monthlyPayment, currencySymbol)}
          </p>
          <p className="text-sm text-emerald-600">
            Extra Payment: {formatCurrency(monthlyPayment - totalMinPayment, currencySymbol)}
          </p>
          <p className="text-sm text-emerald-600">
            Total Interest: {formatCurrency(timelineResults.acceleratedInterest, currencySymbol)}
          </p>
          <p className="text-sm text-emerald-600">
            Months to Pay Off: {timelineResults.acceleratedMonths}
          </p>
        </div>
      </div>
    </div>
  );
};