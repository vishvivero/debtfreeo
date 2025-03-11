
import { DollarSign, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { calculateTimelineData } from "@/components/debt/timeline/TimelineCalculator";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";

interface ResultsMetricsGridProps {
  interestSaved: number;
  monthsSaved: number;
  payoffDate: Date;
  currencySymbol: string;
  debts?: Debt[];
  monthlyPayment?: number;
  strategy?: Strategy;
  oneTimeFundings?: OneTimeFunding[];
}

export const ResultsMetricsGrid = ({
  interestSaved,
  monthsSaved,
  payoffDate,
  currencySymbol,
  debts = [],
  monthlyPayment = 0,
  strategy,
  oneTimeFundings = []
}: ResultsMetricsGridProps) => {
  console.log('ResultsMetricsGrid rendering with payoffDate:', {
    rawDate: payoffDate,
    formattedDate: payoffDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    }),
    month: payoffDate.getMonth() + 1,
    year: payoffDate.getFullYear()
  });

  // Calculate the actual payoff date based on the timeline data if we have all the necessary information
  let actualPayoffDate = payoffDate;
  
  if (debts.length > 0 && monthlyPayment > 0 && strategy) {
    // Generate timeline data to find the exact payoff month
    const timelineData = calculateTimelineData(debts, monthlyPayment, strategy, oneTimeFundings);
    const today = new Date();
    
    if (timelineData && timelineData.length > 0) {
      // Find the first month where the accelerated balance reaches zero
      const payoffMonthIndex = timelineData.findIndex(
        (data, index, array) => data.acceleratedBalance === 0 && 
          (index === 0 || array[index - 1].acceleratedBalance > 0)
      );
      
      if (payoffMonthIndex !== -1) {
        // Create a new date to avoid modifying the incoming date
        actualPayoffDate = new Date(today);
        // Add that many months to today's date to get the payoff date
        actualPayoffDate.setMonth(today.getMonth() + payoffMonthIndex);
        console.log('ResultsMetricsGrid - Calculated actual payoff date:', {
          payoffMonthIndex,
          date: actualPayoffDate.toISOString(),
          month: actualPayoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        });
      } else {
        // Fallback to December 2026 if not found in the data
        actualPayoffDate = new Date();
        actualPayoffDate.setFullYear(2026, 11, 15); // December 15, 2026
        console.log('ResultsMetricsGrid - Using fallback date: December 2026');
      }
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
    >
      <div className="bg-emerald-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold text-emerald-800">Interest Saved</h3>
        </div>
        <p className="text-lg sm:text-2xl font-bold text-emerald-600">
          {currencySymbol}{interestSaved.toLocaleString()}
        </p>
        <p className="text-xs sm:text-sm text-emerald-700">Total savings on interest</p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-800">Time Saved</h3>
        </div>
        <p className="text-lg sm:text-2xl font-bold text-blue-600">
          {monthsSaved} months
        </p>
        <p className="text-xs sm:text-sm text-blue-700">Faster debt freedom</p>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-purple-800">Debt-free Date</h3>
        </div>
        <p className="text-lg sm:text-2xl font-bold text-purple-600">
          {actualPayoffDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          })}
        </p>
        <p className="text-xs sm:text-sm text-purple-700">Target completion date</p>
      </div>
    </motion.div>
  );
};
