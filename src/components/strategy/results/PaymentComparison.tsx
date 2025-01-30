import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/strategies";
import { Debt } from "@/lib/types";
import { Info } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const extraPayment = monthlyPayment - totalMinPayment;
  const avgInterestRate = debts.reduce((sum, debt) => sum + debt.interest_rate, 0) / debts.length;

  const strategySavings = baseTotalInterest - optimizedTotalInterest;
  const extraPaymentSavings = extraPayment > 0 ? (baseTotalInterest * 0.1) : 0; // Simplified calculation
  const oneTimeFundingSavings = 0; // This would need to be calculated based on one-time fundings

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-lg bg-white shadow-sm border"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              Interest Savings Breakdown
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>See how different aspects of your debt repayment plan contribute to your total savings</p>
                </TooltipContent>
              </Tooltip>
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-md">
                <div>
                  <h4 className="font-medium">Strategy Impact</h4>
                  <p className="text-sm text-muted-foreground">By targeting high-interest first</p>
                </div>
                <span className="text-emerald-600 font-semibold">
                  {formatCurrency(strategySavings, currencySymbol)} saved
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
                <div>
                  <h4 className="font-medium">Extra Payments Impact</h4>
                  <p className="text-sm text-muted-foreground">
                    {extraPayment > 0 ? 'From additional monthly payments' : 'No extra payments added'}
                  </p>
                </div>
                <span className="text-blue-600 font-semibold">
                  {formatCurrency(extraPaymentSavings, currencySymbol)} saved
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-md">
                <div>
                  <h4 className="font-medium">One-time Funding Impact</h4>
                  <p className="text-sm text-muted-foreground">
                    {oneTimeFundingSavings > 0 ? 'From lump sum payments' : 'No lump sum payments added'}
                  </p>
                </div>
                <span className="text-purple-600 font-semibold">
                  {formatCurrency(oneTimeFundingSavings, currencySymbol)} saved
                </span>
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <span className="font-semibold">Total Savings</span>
                <span className="text-lg font-bold text-emerald-600">
                  {formatCurrency(strategySavings + extraPaymentSavings + oneTimeFundingSavings, currencySymbol)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
};