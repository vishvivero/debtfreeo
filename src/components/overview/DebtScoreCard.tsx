import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDebts } from "@/hooks/use-debts";
import { DebtComparison } from "./DebtComparison";
import { calculateDebtScore, getScoreCategory } from "@/lib/utils/scoring/debtScoreCalculator";
import { unifiedDebtCalculationService } from "@/lib/services/UnifiedDebtCalculationService";
import { strategies } from "@/lib/strategies";
import { NoDebtsMessage } from "@/components/debt/NoDebtsMessage";
import { useCurrency } from "@/hooks/use-currency";
export const DebtScoreCard = () => {
  const {
    debts,
    profile
  } = useDebts();
  const {
    convertToPreferredCurrency
  } = useCurrency();
  console.log('Rendering DebtScoreCard with:', {
    debtCount: debts?.length,
    totalBalance: debts?.reduce((sum, debt) => sum + debt.balance, 0),
    monthlyPayment: profile?.monthly_payment,
    profile
  });

  // Calculate total debt and minimum payments - properly normalize currency
  const totalDebt = debts?.reduce((sum, debt) => sum + convertToPreferredCurrency(debt.balance, debt.currency_symbol), 0) || 0;
  const totalMinimumPayments = debts?.reduce((sum, debt) => sum + convertToPreferredCurrency(debt.minimum_payment, debt.currency_symbol), 0) || 0;
  const hasNoDebts = !debts || debts.length === 0;
  const isDebtFree = debts && debts.length > 0 && totalDebt === 0;
  const calculateScore = () => {
    if (!debts || debts.length === 0) return null;

    // Create normalized debts for calculation
    const normalizedDebts = debts.map(debt => ({
      ...debt,
      balance: convertToPreferredCurrency(debt.balance, debt.currency_symbol),
      minimum_payment: convertToPreferredCurrency(debt.minimum_payment, debt.currency_symbol)
    }));

    // Use either the profile's monthly payment or total minimum payments if monthly payment is not set
    const effectiveMonthlyPayment = profile?.monthly_payment || totalMinimumPayments;
    const selectedStrategy = strategies.find(s => s.id === profile?.selected_strategy) || strategies[0];
    console.log('Calculating score with normalized debts:', {
      totalNormalizedDebt: normalizedDebts.reduce((sum, debt) => sum + debt.balance, 0),
      totalNormalizedMinPayments: normalizedDebts.reduce((sum, debt) => sum + debt.minimum_payment, 0),
      effectiveMonthlyPayment
    });
    const originalPayoff = unifiedDebtCalculationService.calculatePayoffDetails(normalizedDebts, totalMinimumPayments, selectedStrategy, []);
    const optimizedPayoff = unifiedDebtCalculationService.calculatePayoffDetails(normalizedDebts, effectiveMonthlyPayment, selectedStrategy, []);
    console.log('Score calculation results:', {
      originalPayoffInterest: originalPayoff.baselineInterest,
      optimizedPayoffInterest: optimizedPayoff.acceleratedInterest
    });
    return calculateDebtScore(normalizedDebts, originalPayoff, optimizedPayoff, selectedStrategy, effectiveMonthlyPayment);
  };
  const scoreDetails = calculateScore();
  const scoreCategory = scoreDetails ? getScoreCategory(scoreDetails.totalScore) : null;
  const renderCircularProgress = () => {
    if (!scoreDetails) return null;
    return <div className="relative w-64 h-64">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
          <div className="text-6xl font-bold text-gray-900">
            {Math.round(scoreDetails.totalScore)}
          </div>
          <div className="text-emerald-500 font-medium text-lg">
            {scoreCategory?.label}
          </div>
        </div>
        <svg className="w-full h-full transform -rotate-90">
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="25%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="75%" stopColor="#84cc16" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <circle cx="128" cy="128" r="116" stroke="currentColor" strokeWidth="16" fill="none" className="text-gray-100" />
          <motion.circle initial={{
          strokeDashoffset: 729
        }} animate={{
          strokeDashoffset: 729 - 729 * scoreDetails.totalScore / 100
        }} transition={{
          duration: 1,
          ease: "easeOut"
        }} cx="128" cy="128" r="116" stroke="url(#scoreGradient)" strokeWidth="16" fill="none" strokeDasharray="729" className="transition-all duration-1000 ease-out" />
        </svg>
      </div>;
  };
  const renderScoreBreakdown = () => {
    if (!scoreDetails) return null;
    return <div className="space-y-4 mt-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
          Your Optimized Debt Repayment Strategy
        </h3>
        <p className="text-gray-600 mt-2">
          We've analyzed your debts and created a plan to minimize interest and accelerate your path to financial freedom.
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50/50 rounded-lg">
            <div className="text-gray-600">Interest Savings</div>
            <div className="text-lg font-semibold text-emerald-600">
              {scoreDetails.interestScore.toFixed(1)}/50
            </div>
          </div>
          <div className="p-4 bg-blue-50/50 rounded-lg">
            <div className="text-gray-600">Duration Reduction</div>
            <div className="text-lg font-semibold text-blue-600">
              {scoreDetails.durationScore.toFixed(1)}/30
            </div>
          </div>
          <div className="p-4 bg-purple-50/50 rounded-lg">
            <div className="text-gray-600">Payment Behavior</div>
            <div className="text-lg font-semibold text-purple-600">
              {(scoreDetails.behaviorScore.ontimePayments + scoreDetails.behaviorScore.excessPayments + scoreDetails.behaviorScore.strategyUsage).toFixed(1)}/20
            </div>
          </div>
        </div>
      </div>;
  };
  const renderContent = () => {
    if (hasNoDebts) {
      return <NoDebtsMessage />;
    }
    if (isDebtFree) {
      return <div className="text-center space-y-6 py-8">
          <motion.div initial={{
          scale: 0
        }} animate={{
          scale: 1
        }} className="inline-block p-4 bg-emerald-50 rounded-full">
            <div className="w-12 h-12 text-emerald-600">🎉</div>
          </motion.div>
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="space-y-4">
            <h2 className="text-3xl font-bold text-emerald-600">
              Congratulations! You're Debt-Free!
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              You've achieved financial freedom! Keep up the great work and consider your next financial goals.
            </p>
          </motion.div>
        </div>;
    }
    return <>
        <div className="mt-8 pt-8 border-t border-gray-100">
          <DebtComparison />
        </div>
      </>;
  };
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.5
  }} className="mb-6">
      
    </motion.div>;
};