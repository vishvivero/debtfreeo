
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, Plane, Smartphone, Palmtree, ChevronDown, ChevronUp, Percent, Info } from "lucide-react";
import { useDebts } from "@/hooks/use-debts";
import { useOneTimeFunding } from "@/hooks/use-one-time-funding";
import { strategies } from "@/lib/strategies";
import { calculateTimelineData } from "@/components/debt/timeline/TimelineCalculator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const DebtComparison = () => {
  const { debts, profile } = useDebts();
  const { oneTimeFundings } = useOneTimeFunding();
  const navigate = useNavigate();
  const [isDebtListExpanded, setIsDebtListExpanded] = useState(false);
  const currencySymbol = profile?.preferred_currency || "£";

  const calculateComparison = () => {
    if (!debts || debts.length === 0 || !profile?.monthly_payment) {
      return {
        originalPayoffDate: new Date(),
        optimizedPayoffDate: new Date(),
        interestSaved: 0,
        originalInterest: 0,
        optimizedInterest: 0,
        principalPercentage: 0,
        interestPercentage: 0,
        totalDebts: 0
      };
    }

    const selectedStrategy = strategies.find(s => s.id === profile.selected_strategy) || strategies[0];
    const timelineData = calculateTimelineData(debts, profile.monthly_payment, selectedStrategy, oneTimeFundings);
    
    const lastDataPoint = timelineData[timelineData.length - 1];
    const acceleratedPayoffPoint = timelineData.find(d => d.acceleratedBalance <= 0);
    const optimizedPayoffDate = acceleratedPayoffPoint ? new Date(acceleratedPayoffPoint.date) : new Date(lastDataPoint.date);
    
    const totalPayment = lastDataPoint.baselineInterest + debts.reduce((sum, debt) => sum + debt.balance, 0);
    const interestPercentage = (lastDataPoint.baselineInterest / totalPayment * 100).toFixed(1);
    const principalPercentage = (100 - parseFloat(interestPercentage)).toFixed(1);
    
    return {
      originalPayoffDate: new Date(lastDataPoint.date),
      optimizedPayoffDate,
      interestSaved: lastDataPoint.baselineInterest - lastDataPoint.acceleratedInterest,
      originalInterest: lastDataPoint.baselineInterest,
      optimizedInterest: lastDataPoint.acceleratedInterest,
      principalPercentage,
      interestPercentage,
      totalDebts: debts.length
    };
  };

  const comparison = calculateComparison();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Current Plan */}
      <Card className="bg-gradient-to-br from-blue-50/50 to-white border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-gray-900">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Your Debt Overview
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Current overview of your debt situation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Debt-Free Date */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Debt-Free Date</h3>
                <p className="text-sm text-gray-500">Based on minimum payments only</p>
              </div>
            </div>
            <p className="text-2xl font-semibold text-blue-600">
              {comparison.originalPayoffDate.toLocaleDateString('en-US', { 
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>

          {/* Payment Efficiency */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-100 rounded-full">
                <Percent className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Payment Efficiency</h3>
                <p className="text-sm text-emerald-600">
                  {currencySymbol}{Math.round(comparison.originalInterest).toLocaleString()} goes to interest
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Principal: {comparison.principalPercentage}%</span>
                <span>Interest: {comparison.interestPercentage}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full flex">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${comparison.principalPercentage}%` }}
                    className="bg-emerald-500"
                  />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${comparison.interestPercentage}%` }}
                    className="bg-red-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Total Debts */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-purple-600 border-purple-600">
                  Total Active Debts
                </Badge>
              </div>
              <span className="font-semibold text-purple-600">
                {comparison.totalDebts} debts
              </span>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setIsDebtListExpanded(!isDebtListExpanded)}
              className="w-full flex items-center justify-between"
            >
              <span>View Debt List</span>
              {isDebtListExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            {isDebtListExpanded && (
              <div className="mt-4 space-y-3">
                {debts?.map(debt => (
                  <div key={debt.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{debt.name}</span>
                    <span className="font-medium text-gray-900">
                      {currencySymbol}{debt.balance.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Optimized Plan */}
      <Card className="bg-gradient-to-br from-emerald-50/50 to-white border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-emerald-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              What Debtfreeo Can Save You
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>See how our optimized plan can help you save</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Optimized Debt-Free Date */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-100 rounded-full">
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Optimized Debt-Free Date</h3>
                <p className="text-sm text-emerald-600">
                  Become debt-free sooner with our optimized plan!
                </p>
              </div>
            </div>
            <p className="text-2xl font-semibold text-emerald-600">
              {comparison.optimizedPayoffDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>

          {/* Total Interest (Optimized) */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-100 rounded-full">
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Total Interest (Optimized)</h3>
                <p className="text-sm text-emerald-600">
                  Save {currencySymbol}{Math.round(comparison.interestSaved).toLocaleString()} in interest
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Original: {currencySymbol}{Math.round(comparison.originalInterest).toLocaleString()}</span>
                <span>Optimized: {currencySymbol}{Math.round(comparison.optimizedInterest).toLocaleString()}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(comparison.optimizedInterest / comparison.originalInterest) * 100}%` }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* What You Could Get */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-4">With your savings, you could get</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-gray-600">International Trips</span>
                </div>
                <span className="text-sm font-medium text-emerald-600">
                  {Math.floor(comparison.interestSaved / 1000)} trips
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-gray-600">Premium Smartphones</span>
                </div>
                <span className="text-sm font-medium text-emerald-600">
                  {Math.floor(comparison.interestSaved / 800)} phones
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Palmtree className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-gray-600">Dream Family Vacation</span>
                </div>
                <span className="text-sm font-medium text-emerald-600">1 trip</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 flex justify-center mt-4">
        <Button
          onClick={() => navigate("/strategy")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-full flex items-center gap-2"
        >
          Start Optimizing Your Debt Now
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            →
          </motion.div>
        </Button>
      </div>
    </div>
  );
};
