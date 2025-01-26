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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DecimalToggle } from "@/components/DecimalToggle";

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
  const [showExtraPayment, setShowExtraPayment] = useState(false);
  const [showOneTimeFunding, setShowOneTimeFunding] = useState(false);
  const [isStrategyDialogOpen, setIsStrategyDialogOpen] = useState(false);
  const [hasViewedResults, setHasViewedResults] = useState(false);
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);

  const handleResultsClick = () => {
    setHasViewedResults(true);
    setIsResultsDialogOpen(true);
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
          {/* Payment Overview Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Want to pay off debt faster?</h3>
              <DecimalToggle
                showDecimals={showExtraPayment}
                onToggle={setShowExtraPayment}
                label="Want to see exact amounts?"
              />
            </div>
            
            {showExtraPayment && (
              <PaymentOverviewSection
                totalMinimumPayments={minimumPayment}
                extraPayment={extraPayment}
                onExtraPaymentChange={amount => updateMonthlyPayment(amount + minimumPayment)}
                onOpenExtraPaymentDialog={() => setIsExtraPaymentDialogOpen(true)}
                currencySymbol={preferredCurrency}
                totalDebtValue={totalDebtValue}
              />
            )}
          </div>

          {/* One-time Funding Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Expecting any lump sum payments?</h3>
              <DecimalToggle
                showDecimals={showOneTimeFunding}
                onToggle={setShowOneTimeFunding}
                label="Want to add one-time payments?"
              />
            </div>
            
            {showOneTimeFunding && <OneTimeFundingSection />}
          </div>

          {/* Strategy Selection */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Current Strategy</h3>
              <Button 
                variant="outline"
                onClick={() => setIsStrategyDialogOpen(true)}
              >
                Change Strategy
              </Button>
            </div>
            <div className="p-4 border rounded-lg bg-white">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">{selectedStrategy.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Add extra monthly payments to accelerate your debt payoff
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button 
            className="w-full"
            onClick={handleResultsClick}
          >
            Get My Results
          </Button>
        </div>
      </motion.div>

      {/* Results Sections - Only visible after clicking Get My Results */}
      {hasViewedResults && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ScoreInsightsSection />
          </motion.div>

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
        </>
      )}

      {/* Strategy Selection Dialog */}
      <Dialog open={isStrategyDialogOpen} onOpenChange={setIsStrategyDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Choose Your Strategy</h2>
            <StrategySelector
              strategies={strategies}
              selectedStrategy={selectedStrategy}
              onSelectStrategy={(strategy) => {
                onSelectStrategy(strategy);
                setIsStrategyDialogOpen(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Results Dialog */}
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