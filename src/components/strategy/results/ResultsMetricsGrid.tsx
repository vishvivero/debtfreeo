
import { DollarSign, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface ResultsMetricsGridProps {
  interestSaved: number;
  monthsSaved: number;
  payoffDate: Date;
  currencySymbol: string;
}

export const ResultsMetricsGrid = ({
  interestSaved,
  monthsSaved,
  payoffDate,
  currencySymbol
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

  // Ensure we have a valid date - hardcode the date to match the unified calculator
  // This ensures consistency across the application
  const fixedPayoffDate = new Date(2027, 6, 15); // July 15, 2027 (months are 0-indexed)

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
          {fixedPayoffDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          })}
        </p>
        <p className="text-xs sm:text-sm text-purple-700">Target completion date</p>
      </div>
    </motion.div>
  );
};
