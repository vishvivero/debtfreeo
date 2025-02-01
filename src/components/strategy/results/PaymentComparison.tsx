import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/strategies";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import { UnifiedPayoffCalculator } from "@/lib/services/calculations/UnifiedPayoffCalculator";

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
  console.log('Rendering PaymentComparison with:', {
    totalDebts: debts.length,
    monthlyPayment,
    strategy: strategy.name,
    oneTimeFundings: oneTimeFundings.length
  });

  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMinPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  const avgInterestRate = debts.reduce((sum, debt) => sum + debt.interest_rate, 0) / debts.length;

  const payoffDetails = UnifiedPayoffCalculator.calculatePayoff(
    debts,
    monthlyPayment,
    strategy,
    oneTimeFundings
  );

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
            Total Interest: {formatCurrency(payoffDetails.baselineInterest, currencySymbol)}
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
            Total Interest: {formatCurrency(payoffDetails.acceleratedInterest, currencySymbol)}
          </p>
        </div>
      </div>
    </div>
  );
};