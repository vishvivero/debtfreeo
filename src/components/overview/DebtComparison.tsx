
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Calendar, ArrowDown, Percent, DollarSign, Award, Info, ArrowRight, Plane, Smartphone, Palmtree, ChevronDown, ChevronUp, Target, PiggyBank, TrendingUp, CheckCircle2 } from "lucide-react";
import { useDebts } from "@/hooks/use-debts";
import { useOneTimeFunding } from "@/hooks/use-one-time-funding";
import { strategies } from "@/lib/strategies";
import { calculateTimelineData } from "@/components/debt/timeline/TimelineCalculator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { InterestCalculator } from "@/lib/services/calculations/InterestCalculator";

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
        timeSaved: {
          years: 0,
          months: 0
        },
        moneySaved: 0,
        baselineYears: 0,
        baselineMonths: 0,
        principalPercentage: 0,
        interestPercentage: 0,
        monthlyInterestCost: 0
      };
    }

    // Calculate current monthly interest correctly
    const monthlyInterestCost = debts.reduce((total, debt) => {
      if (debt.status === 'active') {  // Only include active debts
        const monthlyRate = debt.interest_rate / 1200; // Convert annual rate to monthly decimal
        const monthlyInterest = debt.balance * monthlyRate;
        console.log(`Monthly interest for ${debt.name}:`, {
          balance: debt.balance,
          rate: debt.interest_rate,
          monthlyInterest: monthlyInterest
        });
        return total + monthlyInterest;
      }
      return total;
    }, 0);

    console.log('Monthly interest calculation:', {
      debts: debts.length,
      totalMonthlyInterest: monthlyInterestCost
    });

    const selectedStrategy = strategies.find(s => s.id === profile.selected_strategy) || strategies[0];
    const timelineData = calculateTimelineData(debts, profile.monthly_payment, selectedStrategy, oneTimeFundings);
    const lastDataPoint = timelineData[timelineData.length - 1];
    const acceleratedPayoffPoint = timelineData.find(d => d.acceleratedBalance <= 0);
    const optimizedPayoffDate = acceleratedPayoffPoint ? new Date(acceleratedPayoffPoint.date) : new Date(lastDataPoint.date);
    const totalPayment = lastDataPoint.baselineInterest + debts.reduce((sum, debt) => sum + debt.balance, 0);
    const interestPercentage = lastDataPoint.baselineInterest / totalPayment * 100;
    const principalPercentage = 100 - interestPercentage;
    const baselineMonths = timelineData.length;
    const baselineYears = Math.floor(baselineMonths / 12);
    const remainingMonths = baselineMonths % 12;
    const totalBaselineMonths = baselineMonths;
    const totalAcceleratedMonths = timelineData.find(d => d.acceleratedBalance <= 0) ? timelineData.findIndex(d => d.acceleratedBalance <= 0) : baselineMonths;
    const monthsSaved = Math.max(0, totalBaselineMonths - totalAcceleratedMonths);
    const yearsSaved = Math.floor(monthsSaved / 12);
    const remainingMonthsSaved = monthsSaved % 12;

    return {
      totalDebts: debts.length,
      originalPayoffDate: new Date(lastDataPoint.date),
      originalTotalInterest: lastDataPoint.baselineInterest,
      optimizedPayoffDate,
      optimizedTotalInterest: lastDataPoint.acceleratedInterest,
      timeSaved: {
        years: yearsSaved,
        months: remainingMonthsSaved
      },
      moneySaved: lastDataPoint.baselineInterest - lastDataPoint.acceleratedInterest,
      baselineYears,
      baselineMonths: remainingMonths,
      principalPercentage,
      interestPercentage,
      monthlyInterestCost: Math.round(monthlyInterestCost * 100) / 100 // Round to 2 decimal places
    };
  };

  const comparison = calculateComparison();
  const totalMonthlyInterest = debts?.reduce((total, debt) => {
    if (debt.status === 'active') {
      const monthlyInterest = InterestCalculator.calculateMonthlyInterest(debt.balance, debt.interest_rate);
      console.log(`Monthly interest for ${debt.name}:`, {
        balance: debt.balance,
        rate: debt.interest_rate,
        monthlyInterest
      });
      return total + monthlyInterest;
    }
    return total;
  }, 0) || 0;

  console.log('Monthly interest calculation:', {
    debts: debts?.length,
    totalMonthlyInterest
  });

  const renderActionableInsights = () => {
    if (!comparison || !debts?.length) return null;

    if (debts.length === 1) {
      const debt = debts[0];
      const monthlyInterest = InterestCalculator.calculateMonthlyInterest(debt.balance, debt.interest_rate);

      return (
        <div className="mt-6 space-y-6">
          <h3 className="text-2xl font-bold text-gray-900">Getting Started with Your Debt-Free Journey</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4 bg-white/50 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-emerald-100">
                  <Target className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">Understanding Your Debt</h4>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <button>
                          <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                        </button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 bg-white border-gray-200 shadow-lg z-50">
                        <div className="space-y-2">
                          <h5 className="font-semibold text-sm">Monthly Interest Explained</h5>
                          <p className="text-sm text-muted-foreground">
                            Monthly interest is calculated based on your current balance and APR. This shows how much you're paying just in interest each month before any principal reduction.
                          </p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Monthly Interest: {currencySymbol}{monthlyInterest.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    This is what your debt costs you each month in interest
                  </p>
                </div>
              </div>
            </Card>
            
            {/* ... keep existing code (other cards in the grid) */}
          </div>
        </div>
      );
    }

    const highestInterestDebt = [...debts].sort((a, b) => b.interest_rate - a.interest_rate)[0];
    const lowestBalance = [...debts].sort((a, b) => a.balance - b.balance)[0];

    return (
      <div className="mt-6 space-y-6">
        <h3 className="text-2xl font-bold text-gray-900">Action Plan</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4 bg-white/50 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-green-100">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">Priority Focus</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="cursor-help">
                        <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="z-[60] max-w-[300px] p-4 bg-white border-gray-200 shadow-lg">
                        This debt has the highest interest rate and should be prioritized to minimize interest costs.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Focus on {highestInterestDebt.name} with {highestInterestDebt.interest_rate}% APR
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Monthly Interest: {currencySymbol}{totalMonthlyInterest.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  This is what your debt costs you monthly
                </p>
              </div>
            </div>
          </Card>

          {/* ... keep existing code (other cards in grid) */}
        </div>
      </div>
    );
  };

  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.5
  }} className="space-y-4 sm:space-y-6 px-2 sm:px-6 lg:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        {/* Current Plan Card */}
        <Card className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900/20 dark:to-blue-900/20 border-0 shadow-lg h-full">
          <CardHeader className="pb-2 p-3 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-500" />
              Your Debt Overview
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-help">
                    <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="z-[60] max-w-[300px] p-4 bg-white border-gray-200 shadow-lg">
                    A comprehensive view of your current debt situation and how it's structured.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-6 p-3 sm:p-6">
            <div className="grid gap-3 sm:gap-4">
              {/* Debt-Free Date */}
              <div className="p-3 sm:p-6 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm shadow-sm">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 rounded-full bg-blue-100 dark:bg-blue-900 shrink-0">
                      <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        Debt-Free Date
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="cursor-help">
                              <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="z-[60] max-w-[300px] p-4 bg-white border-gray-200 shadow-lg">
                              The date you'll become debt-free if you continue making only minimum payments.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                        Based on minimum payments only, you will be paying debts for {comparison.baselineYears} {comparison.baselineYears === 1 ? 'year' : 'years'}
                        {comparison.baselineMonths > 0 && ` and ${comparison.baselineMonths} ${comparison.baselineMonths === 1 ? 'month' : 'months'}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {comparison.originalPayoffDate.toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Efficiency */}
              <div className="p-3 sm:p-6 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm shadow-sm">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 rounded-full bg-emerald-100 dark:bg-emerald-900 shrink-0">
                      <Percent className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        Payment Efficiency
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="cursor-help">
                              <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="z-[60] max-w-[300px] p-4 bg-white border-gray-200 shadow-lg">
                              Shows how your payments are split between principal and interest.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                      <div className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 mt-1 sm:mt-2">
                        {currencySymbol}{Math.ceil(comparison.originalTotalInterest).toLocaleString()} of your payments go towards interest.
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between text-xs sm:text-sm mb-1 sm:mb-2">
                      <span className="text-gray-600 dark:text-gray-300">
                        Principal: <span className="font-semibold text-emerald-600">{comparison.principalPercentage.toFixed(1)}%</span>
                      </span>
                      <span className="text-gray-600 dark:text-gray-300">
                        Interest: <span className="font-semibold text-red-600">{comparison.interestPercentage.toFixed(1)}%</span>
                      </span>
                    </div>
                    <div className="w-full h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
                    <div className="text-xs sm:text-sm text-center text-gray-500 dark:text-gray-400">
                      {currencySymbol}{Math.ceil(comparison.originalTotalInterest).toLocaleString()} goes to interest payments.
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Debts */}
              <div className="p-3 sm:p-6 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 sm:p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                    <Coins className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <Badge variant="outline" className="text-purple-600 border-purple-600">
                        Total Active Debts
                      </Badge>
                    </span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      {comparison.totalDebts} debts
                    </span>
                  </div>
                  <Button variant="ghost" className="w-full flex items-center justify-between hover:bg-purple-50 dark:hover:bg-purple-900/20 text-sm sm:text-base" onClick={() => setIsDebtListExpanded(!isDebtListExpanded)}>
                    <span>View Debt List</span>
                    {isDebtListExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                  {isDebtListExpanded && <div className="space-y-3">
                      {debts?.map(debt => <div key={debt.id} className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                            <span className="font-medium">{debt.name}</span>
                          </span>
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            {currencySymbol}{debt.balance.toLocaleString()}
                          </span>
                        </div>)}
                    </div>}
                  {!isDebtListExpanded && <div className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
                      Click to view your complete debt list
                    </div>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optimized Plan Card */}
        <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-0 shadow-lg h-full">
          <CardHeader className="pb-2 p-3 sm:p-6">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-emerald-500" />
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                What Debtfreeo Can Save You
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-help">
                    <Info className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="z-[60] max-w-[300px] p-4 bg-white border-gray-200 shadow-lg">
                    See how much you could save with our optimized strategy.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-6 p-3 sm:p-6">
            <div className="grid gap-3 sm:gap-4">
              {/* Optimized Debt-Free Date */}
              <div className="p-3 sm:p-6 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm shadow-sm">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 rounded-full bg-emerald-100 dark:bg-emerald-900 shrink-0">
                      <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        Optimized Debt-Free Date
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="cursor-help">
                              <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="z-[60] max-w-[300px] p-4 bg-white border-gray-200 shadow-lg">
                              Your projected debt-free date with our optimized strategy.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                      <div className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 mt-1 sm:mt-2">
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
                  <div className="text-right">
                    <span className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {comparison.optimizedPayoffDate.toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Interest (Optimized) */}
              <div className="p-3 sm:p-6 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm shadow-sm">
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
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${comparison.optimizedTotalInterest / comparison.originalTotalInterest * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-emerald-500"
                        />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(comparison.originalTotalInterest - comparison.optimizedTotalInterest) / comparison.originalTotalInterest * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-red-500"
                        />
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-center text-gray-500 dark:text-gray-400">
                      You save {(comparison.moneySaved / comparison.originalTotalInterest * 100).toFixed(1)}% on interest payments
                    </div>
                  </div>
                  
                </div>
              </div>

              {/* Savings Section */}
              <div className="p-6 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900">
                    <PiggyBank className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">With your savings, you could get</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="cursor-help">
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

              {/* Monthly Interest Cost */}
              <Card className="p-4 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-amber-100">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Monthly Interest Cost</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {currencySymbol}{Math.ceil(comparison.monthlyInterestCost).toLocaleString()} per month
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      This is what your debt costs you monthly
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-4 sm:mt-8">
        <Button onClick={() => navigate("/strategy")} className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-full flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base">
          Start Optimizing Your Debt Now
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>
    </motion.div>;
};
