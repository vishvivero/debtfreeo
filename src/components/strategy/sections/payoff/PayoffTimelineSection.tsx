
import { motion } from "framer-motion";
import { PayoffTimeline } from "@/components/debt/PayoffTimeline";
import { Debt } from "@/lib/types";

interface PayoffTimelineSectionProps {
  debts: Debt[];
  extraPayment: number;
}

export const PayoffTimelineSection = ({
  debts,
  extraPayment,
}: PayoffTimelineSectionProps) => {
  if (debts.length === 0) return null;

  return (
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
  );
};
