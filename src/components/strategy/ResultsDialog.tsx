
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import confetti from 'canvas-confetti';
import { useState } from "react";
import { UnifiedDebtTimelineCalculator } from "@/lib/services/calculations/UnifiedDebtTimelineCalculator";
import { ResultsContent } from "./results/content/ResultsContent";

interface ResultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  debts: Debt[];
  monthlyPayment: number;
  extraPayment: number;
  oneTimeFundings: OneTimeFunding[];
  selectedStrategy: Strategy;
  currencySymbol?: string;
}

export const ResultsDialog = ({
  isOpen,
  onClose,
  debts,
  monthlyPayment,
  extraPayment,
  oneTimeFundings,
  selectedStrategy,
  currencySymbol = '£'
}: ResultsDialogProps) => {
  const [currentView, setCurrentView] = useState<'initial' | 'timeline' | 'insights'>('initial');

  if (isOpen) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  const totalMonthlyPayment = totalMinimumPayment + extraPayment;

  console.log('ResultsDialog calculation params:', {
    totalDebts: debts.length,
    totalMinimumPayment,
    extraPayment,
    totalMonthlyPayment,
    selectedStrategy: selectedStrategy.name
  });

  const timelineResults = UnifiedDebtTimelineCalculator.calculateTimeline(
    debts,
    totalMonthlyPayment,
    selectedStrategy,
    oneTimeFundings
  );

  console.log('Timeline calculation results in ResultsDialog:', timelineResults);

  const handleNext = () => {
    if (currentView === 'initial') {
      setCurrentView('timeline');
    } else if (currentView === 'timeline') {
      setCurrentView('insights');
    }
  };

  const handleBack = () => {
    if (currentView === 'timeline') {
      setCurrentView('initial');
    } else if (currentView === 'insights') {
      setCurrentView('timeline');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <ResultsContent
          currentView={currentView}
          handleNext={handleNext}
          handleBack={handleBack}
          onClose={onClose}
          debts={debts}
          monthlyPayment={monthlyPayment}
          extraPayment={extraPayment}
          oneTimeFundings={oneTimeFundings}
          selectedStrategy={selectedStrategy}
          currencySymbol={currencySymbol}
          timelineResults={timelineResults}
        />

        <p className="text-xs text-muted-foreground text-center mt-6 px-4">
          Disclaimer: The calculations provided are estimates only. Always review and make payments based on your creditor's requirements.
        </p>
      </DialogContent>
    </Dialog>
  );
};
