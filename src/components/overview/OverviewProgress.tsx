import { motion } from "framer-motion";
import { PayoffProgress } from "@/components/PayoffProgress";
import { useDebts } from "@/hooks/use-debts";
import { calculatePayoffDetails } from "@/lib/utils/payment/paymentCalculations";
import { strategies } from "@/lib/strategies";
import { OneTimeFunding } from "@/hooks/use-one-time-funding";
import { useProfile } from "@/hooks/use-profile";

interface OverviewProgressProps {
  totalDebt: number;
  currencySymbol: string;
  oneTimeFundings?: OneTimeFunding[];
}

export const OverviewProgress = ({
  totalDebt,
  currencySymbol,
  oneTimeFundings = []
}: OverviewProgressProps) => {
  const { debts, profile } = useDebts();

  const calculateProjectedPayoffDate = () => {
    if (!debts || debts.length === 0 || !profile?.monthly_payment) {
      console.log("No debts or monthly payment available for payoff calculation");
      return undefined;
    }

    const selectedStrategy = strategies.find(s => s.id === profile?.selected_strategy) || strategies[0];
    console.log('Calculating payoff with strategy:', selectedStrategy.name);

    const payoffDetails = calculatePayoffDetails(
      debts,
      profile.monthly_payment,
      selectedStrategy,
      oneTimeFundings
    );

    let maxMonths = 0;
    Object.values(payoffDetails).forEach(details => {
      if (details.months > maxMonths) {
        maxMonths = details.months;
      }
    });

    if (maxMonths === 0) {
      console.log("No valid payoff time calculated");
      return undefined;
    }

    const projectedDate = new Date();
    projectedDate.setMonth(projectedDate.getMonth() + maxMonths);
    console.log("Projected payoff date:", projectedDate.toISOString());
    return projectedDate;
  };

  const projectedPayoffDate = calculateProjectedPayoffDate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <PayoffProgress
        totalDebt={totalDebt}
        paidAmount={0}
        currencySymbol={currencySymbol}
        projectedPayoffDate={projectedPayoffDate}
      />
    </motion.div>
  );
};