
import { Coins, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DebtListSectionProps {
  totalDebts: number;
  debts?: Array<{ id: string; name: string; balance: number }>;
  currencySymbol: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export const DebtListSection = ({
  totalDebts,
  debts,
  currencySymbol,
  isExpanded,
  onToggle
}: DebtListSectionProps) => {
  return (
    <div className="p-3 sm:p-6 bg-white/95 dark:bg-gray-800/95 rounded-xl backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
        <div className="p-2 sm:p-3 rounded-full bg-blue-100 dark:bg-blue-900">
          <Coins className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            Total Debts
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="cursor-help">
                  <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 ml-2" />
                </TooltipTrigger>
                <TooltipContent side="right" className="z-[60] max-w-[300px] p-4 bg-white border-gray-200 shadow-lg">
                  Your total number of active debts.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
        </div>
      </div>
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              Total Active Debts
            </Badge>
          </span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {totalDebts} debts
          </span>
        </div>
        <Button 
          variant="ghost" 
          className="w-full flex items-center justify-between hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm sm:text-base py-2 h-auto" 
          onClick={onToggle}
        >
          <span>View Debt List</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
        {isExpanded && (
          <div className="space-y-2 sm:space-y-3">
            {debts?.map(debt => (
              <div key={debt.id} className="flex items-center justify-between text-xs sm:text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <span className="font-medium">{debt.name}</span>
                </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {currencySymbol}{debt.balance.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
        {!isExpanded && (
          <div className="text-xs sm:text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
            Click to view your complete debt list
          </div>
        )}
      </div>
    </div>
  );
};
