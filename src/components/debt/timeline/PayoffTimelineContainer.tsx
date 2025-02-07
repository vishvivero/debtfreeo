
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, Loader2 } from "lucide-react";
import { Debt } from "@/lib/types";
import { OneTimeFunding } from "@/hooks/use-one-time-funding";
import { Strategy } from "@/lib/strategies";
import { TimelineChart } from "./TimelineChart";
import { TimelineMetrics } from "./TimelineMetrics";
import { calculateTimelineData } from "./TimelineCalculator";
import { format } from "date-fns";
import { useProfile } from "@/hooks/use-profile";
import { UnifiedDebtTimelineCalculator, UnifiedTimelineResults } from "@/lib/services/calculations/UnifiedDebtTimelineCalculator";
import { useState, useEffect } from "react";

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
  const [timelineResults, setTimelineResults] = useState<UnifiedTimelineResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalMonthlyPayment, setTotalMonthlyPayment] = useState(0);

  useEffect(() => {
    const calculateTimeline = async () => {
      try {
        const minimumPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
        const calculatedTotalMonthlyPayment = minimumPayment + extraPayment;
        setTotalMonthlyPayment(calculatedTotalMonthlyPayment);
        
        const results = await UnifiedDebtTimelineCalculator.calculateTimeline(
          debts,
          calculatedTotalMonthlyPayment,
          strategy,
          oneTimeFundings
        );
        setTimelineResults(results);
      } catch (error) {
        console.error('Error calculating timeline:', error);
      } finally {
        setIsLoading(false);
      }
    };

    calculateTimeline();
  }, [debts, extraPayment, strategy, oneTimeFundings]);

  if (isLoading || !timelineResults) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Calculating timeline...</p>
        </div>
      </div>
    );
  }

  const timelineData = calculateTimelineData(debts, totalMonthlyPayment, strategy, oneTimeFundings);
  const currencySymbol = profile?.preferred_currency || '£';

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
                ({format(timelineResults.payoffDate, 'MMMM yyyy')})
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
            baselineLatestDate={timelineResults.payoffDate}
            interestSaved={timelineResults.interestSaved}
            currencySymbol={currencySymbol}
          />
          <TimelineChart 
            data={timelineData}
            debts={debts}
            formattedFundings={oneTimeFundings}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};
