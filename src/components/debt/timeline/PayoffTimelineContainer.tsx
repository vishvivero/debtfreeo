
import { useEffect, useMemo, useState } from "react";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { OneTimeFunding } from "@/lib/types/payment";
import { UnifiedDebtTimelineCalculator } from "@/lib/services/calculations/UnifiedDebtTimelineCalculator";
import { TimelineChart } from "./TimelineChart";
import { TimelineTooltip } from "./TimelineTooltip";
import { TimelineMetrics } from "./TimelineMetrics";
import { Loader2 } from "lucide-react";

interface PayoffTimelineContainerProps {
  debts: Debt[];
  extraPayment: number;
  strategy: Strategy;
  oneTimeFundings: OneTimeFunding[];
  monthlyPayment: number;
}

export const PayoffTimelineContainer = ({
  debts,
  extraPayment,
  strategy,
  oneTimeFundings,
  monthlyPayment
}: PayoffTimelineContainerProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(true);

  // Validate inputs before calculation
  const validatedMonthlyPayment = Math.max(
    monthlyPayment,
    debts.reduce((sum, debt) => sum + debt.minimum_payment, 0)
  );

  const timelineResults = useMemo(() => {
    setIsCalculating(true);
    setError(null);

    console.log('Starting timeline calculation with:', {
      debtsCount: debts.length,
      validatedMonthlyPayment,
      strategyName: strategy.name,
      oneTimeFundingsCount: oneTimeFundings.length
    });

    try {
      if (!debts.length || validatedMonthlyPayment <= 0) {
        throw new Error('Invalid calculation parameters');
      }

      const results = UnifiedDebtTimelineCalculator.calculateTimeline(
        debts,
        validatedMonthlyPayment,
        strategy,
        oneTimeFundings
      );

      console.log('Timeline calculation complete:', {
        baselineMonths: results.baselineMonths,
        acceleratedMonths: results.acceleratedMonths,
        payoffDate: results.payoffDate
      });

      return results;
    } catch (err) {
      console.error('Error calculating timeline:', err);
      setError(err instanceof Error ? err.message : 'Error calculating payoff timeline');
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, [debts, validatedMonthlyPayment, strategy, oneTimeFundings]);

  if (isCalculating) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !timelineResults) {
    return (
      <div className="text-center p-4 text-red-600">
        {error || 'Unable to calculate payoff timeline'}
      </div>
    );
  }

  const currencySymbol = debts[0]?.currency_symbol || '£';

  return (
    <div className="space-y-8">
      <TimelineMetrics
        baselineMonths={timelineResults.baselineMonths}
        acceleratedMonths={timelineResults.acceleratedMonths}
        monthsSaved={timelineResults.monthsSaved}
        baselineLatestDate={timelineResults.payoffDate}
        interestSaved={timelineResults.interestSaved}
        currencySymbol={currencySymbol}
      />

      <TimelineChart
        debts={debts}
        extraPayment={extraPayment}
        baselineMonths={timelineResults.baselineMonths}
        acceleratedMonths={timelineResults.acceleratedMonths}
        currencySymbol={currencySymbol}
        oneTimeFundings={oneTimeFundings}
        customTooltip={TimelineTooltip}
      />
    </div>
  );
};
