
import { motion } from "framer-motion";
import { PayoffTimeline } from "@/components/debt/PayoffTimeline";
import { ScoreInsightsSection } from "./ScoreInsightsSection";
import { Debt } from "@/lib/types";

interface ResultsSectionProps {
  hasViewedResults: boolean;
  debts: Debt[];
  extraPayment: number;
}

export const ResultsSection = ({
  hasViewedResults,
  debts,
  extraPayment,
}: ResultsSectionProps) => {
  if (!hasViewedResults) return null;

  return (
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
  );
};
