import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { CheckCircle2, TrendingUp, PiggyBank, Calendar, Info, Target, AlertTriangle } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useDebts } from "@/hooks/use-debts";
import { DebtComparison } from "./DebtComparison";
import { calculateDebtScore, getScoreCategory } from "@/lib/utils/scoring/debtScoreCalculator";
import { unifiedDebtCalculationService } from "@/lib/services/UnifiedDebtCalculationService";
import { strategies } from "@/lib/strategies";
import { NoDebtsMessage } from "@/components/debt/NoDebtsMessage";

export const DebtScoreCard = () => {
  const { debts, profile } = useDebts();
  
  console.log('Rendering DebtScoreCard with:', {
    debtCount: debts?.length,
    totalBalance: debts?.reduce((sum, debt) => sum + debt.balance, 0),
    monthlyPayment: profile?.monthly_payment,
    profile
  });

  const totalDebt = debts?.reduce((sum, debt) => sum + debt.balance, 0) || 0;
  const totalMinimumPayments = debts?.reduce((sum, debt) => sum + debt.minimum_payment, 0) || 0;
  
  const hasNoDebts = !debts || debts.length === 0;
  const isDebtFree = debts && debts.length > 0 && totalDebt === 0;
  
  const calculateScore = () => {
    if (!debts || debts.length === 0) return null;

    const effectiveMonthlyPayment = profile?.monthly_payment || totalMinimumPayments;
    const selectedStrategy = strategies.find(s => s.id === profile?.selected_strategy) || strategies[0];
    
    const originalPayoff = unifiedDebtCalculationService.calculatePayoffDetails(
      debts,
      totalMinimumPayments,
      selectedStrategy,
      []
    );

    const optimizedPayoff = unifiedDebtCalculationService.calculatePayoffDetails(
      debts,
      effectiveMonthlyPayment,
      selectedStrategy,
      []
    );

    return calculateDebtScore(
      debts,
      originalPayoff,
      optimizedPayoff,
      selectedStrategy,
      effectiveMonthlyPayment
    );
  };

  const scoreDetails = calculateScore();
  const scoreCategory = scoreDetails ? getScoreCategory(scoreDetails.totalScore) : null;

  const renderActionableInsights = () => {
    if (!scoreDetails || !debts?.length) return null;

    if (debts.length === 1) {
      const debt = debts[0];
      const monthlyInterest = (debt.balance * (debt.interest_rate / 100)) / 12;
      const totalCostIfMinimum = debt.balance + (monthlyInterest * 24); // Rough 2-year estimate

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
                        <button className="cursor-help">
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
                    Monthly Interest: {profile?.preferred_currency || '£'}
                    {monthlyInterest.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    This is what your debt costs you each month in interest
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white/50 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-blue-100">
                  <PiggyBank className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">Payment Impact</h4>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <button className="cursor-help">
                          <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                        </button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 bg-white border-gray-200 shadow-lg z-50">
                        <div className="space-y-2">
                          <h5 className="font-semibold text-sm">Extra Payment Benefits</h5>
                          <p className="text-sm text-muted-foreground">
                            Extra payments can significantly reduce your total repayment time and interest costs. Even small additional amounts can make a big difference over time.
                          </p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Adding just {profile?.preferred_currency || '£'}50 extra monthly could save you months
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Extra payments go directly to reducing your principal
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white/50 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-amber-100">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">Total Cost Warning</h4>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <button className="cursor-help">
                          <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                        </button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 bg-white border-gray-200 shadow-lg z-50">
                        <div className="space-y-2">
                          <h5 className="font-semibold text-sm">Understanding Total Cost</h5>
                          <p className="text-sm text-muted-foreground">
                            This 2-year projection shows the total amount you'll pay if you only make minimum payments. It includes both principal and accumulated interest, highlighting why paying more than the minimum is beneficial.
                          </p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Paying minimum only: ~{profile?.preferred_currency || '£'}
                    {totalCostIfMinimum.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    This is your estimated 2-year cost with minimum payments
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white/50 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-purple-100">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">Success Tips</h4>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <button className="cursor-help">
                          <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                        </button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 bg-white border-gray-200 shadow-lg z-50">
                        <div className="space-y-2">
                          <h5 className="font-semibold text-sm">Why These Tips Matter</h5>
                          <p className="text-sm text-muted-foreground">
                            These proven strategies help ensure consistent progress towards becoming debt-free. Automatic payments prevent missed payments, tracking helps maintain motivation, and celebrating milestones reinforces positive financial habits.
                          </p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  <div className="space-y-2 mt-2">
                    <p className="text-xs text-gray-600 flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-purple-500" />
                      Set up automatic payments
                    </p>
                    <p className="text-xs text-gray-600 flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-purple-500" />
                      Track your progress monthly
                    </p>
                    <p className="text-xs text-gray-600 flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-purple-500" />
                      Celebrate small wins
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="font-medium text-blue-800">Pro Tip</h5>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <button className="cursor-help">
                        <Info className="h-4 w-4 text-blue-400 hover:text-blue-500 transition-colors" />
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 bg-white border-gray-200 shadow-lg z-50">
                      <div className="space-y-2">
                        <h5 className="font-semibold text-sm">Advanced Payment Strategy</h5>
                        <p className="text-sm text-muted-foreground">
                          This advanced strategy helps you save money on interest while accelerating your debt payoff. By applying extra payments directly to principal, you reduce both the balance and future interest charges.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Every extra payment you make reduces both your balance and the amount of interest you'll pay over time.
                  Consider setting aside any unexpected income for debt payments.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const highestInterestDebt = [...debts].sort((a, b) => b.interest_rate - a.interest_rate)[0];
    const lowestBalance = [...debts].sort((a, b) => a.balance - b.balance)[0];
    const totalInterest = debts.reduce((sum, debt) => 
      sum + (debt.balance * (debt.interest_rate / 100)), 0
    );

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
                <h4 className="font-semibold text-gray-900">Priority Focus</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Focus on {highestInterestDebt.name} with {highestInterestDebt.interest_rate}% APR
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  This debt has the highest interest rate and costs you the most
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white/50 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-blue-100">
                <PiggyBank className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Quick Win</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Target {lowestBalance.name} with {profile?.preferred_currency || '£'}
                  {lowestBalance.balance.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Paying this off first will give you momentum
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white/50 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-amber-100">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Monthly Interest Cost</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {profile?.preferred_currency || '£'}{totalInterest.toFixed(2)} per month
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  This is what your debt costs you monthly
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white/50 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-purple-100">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Optimization Potential</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {(((scoreDetails.durationScore + scoreDetails.interestScore) / 80) * 100).toFixed(0)}% room for improvement
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Based on your current payment strategy
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            Recommended Next Steps
            <HoverCard>
              <HoverCardTrigger asChild>
                <button className="cursor-help">
                  <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h5 className="font-semibold text-sm">Personalized steps based on your debt profile</h5>
                  <p className="text-sm text-muted-foreground">
                    Personalized steps based on your debt profile
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </h4>
          
          <div className="space-y-3">
            {scoreDetails.interestScore < 25 && (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <p className="text-sm text-gray-600">
                  Consider consolidating your high-interest debts to reduce overall interest costs
                </p>
              </div>
            )}
            
            {scoreDetails.durationScore < 15 && (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <p className="text-sm text-gray-600">
                  Look for opportunities to increase your monthly payment by {profile?.preferred_currency || '£'}50-100
                </p>
              </div>
            )}
            
            {scoreDetails.behaviorScore.excessPayments < 2.5 && (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <p className="text-sm text-gray-600">
                  Set up automatic payments to ensure consistent debt reduction
                </p>
              </div>
            )}

            {debts.some(debt => debt.interest_rate > 20) && (
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <p className="text-sm text-gray-600">
                  You have high-interest debt(s). Prioritize paying these off first
                </p>
              </div>
            )}
          </div>
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
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="flex-grow w-full">
            {renderActionableInsights()}
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
      <Card className="bg-white p-6 relative overflow-hidden">
        {renderContent()}
      </Card>
    </motion.div>
  );
};
