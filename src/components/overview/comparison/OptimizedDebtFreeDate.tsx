
import { Calendar, Info } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface OptimizedDebtFreeDateProps {
  comparison: {
    optimizedPayoffDate: Date;
    timeSaved: { years: number; months: number; };
  };
}

export const OptimizedDebtFreeDate = ({ comparison }: OptimizedDebtFreeDateProps) => {
  return (
    <div className="p-4 sm:p-6 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 sm:p-3 rounded-full bg-emerald-100 dark:bg-emerald-900">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <span className="text-base sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
              Optimized Debt-Free Date
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-help">
                    <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 ml-2" />
                  </TooltipTrigger>
                  <TooltipContent 
                    side="right" 
                    className="z-[60] max-w-[300px] p-4 bg-white border-gray-200 shadow-lg"
                  >
                    Your projected debt-free date with our optimized strategy.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <div className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-2">
              {comparison.timeSaved.years > 0 && `Save ${comparison.timeSaved.years} ${comparison.timeSaved.years === 1 ? 'year' : 'years'}`}
              {comparison.timeSaved.months > 0 && comparison.timeSaved.years > 0 && ' and '}
              {comparison.timeSaved.months > 0 && `${comparison.timeSaved.months} ${comparison.timeSaved.months === 1 ? 'month' : 'months'}`}
              {(comparison.timeSaved.years > 0 || comparison.timeSaved.months > 0) && ' with our strategy!'}
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {comparison.optimizedPayoffDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric'
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
