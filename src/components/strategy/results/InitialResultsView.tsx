
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { ResultsMetricsGrid } from "./ResultsMetricsGrid";
import { ResultsSummary } from "./ResultsSummary";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import { PaymentComparison } from "./PaymentComparison";

interface InitialResultsViewProps {
  timelineResults: {
    baselineMonths: number;
    acceleratedMonths: number;
    baselineInterest: number;
    acceleratedInterest: number;
    monthsSaved: number;
    interestSaved: number;
    payoffDate: Date;
  };
  debts: Debt[];
  monthlyPayment: number;
  selectedStrategy: Strategy;
  oneTimeFundings: OneTimeFunding[];
  hasOneTimeFundings: boolean;
  currencySymbol: string;
  onNext: () => void;
  payoffDate?: Date;
}

export const InitialResultsView = ({
  timelineResults,
  debts,
  monthlyPayment,
  selectedStrategy,
  oneTimeFundings,
  hasOneTimeFundings,
  currencySymbol,
  onNext,
  payoffDate
}: InitialResultsViewProps) => {
  // Use provided payoff date or fall back to the one from timeline results
  const actualPayoffDate = payoffDate || timelineResults.payoffDate;
  
  return (
    <motion.div
      key="initial"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <DialogHeader>
        <DialogTitle className="text-xl sm:text-2xl font-bold">
          Your Path to Debt Freedom
        </DialogTitle>
        <DialogDescription>
          Based on your current plan, here's how your debt payoff journey looks
        </DialogDescription>
      </DialogHeader>

      <div className="mt-6 space-y-6">
        <ResultsMetricsGrid
          interestSaved={timelineResults.interestSaved}
          monthsSaved={timelineResults.monthsSaved}
          payoffDate={actualPayoffDate}
          currencySymbol={currencySymbol}
          debts={debts}
          monthlyPayment={monthlyPayment}
          strategy={selectedStrategy}
          oneTimeFundings={oneTimeFundings}
        />

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Payment Breakdown</h3>
            <PaymentComparison
              debts={debts}
              monthlyPayment={monthlyPayment}
              strategy={selectedStrategy}
              oneTimeFundings={oneTimeFundings}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Strategy Summary</h3>
            <ResultsSummary
              strategy={selectedStrategy}
              oneTimeFundings={oneTimeFundings}
              hasOneTimeFundings={hasOneTimeFundings}
              interestSaved={timelineResults.interestSaved}
              currencySymbol={currencySymbol}
              debts={debts}
              monthlyPayment={monthlyPayment}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onNext} className="space-x-2">
            <span>Timeline Details</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
