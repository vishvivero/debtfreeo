
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  TrendingUp, 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  Coins, 
  Clock, 
  Zap,
  Lightbulb,
  PieChart,
  ArrowUpRight
} from "lucide-react";
import { useDebts } from "@/hooks/use-debts";
import { calculateDebtScore, getScoreCategory } from "@/lib/utils/scoring/debtScoreCalculator";
import { unifiedDebtCalculationService } from "@/lib/services/UnifiedDebtCalculationService";
import { strategies } from "@/lib/strategies";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

export const ScoreInsightsSection = () => {
  const { debts, profile } = useDebts();

  if (!debts || debts.length === 0 || !profile?.monthly_payment) {
    return null;
  }

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

  const scoreDetails = calculateDebtScore(
    debts,
    originalPayoff,
    optimizedPayoff,
    selectedStrategy,
    profile.monthly_payment
  );

  const scoreCategory = getScoreCategory(scoreDetails.totalScore);

  const getDetailedRecommendations = () => {
    const recommendations = [];
    const totalMinPayments = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
    const highestInterestDebt = [...debts].sort((a, b) => b.interest_rate - a.interest_rate)[0];
    const lowestBalanceDebt = [...debts].sort((a, b) => a.balance - b.balance)[0];
    const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
    const highInterestThreshold = 15; // 15% interest rate threshold

    // Interest Score Recommendations
    if (scoreDetails.interestScore < 25) {
      if (highestInterestDebt.interest_rate > highInterestThreshold) {
        recommendations.push({
          text: `Prioritize paying off ${highestInterestDebt.name} with ${highestInterestDebt.interest_rate}% interest rate. This could save you ${profile.preferred_currency}${Math.round(highestInterestDebt.balance * highestInterestDebt.interest_rate / 100)} in interest annually.`,
          icon: <Coins className="h-5 w-5 text-yellow-500" />,
          priority: 1
        });
      } else {
        recommendations.push({
          text: `Consider debt consolidation to reduce your average interest rate of ${(debts.reduce((sum, debt) => sum + debt.interest_rate, 0) / debts.length).toFixed(1)}%.`,
          icon: <Coins className="h-5 w-5 text-yellow-500" />,
          priority: 2
        });
      }
    }

    // Duration Score Recommendations
    if (scoreDetails.durationScore < 15) {
      const suggestedIncrease = Math.ceil((totalMinPayments * 0.2) / 10) * 10;
      const monthsSaved = Math.round((totalDebt / (profile.monthly_payment + suggestedIncrease)) - (totalDebt / profile.monthly_payment));
      
      recommendations.push({
        text: `Increasing your monthly payment by ${profile.preferred_currency}${suggestedIncrease} could help you become debt-free ${monthsSaved} months earlier.`,
        icon: <Clock className="h-5 w-5 text-blue-500" />,
        priority: 3
      });
    }

    // Payment Behavior Recommendations
    if (scoreDetails.behaviorScore.ontimePayments < 5) {
      recommendations.push({
        text: "Set up automatic payments to ensure consistent, on-time payments. This could improve your credit score by up to 35%.",
        icon: <Zap className="h-5 w-5 text-purple-500" />,
        priority: 4
      });
    }

    // Strategy Optimization
    if (scoreDetails.behaviorScore.strategyUsage < 5) {
      const suggestedStrategy = highestInterestDebt.interest_rate > highInterestThreshold ? "avalanche" : "snowball";
      if (suggestedStrategy !== selectedStrategy.id) {
        const strategyBenefit = suggestedStrategy === "avalanche" 
          ? "maximize interest savings"
          : "build momentum with quick wins";
        
        recommendations.push({
          text: `Switch to the ${suggestedStrategy} method to ${strategyBenefit}. This strategy is optimal for your current debt profile.`,
          icon: <TrendingUp className="h-5 w-5 text-emerald-500" />,
          priority: 5
        });
      }
    }

    // Extra Payment Recommendations
    if (scoreDetails.behaviorScore.excessPayments < 2.5) {
      const smallestExtra = Math.ceil((lowestBalanceDebt.minimum_payment * 0.1) / 5) * 5;
      const impactEstimate = Math.round((lowestBalanceDebt.balance * lowestBalanceDebt.interest_rate / 100) * (smallestExtra / lowestBalanceDebt.minimum_payment));
      
      recommendations.push({
        text: `Adding just ${profile.preferred_currency}${smallestExtra} extra to your monthly payment could save you approximately ${profile.preferred_currency}${impactEstimate} in interest over time.`,
        icon: <Target className="h-5 w-5 text-indigo-500" />,
        priority: 6
      });
    }

    // High Score Maintenance Advice
    if (scoreDetails.totalScore >= 80) {
      const emergencyFundTarget = Math.round(totalMinPayments * 6 / 100) * 100;
      recommendations.push({
        text: `Great job managing your debt! Consider building an emergency fund of ${profile.preferred_currency}${emergencyFundTarget} (6 months of payments) to prevent future debt.`,
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        priority: 7
      });
    }

    // Default recommendation
    if (recommendations.length === 0) {
      recommendations.push({
        text: "Keep monitoring your debt repayment progress and stay consistent with your payments.",
        icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
        priority: 8
      });
    }

    // Sort by priority and return the most relevant recommendation
    return recommendations.sort((a, b) => a.priority - b.priority)[0];
  };

  const recommendation = getDetailedRecommendations();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getProgressColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return "bg-emerald-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-6"
    >
      <Card className="bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <PieChart className="h-6 w-6 text-primary" />
            Debt Management Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="relative w-48 h-48"
            >
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="none"
                  className="text-gray-100"
                />
                <motion.circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray="552.92"
                  initial={{ strokeDashoffset: 552.92 }}
                  animate={{ 
                    strokeDashoffset: 552.92 - (552.92 * scoreDetails.totalScore) / 100 
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={cn(
                    "transition-all duration-1000 ease-out",
                    getScoreColor(scoreDetails.totalScore)
                  )}
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className={cn(
                    "text-4xl font-bold",
                    getScoreColor(scoreDetails.totalScore)
                  )}>
                    {Math.round(scoreDetails.totalScore)}
                  </div>
                  <div className={cn(
                    "text-lg font-medium",
                    scoreCategory.color
                  )}>
                    {scoreCategory.label}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <HoverCard openDelay={200}>
              <HoverCardTrigger asChild>
                <div className="space-y-2 cursor-help">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-primary" />
                      Interest Optimization
                    </span>
                    <span className={cn(
                      "font-medium",
                      getScoreColor(scoreDetails.interestScore)
                    )}>
                      {scoreDetails.interestScore.toFixed(1)}/50
                    </span>
                  </div>
                  <Progress 
                    value={(scoreDetails.interestScore / 50) * 100} 
                    className="h-2"
                    indicatorClassName={getProgressColor(scoreDetails.interestScore, 50)}
                  />
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-semibold">Interest Optimization Score</h4>
                  <p className="text-sm text-muted-foreground">
                    Measures how effectively you're minimizing interest payments through your chosen repayment strategy and payment allocation.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>

            <HoverCard openDelay={200}>
              <HoverCardTrigger asChild>
                <div className="space-y-2 cursor-help">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Payment Efficiency
                    </span>
                    <span className={cn(
                      "font-medium",
                      getScoreColor(scoreDetails.durationScore)
                    )}>
                      {scoreDetails.durationScore.toFixed(1)}/30
                    </span>
                  </div>
                  <Progress 
                    value={(scoreDetails.durationScore / 30) * 100} 
                    className="h-2"
                    indicatorClassName={getProgressColor(scoreDetails.durationScore, 30)}
                  />
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-semibold">Payment Efficiency Score</h4>
                  <p className="text-sm text-muted-foreground">
                    Evaluates how quickly you're paying off your debts compared to the minimum payment schedule.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>

            <HoverCard openDelay={200}>
              <HoverCardTrigger asChild>
                <div className="space-y-2 cursor-help">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      Financial Behavior
                    </span>
                    <span className={cn(
                      "font-medium",
                      getScoreColor(
                        scoreDetails.behaviorScore.ontimePayments +
                        scoreDetails.behaviorScore.excessPayments +
                        scoreDetails.behaviorScore.strategyUsage
                      )
                    )}>
                      {(
                        scoreDetails.behaviorScore.ontimePayments +
                        scoreDetails.behaviorScore.excessPayments +
                        scoreDetails.behaviorScore.strategyUsage
                      ).toFixed(1)}/20
                    </span>
                  </div>
                  <Progress 
                    value={
                      ((scoreDetails.behaviorScore.ontimePayments +
                        scoreDetails.behaviorScore.excessPayments +
                        scoreDetails.behaviorScore.strategyUsage) / 20) * 100
                    } 
                    className="h-2"
                    indicatorClassName={getProgressColor(
                      scoreDetails.behaviorScore.ontimePayments +
                      scoreDetails.behaviorScore.excessPayments +
                      scoreDetails.behaviorScore.strategyUsage,
                      20
                    )}
                  />
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-semibold">Financial Behavior Score</h4>
                  <p className="text-sm text-muted-foreground">
                    Reflects your consistency in making payments, utilizing extra payments, and following your chosen debt repayment strategy.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>

          {recommendation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-6"
            >
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Personalized Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    {recommendation.icon}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">{recommendation.text}</p>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        <span className="text-xs text-gray-500">
                          Based on your current debt profile and payment patterns
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
