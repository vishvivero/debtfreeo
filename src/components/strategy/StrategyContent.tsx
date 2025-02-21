
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Strategy } from "@/lib/strategies";
import { Debt } from "@/lib/types";
import { useMonthlyPayment } from "@/hooks/use-monthly-payment";
import { useOneTimeFunding } from "@/hooks/use-one-time-funding";
import { StrategySelector } from "@/components/StrategySelector";
import { strategies } from "@/lib/strategies";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/use-profile";
import { ResultsDialog } from "./ResultsDialog";
import { ExtraPaymentSection } from "./sections/ExtraPaymentSection";
import { OneTimeFundingSection } from "./sections/OneTimeFundingSection";
import { StrategySection } from "./sections/StrategySection";
import { ResultsSection } from "./sections/ResultsSection";

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
  selectedStrategy: initialStrategy,
  onUpdateDebt,
  onDeleteDebt,
  onSelectStrategy: parentOnSelectStrategy,
  preferredCurrency,
  totalDebtValue
}) => {
  const { currentPayment, minimumPayment, extraPayment, updateMonthlyPayment } = useMonthlyPayment();
  const [isExtraPaymentDialogOpen, setIsExtraPaymentDialogOpen] = useState(false);
  const { oneTimeFundings } = useOneTimeFunding();
  const { profile, updateProfile } = useProfile();
  const [showExtraPayment, setShowExtraPayment] = useState(profile?.show_extra_payments || false);
  const [showOneTimeFunding, setShowOneTimeFunding] = useState(profile?.show_lump_sum_payments || false);
  const [isStrategyDialogOpen, setIsStrategyDialogOpen] = useState(false);
  const [hasViewedResults, setHasViewedResults] = useState(false);
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy>(initialStrategy);

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
    if (profile) {
      setShowExtraPayment(profile.show_extra_payments || false);
      setShowOneTimeFunding(profile.show_lump_sum_payments || false);
    }
  }, [profile]);

  const handleResultsClick = () => {
    setHasViewedResults(true);
    setIsResultsDialogOpen(true);
  };

  const handleStrategyChange = async (strategy: Strategy) => {
    console.log('Changing strategy to:', strategy.id);
    
    if (strategy.id === selectedStrategy.id) {
      setIsStrategyDialogOpen(false);
      return;
    }

    setSelectedStrategy(strategy);
    parentOnSelectStrategy(strategy);
    
    if (profile) {
      try {
        await updateProfile.mutate({
          selected_strategy: strategy.id
        });
        toast({
          title: "Strategy Updated",
          description: `Your debt repayment strategy has been updated to ${strategy.name}`,
        });
      } catch (error) {
        console.error('Error updating strategy preference:', error);
        toast({
          title: "Error",
          description: "Failed to save strategy preference",
          variant: "destructive",
        });
      }
    }
    setIsStrategyDialogOpen(false);
  };

  const handleExtraPaymentToggle = async (checked: boolean) => {
    console.log('Toggling extra payments:', checked);
    setShowExtraPayment(checked);
    if (profile) {
      try {
        await updateProfile.mutate({
          show_extra_payments: checked
        });
      } catch (error) {
        console.error('Error updating extra payments preference:', error);
        toast({
          title: "Error",
          description: "Failed to save your preference",
          variant: "destructive",
        });
      }
    }
  };

  const handleOneTimeFundingToggle = async (checked: boolean) => {
    console.log('Toggling lump sum payments:', checked);
    setShowOneTimeFunding(checked);
    if (profile) {
      try {
        await updateProfile.mutate({
          show_lump_sum_payments: checked
        });
      } catch (error) {
        console.error('Error updating lump sum payments preference:', error);
        toast({
          title: "Error",
          description: "Failed to save your preference",
          variant: "destructive",
        });
      }
    }
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
          <ExtraPaymentSection
            showExtraPayment={showExtraPayment}
            onToggleExtraPayment={handleExtraPaymentToggle}
            minimumPayment={minimumPayment}
            extraPayment={extraPayment}
            updateMonthlyPayment={updateMonthlyPayment}
            onOpenExtraPaymentDialog={() => setIsExtraPaymentDialogOpen(true)}
            preferredCurrency={preferredCurrency}
            totalDebtValue={totalDebtValue}
          />

          <OneTimeFundingSection
            showOneTimeFunding={showOneTimeFunding}
            onToggleOneTimeFunding={handleOneTimeFundingToggle}
          />

          <StrategySection
            selectedStrategy={selectedStrategy}
            onOpenStrategyDialog={() => setIsStrategyDialogOpen(true)}
          />

          <Button 
            className="w-full"
            onClick={handleResultsClick}
          >
            Get My Results
          </Button>
        </div>
      </motion.div>

      <ResultsSection
        hasViewedResults={hasViewedResults}
        debts={debts}
        extraPayment={extraPayment}
      />

      <Dialog open={isStrategyDialogOpen} onOpenChange={setIsStrategyDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Choose Your Strategy</h2>
            <StrategySelector
              strategies={strategies}
              selectedStrategy={selectedStrategy}
              onSelectStrategy={handleStrategyChange}
            />
          </div>
        </DialogContent>
      </Dialog>

      <ResultsDialog
        isOpen={isResultsDialogOpen}
        onClose={() => setIsResultsDialogOpen(false)}
        debts={debts}
        monthlyPayment={currentPayment}
        extraPayment={extraPayment}
        oneTimeFundings={oneTimeFundings}
        selectedStrategy={selectedStrategy}
        currencySymbol={preferredCurrency}
      />
    </div>
  );
};
