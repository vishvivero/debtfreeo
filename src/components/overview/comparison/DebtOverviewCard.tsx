
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Info } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DebtFreeDate } from "./DebtFreeDate";
import { PaymentEfficiency } from "./PaymentEfficiency";
import { TotalDebtsSection } from "./TotalDebtsSection";

interface DebtOverviewCardProps {
  comparison: {
    totalDebts: number;
    originalPayoffDate: Date;
    originalTotalInterest: number;
    baselineYears: number;
    baselineMonths: number;
    principalPercentage: number;
    interestPercentage: number;
  };
  currencySymbol: string;
  debts?: Array<{ id: string; name: string; balance: number; }>;
}

export const DebtOverviewCard = ({ comparison, currencySymbol, debts }: DebtOverviewCardProps) => {
  return (
    <Card className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900/20 dark:to-blue-900/20 border-0 shadow-lg h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-500" />
          Your Debt Overview
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="cursor-help">
                <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent 
                side="right" 
                className="z-[60] max-w-[300px] p-4 bg-white border-gray-200 shadow-lg"
              >
                A comprehensive view of your current debt situation and how it's structured.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="grid gap-3 sm:gap-4">
          <DebtFreeDate comparison={comparison} />
          <PaymentEfficiency 
            comparison={comparison}
            currencySymbol={currencySymbol}
          />
          <TotalDebtsSection 
            totalDebts={comparison.totalDebts}
            debts={debts}
            currencySymbol={currencySymbol}
          />
        </div>
      </CardContent>
    </Card>
  );
};
