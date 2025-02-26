import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Target, Info, DollarSign, Plane, Smartphone, Palmtree } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

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
    <Card className="bg-gradient-to-br from-gray-50 to-emerald-50 border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl">
      <CardHeader className="pb-2 p-6">
        <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold">
          <div className="p-3 rounded-full bg-emerald-100">
            <Target className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
          </div>
          <span className="bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent leading-tight">
            What Debtfreeo Can Save You
          </span>
          <HoverCard>
            <HoverCardTrigger asChild>
              <button className="cursor-help p-2">
                <Info className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-4 bg-white/95 backdrop-blur-sm border-gray-200 shadow-lg">
              <div className="space-y-2">
                <h4 className="font-semibold text-base">Optimized Strategy</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  See how much you could save with our optimized payment strategy
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Time Savings Section */}
        <div className="p-6 bg-white/95 dark:bg-gray-800/95 rounded-xl backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col space-y-3">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-full bg-emerald-100 dark:bg-emerald-900 shrink-0">
                <Target className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
                  Optimized Debt-Free Date
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="cursor-help p-1">
                        <Info className="w-5 h-5 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="z-[60] max-w-[300px] p-4 bg-white/95 backdrop-blur-sm border-gray-200 shadow-lg">
                        Your projected debt-free date with our optimized strategy.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h3>
                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  {comparison.timeSaved.years > 0 && <>
                    Become debt-free{' '}
                    {comparison.timeSaved.years} {comparison.timeSaved.years === 1 ? 'year' : 'years'}
                    {comparison.timeSaved.months > 0 && ' and '}
                    {comparison.timeSaved.months > 0 && <>{comparison.timeSaved.months} {comparison.timeSaved.months === 1 ? 'month' : 'months'}</>}
                    {' '}sooner with our optimized plan!
                  </>}
                  {!comparison.timeSaved.years && comparison.timeSaved.months > 0 && <>
                    Become debt-free{' '}
                    {comparison.timeSaved.months} {comparison.timeSaved.months === 1 ? 'month' : 'months'}{' '}
                    sooner with our optimized plan!
                  </>}
                  {!comparison.timeSaved.years && !comparison.timeSaved.months && <>
                    Start your journey to become debt-free today!
                  </>}
                </div>
              </div>
            </div>
            <span className="text-base sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {comparison.optimizedPayoffDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Interest Savings Section */}
        <div className="p-6 bg-white/95 dark:bg-gray-800/95 rounded-xl backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col space-y-3">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-full bg-emerald-100 dark:bg-emerald-900 shrink-0">
                <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  Total Interest (Optimized)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="cursor-help">
                        <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="z-[60] max-w-[300px] p-4 bg-white border-gray-200 shadow-lg">
                        The total interest you'll pay with our optimized strategy.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
                <div className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 mt-1 sm:mt-2">
                  Our optimized plan helps you save{' '}
                  {currencySymbol}{Math.ceil(comparison.moneySaved).toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  })}{' '}
                  in total interest.
                </div>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm mb-1 sm:mb-2">
                <span className="text-gray-600 dark:text-gray-300">
                  Original Interest: <span className="font-semibold text-red-600">{currencySymbol}{Math.ceil(comparison.originalTotalInterest).toLocaleString()}</span>
                </span>
                <span className="text-gray-600 dark:text-gray-300">
                  Optimized Interest: <span className="font-semibold text-emerald-600">{currencySymbol}{Math.ceil(comparison.optimizedTotalInterest).toLocaleString()}</span>
                </span>
              </div>
              <div className="w-full h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full flex">
                  <motion.div initial={{
                    width: 0
                  }} animate={{
                    width: `${comparison.optimizedTotalInterest / comparison.originalTotalInterest * 100}%`
                  }} transition={{
                    duration: 1,
                    ease: "easeOut"
                  }} className="h-full bg-emerald-500" />
                  <motion.div initial={{
                    width: 0
                  }} animate={{
                    width: `${(comparison.originalTotalInterest - comparison.optimizedTotalInterest) / comparison.originalTotalInterest * 100}%`
                  }} transition={{
                    duration: 1,
                    ease: "easeOut"
                  }} className="h-full bg-red-500" />
                </div>
              </div>
              <div className="text-xs sm:text-sm text-center text-gray-500 dark:text-gray-400">
                You save {(comparison.moneySaved / comparison.originalTotalInterest * 100).toFixed(1)}% on interest payments
              </div>
            </div>

          </div>
        </div>

        {/* What You Could Do Section */}
        <div className="p-6 bg-white/95 dark:bg-gray-800/95 rounded-xl backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900">
              <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">With your savings, you could get</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="z-[60] max-w-[300px] p-4 bg-white border-gray-200 shadow-lg">
                    Real-world examples of what you could do with your savings.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Plane className="w-4 h-4 text-emerald-600" /> International Trips
                </span>
                <span className="font-semibold text-emerald-600">
                  {Math.floor(comparison.moneySaved / 1000)} trips
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" /> Premium Smartphones
                </span>
                <span className="font-semibold text-emerald-600">
                  {Math.floor(comparison.moneySaved / 800)} phones
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Palmtree className="w-4 h-4 text-emerald-600" /> Dream Family Vacation
                </span>
                <span className="font-semibold text-emerald-600">
                  1 trip
                </span>
              </div>
            </div>
            <div className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
              Make your savings work for you!
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
