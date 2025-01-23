import { useState } from "react";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { Strategy } from "@/lib/strategies";
import { Debt } from "@/lib/types";
import { PaymentOverviewSection } from "./PaymentOverviewSection";
import { OneTimeFundingSection } from "./OneTimeFundingSection";
import { ScoreInsightsSection } from "./sections/ScoreInsightsSection";
import { useMonthlyPayment } from "@/hooks/use-monthly-payment";
import { PayoffTimeline } from "@/components/debt/PayoffTimeline";
import { ResultsDialog } from "./ResultsDialog";
import { useOneTimeFunding } from "@/hooks/use-one-time-funding";
import { StrategySelector } from "@/components/StrategySelector";
import { strategies } from "@/lib/strategies";

interface StrategyContentProps {
  debts: Debt[];
  selectedStrategy: Strategy;
  onUpdateDebt: (debt: Debt) => void;
  onDeleteDebt: (debtId: string) => void;
  onSelectStrategy: (strategy: Strategy) => void;
  preferredCurrency?: string;
  totalDebtValue: number;
}

export const StrategyContent: React.FC<StrategyContentProps> = ({
  debts,
  selectedStrategy,
  onUpdateDebt,
  onDeleteDebt,
  onSelectStrategy,
  preferredCurrency,
  totalDebtValue
}) => {
  const { currentPayment, minimumPayment, extraPayment, updateMonthlyPayment } = useMonthlyPayment();
  const [isExtraPaymentDialogOpen, setIsExtraPaymentDialogOpen] = useState(false);
  const { oneTimeFundings } = useOneTimeFunding();

  console.log('StrategyContent render:', {
    debts,
    minimumPayment,
    currentPayment,
    selectedStrategy,
    totalDebtValue
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 space-y-6 border shadow-sm">
            <PaymentOverviewSection
              totalMinimumPayments={minimumPayment}
              extraPayment={extraPayment}
              onExtraPaymentChange={amount => updateMonthlyPayment(amount + minimumPayment)}
              onOpenExtraPaymentDialog={() => setIsExtraPaymentDialogOpen(true)}
              currencySymbol={preferredCurrency}
              totalDebtValue={totalDebtValue}
            />
            
            <OneTimeFundingSection />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Choose Your Strategy</h3>
              <StrategySelector
                strategies={strategies}
                selectedStrategy={selectedStrategy}
                onSelectStrategy={onSelectStrategy}
              />
            </div>
            
            <ResultsDialog
              debts={debts}
              monthlyPayment={currentPayment}
              extraPayment={extraPayment}
              oneTimeFundings={oneTimeFundings}
              selectedStrategy={selectedStrategy}
              currencySymbol={preferredCurrency}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ScoreInsightsSection />
        </motion.div>
      </div>

      {debts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full"
        >
          <PayoffTimeline
            debts={debts}
            extraPayment={extraPayment}
          />
        </motion.div>
      )}
    </div>
  );
};