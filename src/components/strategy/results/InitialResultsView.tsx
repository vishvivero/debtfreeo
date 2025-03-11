
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { PaymentComparison } from "@/components/strategy/PaymentComparison";
import { ResultsMetricsGrid } from "./ResultsMetricsGrid";
import { ResultsDialogFooter } from "./ResultsDialogFooter";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";

interface InitialResultsViewProps {
  timelineResults: {
    interestSaved: number;
    monthsSaved: number;
    payoffDate: Date;
  };
  debts: Debt[];
  monthlyPayment: number;
  selectedStrategy: Strategy;
  oneTimeFundings: OneTimeFunding[];
  hasOneTimeFundings: boolean;
  currencySymbol: string;
  onNext: () => void;
}

export const InitialResultsView = ({
  timelineResults,
  debts,
  monthlyPayment,
  selectedStrategy,
  oneTimeFundings,
  hasOneTimeFundings,
  currencySymbol,
  onNext
}: InitialResultsViewProps) => {
  console.log('InitialResultsView rendering with:', {
    payoffDate: timelineResults.payoffDate,
    formattedDate: timelineResults.payoffDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    }),
    interestSaved: timelineResults.interestSaved,
    monthsSaved: timelineResults.monthsSaved
  });

  return (
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
        <ResultsMetricsGrid
          interestSaved={timelineResults.interestSaved}
          monthsSaved={timelineResults.monthsSaved}
          payoffDate={timelineResults.payoffDate}
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
          />
        </motion.div>

        {/* Only show one-time payment information if they are enabled */}
        {hasOneTimeFundings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-purple-50 p-4 rounded-lg border border-purple-100"
          >
            <h3 className="font-semibold text-purple-800 mb-2">
              Lump Sum Payments Impact
            </h3>
            <p className="text-sm text-purple-700">
              You've included {oneTimeFundings.length > 1 ? `${oneTimeFundings.length} lump sum payments` : "a lump sum payment"} 
              {oneTimeFundings.length > 1 ? " that total " : " of "}
              <span className="font-semibold">
                {currencySymbol}{oneTimeFundings.reduce((sum, f) => sum + Number(f.amount), 0).toLocaleString()}
              </span>. 
              These payments significantly accelerate your debt payoff timeline.
            </p>
          </motion.div>
        )}

        <ResultsDialogFooter
          currentView="initial"
          onBack={() => {}}
          onNext={onNext}
          onClose={() => {}}
        />
      </div>
    </motion.div>
  );
};
