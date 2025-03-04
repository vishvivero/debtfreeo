
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { PayoffTimeline } from "@/components/debt/PayoffTimeline";
import { ResultsDialogFooter } from "./ResultsDialogFooter";
import { Debt } from "@/lib/types";

interface TimelineResultsViewProps {
  debts: Debt[];
  extraPayment: number;
  enableOneTimeFundings: boolean;
  onBack: () => void;
  onNext: () => void;
}

export const TimelineResultsView = ({
  debts,
  extraPayment,
  enableOneTimeFundings,
  onBack,
  onNext
}: TimelineResultsViewProps) => {
  return (
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
          enableOneTimeFundings={enableOneTimeFundings}
        />
        <ResultsDialogFooter
          currentView="timeline"
          onBack={onBack}
          onNext={onNext}
          onClose={() => {}}
        />
      </div>
    </motion.div>
  );
};
