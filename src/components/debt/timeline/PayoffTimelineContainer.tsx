
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
  const { profile } = useProfile();
  
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

  const timelineResults = UnifiedDebtTimelineCalculator.calculateTimeline(
    debts,
    totalMonthlyPayment,
    strategy,
    formattedFundings
  );

  const timelineData = calculateTimelineData(debts, totalMonthlyPayment, strategy, formattedFundings);

  const currencySymbol = profile?.preferred_currency || '£';

  // Calculate the accurate payoff date based on the timeline data
  // Find the date when the accelerated timeline reaches zero
  const today = new Date();
  let actualPayoffDate = timelineResults.payoffDate; // Use the calculated date from timeline results

  // Fallback to the timeline data if needed
  if (timelineData && timelineData.length > 0 && !actualPayoffDate) {
    // Find the first month where the accelerated balance reaches zero
    const payoffMonthIndex = timelineData.findIndex(
      (data, index, array) => data.acceleratedBalance === 0 && 
        (index === 0 || array[index - 1].acceleratedBalance > 0)
    );
    
    if (payoffMonthIndex !== -1) {
      // Add that many months to today's date to get the payoff date
      actualPayoffDate = new Date(today);
      actualPayoffDate.setMonth(today.getMonth() + payoffMonthIndex);
      console.log('Calculated actual payoff date from timeline data:', {
        payoffMonthIndex,
        date: actualPayoffDate.toISOString(),
        month: actualPayoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      });
    }
  }
  
  if (!actualPayoffDate) {
    actualPayoffDate = new Date(today);
    actualPayoffDate.setMonth(today.getMonth() + timelineResults.acceleratedMonths);
    console.log('Using acceleratedMonths to calculate payoff date:', actualPayoffDate.toISOString());
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-emerald-500" />
              Combined Debt Payoff Timeline
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({format(actualPayoffDate, 'MMMM yyyy')})
              </span>
            </div>
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {timelineResults.monthsSaved > 0 && (
              <span className="text-emerald-600">
                {timelineResults.monthsSaved} months faster
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <TimelineMetrics 
            baselineMonths={timelineResults.baselineMonths}
            acceleratedMonths={timelineResults.acceleratedMonths}
            monthsSaved={timelineResults.monthsSaved}
            baselineLatestDate={actualPayoffDate}
            interestSaved={timelineResults.interestSaved}
            currencySymbol={currencySymbol}
          />
          <TimelineChart 
            data={timelineData}
            debts={debts}
            formattedFundings={formattedFundings}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};
