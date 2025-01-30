import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/strategies";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";

interface PaymentComparisonProps {
  debts: Debt[];
  monthlyPayment: number;
  basePayoffMonths: number;
  optimizedPayoffMonths: number;
  baseTotalInterest: number;
  optimizedTotalInterest: number;
  currencySymbol?: string;
}

export const PaymentComparison = ({
  debts,
  monthlyPayment,
  basePayoffMonths,
  optimizedPayoffMonths,
  baseTotalInterest,
  optimizedTotalInterest,
  currencySymbol = '£'
}: PaymentComparisonProps) => {
  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMinPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  const avgInterestRate = debts.reduce((sum, debt) => sum + debt.interest_rate, 0) / debts.length;

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
            Total Interest: {formatCurrency(baseTotalInterest, currencySymbol)}
          </p>
          <p className="text-sm text-gray-600">
            Months to Pay Off: {basePayoffMonths}
          </p>
          <p className="text-sm text-gray-600">
            Avg Interest Rate: {avgInterestRate.toFixed(2)}%
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
            Total Interest: {formatCurrency(optimizedTotalInterest, currencySymbol)}
          </p>
          <p className="text-sm text-emerald-600">
            Months to Pay Off: {optimizedPayoffMonths}
          </p>
          <p className="text-sm text-emerald-600">
            Interest Saved: {formatCurrency(baseTotalInterest - optimizedTotalInterest, currencySymbol)}
          </p>
        </div>
      </div>
    </div>
  );
};