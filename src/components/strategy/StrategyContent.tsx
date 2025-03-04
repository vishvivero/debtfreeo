import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Strategy } from "@/lib/strategies";
import { Debt } from "@/lib/types";
import { useMonthlyPayment } from "@/hooks/use-monthly-payment";
import { ResultsDialog } from "./ResultsDialog";
import { useOneTimeFunding } from "@/hooks/use-one-time-funding";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/use-profile";
import { useCurrency } from "@/hooks/use-currency";
import { ExtraPaymentsSection } from "./sections/ExtraPaymentsSection";
import { OneTimeFundingSection } from "./sections/OneTimeFundingSection";
import { StrategySelectionSection } from "./sections/StrategySelectionSection";
import { strategies } from "@/lib/strategies";

interface StrategyContentProps {
  debts: Debt[];
  selectedStrategy: Strategy;
  onUpdateDebt: (debt: Debt) => void;
  onDeleteDebt: (debtId: string) => void;
  onSelectStrategy: (strategy: Strategy) => void;
  preferredCurrency?: string;
  totalDebtValue: number;
  currentPayment: number;
  minimumPayment: number;
}

export const StrategyContent: React.FC<StrategyContentProps> = ({
  debts,
  selectedStrategy: initialStrategy,
  onUpdateDebt,
  onDeleteDebt,
  onSelectStrategy: parentOnSelectStrategy,
  preferredCurrency,
  totalDebtValue,
  currentPayment,
  minimumPayment
}) => {
  const { updateMonthlyPayment } = useMonthlyPayment();
  const { oneTimeFundings } = useOneTimeFunding();
  const { profile } = useProfile();
  const [hasViewedResults, setHasViewedResults] = useState(false);
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy>(initialStrategy);
  const [extraPayment, setExtraPayment] = useState(Math.max(0, currentPayment - minimumPayment));
  const { preferredCurrency: currencyFromHook } = useCurrency();

  const effectiveCurrency = preferredCurrency || currencyFromHook;

  useEffect(() => {
    if (profile?.selected_strategy) {
      const savedStrategy = strategies.find(s => s.id === profile.selected_strategy);
      if (savedStrategy && savedStrategy.id !== selectedStrategy.id) {
        console.log('Initializing strategy from profile:', savedStrategy.id);
        setSelectedStrategy(savedStrategy);
        parentOnSelectStrategy(savedStrategy);
      }
    }
  }, [profile?.selected_strategy]);

  useEffect(() => {
    setExtraPayment(Math.max(0, currentPayment - minimumPayment));
  }, [currentPayment, minimumPayment]);

  const handleResultsClick = () => {
    setHasViewedResults(true);
    setIsResultsDialogOpen(true);
  };

  const handleStrategyChange = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    parentOnSelectStrategy(strategy);
  };

  const handleExtraPaymentChange = (amount: number) => {
    setExtraPayment(amount);
    updateMonthlyPayment(amount + minimumPayment);
  };

  const getActiveOneTimeFundings = () => {
    const showOneTimeFunding = profile?.show_lump_sum_payments || false;
    return showOneTimeFunding ? oneTimeFundings : [];
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 space-y-6 border shadow-sm">
          <ExtraPaymentsSection 
            totalDebtValue={totalDebtValue}
            minimumPayment={minimumPayment}
            currencySymbol={effectiveCurrency}
            extraPayment={extraPayment}
            onExtraPaymentChange={handleExtraPaymentChange}
          />

          <OneTimeFundingSection />

          <StrategySelectionSection 
            selectedStrategy={selectedStrategy}
            onSelectStrategy={handleStrategyChange}
          />

          <Button 
            className="w-full"
            onClick={handleResultsClick}
          >
            Get Results
          </Button>
        </div>
      </motion.div>

      <ResultsDialog
        isOpen={isResultsDialogOpen}
        onClose={() => setIsResultsDialogOpen(false)}
        debts={debts}
        monthlyPayment={currentPayment}
        extraPayment={extraPayment}
        oneTimeFundings={getActiveOneTimeFundings()}
        selectedStrategy={selectedStrategy}
        currencySymbol={effectiveCurrency}
      />
    </div>
  );
};
