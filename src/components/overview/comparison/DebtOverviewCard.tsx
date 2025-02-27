
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info, DollarSign, Calendar, CircleDot } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900">
            <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-xl font-bold">
            Your Debt Overview
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-gray-400 inline ml-2 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Current overview of your debt situation and payment efficiency</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Debt-Free Date Section */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-blue-200 dark:bg-blue-800">
              <Calendar className="w-5 h-5 text-blue-700 dark:text-blue-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                Debt-Free Date
                <Badge variant="secondary" className="text-xs">Based on minimum payments</Badge>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {comparison.baselineYears > 0 && `${comparison.baselineYears} ${comparison.baselineYears === 1 ? 'year' : 'years'}`}
                {comparison.baselineMonths > 0 && comparison.baselineYears > 0 && ' and '}
                {comparison.baselineMonths > 0 && `${comparison.baselineMonths} ${comparison.baselineMonths === 1 ? 'month' : 'months'}`}
                {' '}until debt freedom
              </p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-bold text-blue-700 dark:text-blue-300"
              >
                {comparison.originalPayoffDate.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Payment Efficiency Section */}
        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-full bg-purple-200 dark:bg-purple-800">
              <CircleDot className="w-5 h-5 text-purple-700 dark:text-purple-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Payment Efficiency</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                How your payments are allocated
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Principal</span>
              <span className="font-semibold">{comparison.principalPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${comparison.principalPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-green-500"
              />
            </div>
            <div className="flex justify-between text-sm">
              <span>Interest</span>
              <span className="font-semibold text-red-500">{comparison.interestPercentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Total Debts Section */}
        <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Total Active Debts</h3>
              <Badge variant="secondary">{totalDebts} debts</Badge>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              View All
            </Button>
          </div>
          {debts && debts.length > 0 && (
            <div className="space-y-2">
              {debts.slice(0, 3).map(debt => (
                <div key={debt.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{debt.name}</span>
                  <span className="font-medium">{currencySymbol}{debt.balance.toLocaleString()}</span>
                </div>
              ))}
              {debts.length > 3 && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  And {debts.length - 3} more debts...
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
