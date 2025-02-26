
import { Calendar, Info } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DebtFreeDateProps {
  comparison: {
    originalPayoffDate: Date;
    baselineYears: number;
    baselineMonths: number;
  };
}

export const DebtFreeDate = ({ comparison }: DebtFreeDateProps) => {
  return (
    <div className="p-4 sm:p-6 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm shadow-sm">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-2 sm:p-3 rounded-full bg-blue-100 dark:bg-blue-900">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <span className="text-base sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
              Debt-Free Date
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-help">
                    <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 ml-2" />
                  </TooltipTrigger>
                  <TooltipContent 
                    side="right" 
                    className="z-[60] max-w-[300px] p-4 bg-white border-gray-200 shadow-lg"
                  >
                    The date you'll become debt-free if you continue making only minimum payments.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
              Based on minimum payments only, you will be paying debts for {comparison.baselineYears} {comparison.baselineYears === 1 ? 'year' : 'years'}
              {comparison.baselineMonths > 0 && ` and ${comparison.baselineMonths} ${comparison.baselineMonths === 1 ? 'month' : 'months'}`}
            </div>
          </div>
        </div>
        <div className="text-center w-full">
          <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
            {comparison.originalPayoffDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric'
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
