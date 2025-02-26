
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Info } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { OptimizedDebtFreeDate } from "./OptimizedDebtFreeDate";
import { OptimizedInterest } from "./OptimizedInterest";
import { SavingsSection } from "./SavingsSection";

interface OptimizedPlanCardProps {
  comparison: {
    optimizedPayoffDate: Date;
    optimizedTotalInterest: number;
    timeSaved: { years: number; months: number; };
    moneySaved: number;
  };
  currencySymbol: string;
}

export const OptimizedPlanCard = ({ comparison, currencySymbol }: OptimizedPlanCardProps) => {
  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-0 shadow-lg h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Award className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-emerald-500" />
          <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
            What Debtfreeo Can Save You
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="cursor-help">
                <Info className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
              </TooltipTrigger>
              <TooltipContent 
                side="right" 
                className="z-[60] max-w-[300px] p-4 bg-white border-gray-200 shadow-lg"
              >
                See how much you could save with our optimized strategy.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="grid gap-3 sm:gap-4">
          <OptimizedDebtFreeDate comparison={comparison} />
          <OptimizedInterest 
            comparison={comparison}
            currencySymbol={currencySymbol}
          />
          <SavingsSection comparison={comparison} />
        </div>
      </CardContent>
    </Card>
  );
};
