import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import confetti from 'canvas-confetti';
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UnifiedDebtTimelineCalculator } from "@/lib/services/calculations/UnifiedDebtTimelineCalculator";
import { InitialResultsView } from "./results/InitialResultsView";
import { TimelineResultsView } from "./results/TimelineResultsView";
import { InsightsResultsView } from "./results/InsightsResultsView";
import { calculateTimelineData } from "@/components/debt/timeline/TimelineCalculator";

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
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'initial' | 'timeline' | 'insights'>('initial');
  const hasOneTimeFundings = oneTimeFundings.length > 0;
  const navigate = useNavigate();
  
  if (isOpen) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: {
        y: 0.6
      }
    });
  }

  // Calculate total minimum payment required
  const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  const totalMonthlyPayment = totalMinimumPayment + extraPayment;
  
  console.log('ResultsDialog calculation params:', {
    totalDebts: debts.length,
    totalMinimumPayment,
    extraPayment,
    totalMonthlyPayment,
    selectedStrategy: selectedStrategy.name,
    oneTimeFundings: oneTimeFundings.length,
    hasOneTimeFundings
  });
  
  const timelineResults = UnifiedDebtTimelineCalculator.calculateTimeline(
    debts, 
    totalMonthlyPayment, 
    selectedStrategy, 
    oneTimeFundings
  );
  
  console.log('Timeline calculation results in ResultsDialog:', timelineResults);
  
  // Use the calculated payoff date directly from timelineResults
  let payoffDate = timelineResults.payoffDate;
  
  // Only use timeline data as fallback if the payoffDate is not available
  if (!payoffDate) {
    const today = new Date();
    payoffDate = new Date(today);
    
    // Generate timeline data to find the exact payoff month
    const timelineData = calculateTimelineData(debts, totalMonthlyPayment, selectedStrategy, oneTimeFundings);
    
    if (timelineData && timelineData.length > 0) {
      // Find the first month where the accelerated balance reaches zero
      const payoffMonthIndex = timelineData.findIndex(
        (data, index, array) => data.acceleratedBalance === 0 && 
          (index === 0 || array[index - 1].acceleratedBalance > 0)
      );
      
      if (payoffMonthIndex !== -1) {
        // Add that many months to today's date to get the payoff date
        payoffDate.setMonth(today.getMonth() + payoffMonthIndex);
        console.log('ResultsDialog - Calculated payoff date from timeline data:', {
          payoffMonthIndex,
          date: payoffDate.toISOString(),
          month: payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        });
      } else {
        // Fallback to using acceleratedMonths
        payoffDate.setMonth(today.getMonth() + timelineResults.acceleratedMonths);
        console.log('ResultsDialog - Using acceleratedMonths for payoff date:', payoffDate.toISOString());
      }
    } else {
      // Final fallback using acceleratedMonths
      payoffDate.setMonth(today.getMonth() + timelineResults.acceleratedMonths);
      console.log('ResultsDialog - Final fallback for payoff date:', payoffDate.toISOString());
    }
  }
  
  console.log('ResultsDialog - Final payoff date:', {
    date: payoffDate.toISOString(),
    formattedDate: payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    baselineMonths: timelineResults.baselineMonths,
    acceleratedMonths: timelineResults.acceleratedMonths,
    monthsSaved: timelineResults.monthsSaved
  });
  
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

  const handleViewFullResults = () => {
    onClose();
    navigate("/results-history");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {currentView === 'insights' && (
            <InsightsResultsView
              onBack={handleBack}
              onClose={onClose}
              onViewFullResults={handleViewFullResults}
            />
          )}

          {currentView === 'timeline' && (
            <TimelineResultsView
              debts={debts}
              extraPayment={extraPayment}
              enableOneTimeFundings={hasOneTimeFundings}
              onBack={handleBack}
              onNext={handleNext}
            />
          )}

          {currentView === 'initial' && (
            <InitialResultsView
              timelineResults={timelineResults}
              debts={debts}
              monthlyPayment={monthlyPayment}
              selectedStrategy={selectedStrategy}
              oneTimeFundings={oneTimeFundings}
              hasOneTimeFundings={hasOneTimeFundings}
              currencySymbol={currencySymbol}
              onNext={handleNext}
              payoffDate={payoffDate}
            />
          )}
        </AnimatePresence>

        <p className="text-xs text-muted-foreground text-center mt-6 px-4">
          Disclaimer: The calculations provided are estimates only. Always review and make payments based on your creditor's requirements.
        </p>
      </DialogContent>
    </Dialog>
  );
};
