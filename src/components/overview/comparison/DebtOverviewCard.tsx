
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Calendar, Info, Wallet } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { PaymentEfficiencySection } from "./PaymentEfficiencySection";
import { DebtListSection } from "./DebtListSection";

interface DebtOverviewCardProps {
  comparison: {
    baselineYears: number;
    baselineMonths: number;
    originalPayoffDate: Date;
    originalTotalInterest: number;
    principalPercentage: number;
    interestPercentage: number;
  };
  totalDebts: number;
  debts?: Array<{ id: string; name: string; balance: number }>;
  currencySymbol: string;
}

export const DebtOverviewCard = ({ comparison, totalDebts, debts, currencySymbol }: DebtOverviewCardProps) => {
  const [isDebtListExpanded, setIsDebtListExpanded] = useState(false);

  return (
    <Card className="bg-gradient-to-br from-gray-50 to-blue-50 border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl">
      <CardHeader className="pb-2 p-6">
        <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold">
          <div className="p-3 rounded-full bg-blue-100">
            <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
          </div>
          <span className="bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent leading-tight">
            Your Debt Overview
          </span>
          <HoverCard>
            <HoverCardTrigger asChild>
              <button className="cursor-help p-2">
                <Info className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-4 bg-white/95 backdrop-blur-sm border-gray-200 shadow-lg">
              <div className="space-y-2">
                <h4 className="font-semibold text-base">Current Debt Situation</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  View your current debt situation and payment efficiency
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="p-6 bg-white/95 dark:bg-gray-800/95 rounded-xl backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col space-y-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="p-3 sm:p-4 rounded-full bg-blue-100 dark:bg-blue-900 shrink-0">
                <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
                  Debt-Free Date
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="cursor-help p-1">
                        <Info className="w-5 h-5 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="z-[60] max-w-[300px] p-4 bg-white/95 backdrop-blur-sm border-gray-200 shadow-lg">
                        <p className="text-sm font-medium">The date you'll become debt-free if you continue making only minimum payments.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h3>
                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  Based on minimum payments only, you will be paying debts for {comparison.baselineYears} {comparison.baselineYears === 1 ? 'year' : 'years'}
                  {comparison.baselineMonths > 0 && ` and ${comparison.baselineMonths} ${comparison.baselineMonths === 1 ? 'month' : 'months'}`}
                </div>
              </div>
            </div>
            <div className="text-right mt-4">
              <span className="text-xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                {comparison.originalPayoffDate.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        <PaymentEfficiencySection 
          principalPercentage={comparison.principalPercentage}
          interestPercentage={comparison.interestPercentage}
          totalInterest={comparison.originalTotalInterest}
          currencySymbol={currencySymbol}
        />

        <DebtListSection
          totalDebts={totalDebts}
          debts={debts}
          currencySymbol={currencySymbol}
          isExpanded={isDebtListExpanded}
          onToggle={() => setIsDebtListExpanded(!isDebtListExpanded)}
        />
      </CardContent>
    </Card>
  );
};
