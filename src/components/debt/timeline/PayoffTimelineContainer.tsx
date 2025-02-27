import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
import { Debt } from "@/lib/types";
import { OneTimeFunding } from "@/hooks/use-one-time-funding";
import { Strategy } from "@/lib/strategies";
import { TimelineChart } from "./TimelineChart";
import { TimelineMetrics } from "./TimelineMetrics";
import { calculateTimelineData } from "./TimelineCalculator";
import { format } from "date-fns";
import { useProfile } from "@/hooks/use-profile";
import { UnifiedDebtTimelineCalculator } from "@/lib/services/calculations/UnifiedDebtTimelineCalculator";
import { normalizeDate } from "@/lib/utils/dateUtils";
interface PayoffTimelineContainerProps {
  debts: Debt[];
  extraPayment: number;
  strategy: Strategy;
  oneTimeFundings: OneTimeFunding[];
}
export const PayoffTimelineContainer = ({
  debts,
  extraPayment,
  strategy,
  oneTimeFundings
}: PayoffTimelineContainerProps) => {
  const {
    profile
  } = useProfile();
  console.log('PayoffTimelineContainer: Starting calculation for debts:', {
    totalDebts: debts.length,
    extraPayment,
    strategy: strategy.name,
    oneTimeFundings: oneTimeFundings.length,
    oneTimeFundingsEnabled: oneTimeFundings.length > 0
  });

  // Format the funding data to ensure it has proper date format
  const formattedFundings = oneTimeFundings.map(funding => {
    const normalizedDate = normalizeDate(funding.payment_date);
    console.log('Formatting funding:', {
      id: funding.id,
      originalDate: funding.payment_date,
      normalizedDate,
      dateType: typeof funding.payment_date,
      amount: funding.amount
    });
    return {
      ...funding,
      payment_date: normalizedDate || new Date().toISOString()
    };
  });
  console.log('Formatted fundings:', formattedFundings);

  // Calculate total minimum payment required
  const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  const totalMonthlyPayment = totalMinimumPayment + extraPayment;
  const timelineResults = UnifiedDebtTimelineCalculator.calculateTimeline(debts, totalMonthlyPayment, strategy, formattedFundings);
  const timelineData = calculateTimelineData(debts, totalMonthlyPayment, strategy, formattedFundings);
  const currencySymbol = profile?.preferred_currency || '£';
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    delay: 0.3
  }} className="w-full">
      <Card>
        
        
      </Card>
    </motion.div>;
};