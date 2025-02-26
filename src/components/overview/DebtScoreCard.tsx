
import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useDebts } from "@/hooks/use-debts";
import { DebtComparison } from "./DebtComparison";
import { calculateDebtScore } from "@/lib/utils/scoring/debtScoreCalculator";
import { unifiedDebtCalculationService } from "@/lib/services/UnifiedDebtCalculationService";
import { strategies } from "@/lib/strategies";
import { NoDebtsMessage } from "@/components/debt/NoDebtsMessage";
import { SingleDebtInsights } from "./debt-score/SingleDebtInsights";
import { MultiDebtInsights } from "./debt-score/MultiDebtInsights";
import { DebtFreeMessage } from "./debt-score/DebtFreeMessage";

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
    const originalPayoff = unifiedDebtCalculationService.calculatePayoffDetails(debts, totalMinimumPayments, selectedStrategy, []);
    const optimizedPayoff = unifiedDebtCalculationService.calculatePayoffDetails(debts, effectiveMonthlyPayment, selectedStrategy, []);
    return calculateDebtScore(debts, originalPayoff, optimizedPayoff, selectedStrategy, effectiveMonthlyPayment);
  };

  const scoreDetails = calculateScore();

  const renderActionableInsights = () => {
    if (!scoreDetails || !debts?.length) return null;

    if (debts.length === 1) {
      return <SingleDebtInsights 
        debt={debts[0]} 
        currencySymbol={profile?.preferred_currency || '£'} 
      />;
    }

    return <MultiDebtInsights 
      debts={debts}
      scoreDetails={scoreDetails}
      currencySymbol={profile?.preferred_currency || '£'}
    />;
  };

  const renderContent = () => {
    if (hasNoDebts) {
      return <NoDebtsMessage />;
    }
    if (isDebtFree) {
      return <DebtFreeMessage />;
    }
    return (
      <>
        <div className="flex flex-col md:flex-row items-start gap-8">
          {renderActionableInsights()}
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
      className="w-full"
    >
      <Card className="bg-white overflow-hidden">
        {renderContent()}
      </Card>
    </motion.div>
  );
};
