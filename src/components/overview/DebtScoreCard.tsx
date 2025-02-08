
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDebts } from "@/hooks/use-debts";
import { DebtComparison } from "./DebtComparison";
import { calculateDebtScore, getScoreCategory } from "@/lib/utils/scoring/debtScoreCalculator";
import { unifiedDebtCalculationService } from "@/lib/services/UnifiedDebtCalculationService";
import { strategies } from "@/lib/strategies";
import { NoDebtsMessage } from "@/components/debt/NoDebtsMessage";

export const DebtScoreCard = () => {
  const { debts, profile } = useDebts();
  
  console.log('Rendering DebtScoreCard with debts:', {
    debtCount: debts?.length,
    totalBalance: debts?.reduce((sum, debt) => sum + debt.balance, 0),
  });

  // Calculate total debt
  const totalDebt = debts?.reduce((sum, debt) => sum + debt.balance, 0) || 0;
  
  const hasNoDebts = !debts || debts.length === 0;
  const isDebtFree = debts && debts.length > 0 && totalDebt === 0;
  
  const calculateScore = () => {
    if (!debts || debts.length === 0 || !profile?.monthly_payment) return null;

    const selectedStrategy = strategies.find(s => s.id === profile?.selected_strategy) || strategies[0];
    
    const originalPayoff = unifiedDebtCalculationService.calculatePayoffDetails(
      debts,
      debts.reduce((sum, debt) => sum + debt.minimum_payment, 0),
      selectedStrategy,
      []
    );

    const optimizedPayoff = unifiedDebtCalculationService.calculatePayoffDetails(
      debts,
      profile.monthly_payment,
      selectedStrategy,
      []
    );

    return calculateDebtScore(
      debts,
      originalPayoff,
      optimizedPayoff,
      selectedStrategy,
      profile.monthly_payment
    );
  };

  const scoreDetails = calculateScore();
  const scoreCategory = scoreDetails ? getScoreCategory(scoreDetails.totalScore) : null;

  const renderCircularProgress = () => {
    if (!scoreDetails) return null;

    return (
      <div className="relative w-72 h-72">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
          <div className="text-7xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {Math.round(scoreDetails.totalScore)}
          </div>
          <div className={`${scoreCategory?.color} font-medium text-xl mt-2`}>
            {scoreCategory?.label}
          </div>
        </div>
        <svg className="w-full h-full transform -rotate-90">
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <circle
            cx="144"
            cy="144"
            r="120"
            stroke="#f3f4f6"
            strokeWidth="24"
            fill="none"
          />
          <motion.circle
            initial={{ strokeDashoffset: 754 }}
            animate={{ 
              strokeDashoffset: 754 - (754 * scoreDetails.totalScore) / 100 
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx="144"
            cy="144"
            r="120"
            stroke="url(#scoreGradient)"
            strokeWidth="24"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="754"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
      </div>
    );
  };

  const renderScoreBreakdown = () => {
    if (!scoreDetails) return null;

    const metrics = [
      {
        label: "Interest Savings",
        score: scoreDetails.interestScore,
        total: 50,
        color: "emerald",
        description: "Potential interest saved through optimized payments"
      },
      {
        label: "Duration Reduction",
        score: scoreDetails.durationScore,
        total: 30,
        color: "blue",
        description: "Time saved on your debt repayment journey"
      },
      {
        label: "Payment Behavior",
        score: scoreDetails.behaviorScore.ontimePayments + 
               scoreDetails.behaviorScore.excessPayments + 
               scoreDetails.behaviorScore.strategyUsage,
        total: 20,
        color: "purple",
        description: "Score based on payment habits and strategy usage"
      }
    ];

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Your Optimized Debt Repayment Strategy
          </h3>
          <p className="text-gray-600 mt-2 text-lg">
            We've analyzed your debts and created a plan to minimize interest and accelerate your path to financial freedom.
          </p>
        </div>
        <div className="grid gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className={`p-6 bg-${metric.color}-50/50 rounded-xl border border-${metric.color}-100 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">{metric.label}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className={`w-4 h-4 text-${metric.color}-500`} />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">{metric.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className={`text-xl font-bold text-${metric.color}-600`}>
                  {metric.score.toFixed(1)}/{metric.total}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(metric.score / metric.total) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full bg-${metric.color}-500 rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (hasNoDebts) {
      return <NoDebtsMessage />;
    }

    if (isDebtFree) {
      return (
        <div className="text-center space-y-6 py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block p-4 bg-emerald-50 rounded-full"
          >
            <div className="w-12 h-12 text-emerald-600">🎉</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-3xl font-bold text-emerald-600">
              Congratulations! You're Debt-Free!
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              You've achieved financial freedom! Keep up the great work and consider your next financial goals.
            </p>
          </motion.div>
        </div>
      );
    }

    return (
      <>
        <div className="flex flex-col lg:flex-row items-center gap-8 p-6">
          <div className="flex-shrink-0">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">YOUR DEBT SCORE</h3>
              </div>
              {renderCircularProgress()}
            </div>
          </div>
          <div className="flex-grow w-full lg:w-auto">
            {renderScoreBreakdown()}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100">
          <DebtComparison />
        </div>
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <Card className="bg-white overflow-hidden">
        {renderContent()}
      </Card>
    </motion.div>
  );
};
