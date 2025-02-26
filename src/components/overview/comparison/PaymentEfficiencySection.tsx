
import { Percent, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PaymentEfficiencyProps {
  principalPercentage: number;
  interestPercentage: number;
  totalInterest: number;
  currencySymbol: string;
}

export const PaymentEfficiencySection = ({
  principalPercentage,
  interestPercentage,
  totalInterest,
  currencySymbol
}: PaymentEfficiencyProps) => {
  return (
    <div className="p-3 sm:p-6 bg-white/95 dark:bg-gray-800/95 rounded-xl backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col space-y-3">
        <div className="flex items-start sm:items-center gap-2 sm:gap-4">
          <div className="p-2 sm:p-3 rounded-full bg-blue-100 dark:bg-blue-900 shrink-0">
            <Percent className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-base sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              Payment Efficiency
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-help">
                    <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="z-[60] max-w-[300px] p-4 bg-white border-gray-200 shadow-lg">
                    Shows how your payments are split between principal and interest.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <div className="text-xs sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mt-1 sm:mt-2">
              {currencySymbol}{Math.ceil(totalInterest).toLocaleString()} of your payments go towards interest.
            </div>
          </div>
        </div>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-1 sm:mb-2">
            <span className="text-gray-600 dark:text-gray-300">
              Principal: <span className="font-semibold text-emerald-600">{principalPercentage.toFixed(1)}%</span>
            </span>
            <span className="text-gray-600 dark:text-gray-300">
              Interest: <span className="font-semibold text-red-600">{interestPercentage.toFixed(1)}%</span>
            </span>
          </div>
          <div className="w-full h-2.5 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full flex">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${principalPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-emerald-500"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${interestPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-red-500"
              />
            </div>
          </div>
          <div className="text-xs sm:text-sm text-center text-gray-500 dark:text-gray-400">
            {currencySymbol}{Math.ceil(totalInterest).toLocaleString()} goes to interest payments.
          </div>
        </div>
      </div>
    </div>
  );
};
