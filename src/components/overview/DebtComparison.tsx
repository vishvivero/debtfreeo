
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Coins, Calendar, ArrowDown, Percent, DollarSign, Award,
  Info, ArrowRight, Plane, Smartphone, Palmtree,
  ChevronDown, ChevronUp, Target, PiggyBank, TrendingUp, CheckCircle2
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
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
        <Card className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900/20 dark:to-blue-900/20 border-0 shadow-lg h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              <Calendar className="w-6 h-6 text-gray-500" />
              Your Debt Overview
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-help">
                    <Info className="w-4 h-4 text-gray-400" />
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
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              {/* Debt-Free Date */}
              <div className="p-6 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                      <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Debt-Free Date
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="cursor-help">
                              <Info className="w-4 h-4 text-gray-400 ml-2" />
                            </TooltipTrigger>
                            <TooltipContent 
                              side="right" 
                              className="z-[60] max-w-[300px] p-4 bg-white border-gray-200 shadow-lg"
                            >
                              The date you'll become debt-free if you continue making only minimum payments.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Based on minimum payments only, you will be paying debts for {comparison.baselineYears} {comparison.baselineYears === 1 ? 'year' : 'years'}
                        {comparison.baselineMonths > 0 && ` and ${comparison.baselineMonths} ${comparison.baselineMonths === 1 ? 'month' : 'months'}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {comparison.originalPayoffDate.toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Efficiency */}
              <div className="p-6 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900">
                    <Percent className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">Payment Efficiency</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="cursor-help">
                          <Info className="w-4 h-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent 
                          side="right" 
                          className="z-[60] max-w-[300px] p-4 bg-white border-gray-200 shadow-lg"
                        >
                          Shows how your payments are split between principal and interest.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-300">
                        Principal: <span className="font-semibold text-emerald-600">{comparison.principalPercentage.toFixed(1)}%</span>
                      </span>
                      <span className="text-gray-600 dark:text-gray-300">
                        Interest: <span className="font-semibold text-red-600">{comparison.interestPercentage.toFixed(1)}%</span>
                      </span>
                    </div>
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
                  <div className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
                    {currencySymbol}{comparison.originalTotalInterest.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })} goes to interest
                  </div>
                </div>
              </div>

              {/* Total Debts */}
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
                  <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">{comparison.totalDebts}</span>
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full mt-2 flex items-center justify-between hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  onClick={() => setIsDebtListExpanded(!isDebtListExpanded)}
                >
                  <span>View Debt List</span>
                  {isDebtListExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                {isDebtListExpanded && (
                  <div className="mt-4 space-y-3">
                    {debts?.map((debt) => (
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
            </div>
          </CardContent>
        </Card>

        {/* Optimized Plan Card */}
        <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-0 shadow-lg h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-6 h-6 text-emerald-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                What Debtfreeo Can Save You
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-help">
                    <Info className="w-4 h-4 text-emerald-400" />
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
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              {/* Optimized Debt-Free Date */}
              <div className="p-6 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900">
                      <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Optimized Debt-Free Date
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="cursor-help">
                              <Info className="w-4 h-4 text-gray-400 ml-2" />
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
                      <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-2">
                        {comparison.moneySaved > 0 && `Save ${currencySymbol}${comparison.moneySaved.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        })} in interest!`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {comparison.optimizedPayoffDate.toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Interest (Optimized) */}
              <div className="p-6 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900">
                      <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      Total Interest (Optimized)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="cursor-help">
                            <Info className="w-4 h-4 text-gray-400 ml-2" />
                          </TooltipTrigger>
                          <TooltipContent 
                            side="right" 
                            className="z-[60] max-w-[300px] p-4 bg-white border-gray-200 shadow-lg"
                          >
                            The total interest you'll pay with our optimized strategy.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {currencySymbol}{comparison.optimizedTotalInterest.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                  </span>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <ArrowDown className="w-5 h-5" />
                    <span className="font-medium">
                      Save {currencySymbol}{comparison.moneySaved.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      })} in interest!
                    </span>
                  </div>
                </div>
              </div>

              {/* Savings Section */}
              <div className="p-6 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm shadow-sm">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  With your savings, you could get:
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="cursor-help">
                        <Info className="w-4 h-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent 
                        side="right" 
                        className="z-[60] max-w-[300px] p-4 bg-white border-gray-200 shadow-lg"
                      >
                        Real-world examples of what you could do with your savings.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h4>
                <div className="space-y-3">
                  <motion.div 
                    className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Plane className="w-5 h-5 text-emerald-600 dark:text-emerald-400 transform -rotate-45" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {Math.floor(comparison.moneySaved / 1000)} international trips
                    </span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {Math.floor(comparison.moneySaved / 800)} premium smartphones
                    </span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Palmtree className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      a dream family vacation
                    </span>
                  </motion.div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-8">
        <Button
          onClick={() => navigate("/strategy")}
          className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-8 py-3 rounded-full flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Start Optimizing Your Debt Now
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </motion.div>
  );
};
