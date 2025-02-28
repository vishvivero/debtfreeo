
import { motion } from "framer-motion";
import { TrendingUp, Calendar, Target } from "lucide-react";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import { useDebtTimeline } from "@/hooks/use-debt-timeline";
import { formatCurrency } from "@/lib/strategies";
import { convertCurrency } from "@/lib/utils/currencyConverter";

interface ResultsSummaryProps {
  debts: Debt[];
  monthlyPayment: number;
  extraPayment: number;
  strategy: Strategy;
  oneTimeFundings: OneTimeFunding[];
  currencySymbol?: string;
}

export const ResultsSummary = ({
  debts,
  monthlyPayment,
  extraPayment,
  strategy,
  oneTimeFundings,
  currencySymbol = '£'
}: ResultsSummaryProps) => {
  console.log('ResultsSummary: Rendering with:', {
    totalDebts: debts.length,
    monthlyPayment,
    extraPayment,
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
    console.log('ResultsSummary: No timeline results available');
    return null;
  }

  // Get debt's original currency symbol from timeline results
  const debtCurrencySymbol = timelineResults.originalCurrency || (debts.length > 0 ? debts[0].currency_symbol : '$');

  // Calculate interest values with potential currency conversion
  const baselineInterest = debtCurrencySymbol !== currencySymbol 
    ? convertCurrency(timelineResults.baselineInterest, debtCurrencySymbol, currencySymbol)
    : timelineResults.baselineInterest;
    
  const acceleratedInterest = debtCurrencySymbol !== currencySymbol 
    ? convertCurrency(timelineResults.acceleratedInterest, debtCurrencySymbol, currencySymbol)
    : timelineResults.acceleratedInterest;
    
  const interestSaved = baselineInterest - acceleratedInterest;

  console.log('ResultsSummary: Timeline calculation details:', {
    originalBaselineInterest: timelineResults.baselineInterest,
    originalAcceleratedInterest: timelineResults.acceleratedInterest,
    originalCurrency: debtCurrencySymbol,
    targetCurrency: currencySymbol,
    currencyConversionNeeded: debtCurrencySymbol !== currencySymbol,
    convertedBaselineInterest: baselineInterest,
    convertedAcceleratedInterest: acceleratedInterest,
    interestSaved,
    monthsSaved: timelineResults.monthsSaved,
    payoffDate: timelineResults.payoffDate.toISOString(),
    baselineMonths: timelineResults.baselineMonths,
    acceleratedMonths: timelineResults.acceleratedMonths
  });

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
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-green-800">Interest Saved</h3>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {formatCurrency(interestSaved, currencySymbol)}
          </p>
          <p className="text-sm text-green-700">Total interest saved</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 p-4 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Time Saved</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {timelineResults.monthsSaved} months
          </p>
          <p className="text-sm text-blue-700">Faster debt freedom</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-purple-50 p-4 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-purple-800">Debt-free Date</h3>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {timelineResults.payoffDate.toLocaleDateString('en-US', { 
              month: 'long',
              year: 'numeric'
            })}
          </p>
          <p className="text-sm text-purple-700">Target completion date</p>
        </motion.div>
      </div>
    </div>
  );
};
