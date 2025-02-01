import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Coins, Calendar, ArrowDown, Percent, DollarSign, Award,
  Info, ArrowRight, Plane, Smartphone, Palmtree,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { useDebts } from "@/hooks/use-debts";
import { useOneTimeFunding } from "@/hooks/use-one-time-funding";
import { strategies } from "@/lib/strategies";
import { calculateTimelineData } from "@/components/debt/timeline/TimelineCalculator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const DebtComparison = () => {
  const { debts, profile } = useDebts();
  const { oneTimeFundings } = useOneTimeFunding();
  const navigate = useNavigate();
  const currencySymbol = profile?.preferred_currency || "£";
  const [isDebtListExpanded, setIsDebtListExpanded] = useState(false);

  const calculateComparison = () => {
    if (!debts || debts.length === 0 || !profile?.monthly_payment) {
      return {
        totalDebts: 0,
        originalPayoffDate: new Date(),
        originalTotalInterest: 0,
        optimizedPayoffDate: new Date(),
        optimizedTotalInterest: 0,
        timeSaved: { years: 0, months: 0 },
        moneySaved: 0,
        baselineYears: 0,
        baselineMonths: 0,
        principalPercentage: 0,
        interestPercentage: 0
      };
    }

    console.log('Calculating comparison with one-time fundings:', oneTimeFundings);

    const selectedStrategy = strategies.find(s => s.id === profile.selected_strategy) || strategies[0];
    
    // Calculate minimum payments total
    const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
    
    // Get timeline data
    const timelineData = calculateTimelineData(
      debts,
      profile.monthly_payment,
      selectedStrategy,
      oneTimeFundings
    );

    // Get the last data point for final balances and interest
    const lastDataPoint = timelineData[timelineData.length - 1];
    
    // Find when accelerated balance reaches 0
    const acceleratedPayoffPoint = timelineData.find(d => d.acceleratedBalance <= 0);
    const optimizedPayoffDate = acceleratedPayoffPoint 
      ? new Date(acceleratedPayoffPoint.date)
      : new Date(lastDataPoint.date);

    // Calculate payment efficiency from original timeline
    const totalPayment = lastDataPoint.baselineInterest + debts.reduce((sum, debt) => sum + debt.balance, 0);
    const interestPercentage = (lastDataPoint.baselineInterest / totalPayment) * 100;
    const principalPercentage = 100 - interestPercentage;

    // Calculate months for baseline scenario
    const baselineMonths = timelineData.length;
    const baselineYears = Math.floor(baselineMonths / 12);
    const remainingMonths = baselineMonths % 12;

    return {
      totalDebts: debts.length,
      originalPayoffDate: new Date(lastDataPoint.date),
      originalTotalInterest: lastDataPoint.baselineInterest,
      optimizedPayoffDate,
      optimizedTotalInterest: lastDataPoint.acceleratedInterest,
      moneySaved: lastDataPoint.baselineInterest - lastDataPoint.acceleratedInterest,
      baselineYears,
      baselineMonths: remainingMonths,
      principalPercentage,
      interestPercentage
    };
  };

  const comparison = calculateComparison();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Plan Card */}
        <Card className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900/20 dark:to-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <Calendar className="w-5 h-5 text-gray-500" />
              How Does Your Debt Look Now?
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent 
                    side="right" 
                    className="z-[60] bg-white border-gray-200 shadow-lg"
                  >
                    <p>This shows your current debt situation without any optimizations</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              {/* Current Debt-Free Date */}
              <div className="p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                        Debt-Free Date
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400 ml-2" />
                            </TooltipTrigger>
                            <TooltipContent 
                              side="right" 
                              className="z-[60] bg-white border-gray-200 shadow-lg"
                            >
                              <p>Based on minimum payments only (baseline scenario)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                      <div className="text-sm text-gray-500">
                        Based on minimum payments only, you will be paying debts for {comparison.baselineYears} {comparison.baselineYears === 1 ? 'year' : 'years'}
                        {comparison.baselineMonths > 0 && ` and ${comparison.baselineMonths} ${comparison.baselineMonths === 1 ? 'month' : 'months'}`}
                      </div>
                    </div>
                  </div>
                  <span className="text-lg font-semibold whitespace-nowrap">
                    {comparison.originalPayoffDate.toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Payment Efficiency */}
              <div className="p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Percent className="w-5 h-5 text-gray-500" />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-2">
                          <span className="text-gray-600 dark:text-gray-300">Payment Efficiency</span>
                          <Info className="w-4 h-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent 
                          side="right" 
                          className="z-[60] bg-white border-gray-200 shadow-lg" 
                          sideOffset={5}
                        >
                          <p>How your payments are split between reducing debt (principal) and paying interest</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        Principal: <span className="font-medium text-emerald-600">{comparison.principalPercentage.toFixed(1)}%</span>
                      </span>
                      <span className="text-gray-600 dark:text-gray-300">
                        Interest: <span className="font-medium text-red-600">{comparison.interestPercentage.toFixed(1)}%</span>
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full flex">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${comparison.principalPercentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-emerald-500"
                        />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${comparison.interestPercentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-red-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-center text-gray-500">
                  {currencySymbol}{comparison.originalTotalInterest.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  })} goes to interest
                </div>
              </div>

              {/* Total Debts */}
              <div className="p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Coins className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      Total Debts
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-gray-400 ml-2" />
                          </TooltipTrigger>
                          <TooltipContent 
                            side="right" 
                            className="z-[60] bg-white border-gray-200 shadow-lg"
                          >
                            <p>The total number of active debts in your portfolio</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </span>
                  </div>
                  <span className="text-2xl font-bold">{comparison.totalDebts}</span>
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full mt-2 flex items-center justify-between"
                  onClick={() => setIsDebtListExpanded(!isDebtListExpanded)}
                >
                  <span>View Debt List</span>
                  {isDebtListExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                {isDebtListExpanded && (
                  <div className="mt-2 space-y-2">
                    {debts?.map((debt, index) => (
                      <div key={debt.id} className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                        <span>{debt.name}</span>
                        <span>{currencySymbol}{debt.balance.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optimized Plan Card */}
        <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <Award className="w-5 h-5" />
              What Debtfreeo Can Save You
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-emerald-400" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="z-[60]">
                    <p>Your potential savings with our optimized debt repayment strategy</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Optimized Debt-Free Date</span>
                      <div className="text-sm text-emerald-600 font-medium">
                        {comparison.moneySaved > 0 && `Save ${currencySymbol}${comparison.moneySaved.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        })} in interest!`}
                      </div>
                    </div>
                  </div>
                  <span className="text-lg font-semibold">
                    {comparison.optimizedPayoffDate.toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    <span className="text-gray-600 dark:text-gray-300">Total Interest (Optimized)</span>
                  </div>
                  <span className="text-xl font-semibold text-emerald-600">
                    {currencySymbol}{comparison.optimizedTotalInterest.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                  </span>
                </div>
                <div className="mt-4 p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <ArrowDown className="w-4 h-4" />
                    <span className="font-medium">
                      Save {currencySymbol}{comparison.moneySaved.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      })} in interest!
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg backdrop-blur-sm">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
                  With your savings, you could get:
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Plane className="w-4 h-4" />
                    <span>{Math.floor(comparison.moneySaved / 1000)} international trips</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Smartphone className="w-4 h-4" />
                    <span>{Math.floor(comparison.moneySaved / 800)} premium smartphones</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Palmtree className="w-4 h-4" />
                    <span>a dream family vacation</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={() => navigate("/strategy")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-full flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Start Optimizing Your Debt Now
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};
