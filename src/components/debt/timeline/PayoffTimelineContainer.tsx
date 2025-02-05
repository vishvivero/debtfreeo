
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
    oneTimeFundings: oneTimeFundings.length
  });

  // Keep fundings as is, let TimelineCalculator handle date conversion
  const formattedFundings = [...oneTimeFundings];

  // Calculate total minimum payment required
  const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  const totalMonthlyPayment = totalMinimumPayment + extraPayment;

  const timelineData = calculateTimelineData(debts, totalMonthlyPayment, strategy, formattedFundings);

  // Calculate months between start and end dates
  const startDate = new Date();
  const baselineLatestDate = new Date(timelineData[timelineData.length - 1].date);
  const baselineMonths = Math.ceil((baselineLatestDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  
  const acceleratedLatestDate = timelineData.find(d => d.acceleratedBalance <= 0)?.date;
  const acceleratedMonths = acceleratedLatestDate 
    ? Math.ceil((new Date(acceleratedLatestDate).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
    : baselineMonths;
  
  const monthsSaved = Math.max(0, baselineMonths - acceleratedMonths);

  // Calculate interest saved
  const lastDataPoint = timelineData[timelineData.length - 1];
  const interestSaved = lastDataPoint.baselineInterest - lastDataPoint.acceleratedInterest;

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
                ({format(baselineLatestDate, 'MMMM yyyy')})
              </span>
            </div>
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {monthsSaved > 0 && (
              <span className="text-emerald-600">
                {monthsSaved} months faster
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <TimelineMetrics 
            baselineMonths={baselineMonths}
            acceleratedMonths={acceleratedMonths}
            monthsSaved={monthsSaved}
            baselineLatestDate={baselineLatestDate}
            interestSaved={interestSaved}
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
