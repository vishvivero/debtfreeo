import { motion } from "framer-motion";
import { TrendingUp, Calendar, Target, PiggyBank } from "lucide-react";
import { formatCurrency } from "@/lib/strategies";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UnifiedPayoffCalculator } from "@/lib/services/calculations/UnifiedPayoffCalculator";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/hooks/use-one-time-funding";

interface ResultsSummaryProps {
  debts: Debt[];
  monthlyPayment: number;
  strategy: Strategy;
  oneTimeFundings: OneTimeFunding[];
  currencySymbol?: string;
}

export const ResultsSummary = ({
  debts,
  monthlyPayment,
  strategy,
  oneTimeFundings,
  currencySymbol = '£'
}: ResultsSummaryProps) => {
  console.log('ResultsSummary rendered with:', {
    totalDebts: debts.length,
    monthlyPayment,
    strategy: strategy.name,
    oneTimeFundings: oneTimeFundings.length,
    currencySymbol
  });

  const calculation = UnifiedPayoffCalculator.calculatePayoff(
    debts,
    monthlyPayment,
    strategy,
    oneTimeFundings
  );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Interest Savings Breakdown</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-green-50 p-4 rounded-lg"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Strategy Impact</h3>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Savings from using the debt payoff strategy</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(calculation.interestSaved, currencySymbol)}
          </p>
          <p className="text-sm text-green-700">Total interest saved</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 p-4 rounded-lg"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Time Saved</h3>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Months saved on your debt-free journey</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="text-2xl font-bold text-blue-600">
            {calculation.monthsSaved} months
          </p>
          <p className="text-sm text-blue-700">Faster debt freedom</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-purple-50 p-4 rounded-lg"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-800">Debt-free Date</h3>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Your projected debt-free date</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="text-2xl font-bold text-purple-600">
            {calculation.payoffDate.toLocaleDateString('en-US', { 
              month: 'long',
              year: 'numeric'
            })}
          </p>
          <p className="text-sm text-purple-700">Target completion date</p>
        </motion.div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Total Interest Saved</h3>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(calculation.interestSaved, currencySymbol)}
          </p>
        </div>
      </div>
    </div>
  );
};