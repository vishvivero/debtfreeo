import { format } from "date-fns";
import { motion } from "framer-motion";
import { Calendar, PiggyBank, Clock, TrendingUp } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface TimelineMetricsProps {
  baselineMonths: number;
  acceleratedMonths: number;
  monthsSaved: number;
  baselineLatestDate: Date;
  interestSaved: number;
  currencySymbol: string;
}

export const TimelineMetrics = ({ 
  baselineMonths, 
  acceleratedMonths, 
  monthsSaved,
  baselineLatestDate,
  interestSaved,
  currencySymbol
}: TimelineMetricsProps) => {
  console.log('TimelineMetrics rendered with:', {
    baselineMonths,
    acceleratedMonths,
    monthsSaved,
    baselineLatestDate: baselineLatestDate.toISOString(),
    interestSaved,
    currencySymbol
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <PiggyBank className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Interest Saved</h3>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total interest saved with your strategy</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="text-2xl font-bold text-green-600">
            {currencySymbol}{interestSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-green-700">Total savings</p>
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
                  <Clock className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Original Term</h3>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Time to pay off debt with minimum payments</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="text-2xl font-bold text-blue-600">
            {baselineMonths} months
          </p>
          <p className="text-sm text-blue-700">Base timeline</p>
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
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-800">Time Saved</h3>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Months saved with your strategy</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="text-2xl font-bold text-purple-600">
            {monthsSaved} months
          </p>
          <p className="text-sm text-purple-700">Faster freedom</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-orange-50 p-4 rounded-lg"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold text-orange-800">Debt-free Date</h3>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>When you'll be debt-free with your strategy</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="text-2xl font-bold text-orange-600">
            {format(baselineLatestDate, 'MMM yyyy')}
          </p>
          <p className="text-sm text-orange-700">Target date</p>
        </motion.div>
      </div>

      {monthsSaved > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-green-600 bg-green-50 p-4 rounded-lg"
        >
          You'll be debt-free {monthsSaved} months sooner and save {currencySymbol}
          {interestSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} in interest!
        </motion.div>
      )}
    </div>
  );
};