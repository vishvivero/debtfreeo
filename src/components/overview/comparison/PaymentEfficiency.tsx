
import { Percent, Info } from "lucide-react";
import { motion } from "framer-motion";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PaymentEfficiencyProps {
  comparison: {
    principalPercentage: number;
    interestPercentage: number;
    originalTotalInterest: number;
  };
  currencySymbol: string;
}

export const PaymentEfficiency = ({ comparison, currencySymbol }: PaymentEfficiencyProps) => {
  return (
    <div className="p-6 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900">
          <Percent className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">Payment Efficiency</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="cursor-help">
                <Info className="w-4 h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent 
                side="right" 
                className="z-[60] max-w-[300px] p-4 bg-white border-gray-200 shadow-lg"
              >
                Shows how your payments are split between principal and interest.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-300">
              Principal: <span className="font-semibold text-emerald-600">{comparison.principalPercentage.toFixed(1)}%</span>
            </span>
            <span className="text-gray-600 dark:text-gray-300">
              Interest: <span className="font-semibold text-red-600">{comparison.interestPercentage.toFixed(1)}%</span>
            </span>
          </div>
          <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full flex">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${comparison.principalPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-emerald-500"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${comparison.interestPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-red-500"
              />
            </div>
          </div>
        </div>
        <div className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
          {currencySymbol}{comparison.originalTotalInterest.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          })} goes to interest
        </div>
      </div>
    </div>
  );
};
