
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Target, Info, DollarSign, Plane, Smartphone, Palmtree } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface OptimizedPlanCardProps {
  comparison: {
    timeSaved: {
      years: number;
      months: number;
    };
    optimizedPayoffDate: Date;
    originalTotalInterest: number;
    optimizedTotalInterest: number;
    moneySaved: number;
  };
  currencySymbol: string;
}

export const OptimizedPlanCard = ({ comparison, currencySymbol }: OptimizedPlanCardProps) => {
  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-emerald-50 dark:bg-emerald-900">
            <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="text-xl font-bold">
            What Debtfreeo Can Save You
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-gray-400 inline ml-2 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>See how much you could save with our optimized strategy</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Optimized Debt-Free Date Section */}
        <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-emerald-200 dark:bg-emerald-800">
              <Target className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                Optimized Debt-Free Date
                <Badge variant="secondary" className="text-xs">
                  {comparison.timeSaved.years > 0 ? `${comparison.timeSaved.years}y` : ''} 
                  {comparison.timeSaved.months > 0 ? ` ${comparison.timeSaved.months}m` : ''} sooner!
                </Badge>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Become debt-free earlier with our optimized plan
              </p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-bold text-emerald-700 dark:text-emerald-300"
              >
                {comparison.optimizedPayoffDate.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Interest Savings Section */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-full bg-blue-200 dark:bg-blue-800">
              <DollarSign className="w-5 h-5 text-blue-700 dark:text-blue-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Interest Savings</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total interest saved with our plan
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Original Interest</span>
              <span className="text-red-500 font-semibold">
                {currencySymbol}{Math.ceil(comparison.originalTotalInterest).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Optimized Interest</span>
              <span className="text-emerald-500 font-semibold">
                {currencySymbol}{Math.ceil(comparison.optimizedTotalInterest).toLocaleString()}
              </span>
            </div>
            <div className="h-px bg-gray-200 dark:bg-gray-700" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Savings</span>
              <span className="text-lg font-bold text-emerald-600">
                {currencySymbol}{Math.ceil(comparison.moneySaved).toLocaleString()}
              </span>
            </div>
            <div className="text-center text-sm text-emerald-600 font-medium">
              Save {((comparison.moneySaved / comparison.originalTotalInterest) * 100).toFixed(1)}% on interest!
            </div>
          </motion.div>
        </div>

        {/* What You Could Do Section */}
        <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl">
          <h3 className="font-semibold mb-4">With your savings, you could get</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-emerald-500" />
                <span className="text-sm">International Trips</span>
              </div>
              <span className="font-medium text-sm">
                {Math.floor(comparison.moneySaved / 1000)} trips
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <span className="text-sm">Premium Smartphones</span>
              </div>
              <span className="font-medium text-sm">
                {Math.floor(comparison.moneySaved / 800)} phones
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palmtree className="w-4 h-4 text-emerald-500" />
                <span className="text-sm">Dream Family Vacation</span>
              </div>
              <span className="font-medium text-sm">1 trip</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
