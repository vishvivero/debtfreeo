
import { motion } from "framer-motion";
import { ScoreInsightsSection } from "../ScoreInsightsSection";

export const ScoreInsightsContainer = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <ScoreInsightsSection />
    </motion.div>
  );
};
