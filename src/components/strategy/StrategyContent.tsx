import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/hooks/use-profile";

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
  const { profile, updateProfile } = useProfile();
  const [showExtraPayment, setShowExtraPayment] = useState(profile?.show_extra_payments ?? false);
  const [showOneTimeFunding, setShowOneTimeFunding] = useState(profile?.show_lump_sum_payments ?? false);
  const [isStrategyDialogOpen, setIsStrategyDialogOpen] = useState(false);
  const [hasViewedResults, setHasViewedResults] = useState(false);
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (profile) {
      setShowExtraPayment(profile.show_extra_payments ?? false);
      setShowOneTimeFunding(profile.show_lump_sum_payments ?? false);
    }
  }, [profile]);

  const handleResultsClick = () => {
    setHasViewedResults(true);
    setIsResultsDialogOpen(true);
  };

  const handleExtraPaymentToggle = async (checked: boolean) => {
    console.log('Toggling extra payments:', checked);
    setShowExtraPayment(checked);
    if (profile) {
      try {
        await updateProfile.mutateAsync({
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
    if (!checked && user) {
      try {
        const { error } = await supabase
          .from('one_time_funding')
          .delete()
          .eq('user_id', user.id)
          .eq('is_applied', false);

        if (error) throw error;

        toast({
          title: "One-time fundings deleted",
          description: "All pending one-time fundings have been removed",
        });
      } catch (error) {
        console.error('Error deleting one-time fundings:', error);
        toast({
          title: "Error",
          description: "Failed to delete one-time fundings",
          variant: "destructive",
        });
      }
    }
    
    if (profile) {
      try {
        await updateProfile.mutateAsync({
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Want to pay off debt faster?</h3>
              <DecimalToggle
                showDecimals={showExtraPayment}
                onToggle={handleExtraPaymentToggle}
                label="Add Extra Payments"
                resetOnDisable={true}
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Expecting any lump sum payments?</h3>
              <DecimalToggle
                showDecimals={showOneTimeFunding}
                onToggle={handleOneTimeFundingToggle}
                label="Add Lump Sum Payments"
              />
            </div>
            
            {showOneTimeFunding && <OneTimeFundingSection />}
          </div>

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