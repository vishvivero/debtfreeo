
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useDebts } from "@/hooks/use-debts";
import { DebtComparison } from "./DebtComparison";
import { calculateDebtScore, getScoreCategory } from "@/lib/utils/scoring/debtScoreCalculator";
import { unifiedDebtCalculationService } from "@/lib/services/UnifiedDebtCalculationService";
import { strategies } from "@/lib/strategies";
import { NoDebtsMessage } from "@/components/debt/NoDebtsMessage";
import { ScoreCircle } from "./score/ScoreCircle";
import { ScoreBreakdown } from "./score/ScoreBreakdown";
import { DebtFreeMessage } from "./score/DebtFreeMessage";

export const DebtScoreCard = () => {
  const { debts, profile } = useDebts();
  
  console.log('Rendering DebtScoreCard with:', {
    debtCount: debts?.length,
    totalBalance: debts?.reduce((sum, debt) => sum + debt.balance, 0),
    monthlyPayment: profile?.monthly_payment,
    profile
  });

  // Calculate total debt and minimum payments
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

  const renderContent = () => {
    if (hasNoDebts) {
      return <NoDebtsMessage />;
    }

    if (isDebtFree) {
      return <DebtFreeMessage />;
    }

    return (
      <>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">YOUR DEBT SCORE</h3>
              </div>
              <ScoreCircle score={scoreDetails?.totalScore} category={scoreCategory} />
            </div>
          </div>
          <div className="flex-grow">
            <ScoreBreakdown scoreDetails={scoreDetails} />
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
