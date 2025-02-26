
import { useState } from "react";
import { Coins, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TotalDebtsSectionProps {
  totalDebts: number;
  debts?: Array<{ id: string; name: string; balance: number; }>;
  currencySymbol: string;
}

export const TotalDebtsSection = ({ totalDebts, debts, currencySymbol }: TotalDebtsSectionProps) => {
  const [isDebtListExpanded, setIsDebtListExpanded] = useState(false);

  return (
    <div className="p-6 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
            <Coins className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Total Debts
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-help">
                    <Info className="w-4 h-4 text-gray-400 ml-2" />
                  </TooltipTrigger>
                  <TooltipContent 
                    side="right" 
                    className="z-[60] max-w-[300px] p-4 bg-white border-gray-200 shadow-lg"
                  >
                    Your total number of active debts.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
          </div>
        </div>
        <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalDebts}</span>
      </div>
      <Button 
        variant="ghost" 
        className="w-full mt-2 flex items-center justify-between hover:bg-purple-50 dark:hover:bg-purple-900/20"
        onClick={() => setIsDebtListExpanded(!isDebtListExpanded)}
      >
        <span>View Debt List</span>
        {isDebtListExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>
      {isDebtListExpanded && debts && (
        <div className="mt-4 space-y-3">
          {debts.map((debt) => (
            <div key={debt.id} className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{debt.name}</span>
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                {currencySymbol}{debt.balance.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
