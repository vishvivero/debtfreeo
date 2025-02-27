
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, DollarSign, Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import confetti from 'canvas-confetti';
import { PaymentComparison } from "@/components/strategy/PaymentComparison";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { PayoffTimeline } from "@/components/debt/PayoffTimeline";
import { UnifiedDebtTimelineCalculator } from "@/lib/services/calculations/UnifiedDebtTimelineCalculator";
import { ScoreInsightsSection } from "@/components/strategy/sections/ScoreInsightsSection";

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

  if (isOpen) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
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
        <AnimatePresence mode="wait">
          {currentView === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-bold">
                  Your Debt Score Insights
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <ScoreInsightsSection />
                <div className="mt-6 flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={handleBack}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-bold">
                  Combined Debt Payoff Timeline
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <PayoffTimeline
                  debts={debts}
                  extraPayment={extraPayment}
                />
                <div className="mt-6 flex justify-between gap-4">
                  <Button 
                    variant="outline" 
                    onClick={handleBack}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    className="flex items-center gap-2 bg-[#00D382] hover:bg-[#00D382]/90 text-white" 
                    onClick={handleNext}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'initial' && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mx-auto bg-primary/10 p-3 rounded-full w-fit"
                >
                  <Sparkles className="h-6 w-6 text-primary" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
                    Your Path to Debt Freedom
                  </DialogTitle>
                  <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                    Here's your personalized debt payoff strategy
                  </p>
                </motion.div>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                      <h3 className="font-semibold text-emerald-800">Interest Saved</h3>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-emerald-600">
                      {currencySymbol}{timelineResults.interestSaved.toLocaleString()}
                    </p>
                    <p className="text-xs sm:text-sm text-emerald-700">Total savings on interest</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-800">Time Saved</h3>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-blue-600">
                      {timelineResults.monthsSaved} months
                    </p>
                    <p className="text-xs sm:text-sm text-blue-700">Faster debt freedom</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold text-purple-800">Debt-free Date</h3>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-purple-600">
                      {timelineResults.payoffDate.toLocaleDateString('en-US', { 
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-xs sm:text-sm text-purple-700">Target completion date</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <PaymentComparison
                    debts={debts}
                    monthlyPayment={monthlyPayment}
                    strategy={selectedStrategy}
                    oneTimeFundings={oneTimeFundings}
                    currencySymbol={currencySymbol}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row justify-between pt-4 gap-4"
                >
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="w-full"
                  >
                    Close
                  </Button>
                  <Button 
                    className="w-full gap-2 bg-[#00D382] hover:bg-[#00D382]/90 text-white" 
                    onClick={handleNext}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-xs text-muted-foreground text-center mt-6 px-4">
          Disclaimer: The calculations provided are estimates only. Always review and make payments based on your creditor's requirements.
        </p>
      </DialogContent>
    </Dialog>
  );
};

