
import { motion, AnimatePresence } from "framer-motion";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";
import { DebtMetrics } from "../metrics/DebtMetrics";
import { PaymentComparison } from "@/components/strategy/PaymentComparison";
import { ResultsNavigation } from "../navigation/ResultsNavigation";
import { PayoffTimeline } from "@/components/debt/PayoffTimeline";
import { ScoreInsightsSection } from "@/components/strategy/sections/ScoreInsightsSection";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import { UnifiedTimelineResult } from "@/lib/services/UnifiedDebtCalculationService";

interface ResultsContentProps {
  currentView: 'initial' | 'timeline' | 'insights';
  handleNext: () => void;
  handleBack: () => void;
  onClose: () => void;
  debts: Debt[];
  monthlyPayment: number;
  extraPayment: number;
  oneTimeFundings: OneTimeFunding[];
  selectedStrategy: Strategy;
  currencySymbol?: string;
  timelineResults: UnifiedTimelineResult;
}

export const ResultsContent = ({
  currentView,
  handleNext,
  handleBack,
  onClose,
  debts,
  monthlyPayment,
  extraPayment,
  oneTimeFundings,
  selectedStrategy,
  currencySymbol,
  timelineResults
}: ResultsContentProps) => {
  return (
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
            <ResultsNavigation 
              currentView={currentView}
              onBack={handleBack}
              onNext={handleNext}
              onClose={onClose}
            />
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
            <ResultsNavigation 
              currentView={currentView}
              onBack={handleBack}
              onNext={handleNext}
              onClose={onClose}
            />
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
            <DebtMetrics 
              timelineResults={timelineResults}
              currencySymbol={currencySymbol}
            />

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

            <ResultsNavigation 
              currentView={currentView}
              onBack={handleBack}
              onNext={handleNext}
              onClose={onClose}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
