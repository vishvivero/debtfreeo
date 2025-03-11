
import { motion } from "framer-motion";
import { TrendingUp, Clock, Calendar } from "lucide-react";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import { useDebtTimeline } from "@/hooks/use-debt-timeline";
import { formatCurrency } from "@/lib/strategies";

interface ResultsSummaryProps {
  strategy: Strategy;
  hasOneTimeFundings?: boolean;
  interestSaved: number;
  currencySymbol?: string;
  debts?: Debt[];
  monthlyPayment?: number;
  oneTimeFundings?: OneTimeFunding[];
}

export const ResultsSummary = ({
  strategy,
  hasOneTimeFundings = false,
  interestSaved,
  currencySymbol = '£',
  debts = [],
  monthlyPayment = 0,
  oneTimeFundings = []
}: ResultsSummaryProps) => {
  console.log('ResultsSummary: Rendering with:', {
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

  // If we don't have timeline results and interestSaved was directly provided, 
  // we can still render with basic information
  const effectiveInterestSaved = timelineResults?.interestSaved ?? interestSaved;
  const effectiveMonthsSaved = timelineResults?.monthsSaved ?? 0;
  
  // Calculate years and months saved
  const yearsSaved = Math.floor(effectiveMonthsSaved / 12);
  const monthsSaved = effectiveMonthsSaved % 12;
  
  // Fallback date if no timeline results
  const today = new Date();
  const fallbackDate = new Date(today);
  fallbackDate.setFullYear(2026, 11, 15); // December 15, 2026
  
  const payoffDate = timelineResults?.payoffDate || fallbackDate;

  // Format the time saved in a more readable way (years and months)
  const formatTimeSaved = (months: number): string => {
    if (months <= 0) return "0 months";
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
      return `${months} month${months === 1 ? '' : 's'}`;
    } else if (remainingMonths === 0) {
      return `${years} year${years === 1 ? '' : 's'}`;
    } else {
      return `${years} year${years === 1 ? '' : 's'} and ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
    }
  };

  // Log the calculated time saved for debugging
  console.log('ResultsSummary: Time saved calculation:', {
    monthsSaved: effectiveMonthsSaved,
    formattedTimeSaved: formatTimeSaved(effectiveMonthsSaved),
    yearsSaved: Math.floor(effectiveMonthsSaved / 12),
    remainingMonths: effectiveMonthsSaved % 12,
    payoffDate: payoffDate.toISOString(),
    formattedPayoffDate: payoffDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
  });

  return (
    <div className="space-y-6">
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
            {formatCurrency(effectiveInterestSaved, currencySymbol)}
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
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Time Saved</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {formatTimeSaved(effectiveMonthsSaved)}
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
            <Calendar className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-purple-800">Debt-free Date</h3>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {payoffDate.toLocaleDateString('en-US', { 
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
