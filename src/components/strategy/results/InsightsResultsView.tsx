
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { PersonalizedActionPlan } from "@/components/strategy/sections/PersonalizedActionPlan";
import { ResultsDialogFooter } from "./ResultsDialogFooter";

interface InsightsResultsViewProps {
  onBack: () => void;
  onClose: () => void;
  onViewFullResults: () => void;
}

export const InsightsResultsView = ({
  onBack,
  onClose,
  onViewFullResults
}: InsightsResultsViewProps) => {
  return (
    <motion.div
      key="insights"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <DialogHeader>
        <DialogTitle className="text-xl sm:text-2xl font-bold">
          Your Personalized Action Plan
        </DialogTitle>
      </DialogHeader>
      <div className="mt-4">
        <PersonalizedActionPlan />
        <ResultsDialogFooter
          currentView="insights"
          onBack={onBack}
          onNext={() => {}}
          onClose={onClose}
          onViewFullResults={onViewFullResults}
        />
      </div>
    </motion.div>
  );
};
